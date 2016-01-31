/**
 * Development Application Configuration
 */
module.exports = {
	http: {
		port: 8080
	},
	sequelize: {
		username: 'root',
		password: 'root',
		database: 'smartBilboard',
		connection: {
			host : 'localhost',
			dialect: 'mysql',
			dialectOptions: {
				multipleStatements: true
			},
			logging: false,
			sync: { force: false }
		}
	}
};
