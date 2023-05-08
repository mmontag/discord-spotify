const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Provides information about currently playing music.'),
  async execute(interaction) {
    // interaction.guild is the object representing the Guild in which the command was run
    const spotifyApi = interaction.client.spotifyApi;
    await spotifyApi.ensureAccessToken();
    const replyText = await spotifyApi.getMyCurrentPlaybackState()
      .then(function (data) {
        // Output items
        if (data.body && data.body.is_playing) {
          const item = data.body.item;
          return `Now playing: ${item.artists[0]?.name} - ${item?.name}`;
        } else {
          return 'Not playing anything.';
        }
      }, function (err) {
        console.log('Something went wrong!', err);
        return 'Error getting playback state.';
      });

    console.log(replyText);

    await interaction.reply(replyText);
  },
};
