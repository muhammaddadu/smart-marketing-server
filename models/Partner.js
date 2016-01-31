/**
 * Partner Model
 */

var clout = require('clout-js'),
	_ = require('lodash'),
	async = require('async'),
    debug = require('debug')('/model/Partner'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise');

if (!Sequelize) {
	return;
}

var definition = {
        companyName: { type: Sequelize.STRING, allowNull: false },
	},
	props = {
    },
	Partner = sequelize.define('Partner', definition, props);

/**
 * Static Methods
 */
Partner.register = function register(input) {
    var self = this,
        User = require('./User');
    return new Promise(function (resolve, reject) {
        if (!_.isObject(input)) {
        	return reject('invalid arguments');
        }
        async.waterfall([
            function createUser(go) {
                User.register(input).then(function (user) {
                    go(null, user);
                }, go);
            },
            function createPartner(user, go) {
                var partner = self.build({
                    companyName: input.companyName,
                    userId: user.id
                });
                partner.save().then(resolve, go);
            }
        ], function (err, user, partner) {
            if (err) { return reject(err); }
        });
    });
}

module.exports = Partner;
