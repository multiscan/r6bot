const Config = require('./config');
const Sequelize = require('sequelize');
const Model = Sequelize.Model;

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: Config.dbPath
});

class Player extends Model {}
Player.init({
  steamid: {
    type: Sequelize.STRING,
    allowNull: false
  },
  nick: {
    type: Sequelize.STRING,
    allowNull: true
  },
  personaname: {
    type: Sequelize.STRING,
    allowNull: true
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: true
  },
  realname: {
    type: Sequelize.STRING,
    allowNull: true
  },
  tg_id: {
    type: Sequelize.STRING,
    allowNull: true
  },
  tg_nick: {
    type: Sequelize.STRING,
    allowNull: true
  },
  tg_first_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  tg_last_name: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'player'
})

class Chat extends Model {}
Chat.init({
  uid: Sequelize.STRING,
  title: Sequelize.STRING
}, {
  sequelize,
  modelName: 'chat'
});

Chat.belongsToMany(Player, {through: 'PlayerChat'});
Player.belongsToMany(Chat, {through: 'PlayerChat'});

function chatid(ctx) {
  return "C" + ctx.chat.id
}

function getChat(ctx) {
  return new Promise((resolve, reject) => {
    Chat.findOrCreate({where: {uid: chatid(ctx)}, defaults: {title: ctx.chat.title}})
        .then( ([chat, created]) => {resolve(chat)} )
  })
}

function getPlayers(ctx) {
  return new Promise((resolve, reject) => {
    getChat(ctx).then( chat => {
      chat.getPlayers().then( players => {
        resolve(players)
      })
    })
  })
}

function getPlayersSteamIds(ctx) {
  return new Promise((resolve, reject) => {
    getPlayers(ctx).then( players => {
      resolve(players.map( (player, index) => {
        return player.steamid
      }))
    })
  })
}

function addPlayer(ctx, player) {
  return new Promise((resolve, reject) => {
    getChat(ctx).then( chat => {
      Player
        // TODO: upsert or update in case user data have changed
        .findOrCreate({where: {steamid: player.steamid}, defaults:
            { nick: player.nick,
              personaname: player.personaname,
              avatar: player.avatar,
              realname: player.realname,
              tg_id: player.tg_id,
              tg_nick: player.tg_nick,
              tg_first_name: player.tg_first_name,
              tg_last_name: player.tg_last_name
            }
        })
        .then( ([player, created]) => {
          chat.addPlayer(player)
              .then(msg => {console.log("Added player " + player.steamid + " to chat " + chat.title); resolve(player)})
              .catch(err => {console.log("Player " + player.steamid + " already in chat " + chat.title)})
        })
    })
  })
}

function delPlayerBySteam(ctx, steam) {
  return new Promise((resolve, reject) => {
    getChat(ctx).then(chat => {
      chat.getPlayers({where: {steamid: steamid}}).then(player => {
        chat.removePlayer(player).then(() => {
          // TODO also remove player from DB if no longer associated
          resolve(true)
        })
      })
    })
  })
}

function init() {
  sequelize.sync().then( () => {
    console.log("Db initialized. You can now start the bot")
  })
}

function seed(ctx, players) {
  sequelize.sync().then( () => {
    Chat.create({uid: chatid(ctx), title: ctx.chat.title}).then( chat => {
      console.log("Chat created: " + chat.title)
      for (const player of players) {
        Player.create(player).then ( player => {
          console.log("Player created: " + player.steamid)
          chat.addPlayer(player)
              .then(msg => {console.log("Added player " + player.steamid + " to chat " + chat.title)})
              .catch(err => {console.log("Player " + player.steamid + " already in chat " + chat.title)})
        })
      }
    })
  })
}

module.exports = {
    getChat,
    getPlayers,
    getPlayersSteamIds,
    addPlayer,
    delPlayerBySteam,
    seed,
    init,
};
