const router = require('express').Router();
const categoryService = require('../services/categoryService');

//http://localhost:5000/categories

//READ
router.get('/', async (req, res) => {

    const allCategories = await categoryService.getAll();

    res.json(allCategories);
});

module.exports = router;