const Location = require('../models/Location');

exports.getAll = () => Location.find().lean();