/**
 * Prelaunch Home
 */
var path = require('path'),
	async = require('async');

var TEMPLATE_PATH = path.join(__dirname, '../views/frontend/template'),
	HOME_TEMPLATE_PATH = path.join(__dirname, '../views/frontend/home');

module.exports = {
	path: '/',
	method: 'all',
	description: 'Homepage',
	fn: function (req, res, next) {
		var template = {
			layout: TEMPLATE_PATH,
			title: 'Introducing the new way of marketing',
			javascript: ['/js/frontend.js', '/js/frontend-home.js']
		};
		res.render(HOME_TEMPLATE_PATH, template);
	}
}
