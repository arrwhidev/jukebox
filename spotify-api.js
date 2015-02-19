/**
 * @author Arran White https://github.com/arrwhidev @arranwhite_
 *
 * Took some inspiration from https://github.com/spotify/web-api-auth-examples
 */

var request = require('request');
var querystring = require('querystring');
var spotify = require('spotify-web-api-node');
var Q = require('q');
var config = require('./config');
var f = require('./functions');

var spotifyApi = new spotify({
    clientId: config.spotify.client_id,
    clientSecret: config.spotify.client_secret,
    redirectUri : config.spotify.redirect_uri
});

module.exports = {

    /*
        Make request to Spotify for an auth code.
    */
    requestAuthorization : function(res) {
        var state = f.generateRandomString(16);
        res.cookie(config.spotify.state_key, state);
        res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
            response_type: 'code',
            client_id: config.spotify.client_id,
            scope: config.spotify.scopes,
            redirect_uri: config.spotify.redirect_uri,
            state: state
        }));
    },

    /*
        Handle the callback from Spotify with auth code.
    */
    handleAuthorizationResponse : function(req, res) {
        var d = Q.defer();
        
        // Grab auth code and state stuff from callback request.
        var authCode = req.query.code || null;
        var state = req.query.state || null;
        var storedState = req.cookies ? req.cookies[config.spotify.state_key] : null;

        if (state === null || state !== storedState) {
            d.reject('State mismatch error.');
        } else {
            res.clearCookie(config.spotify.state_key);
            res.send('Spotify auth success! You can close this window now.');
            d.resolve(authCode);
        }

        return d.promise;
    },

    /*
        Make request for access and refresh token from Spotify using the auth_code.
    */
    requestTokens : function(authCode) {
        var d = Q.defer();
        spotifyApi.authorizationCodeGrant(authCode).then(function(data) {
            spotifyApi.setAccessToken(data.access_token);
            spotifyApi.setRefreshToken(data.refresh_token);
            d.resolve(data.expires_in);
        }, function(err) {
            d.reject('Spotify auth failed, probably refreshed URL with old token. Error: ' + err);
        });
        return d.promise;
    },

    /*
        Make request to refresh the access token.
    */
    requestRefreshToken : function() {
        var d = Q.defer();
        spotifyApi.refreshAccessToken().then(function(data) {
            spotifyApi.setAccessToken(data.access_token);
            d.resolve(data.expires_in);
        }, function(err) {
            d.reject('Failed to refresh token. Error: ' + err);
        });
        return d.promise;
    },
  
    /*
        Make request to search for a track.
        Returns the first track in the response.
    */
    search : function(query) {
        var d = Q.defer();
        spotifyApi.searchTracks(query).then(function(data) {
            if(data.tracks.total <= 0) d.reject('Spotify search return no results.');
            d.resolve(data.tracks.items[0]);
        }, function(err) {
            d.reject('Failed to search Spotify. Error: ' + err);
        });
        return d.promise;

    },

    /*
        Make request to add track to playlist.
    */
    addTrackToPlaylist : function(uri) {
        return spotifyApi.addTracksToPlaylist(
            config.spotify.username, 
            config.spotify.playlist_id, 
            [ uri ], 
            { position : 0 }
        );
    }
};