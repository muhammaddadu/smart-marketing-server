var _ = require('lodash'),
	async = require('async'),
	path = require('path'),
	multiparty = require('multiparty'),
	fs = require('fs'),
	util = require('util'),
	debug = require('debug')('eathomely:api/manage/campaign');

const FILE_DIR = path.join(__dirname, '../../public/pimg');

module.exports = {
	getForUUID: {
		path: '/manage/campaign/uuid/:uuid',
		description: 'get campaigns',
		method: 'get',
		fn: function (req, res, next) {
			// find product with biggest bid
			req.models.Campaign.findAll().then(function (campaigns) {
				var heighest = {campaign: null, bid: -1};
				campaigns.forEach(function (campaign) {
					if (campaign.bid > heighest.bid) {
						heighest.campaign = campaign;
					}
				});
				res.ok(heighest.campaign);
			}, res.error);
		}
	},
	get: {
		path: '/manage/campaign',
		description: 'get campaigns',
		method: 'get',
		fn: function (req, res, next) {
			req.models.Campaign.findAll({
				userId: req.user.id
			}).then(res.success, res.error);
		}
	},
	getById: {
		path: '/manage/campaign/:id',
		description: 'get campaign by id',
		method: 'get',
		fn: function (req, res, next) {
			req.models.Campaign.findOne({
				userId: req.user.id,
				id: req.params.id
			}).then(res.success, res.error);
		}
	},
	put: {
		path: '/manage/campaign',
		description: 'put campaigns',
		method: 'put',
		fn: function (req, res, next) {
			var input = JSON.parse(JSON.stringify(req.query));
			input.userId = req.user.id;
			_.merge(input, req.body);
			req.models.Campaign.create(input).then(res.ok, res.error);
		}
	},
	putImage: {
		path: '/manage/campaign/:id/image',
		description: 'put campaigns',
		method: 'put',
		fn: function (req, res, next) {
			// upload
			async.waterfall([
				function (go) {
					var form = new multiparty.Form();
					form.parse(req, function (err, fields, files) {
						if (err) {
							return go(err);
						}
						if (!req.params.id || !files.file) {
							return res.badRequest('Missing arguments.');
						}
						var Product = req.models.Product
							productId = req.params.productId,
							files = files.file;

						req.models.Campaign.findOne({
							userId: req.user.id,
							id: req.params.id
						}).then(function (campaign) {
							if (!campaign) {
								return res.unauthorized();
							}
							go(null, campaign, files);
						}, go);
					});
				},
				function (campaign, files, go) {
					var is = fs.createReadStream(files[0].path),
						destinationFile = path.join(FILE_DIR, String(new Date().getTime()) + '.jpg'),
						os = fs.createWriteStream(destinationFile);

					util.pump(is, os, function() {
					    fs.unlinkSync(files[0].path);
						// move file
						campaign.image = '/pimg/' + destinationFile.split('pimg/')[1];
						campaign.save().then(res.ok, go);
					});
				}
			], function (err) {
				if (err) { return res.error(err); }
				res.ok();
			});
		}
	},
	post: {
		path: '/manage/campaign/:id',
		description: 'update campaign',
		method: 'post',
		fn: function (req, res, next) {
			var input = JSON.parse(JSON.stringify(req.query));
			_.merge(input, req.body);
			req.models.Campaign.findOne({
				userId: req.user.id,
				id: req.params.id
			}).then(function (campaign) {
				['name', 'bid'].forEach(function (t) {
					typeof input[t] !== 'undefined' && (campaign[t] = input[t]);
				});
				campaign.save().then(res.ok, res.error);
			}, res.error);
		}
	}
};
