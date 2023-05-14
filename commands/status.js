const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Provides information about currently playing music.'),
  async execute(interaction) {
    // interaction.guild is the object representing the Guild in which the command was run
    const spotifyApi = interaction.client.spotifyApi;
    await spotifyApi.ensureAccessToken();
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
