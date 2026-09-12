const path = require('path');
const jsonServer = require('json-server');

const DB_PATH = path.join(__dirname, '..', '..', 'db.json');

const router = jsonServer.router(DB_PATH);

module.exports = router;