/**
 * Development Application Configuration
 */
module.exports = {
	http: {
		port: 8088
	},
	sequelize: {
		username: 'hackcambridge',
		password: '6b382667-5bfd-42df-95cc-0b22b1fb587e',
		database: 'hackcambridge',
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
