const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const open = require('open');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search Spotify for music to play.')
    .addStringOption(option => option.setName('query').setDescription('The search query.').setRequired(true)),
  async execute(interaction) {
    const trackMap = {};

    const spotifyApi = interaction.client.spotifyApi;
    const query = interaction.options.getString('query');
    await spotifyApi.ensureAccessToken();
    const reply = await spotifyApi.searchTracks(query, { limit: 5 })
      .then(function (data) {
        const items = data.body?.tracks?.items;
        if (items?.length > 0) {
          const tracks = items.map(track => {
            return {
              ...track,
              label: `${track.artists[0]?.name} - ${track.name}`,
            };
          });
          const rows = tracks.map(track => {
            trackMap[track.uri] = track;
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
      const trackLabel = trackMap[trackUri].label || trackUri;
      selectedTrack.update({ content: `Playing...`, components: [] });
      await spotifyApi.ensureAccessToken();
      // TODO: extract this play fallback behavior to Spotify API wrapper
      const success = await spotifyApi.play({ uris: [trackUri] })
        .then(data => {
          return true;
        }, async err => {
          console.log(`Error playing ${trackLabel}`, err.message);
          // Fallback: attempt to wake Spotify by opening the track through the operating system.
          return open(trackUri).then(cp => {
            return new Promise((resolve, reject) => {
              cp.on('exit', code => {
                if (code === 0) {
                  console.log(`Forced Spotify to open ${trackUri} through local operating system.`);
                  resolve(true);
                } else if (code === 1) {
                  console.log(`Error opening ${trackUri} through local operating system.`);
                  resolve(false);
                }
              });
            });
          });
        });

      if (success) {
        interaction.editReply({
          content: `Now playing: ${trackLabel}`,
          components: [],
        });
        const track = trackMap[trackUri];
        const images = track?.album.images;
        const thumbnailUrl = images[images.length - 1].url;
        interaction.channel.send({
          content: getTrackAnnouncement(interaction.user.username, trackLabel),
          embeds: [{
            title: track.name,
            url: track.external_urls.spotify,
            author: {
              name: track.artists[0].name,
            },
            description: track.album.name,
            thumbnail: {
              url: thumbnailUrl,
            },
          }],
        });
        console.log(`Now Playing: ${trackLabel}`);
      } else {
        interaction.editReply({
          content: `Error playing ${trackLabel}. Has Spotify been paused a while?`,
          components: []
        });
      }
    } catch (e) {
      await interaction.deleteReply();
    }
  },
};

function getTrackAnnouncement(username, trackLabel) {
  const trackAnnounceMessages = [
    `You can thank ${username} for this one... **${trackLabel}**`,
    `Apparently ${username} thought **${trackLabel}** would be an appropriate choice.`,
    `I'm not sure what ${username} was thinking, but here's **${trackLabel}**.`,
    `${username} decided to play **${trackLabel}**.`,
    `It's **${trackLabel}** time! Thanks, ${username}.`,
    `Blame ${username}. It's **${trackLabel}**.`,
    `Great, ${username} chose **${trackLabel}**.`,
    `Yay, **${trackLabel}**! Thanks, ${username}.`,
    `${username} rolls the dice with **${trackLabel}**.`,
    `**${trackLabel}**, courtesy of ${username}. That figures`,
    `Interesting, ${username}. **${trackLabel}**`,
  ];
  const idx = Math.floor(Math.random() * trackAnnounceMessages.length);
  return trackAnnounceMessages[idx];
}
