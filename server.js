const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = require('./app');

const PORT = process.env.PORT || 8000;

let DB;
if (process.env.NODE_ENV === 'development') {
  DB = process.env.DATABASE;
}
mongoose.connect(DB, {}).then(() => {
  console.log('db connection established');
});

const server = app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}...`);
});

process.on('unhandleRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandleRejection! Shuttin Down...');
  server.close(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
});
