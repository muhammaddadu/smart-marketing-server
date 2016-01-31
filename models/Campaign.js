/**
 * Campaign Model
 */

var clout = require('clout-js'),
	_ = require('lodash'),
	async = require('async'),
    debug = require('debug')('/model/Campaign'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise');

if (!Sequelize) {
	return;
}

var definition = {
        name: { type: Sequelize.STRING, allowNull: false },
        image: { type: Sequelize.STRING, allowNull: true },
        bid: { type: Sequelize.DOUBLE(), allowNull: true, default: 0 },
	},
	props = {
    },
	Campaign = sequelize.define('Campaign', definition, props);


Campaign.belongsTo(require('./User'), { foreignKey: 'userId' });

module.exports = Campaign;