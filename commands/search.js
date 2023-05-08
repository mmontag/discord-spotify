const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

trackMap = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search Spotify for music to play.')
    .addStringOption(option => option.setName('query').setDescription('The search query.').setRequired(true)),
  async execute(interaction) {
    const spotifyApi = interaction.client.spotifyApi;
    const query = interaction.options.getString('query');
    await spotifyApi.ensureAccessToken();
    const reply = await spotifyApi.searchTracks(query, { limit: 5 })
      .then(function (data) {
        const items = data.body?.tracks?.items;
        if (items?.length > 0) {
          const tracks = items.map(track => {
            return {
              label: `${track.artists[0]?.name} - ${track.name}`,
              uri: track.uri,
            };
          });
          const rows = tracks.map(track => {
            trackMap[track.uri] = track.label;
            const button = new ButtonBuilder({
              label: track.label,
              customId: track.uri,
              style: ButtonStyle.Primary,
            });
            const row = new ActionRowBuilder().addComponents(button);
            return row;
          });
          return {
            content: 'Choose a track:',
            components: rows,
            ephemeral: true,
          };
        }
        return `No results found for ${query}.`;
      }, function (err) {
        console.log('Something went wrong!', err);
        return 'Error getting playback state.';
      });

    const response = await interaction.reply(reply);

    const collectorFilter = i => i.user.id === interaction.user.id;
    try {
      const selectedTrack = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
      const trackUri = selectedTrack.customId;
      const trackLabel = trackMap[trackUri] || trackUri;
      console.log(selectedTrack);
      selectedTrack.update({ content: `Playing...`, components: [] });
      await spotifyApi.ensureAccessToken();
      await spotifyApi.play({ uris: [trackUri] })
        .then(data => {
          interaction.editReply({
            content: `Now playing: ${trackLabel}`,
            components: [],
          });
          // TODO: Send a funny message to channel announcing this user's embarrassing selection.
          // (The other messages are ephemeral, only seen by user who sent the commands.)
        }, err => {
          console.log(`Error playing ${trackLabel}`, err.message);
          interaction.editReply({ content: `Error playing ${trackLabel}. Has Spotify been paused a while?`, components: [] });
        });
    } catch (e) {
      await interaction.deleteReply();
    }
  },
};
