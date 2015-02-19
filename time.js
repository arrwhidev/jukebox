/**
 * @author Arran White https://github.com/arrwhidev @arranwhite_
 */

var config = require('./config');

function Time(expiresIn) {
    this.upTimeInSeconds = 0;
    this.secondsSinceTokenRefresh = 0;
    this.secondsUntilTokenExpires = expiresIn;
};

Time.prototype.tick = function() {
    this.upTimeInSeconds += config.app.polling_interval_in_seconds;
    this.secondsSinceTokenRefresh += config.app.polling_interval_in_seconds;

    console.log('\nUp time: ' + this.upTimeInSeconds + ' seconds.');
    console.log('Seconds since token refresh: ' + this.secondsSinceTokenRefresh);
}

// Refreshing token prematurely to be safe.
// If token expires in 60 minutes, then refresh every 30 minutes.
Time.prototype.shouldRefresh = function() {
    if(this.secondsSinceTokenRefresh >= this.secondsUntilTokenExpires / 2) {
        this.secondsSinceTokenRefresh = 0;
        return true;
    }
    return false;
}

Time.prototype.setExpiresIn = function(expiresIn) {
    this.secondsUntilTokenExpires = expiresIn;
}

module.exports = Time;