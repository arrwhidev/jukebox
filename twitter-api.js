/**
 * @author Arran White https://github.com/arrwhidev @arranwhite_
 */

var twitter = require('twit');
var Q = require('q');
var config = require('./config');
var f = require('./functions');

var twit = new twitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
});

module.exports = {

    /*
        Make request to Twitter API to search for tweets.
    */
    searchForTweets : function(since_id) {
        var d = Q.defer();
        _searchTwitter(d, since_id);
        return d.promise;
    }
}

function _searchTwitter(d, since_id) {
    twit.get('search/tweets', _generateJSONForAPI(since_id), function(err, data, res) {
        if(err) {
            d.reject('Twitter search API failed. ' + err);
        } else {
            var numTweets = data.statuses.length;
            if(numTweets < 1) {
                d.reject('No new tweets.');
            } else {
                var tweets = data.statuses;
                d.resolve(tweets);
            }
        }
    });
}

function _generateJSONForAPI(since_id) {
    var query = config.twitter.hashtag + ' since_id:' + since_id;
    var json = {
        count: 100,
        q: query
    };
    return json;
}
