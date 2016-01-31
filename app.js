/**
 * Clout Auth Server
 */
var clout = require('clout-js'),
	_ = require('lodash'),
	passport = require('passport'),
	path = require('path'),
	partials = require('express-partials'),
	hod = require('havenondemand'),
	debug = require('debug')('eathomely:app');

// var memwatch = require('memwatch-next');
// memwatch.on('leak', function (info) {
// 	console.log('memwatch-leak:', JSON.stringify(info, null, '\t'));
// });
// memwatch.on('stats', function (info) {
// 	console.log('memwatch-stats: ', JSON.stringify(info, null, '\t'));
// });

clout.app.use(partials()); // partials

clout.on('started', function () {
	if (clout.server.https) {
		console.info('https server started on port %s', clout.server.https.address().port);
	}
	if (clout.server.http) {
		console.info('http server started on port %s', clout.server.http.address().port);
	}
	clout.io = require('socket.io')(clout.server.http);
	clout.io.on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});
});

clout.config.partners.haven && (clout.haven = new hod.HODClient(clout.config.partners.haven.apikey));

clout.app.use(function (req, res, next) {
	clout.haven && (req.haven = clout.haven);
	next();
});

// setup master account
clout.on('started', function () {
	
});

// setup tags & categories
clout.on('started', function () {

});

// Append passport to middleware
debug('appending passport to middleware');
(function setupPassport() {
	var STRATEGIES_DIR = path.join(__dirname, 'strategies');
	debug('STRATEGIES_DIR: %s', STRATEGIES_DIR);
	
	clout.utils.getGlobbedFiles(STRATEGIES_DIR + '/**/*.js').forEach(function load(filePath) {
		debug('loading strategy %s', filePath);
		passport.use(require(filePath)());
	});
	debug('passport.initialize');
	clout.app.use(passport.initialize());
	debug('passport.session');
	clout.app.use(passport.session());

	debug('passport.serializeUser');
	passport.serializeUser(clout.models.User.serializeUser());
	debug('passport.deserializeUser');
	passport.deserializeUser(clout.models.User.deserializeUser());
})();

clout.start();

module.exports = clout;