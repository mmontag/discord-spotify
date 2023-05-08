const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Plays next song in queue.'),
  async execute(interaction) {

    interaction.client.spotifyApi.skipToNext()
      .then(function () {
        console.log('Playback skipped');
      }, function (err) {
        console.log('Something went wrong!', err);
      });

    //TODO: add message feedback in discord channel

    await interaction.reply('Ok!');
  },
};