/**
 * @author Arran White https://github.com/arrwhidev @arranwhite_
 */

var Q = require('q');
var fs = require('fs');
var config = require('./config');
var osenv = require('osenv');
var _ = require('lodash');

var lastTweetIdFilePath = function() {
    return osenv.home() + '/' + config.app.last_tweet_id_file;
};

var contains = function(value, array) {
    return  _.some(array, function(entry) {
        return value === entry;
    });
}

module.exports = {

    isTweetByWhitelistedUser: function(twitterHandle, whitelist) {
        if(whitelist.length == 0) return true;
        return contains(twitterHandle, whitelist);
    },

    isTweetByBlacklistedUser: function(twitterHandle, blacklist) {
        if(blacklist.length == 0) return false;
        return contains(twitterHandle, blacklist);
    },

    prepareTweetTextForSpotify: function(tweetText) {
        return tweetText.replace(config.twitter.hashtag + ' ', ''); // Remove hashtag.
    },

    doesTweetStartWithHashtag: function(tweetText, hashtag) {
        return tweetText.indexOf(hashtag) == 0;
    },

    saveLastTweetId: function(id) {
        return Q.nfcall(fs.writeFile, lastTweetIdFilePath(), id);
    },

    readLastTweetId: function() {
        return fs.readFileSync(lastTweetIdFilePath(), 'utf-8');
    },

    createFileIfNotExists: function() {
        var d = Q.defer();

        if (fs.existsSync(lastTweetIdFilePath())) {
            d.resolve();
        } else {
            fs.writeFileSync(lastTweetIdFilePath(), '0');
            d.resolve();
        }

        return d.promise;
    },

    logTweetDetails: function(tweet) {
        console.log('Found a tweet! Details:');
        console.log('  User: ' + tweet.user.screen_name);
        console.log('  Text: ' + tweet.text);
    },

    generateRandomString: function(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
