const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Provides information about currently playing music.'),
  async execute(interaction) {
    // interaction.guild is the object representing the Guild in which the command was run
    const status = await interaction.client.spotifyApi.getMyCurrentPlaybackState()
      .then(function (data) {
        // Output items
        if (data.body && data.body.is_playing) {
          const nowPlayingText = `Now playing: ${data.body.item.artists[0]?.name} - ${data.body.item?.name}`;
          console.log(nowPlayingText);
          return nowPlayingText;
        } else {
          console.log("User is not playing anything, or doing so in private.");
          return 'Not playing anything';
        }
      }, function (err) {
        console.log('Something went wrong!', err);
        return 'Error getting current playback state';
      });

    await interaction.reply(status);
  },
};
