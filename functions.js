/**
 * @author Arran White https://github.com/arrwhidev @arranwhite_
 */

var Q = require('q');
var fs = require('fs');
var config = require('./config');

module.exports = {

    saveLastTweetId : function(id) {
        return Q.nfcall(fs.writeFile, config.app.last_tweet_id_file, id);
    },

    readLastTweetId : function() {
        return fs.readFileSync(config.app.last_tweet_id_file, 'utf-8');
    },

    createFileIfNotExists : function() {
        var d = Q.defer();

        if (fs.existsSync(config.app.last_tweet_id_file)) {
            d.resolve();
        } else {
            fs.writeFileSync(config.app.last_tweet_id_file, '0');
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
