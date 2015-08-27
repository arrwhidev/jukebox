/**
 * @author Arran White https://github.com/arrwhidev @arranwhite_
 */

var Q = require('q');
var fs = require('fs');
var config = require('./config');
var osenv = require('osenv');

var lastTweetIdFilePath = function() {
    return osenv.home() + '/' + config.app.last_tweet_id_file;
};

module.exports = {

    saveLastTweetId : function(id) {
        return Q.nfcall(fs.writeFile, lastTweetIdFilePath(), id);
    },

    readLastTweetId : function() {
        return fs.readFileSync(lastTweetIdFilePath(), 'utf-8');
    },

    createFileIfNotExists : function() {
        var d = Q.defer();

        if (fs.existsSync(lastTweetIdFilePath())) {
            d.resolve();
        } else {
            fs.writeFileSync(lastTweetIdFilePath(), '0');
            d.resolve();
        }

        return d.promise;
    },

    generateRandomString : function(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
