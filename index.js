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

var lastTweetId;
var isPolling = false;
var time;
var app = express();
app.use(express.static(__dirname + '/public')).use(cookieParser());

app.listen(config.app.port, function () {
    Q.fcall(f.createFileIfNotExists).then(function() {
        console.log('Server started!');
        console.log('Tweet polling interval: ' + config.app.polling_interval_in_seconds + ' seconds.');
        console.log('Visit http://localhost:' + config.app.port + ' in a browser and authorize Spotify.');
    }).fail(function(reason) {
        console.log(reason);
    }).done();
});

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
    lastTweetId = f.readLastTweetId();

    setInterval(function() {
        time.tick();
        if(time.shouldRefresh()) doRefresh();
        doSearch();
    }, config.app.polling_interval_in_seconds * 1000);
}

var doRefresh = function() {
    Q.fcall(spotifyApi.requestRefreshToken).then(function(expiresIn) {
        time.setExpiresIn(expiresIn);
        console.log('The access token has been refreshed!');
    }).fail(function(reason) {
        console.log(reason);
    }).done();
}

var doSearch = function() {
    Q.fcall(twitterApi.searchForTweets, lastTweetId).then(function(tweets) {
        var promises = [];
        for(var i = 0; i < tweets.length; i++) {
            promises.push(processTweet(tweets[i]));
        }

        Q.allSettled(promises).then(function(results) {
            // TODO - do something with failed results.
            var lastId = tweets[0].id;
            lastTweetId = lastId;
            _writeLastTweetIdToFile(lastId);
        });
    }).fail(function(reason) {
        console.log(reason);
    }).done();
}

function processTweet(tweet) {
    var d = Q.defer();

    if(!_isTweetValid(tweet)) {
        d.reject('Tweet is not valid');
    } else {
        _logTweetDetails(tweet);
        var tweetText = _prepareTweetTextForSpotify(tweet.text);
        console.log('Searching Spotify for:', tweetText);

        Q.fcall(spotifyApi.search, tweetText).then(function(searchResult) {
            console.log('Trying to add track to playlist URI:', searchResult.uri);
            return spotifyApi.addTrackToPlaylist(searchResult.uri);
        }).then(function() {
            console.log('Successfully added track to playlist!');
            d.resolve();
        }).fail(function(reason) {
            console.log('Error:', reason);
            d.reject(reason);
        }).done();
    }

    return d.promise;
}

function _writeLastTweetIdToFile(id) {
    Q.fcall(f.saveLastTweetId, id).then(function() {
        // Successfully wrote id to file.
    }).fail(function(reason) {
        console.log('Failed to write last tweet id to file.');
    }).done();
}

function _isTweetValid(tweet) {
    if(!f.doesTweetStartWithHashtag(tweet.text, config.twitter.hashtag)) return false;
    if(!f.isTweetByWhitelistedUser(tweet.user.screen_name, config.twitter.handleWhitelist)) return false;
    if(f.isTweetByBlacklistedUser(tweet.user.screen_name, config.twitter.handleBlacklist)) return false;
    if(parseInt(tweet.id) === parseInt(lastTweetId)) return false;
    return true;
}

function _prepareTweetTextForSpotify(tweetText) {
    var parsed = tweetText.replace(config.twitter.hashtag + ' ', ''); // Remove hashtag.
    return parsed;
}

function _logTweetDetails(tweet) {
    console.log('Found a tweet! Details:');
    console.log('  User: ' + tweet.user.screen_name);
    console.log('  Text: ' + tweet.text);
}
