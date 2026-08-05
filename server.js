const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
// const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB) //it returns a promise
  .then((con) => {
    console.log('DB connections successful');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

//handling unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! SHutting down.......');
  console.log(err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, Shutting down gracefully');
  server.close(() => {
    console.log('process terminated!');
  });
});
