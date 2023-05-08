# Spotify Bot for Discord

This is a Spotify remote-control bot for Discord. It allows you (and your friends) to control playback on your own Spotify account from Discord using slash commands.

## Instructions
I. Discord
1. [Create a Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html) and [add it to your server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html).
1. Give the bot Privileged Gateway Intents.
1. Run `node deploy-commands.js` to update the bot's slash commands with Discord.
1. Create a Spotify Developer account and create an application.

II. Spotify
1. Add `http://localhost:3000/callback` as a Redirect URI in the Spotify Developer Dashboard.
1. Run `node server.js` to start the server. The server will open Spotify in your browser and ask you to log in. Once you log in, the server will redirect you to `http://localhost:3000/callback` and print your refresh token to the console.
1. Add the refresh token to `config.json`.
1. Run `node server.js` again to start the server. This time, it will authenticate with Spotify automatically and start listening for slash commands.
