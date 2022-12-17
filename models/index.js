const mongoose = require('mongoose');
require('dotenv').config();
mongoose.Promise = global.Promise;

const db = mongoose.connect(process.env.MONGODB_URI);
db.mongoose = mongoose;
db.Stories = require("./stories");
module.exports = db;