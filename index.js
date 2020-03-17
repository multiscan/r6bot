const request = require('request');
const Telegraf = require('telegraf')
const YAML = require('js-yaml')
const FS = require('fs');
const SteamBUrl="https://api.steampowered.com/ISteamUser/"

const Config = YAML.safeLoad(FS.readFileSync('./config.yml'));
console.log(Config)
const SteamIds=Config.SteamIds
console.log(SteamIds)

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

async function getPlayers(ctx) {
	var url=SteamBUrl+"GetPlayerSummaries/v2/?key=" + process.env.STEAM_KEY + "&steamids=" + SteamIds.join(",")
	console.log("url: " + url)
	const json = await downloadPage(url)
	// const json = TESTJSON

	players = JSON.parse(json).response.players
	var out = ""
	for (const player of players) {
		if (player.gameid !== undefined) {
			g = player.gameextrainfo === undefined ? player.gameid : player.gameextrainfo
			p = player.realname + " (" + player.personaname +"): " + g
			out = out + p + "\n"
		} else {
			p = player.realname + " (" + player.personaname +"): NO"
		}

		console.log(p)

	}
	ctx.reply(out)
}

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.command('chi', getPlayers)

// bot.command('chi', (ctx) => ctx.reply(chi()))
bot.launch()
