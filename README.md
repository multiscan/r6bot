# Team R6 Corse telegram bot

This is a simple telegram bot that accept the following commands:

```
/chi                         - List users that are playing
/tacca STEAMID [PLAYER_NAME] - add the given steamId to the list
/stacca STEAMID              - remove a given steamId from the list
/lista                       - List all configured users
/boh                         - Show this help page
```

The list of users is different for each chat and will have to be created 
by adding all the players with the command `tacca STEAMDID PLAYER_NAME`

## Installation
 1. Create a new bot using BotFather chat in Telegram
 1. Generate a personal [steam API key](https://steamcommunity.com/dev/apikey)
 1. Copy `config.js.example` as `config.js` and edit for adding your telegram and steam api keys;
 1. Invite your bot to a telegram chat
 1. Install node packages and itialize the database with
    * `npm install && node setup.js` or
    * `docker-compose run node npm install` and `docker-compose run node node setup.js` 
 1. Start the bot with 
    * `node index.js` or 
    * `docker-compose up -d`


