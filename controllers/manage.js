/**
 * Prelaunch Home
 */
var path = require('path'),
	async = require('async');

var TEMPLATE_PATH = path.join(__dirname, '../views/manage/template'),
	TEMPLATE_DIR = path.join(__dirname, '../views/manage');

module.exports = {
	path: '/manage',
	method: 'all',
	description: 'Homepage',
	fn: function (req, res, next) {
		var template = {
			layout: TEMPLATE_PATH,
			title: 'Introducing the new way of marketing',
			javascript: ['/js/manage.js'],
			css: []
		};
		if (!req.session.partner) {
			// render login
			template.title = 'Partner Login';
			template.css.push('//cdn.datatables.net/1.10.10/css/jquery.dataTables.min.css', '/css/manage-login.css');
			template.javascript.push('/js/jquery-datatables.min.js', '/js/angular-datatables.min.js', '/js/manage-login.js');
			template.navRight = [
				{ active: true, icon: 'fa fa-chevron-left', title: 'Back to Home Page', href: '/' }
			];

			return res.render(path.join(TEMPLATE_DIR, 'login'), template);
		}
		template.javascript.push('//cdn.datatables.net/1.10.10/js/jquery.dataTables.min.js', '/js/angular-datatables.min.js', '/js/manage-partner.js');
		template.css.push('//cdn.datatables.net/1.10.10/css/jquery.dataTables.min.css', '/css/manage.css');
		template.user = req.user;
		res.render(path.join(TEMPLATE_DIR, 'home'), template);
	}
};
