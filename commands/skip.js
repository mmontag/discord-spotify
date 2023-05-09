const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Plays next song in queue.'),
  async execute(interaction) {

    const spotifyApi = interaction.client.spotifyApi;
    await spotifyApi.ensureAccessToken();

    await spotifyApi.skipToNext()
      .then(function () {
        console.log('Playback skipped');
      }, function (err) {
        console.log('Something went wrong!', err);
      });

    // Delay one second to wait for Spotify skip.
    await new Promise(resolve => setTimeout(resolve, 1000));

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