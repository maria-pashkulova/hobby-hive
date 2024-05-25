const router = require('express').Router();

const userService = require('../services/userService');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userData = await userService.login(email, password);

        //httpOnly: true + React ?
        res.cookie(process.env.COOKIE_NAME, userData.token, { httpOnly: true });

        res.json(userData);

        // res.send('Successfully logged in!');

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }



})

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    //TODO: validate email format
    // console.log(req.body);

    try {

        const user = await userService.register(firstName, lastName, email, password);

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
        });

    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }

});

router.get('/logout', (req, res) => {
    //TO DO - invalidate token - да се измисли механизъм за инвалидиране на токена
    res.clearCookie(process.env.COOKIE_NAME);
    res.end();
});

module.exports = router;