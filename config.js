var config = {}
config.app = {};
config.spotify = {};
config.twitter = {};

config.app.port = 8888;
config.app.polling_interval_in_seconds = 5;
config.app.last_tweet_id_file = '/home/<youruser>/jukebox-last-id';

config.spotify.redirect_uri = 'http://localhost:8888/callback';
config.spotify.scopes = 'playlist-modify playlist-modify-private';
config.spotify.state_key = 'jukebox_auth_state';
config.spotify.client_id = '';
config.spotify.client_secret = '';
config.spotify.playlist_id = '';
config.spotify.username = '';

config.twitter.hashtag = '#jukebox'; // Make this unique to avoid clashes!
config.twitter.consumer_key = '';
config.twitter.consumer_secret = '';
config.twitter.access_token = '';
config.twitter.access_token_secret = '';

/*
  Optionally specify a whitelist of twitter handles so random people can't add songs to playlist.
  e.g. ['my_twitter_handle', 'another_user', 'foo_bar'];

  Empty whitelist will allow tweets by all twitter users.
*/
config.twitter.handleWhitelist = [];

module.exports = config;