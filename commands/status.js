const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Provides information about currently playing music.'),
  async execute(interaction) {
    // interaction.guild is the object representing the Guild in which the command was run
    const spotifyApi = interaction.client.spotifyApi;
    await spotifyApi.ensureAccessToken();
    const reply = await spotifyApi.getMyQueue()
      .then(function (data) {
        // Output items
        if (data.body) {
          const item = data.body.currently_playing;
          const queue = data.body.queue;
          let embed = {
            color: 0x1ed760,
          };

          if (item) {
            const images = item.album.images;
            const thumbnailUrl = images[images.length - 1].url;
            embed = {
              ...embed,
              title: item.name,
              url: item.external_urls.spotify,
              author: {
                name: item.artists[0].name,
              },
              description: item.album.name,
              thumbnail: {
                url: thumbnailUrl,
              },
            }
          } else {
            embed = {
              ...embed,
              title: '(Paused)'
            }
          }

          if (queue && queue.length > 0) {
            embed = {
              ...embed,
              fields: [{
                name: 'Up next:',
                value: queue.slice(0, 5).map(track => `${track.artists[0]?.name} - ${track.name}`).join('\n'),
              }],
            }
          }

          return {
            content: 'Now Playing',
            embeds: [embed],
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
