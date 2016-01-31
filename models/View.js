/**
 * View Model
 */

var clout = require('clout-js'),
	_ = require('lodash'),
	async = require('async'),
    debug = require('debug')('/model/View'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise');

if (!Sequelize) {
	return;
}

var definition = {
        count: { type: Sequelize.INTEGER, allowNull: false },
        UUID: { type: Sequelize.STRING, allowNull: false }
	},
	props = {
    },
	View = sequelize.define('View', definition, props);


View.belongsTo(require('./Campaign'), { foreignKey: 'campaignId' });

module.exports = View;