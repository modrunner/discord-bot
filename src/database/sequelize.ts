import { Sequelize } from 'sequelize';

export default new Sequelize(
  'database',
  'username',
  'password',
  {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: './database/database.sqlite',
  },
);
