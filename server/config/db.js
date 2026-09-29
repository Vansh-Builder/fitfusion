const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let sequelize;

const useSqlite = process.env.DB_DIALECT === 'sqlite' || !process.env.DB_PASS && process.env.USE_SQLITE === 'true';

if (useSqlite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'fitfusion.sqlite'),
    logging: false,
    define: { timestamps: true, underscored: true },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'fitfusion_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: { timestamps: true, underscored: true },
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ ${useSqlite ? 'SQLite' : 'MySQL'} connected successfully`);
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
  } catch (err) {
    console.warn(`⚠️ Database connection failed (${err.message}). Switching to local SQLite database...`);
    // Reconfigure to SQLite if MySQL fails
    sequelize.options.dialect = 'sqlite';
    sequelize.options.storage = path.join(__dirname, '..', 'fitfusion.sqlite');
    
    // Create sqlite sequelize instance
    const sqliteSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'fitfusion.sqlite'),
      logging: false,
      define: { timestamps: true, underscored: true },
    });
    
    await sqliteSequelize.authenticate();
    await sqliteSequelize.sync();
    console.log('✅ SQLite database connected & synced (fitfusion.sqlite)');
  }
};

module.exports = { sequelize, connectDB };
