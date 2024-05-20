const router = require('express').Router();

const userService = require('../services/userService');

router.post('/login', (req, res) => {
    const userData = req.body;
    console.log(userData);
    res.send('login');
})

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, repeatPass } = req.body;

    //TODO: validate email format
    //TODO: password === repeatPass ?
    console.log(req.body);

    await userService.register(firstName, lastName, email, password, repeatPass);
    res.send('register');
});

module.exports = router;