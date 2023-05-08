const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const { spotify } = require('./config.json');
const open = require('open');

const app = express();

const spotifyApi = new SpotifyWebApi({
  clientId: spotify.clientId,
  clientSecret: spotify.clientSecret,
  redirectUri: spotify.redirectUri,
});

// TODO: Delete this, it's just for testing
app.get('/status', (req, res) => {
  spotifyApi.getMyCurrentPlaybackState()
    .then(function(data) {
      // Output items
      if (data.body && data.body.is_playing) {
        console.log('Now playing: %s - %s', data.body.item.artists[0]?.name, data.body.item?.name);
        res.send(data.body);
      } else {
        console.log("User is not playing anything, or doing so in private.");
        res.send('Not playing anything');
      }
    }, function(err) {
      res.status(500).send('Error getting current playback state');
      console.log('Something went wrong!', err);
    });
});

// Define a route for the callback URL
app.get('/callback', (req, res) => {
  const { code } = req.query;

  // Use the authorization code to request an access token from the Spotify Web API
  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      const { access_token, refresh_token } = data.body;

      // Set the access token and refresh token on the Spotify Web API instance
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      console.log(`Refresh token: ${refresh_token}`);

      // Redirect the user to your application's main page or some other URL
      res.send('It worked! You can now close this window.');
    })
    .catch(error => {
      console.error('Error getting access token:', error);
      res.status(500).send('Error getting access token');
    });
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});


// Kick-off Spotify's auth flow
// Call the refreshAccessToken() method to obtain a new access token
if (spotify.refreshToken) {
  spotifyApi.setRefreshToken(spotify.refreshToken);
  spotifyApi.refreshAccessToken()
    .then(data => {
      console.log('The access token has been refreshed!');
      console.log(`New access token: ${data.body.access_token}`);

      // Set the new access token on the Spotify Web API instance
      spotifyApi.setAccessToken(data.body.access_token);
    })
    .catch(error => {
      console.error('Error refreshing access token:', error);
    });
} else {
  // Create the authorization URL
  const authorizeURL = spotifyApi.createAuthorizeURL(spotify.scopes, 'state');
  open(authorizeURL);
}

module.exports = { spotifyApi };
