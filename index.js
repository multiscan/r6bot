const request = require('async-request')
const Telegraf = require('telegraf')
const Data = require('./data')
const FS = require('fs')
const Config = require('./config')

// ------------------------------------------------------------------- constants
const SteamBUrl="https://api.steampowered.com/ISteamUser/"

const helpMsg = `This bot helps steam player community to play together. Add the bot in a group, add players' steamId and then use /get to see who's online.

Command reference:
  • /chi → \`List users that are playing\`
  • /tacca STEAMID → \`add the given steamId to the list\`
  • /stacca STEAMID → \`remove a given steamId from the list\`
  • /lista → \`List all configured users\`
  • /boh → \`Show this help page\`

*Note*: use [steamid.io](https://steamid.io) to find your steamId. This bot needs the *steamID64*.`

// ------------------------------------------------------------------- functions
function logMsg(ctx) {
  var from = userString(ctx)
  console.log('<', ctx.message.text, from)
}

function logOutMsg(ctx, text) {
  console.log('>', {
    id: ctx.chat.id
  }, text)
}

function userString(ctx) {
  return JSON.stringify(ctx.from.id == ctx.chat.id ? ctx.from : {
    from: ctx.from,
    chat: ctx.chat
  })
}

async function downloadPage(url) {
  try {
    response = await request(url);
    console.log('RESPONSE...', response.body)
    if (response.statusCode != 200) {
      console.error('Invalid status code <' + response.statusCode + '>')
    } else {
      return response.body
    }
  } catch (e) {
    console.error(e);
  }
}

function getPlayers(ctx) {
  Data.getPlayersSteamIds(ctx).then( player_ids => {
  var url = SteamBUrl+"GetPlayerSummaries/v2/?key="
          + Config.steamKey + "&steamids=" + player_ids.join(",")
  downloadPage(url).then( json => {
    const players = JSON.parse(json).response.players
    console.log(players)
    var out = ""
    for (const player of players) {
      if (player.gameid !== undefined) {
          g = player.gameextrainfo === undefined ? player.gameid : player.gameextrainfo
          p = player.realname + " (" + player.personaname +"): " + g
          out = out + p + "\n"
      }
    }
    ctx.reply(out)
    })
  })
}

async function validateSteamID(id) {
  let url = SteamBUrl+"GetPlayerSummaries/v2/?key="
  + Config.steamKey + "&steamids=" + id
  // console.debug('url', url)
  let json = await downloadPage(url)
  const player = JSON.parse(json).response.players[0]
  // console.debug(player)
  if (player && 'steamid' in player) {
    return player
  } else {
    return false
  }
}

// TODO: at most 100 players allowed otherwise steam request have to be splitted
async function addPlayer(ctx) {
  const m = ctx.message.text.match(/^\/tacca|\/add +([0-9]+)( +(.*))?$/)
  if (m === null) {
    ctx.reply("Syntax Error")
  } else {
    player = await validateSteamID(m[1])
    if (player) {
      player.nick = m[3]
      player.tg_id = ctx.message.from.id
      player.tg_nick = ctx.message.from.username || null
      player.tg_first_name = ctx.message.from.first_name || null
      player.tg_last_name = ctx.message.from.last_name || null
      Data.addPlayer(ctx, player).then( player => {
        ctx.replyWithMarkdown('Ok. Player [' + player.personaname + '](http://steamcommunity.com/profiles/' + player.steamid + ') #' + player.steamid + ' added')
      })
    } else {
      console.error('Sorry, player', m[3], 'not found...')
      ctx.reply('Sorry, player' + m[3] + 'not found...')
    }
  }
}

function delPlayer(ctx) {
  const m = ctx.message.text.match(/^\/stacca|\/rm +([0-9]+)$/)
  if (m === null) {
    ctx.reply("Syntax Error")
  } else {
    const steamid = m[1]
    Data.delPlayerBySteam(ctx, steamid).then( (res) => {
      ctx.reply("Ok. Player " + steamid + " removed")
    })
  }
}


function listPlayers(ctx) {
  Data.getPlayers(ctx).then( players => {
    var out = ""
    for (const player of players) {
      out = out + player.steamid + " - " + player.nick + "\n"
    }
    ctx.reply(out)
  })
}

// ------------------------------------------------------------------------- bot
const bot = new Telegraf(Config.botToken)
bot.command('chi', getPlayers)
bot.command('get', getPlayers)
bot.command('help', ctx => {ctx.replyWithMarkdown(helpMsg, {disable_web_page_preview: true})})
bot.command('boh', ctx => {ctx.replyWithMarkdown(helpMsg, {disable_web_page_preview: true})})
bot.command('start', ctx => {ctx.replyWithMarkdown(helpMsg, {disable_web_page_preview: true})})
bot.command('add', addPlayer)
bot.command('tacca', addPlayer)
bot.command('rm', delPlayer)
bot.command('stacca', delPlayer)
bot.command('lista', listPlayers)
bot.command('list', listPlayers)
bot.launch()
