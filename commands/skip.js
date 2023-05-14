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
    await new Promise(resolve => setTimeout(resolve, 500));

    const reply = await spotifyApi.getMyCurrentPlaybackState()
      .then(function (data) {
        // Output items
        if (data.body && data.body.is_playing) {
          const item = data.body.item;
          const images = item.album.images;
          const thumbnailUrl = images[images.length - 1].url;

          return {
            content: 'Now Playing',
            embeds: [{
              title: item.name,
              url: item.external_urls.spotify,
              author: {
                name: item.artists[0].name,
              },
              description: item.album.name,
              thumbnail: {
                url: thumbnailUrl,
              },
            }],
          };
        } else {
          return 'Not playing anything.';
        }
      }, function (err) {
        console.log('Something went wrong!', err);
        return 'Error getting playback state.';
      });

    console.log(reply);

    await interaction.reply(reply);
  },
};