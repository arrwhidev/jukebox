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

/*
  NOTE: I'm unhappy with this code, it's messy and convoluted.

  The way I'm having to use the Twitter Search API to correctly 
  collect the tweets is pretty nasty. Definitely want to tidy this!

  Options to make this simpler:
    1. Twitter allow the API to return ordered tweets, oldest first 
       would make this really easy. C'mon Twitter ;)
    2. Read more than one tweet at a time. This makes the code that
       interacts with the Spotify API more complicated though, not 
       sure what's best at this time.

  Description of API options (from Twitter API documentation):
    since_id - Returns results with an ID greater than (that is, more recent than) the specified ID. 
    max_id - Returns results with an ID less than (that is, older than) or equal to the specified ID.

  How I use the API (for my own memory more than anything).
    1. Search for a tweet.
         - Always specifying since_id - first time it will be 0.
         - Only searching for one tweet at a time.
    2. API will return newest tweet.
         - If 10 tweets since last search then 9 will have been missed.
    3. Store tweet id as max_id.
         - Don't want to find any newer tweets yet.
         - Use max_id to work backwards to find the hypothetical 9 we missed.
    4. Update max_id_processed to be max_id if max_id > max_id_processed.
         - This is the id of the first tweet we found in this search.
         - This will later become the since_id. 
    5. Search for a tweet.
         - max_id has a value now so specify it to the API.
    6. API will return newest tweet less than max_id.
         - Tweet will be hypothetical tweet 9.
    7. Repeat steps until no tweets are found.
         - We can now be sure we found the hypothetical 9 tweets.
    8. Reset values.
         - Set since_id to max_id_processed.
         - Set max_id to 0.
    9. Search for a tweet using new since_id.
    
    ... then the whole process repeats.
    Now you can see why ordering the tweets in reverse order by date would make this SO EASY! :'(
*/

var max_id_processed = 0;
var max_id = 0;
var since_id = 0;

module.exports = {

    /*
        Make request to Twitter API to search for tweets.
    */
    searchForATweet : function() {
        var d = Q.defer();

        // Read since_id from file if this is the first search since jukebox started.
        if(since_id == null || since_id == 0) { 
           Q.fcall(f.readLastTweetId).then(function(lastId) {
                since_id = lastId;  
                searchTwitter(d);
            }).fail(function(reason) {
                console.log('Failed to read last tweet id from file. Error: ' + reason);
            }).done();
        } else {
            searchTwitter(d);
        }

        return d.promise;
    }
}

// TODO: Refactor this if possible - it's too long!
function searchTwitter(d) {
    twit.get('search/tweets', generateJSONForAPI(), function(err, data, res) {
        if(err) {
            d.reject('Twitter search API failed. ' + err);
        } else {
            if(since_id > 0) {
                // Once since_id is set we want to write it to a file so that if 
                // jukebox gets reset it doesn't find old tweets again.
                Q.fcall(f.saveLastTweetId, since_id).then(function() {  
                    // Successfully wrote last tweet id to file.
                }).fail(function(reason) {
                    d.reject(reason);
                }).done();
            }

            var numTweets = data.statuses.length;
            if(numTweets < 1) {
                // Update values for API.
                since_id = max_id_processed;
                max_id = 0;
                d.reject('No new tweets.');
            } else {
                var tweet = data.statuses[0];

                // When specifying since_id API should only return newer tweets, 
                // but sometimes it returns the tweet with id==since_id. Weird :/
                if(tweet.id == since_id) d.reject('No new tweets.');

                // Update values for API.
                max_id = tweet.id;
                if(max_id > max_id_processed) max_id_processed = max_id;

                // Process the tweet if valid.
                if(isTweetByWhitelistedUser(tweet.user.screen_name) &&
                   doesTweetStartWithHashtag(tweet.text)) {
                    logTweetDetails(tweet);
                    d.resolve(prepareTweetTextForSpotify(tweet.text));
                } else {
                    d.reject('Tweet not valid.');
                }
            }
        }
    });
}

function prepareTweetTextForSpotify(tweetText) {
    var parsed = tweetText.replace(config.twitter.hashtag + ' ', ''); // Remove hashtag.
    return parsed;
}

function generateJSONForAPI(lastId) {
    var query = config.twitter.hashtag + ' since_id:' + since_id;
    if(max_id != 0) query = query + ' max_id:' + max_id

    // Construct JSON for twitter search API.
    var json = {
        count: 1,
        q: query
    };
    return json;
}

function doesTweetStartWithHashtag(tweetText) {
    if(tweetText.indexOf(config.twitter.hashtag) == 0) return true;
    return false;
}

function isTweetByWhitelistedUser(twitterHandle) {
    var array = config.twitter.handleWhitelist;
    if(array.length == 0) return true;
    for (var i in array) {
        if(array[i] == twitterHandle) return true;
    }

    return false;
}

function logTweetDetails(tweet) {
    console.log('Found a tweet! Details:');
    console.log('  User: ' + tweet.user.screen_name);
    console.log('  Text: ' + tweet.text);
}