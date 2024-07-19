const Location = require('../models/Location');

exports.getAll = () => Location.find().sort({ name: 1 }).lean();