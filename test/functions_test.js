var assert = require("assert");
var f = require('../functions.js');

describe('functions.js', function() {
    describe('#isTweetByWhitelistedUser()', function () {
        it('should return true when tweet by whitelisted user.', function () {
            var whitelist = ['user1', 'user2'];
            var result = f.isTweetByWhitelistedUser('user1', whitelist);
            assert.equal(true, result);
        });

        it('should return false when tweet not by whitelisted user.', function () {
            var whitelist = ['user1', 'user2'];
            var result = f.isTweetByWhitelistedUser('user3', whitelist);
            assert.equal(false, result);
        });

        it('should return true when whitelist is empty.', function () {
            var result = f.isTweetByWhitelistedUser('user3', []);
            assert.equal(true, result);
        });
    });

    describe('#isTweetByBlacklistedUser()', function () {
        it('should return true when tweet by blacklisted user.', function () {
            var blacklist = ['user1', 'user2'];
            var result = f.isTweetByBlacklistedUser('user1', blacklist);
            assert.equal(true, result);
        });

        it('should return false when tweet not by blacklisted user.', function () {
            var blacklist = ['user1', 'user2'];
            var result = f.isTweetByBlacklistedUser('user3', blacklist);
            assert.equal(false, result);
        });

        it('should return false when blacklist is empty.', function () {
            var result = f.isTweetByBlacklistedUser('user3', []);
            assert.equal(false, result);
        });
    });

    describe('#doesTweetStartWithHashtag()', function () {
        it('should return true when tweet starts with hashtag', function () {
            var tweet = '#aswjukebox foo bar';
            var hashtag = '#aswjukebox';
            var result = f.doesTweetStartWithHashtag(tweet, hashtag);
            assert.equal(true, result);
        });

        it('should return false when tweet does not start with hashtag.', function () {
            var tweet = '#wronghashtag foo bar';
            var hashtag = '#aswjukebox';
            var result = f.doesTweetStartWithHashtag(tweet, hashtag);
            assert.equal(false, result);
        });
    });
});
