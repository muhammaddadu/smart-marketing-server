/**
 * Clout Auth Server
 */
var passport = require('passport'),
	_ = require('lodash'),
	async = require('async'),
	path = require('path'),
	debug = require('debug')('eathomely:api/auth');

module.exports = {
	login: {
		path: '/login/:type?',
		description: 'clout auth login',
		method: 'post',
		params: {
			email: ['email', 'string', 'clout email'],
			password: ['password', 'string', 'password assosiated with email'],
		},
		fn: function login(req, res, next) {
			var self = this;
			debug('passport.authenticate:local');
			var type = req.params.type || 'consumer';
			debug('type: ' + type);
			async.waterfall([
				function authenticate(go) {
					passport.authenticate('local', function (err, user, info) {
						if (err) { debug(err); return go(err); }
						if (!user) {
							debug('Invalid Username or Password');
							return res.unauthorized('Invalid Username or Password');
						}
						debug('user: ', user.toJson());
						go(null, user);
					}).apply(self, [req, res, next]);
				},
				function login(user, go) {
					debug('req.login');
					req.login(user, function (err) {
						if (err) { debug(err); return go(err); }
						debug('logged in');
						go(null, user);
					});
				},
				function loginAsType(user, go) {
					var Staff = req.models.Staff,
						Partner = req.models.Partner;
					function createHandle(type) {
						return function (res) {
							if (!res) { return go('Account Not Found'); }
							req.session[type] = res;
							user[type] = res;
							go(null, user);
						}
					}
					switch (type) {
						case 'partner':
							Partner.findOne({where: {userId: user.id}}).then(createHandle('partner'), go);
						break;
						default:
							go(null, user);
						break;
					}
				}
			], function (err, user) {
				if (err) { debug(err); return res.error(err); }
				req.session.user = user;
				res.success(user.toJson());
			});
		}
	},
	logout: {
		path: '/logout',
		description: 'clout auth logout',
		method: 'get',
		fn: function logout(req, res, next) {
			req.logout();
			// req.session.destroy();
			req.session.user = null;
			req.session.staff = null;
			req.session.partner = null;
			res.success();
		}
	},
	register: {
		path: '/register/:type?',
		description: 'register clout account',
		method: 'post',
		fn: function register(req, res, next) {
			var type = (function (a) { return a.charAt(0).toUpperCase() + a.slice(1); })(req.params.type || 'customer');
			if (['Customer', 'Partner'].indexOf(type) === -1) {
				return res.badRequest('Invalid user type');
			}
			debug('Creating new %s', type);
			var input = _.extend(req.query, typeof req.body === 'object' ? req.body : {});
			type === 'Customer' && input.vertified && (input.vertified = null);
			input.activationKey = 'RAND';
			debug('Registering');
			req.models[type].register(input).then(function (result) {
				if (!result) { res.error('Please fill in all your details'); }
				req.session.user && req.session.user.id && result && (req.session[req.params.type.toLowerCase()] = result);
				return res.success(result);
			}, res.error);
		}
	},
	whoami: {
		path: '/whoami',
		description: 'returns information about the current session',
		method: 'get',
		fn: function whoami(req, res, next) {
			if (!req.user) {
				return res.badRequest('You are not logged in');
			}
			res.success({
				user: req.user && req.user.toJson(),
				partner: req.session.partner
			});
		}
	}
};
