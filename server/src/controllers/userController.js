const router = require('express').Router();

const userService = require('../services/userService');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const userData = await userService.login(email, password);

    //httpOnly: true + React ?
    res.cookie(process.env.COOKIE_NAME, userData.token, { httpOnly: true });

    res.json(userData);

    // res.send('Successfully logged in!');
})

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, repeatPass } = req.body;

    //TODO: validate email format
    //TODO: password === repeatPass ?
    // console.log(req.body);

    try {

        const user = await userService.register(firstName, lastName, email, password, repeatPass);

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
        })

    } catch (error) {
        res.status(400);
    }

});

router.get('/logout', (req, res) => {
    res.clearCookie(process.env.COOKIE_NAME);
    res.end();
});

module.exports = router;