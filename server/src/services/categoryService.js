const Category = require('../models/Category');

exports.getAll = () => Category.find().lean();