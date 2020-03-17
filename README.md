# Team R6 Corse telegram bot

This is a simple telegram bot that accept the following command:

```
/chi
```

and return the list of steam games the friends are playing.
The list of friends steamIds is in `config.yml`

## Installation
 1. Create a new bot using BotFather chat in Telegram
 1. Save the `HTTP API` as `BOT_TOKEN` env variable (e.g. in .env)
 1. Generate a personal STEAM_KEY in your steam community web page and save it as env variable
 1. Invite your bot to a telegram chat
 1. Start the bot with `node index.js`
