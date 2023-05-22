# Spotify Bot for Discord

This is a Spotify remote-control bot for Discord. It allows you (and your friends) to control playback on your own Spotify account from Discord using slash commands.

## Instructions
I. Discord
1. [Create a Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html) and [add it to your server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html).
1. Give the bot Privileged Gateway Intents.
1. Run `node deploy-commands.js` to update the bot's slash commands with Discord.

II. Spotify
1. Create a Spotify Developer account and create an application.
1. Add `http://localhost:3000/callback` as a Redirect URI in the Spotify Developer Dashboard.
1. Run `node server.js` to start the local server. The server will open Spotify in your browser and ask you to log in. Once you authorize your app to access your Spotify account, you will be redirected to `http://localhost:3000/callback` and your refresh token will be printed to the local console.
1. Add the refresh token to `config.json`. This refresh token is tied to your Spotify account, so protect it like a password.

Run `node server.js` again to start the server. This time, it will authenticate with Spotify automatically and start listening for slash commands from Discord.
