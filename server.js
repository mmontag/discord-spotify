const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { spotifyApi } = require('./spotify.js');
const statusCommand = require('./commands/status');
const searchCommand = require('./commands/search');
const skipCommand = require('./commands/skip');
const queueCommand = require('./commands/queue');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

client.spotifyApi = spotifyApi;

client.commands = new Collection();
client.commands.set(statusCommand.data.name, statusCommand);
client.commands.set(searchCommand.data.name, searchCommand);
client.commands.set(skipCommand.data.name, skipCommand);
client.commands.set(queueCommand.data.name, queueCommand);

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  // Uncomment this to debug if something goes wrong.
  // console.log(interaction);

  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(token);
