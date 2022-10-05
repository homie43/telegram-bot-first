const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telega_bot_first',
    'root',
    'root',
    {
        host: '77.223.106.110',
        port: '6432',
        dialect: 'postgres'
    }
);