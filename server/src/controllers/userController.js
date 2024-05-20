const router = require('express').Router();

const userService = require('../services/userService');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await userService.login(email, password);
    res.send(user);
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