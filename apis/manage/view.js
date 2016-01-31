var _ = require('lodash'),
	async = require('async'),
	path = require('path'),
	multiparty = require('multiparty'),
	debug = require('debug')('eathomely:api/manage/view');

module.exports = {
	countAll: {
		path: '/manage/view/count/all',
		description: 'get views',
		method: 'get',
		fn: function (req, res, next) {
			req.models.View.findAll({
				userId: req.user.id,
				campaignId: req.params.campaignId
			}).then(function (results) {
				var t = 0;
				results.forEach(function (x) {
					t += x.count;
				});
				res.ok(t);
			}, res.error);
		}
	},
	countMonthly: {
		path: '/manage/view/count/month',
		description: 'get views',
		method: 'get',
		fn: function (req, res, next) {
			var from = req.query.from && new Date(parseInt(req.query.from, 10)) || (function (d) {d.setMonth(d.getMonth() - 1); return d;})(new Date()),
				to = req.query.to && new Date(parseInt(req.query.to, 10)) || (new Date());
			req.models.View.findAll({
				userId: req.user.id,
				campaignId: req.params.campaignId,
				updateAt: {
					$gt: from,
					$lt: to,
				}
			}).then(function (result) {
				var t = 0;
				result.forEach(function (x) {
					t += x.count;
				});
				res.ok(t);
			}, res.error);
		}
	},
	get: {
		path: '/manage/view/:campaignId',
		description: 'get views',
		method: 'get',
		fn: function (req, res, next) {
			req.models.View.findAll({
				userId: req.user.id,
				campaignId: req.params.campaignId
			}).then(res.success, res.error);
		}
	},
	put: {
		path: '/manage/view/:campaignId/:uuid',
		description: 'put views',
		method: 'put',
		fn: function (req, res, next) {
			console.log('test');
			// process images
			async.waterfall([
				function (go) {
					var form = new multiparty.Form();
					form.parse(req, function (err, fields, files) {
						if (err) {
							return go(err);
						}
						if (!files.file) {
							return res.badRequest('Missing arguments.');
						}
						var Product = req.models.Product
							productId = req.params.productId,
							files = files.file;

						req.models.Campaign.findOne({
							id: req.params.campaignId
						}).then(function (campaign) {
							if (!campaign) {
								return res.unauthorized();
							}
							go(null, campaign, files);
						}, go);
					});
				},
				function (campaign, files, go) {
					go(null);
					// send to api server
					var filePath = files[0].path;
					req.haven.call('detectfaces', { file: filePath }).on('data', function (response) {
						if (!response.face) { return; }
						var noFaces = response.face.length;
						debug('noFaces', noFaces);
						req.models.View.create({
							count: noFaces,
							UUID: req.params.uuid
						}).then(debug, res.error);
					});
				}
			], function (err) {
				if (err) { return res.error(err); }
				res.ok();
			});
		}
	}
};
