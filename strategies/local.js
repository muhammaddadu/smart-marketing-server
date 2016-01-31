/**
 * Clout Auth Server
 */
var clout = require('clout-js'),
	LocalStrategy = require('passport-local').Strategy;

var options = {
	usernameField: 'email',
	passwordField: 'password'
};

module.exports = function createStrategy() {
	return new LocalStrategy(options, clout.models.User.authenticate());
}
