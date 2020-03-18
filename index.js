const request = require('request');
const Telegraf = require('telegraf')
const Data = require('./data');
const FS = require('fs');
const Config = require('./config');

// ------------------------------------------------------------------- constants
const SteamBUrl="https://api.steampowered.com/ISteamUser/"

const helpMsg = `Command reference:
/chi - List users that are playing
/tacca STEAMID - add the given steamId to the list
/stacca STEAMID - remove a given steamId from the list
/lista - List all configured users
/boh - Show this help page
`;

// ------------------------------------------------------------------- functions

function logMsg(ctx) {
    var from = userString(ctx);
    console.log('<', ctx.message.text, from)
}

function logOutMsg(ctx, text) {
    console.log('>', {
        id: ctx.chat.id
    }, text);
}

function userString(ctx) {
    return JSON.stringify(ctx.from.id == ctx.chat.id ? ctx.from : {
        from: ctx.from,
        chat: ctx.chat
    });
}

// wrap a request in an promise
function downloadPage(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
}

function getPlayers(ctx) {
	Data.getPlayersSteamIds(ctx).then( player_ids => {
		var url = SteamBUrl+"GetPlayerSummaries/v2/?key=" 
		        + Config.steamKey + "&steamids=" + player_ids.join(",")
		downloadPage(url).then( json => {
			const players = JSON.parse(json).response.players
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

// TODO: at most 100 players allowed otherwise steam request have to be splitted
function addPlayer(ctx) {
 	const m = ctx.message.text.match(/\/tacca +([0-9]+)( +(.*))?$/)
 	if (m === null) {
 		ctx.reply("Syntax Error")
 	} else {
		Data.addPlayer(ctx, {steam: m[1], nick: m[3]}).then( player => {
			ctx.reply("Ok. Player " + player.steam + " added")
		})
 	}
}

function delPlayer(ctx) {
 	const m = ctx.message.text.match(/\/stacca +([0-9]+)$/)
 	if (m === null) {
 		ctx.reply("Syntax Error")
 	} else {
 		const steam = m[1]
		Data.delPlayerBySteam(ctx, steam).then( (res) => {
			ctx.reply("Ok. Player " + steam + " removed")
		})
 	}
}


function listPlayers(ctx) {
	Data.getPlayers(ctx).then( players => {
		var out = ""
		for (const player of players) {
			out = out + player.steam + " - " + player.nick + "\n"
		}
		ctx.reply(out)
	})
}

// ------------------------------------------------------------------------- bot
// dataService.loadSteams(Config);
const bot = new Telegraf(Config.botToken)
bot.command('chi', getPlayers)
// bot.command('add', )
bot.command('boh', ctx => {ctx.reply(helpMsg)});
bot.command('tacca', addPlayer)
bot.command('stacca', delPlayer)
bot.command('lista', listPlayers)
bot.launch()
