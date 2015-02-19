/**
 * @author Arran White https://github.com/arrwhidev @arranwhite_
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var Q = require('q');

var spotifyApi = require('./spotify-api');
var twitterApi = require('./twitter-api');
var config = require('./config');
var f = require('./functions');
var Time = require('./time.js');

var isPolling = false;
var time;
var app = express();
app.use(express.static(__dirname + '/public')).use(cookieParser());

app.get('/login', function(req, res) {
    if(isPolling) {
        res.send('Spotify API already authorized.');
        return;
    }
    spotifyApi.requestAuthorization(res);
});

app.get('/callback', function(req, res) {
    if(isPolling) {
        res.send('Not expecting a callback.');
        return;
    }

    Q.fcall(spotifyApi.handleAuthorizationResponse, req, res).then(function(authCode) {
        return spotifyApi.requestTokens(authCode);
    }).then(function(expiresIn) {
        console.log('Spotify API authorized!');
        startPolling(expiresIn);
    }).fail(function(reason) {
        console.log(reason);
    }).done();
});

var startPolling = function(expiresIn) {
    isPolling = true;
    time = new Time(expiresIn);

    setInterval(function() {
        time.tick();
        if(time.shouldRefresh()) doRefresh();
        doSearch();
    }, config.app.polling_interval_in_seconds * 1000); 
}

var doSearch = function() {
    Q.fcall(twitterApi.searchForATweet).then(function(tweetText) {    
        console.log('Searching Spotify for:', tweetText);
        return spotifyApi.search(tweetText);
    }).then(function(searchResult) {
        console.log('Trying to add track to playlist URI:', searchResult.uri);
        return spotifyApi.addTrackToPlaylist(searchResult.uri);
    }).then(function() {
        console.log('Successfully added track to playlist!');
    }).fail(function(reason) {
        console.log(reason);
    }).done();
}

var doRefresh = function() {
    Q.fcall(spotifyApi.requestRefreshToken).then(function(expiresIn) {
        time.setExpiresIn(expiresIn);
        console.log('The access token has been refreshed!');
    }).fail(function(reason) {
        console.log(reason);
    }).done();         
}

app.listen(config.app.port, function () {
    Q.fcall(f.createFileIfNotExists).then(function() {
        console.log('Server started!');
        console.log('Tweet polling interval: ' + config.app.polling_interval_in_seconds + ' seconds.');
        console.log('Visit http://localhost:' + config.app.port + ' in a browser and authorize Spotify.');
    }).fail(function(reason) {
        console.log(reason);
    }).done();
});