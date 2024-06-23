const router = require('express').Router();
const locationService = require('../services/locationService');


//http://localhost:5000/locations

router.get('/', async (req, res) => {

    const allLocations = await locationService.getAll();

    res.json(allLocations);
});


module.exports = router;
