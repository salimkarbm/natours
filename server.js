const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('unhandleRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exceptions Shutting Down...');
  process.exit(1);
});

dotenv.config();
const app = require('./app');

const PORT = process.env.PORT || 8000;

let DB;
if (process.env.NODE_ENV === 'development') {
  DB = process.env.LOCAL_DB;
} else if (process.env.NODE_ENV === 'production') {
  DB = process.env.DATABASE;
}
mongoose
  .connect(DB, {})
  .then(() => {
    console.log('db connection established');
  })
  .catch(() => {
    console.log('error connecting');
  });

const server = app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}...`);
});

process.on('unhandleRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandle Rejection! Shuttin Down...');
  server.close(() => {
    process.exit(1);
  });
});
