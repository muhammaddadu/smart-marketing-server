/**
 * Subscriber Model
 */

var clout = require('clout-js'),
	_ = require('lodash'),
	crypto = require('crypto'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise');

if (!Sequelize) {
	return;
}

var definition = {
		firstName: { type: Sequelize.STRING, allowNull: false },
		lastName: { type: Sequelize.STRING, allowNull: false },
		email: { type: Sequelize.STRING, allowNull: false, validate: { isEmail: true } },
		password: { 
			type: Sequelize.STRING,
			allowNull: false,
			set: function (value) {
				value = createHash(value);
				this.setDataValue('password', value);
			}
		},
		activated: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
		activationKey: {
			type: Sequelize.STRING,
			allowNull: true,
			set: function (value) {
				value = createHash(String(Date.now() + Math.random()));
				this.setDataValue('activationKey', value);
			}
		},
        companyName: { type: Sequelize.STRING, allowNull: false },
		resetPasswordToken: { type: Sequelize.STRING, allowNull: true },
		resetPasswordDate: { type: Sequelize.DATE, allowNull: true }
	},
	props = {
		getterMethods : {
			fullName : function getFullName() { 
				return this.firstName + ' ' + this.lastName; 
			}
		},
		instanceMethods: {
			authenticate: function authenticate(password, cb) {
				var self = this;
				return new Promise(function (resolve, reject) {
					if (self.password !== createHash(password)) {
						return reject('Invalid Password');
					}
					resolve(self);
				});
			},
			activate: function activate(activationKey) {
				var self = this;
				new Promise(function (resolve, reject) {
					if (activationKey !== self.activationKey) {
						return reject('Invalid Activation Key');
					}
					self.activated = true;
					self.save().then(resolve, reject);
				});
			},
			toJson: function toJson() {
				var userCpy = JSON.parse(JSON.stringify(this));
				userCpy.password && (delete userCpy.password);
				userCpy.resetPasswordToken && (delete userCpy.resetPasswordToken);
				userCpy.resetPasswordDate && (delete userCpy.resetPasswordDate);
				userCpy.activationKey && (delete userCpy.activationKey);
				return userCpy;
			}
		}
	},
	User = sequelize.define('User', definition, props);

/**
 * Relationships
 */
require('./Partner').belongsTo(User, { foreignKey: 'userId' });

/**
 * Static Methods
 */
function createHash(text) {
	var shasum = crypto.createHash('sha1');
	shasum.update(text);
	return shasum.digest('hex');
}

User.serializeUser = function serializeUser() {
	return function (user, cb) {
		cb(null, user.get('email') || null);
	};
};

User.deserializeUser = function deserializeUser() {
	var self = this;
	return function (email, cb) {
		self.findOne({where: {email: email}}).then(function (a) {cb(null, a);}, cb)
	};
};

User.authenticate = function authenticate() {
	var self = this;
	return function (email, password, cb) {
		self.findOne({where: {email: email}}).then(function (user) {
			if (!user) {
				return cb(null, null, { message: 'Incorrect Email' });
			}
			return user.authenticate(password).then(function (a) {cb(null, a);}, cb);
		}, cb);
	};
};

User.findByEmail = function findByEmail(email, cb) {
	return this.find({ 
		where: { 'email': email && email.toLowerCase() }
	});
};

User.register = function register(user) {
    // Create an instance
    user = this.build(user);
    var self = this;
	return new Promise(function (resolve, reject) {
	    if (!_.isObject(user)) {
	    	return reject('invalid arguments');
	    }
	    self.findByEmail(user.get('email')).then(function (existingUser) {
			if (existingUser) { return reject('Email already exists'); }
			user.save().then(resolve, reject);
		}, reject);
	});
}

module.exports = User;
