const router = require('express').Router();

const userService = require('../services/userService');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required!' })
    }

    try {
        const userData = await userService.login(email, password);

        //httpOnly: true + React ?
        res.cookie(process.env.COOKIE_NAME, userData.token, { httpOnly: true });

        res.json({
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email
        });

    } catch (error) {
        res.status(401).json({
            message: error.message
        })
    }

})

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'First name, Last name, email, password are required!' })
    }

    //TODO: validate email format
    // console.log(req.body);

    try {

        const userData = await userService.register(firstName, lastName, email, password);
        res.cookie(process.env.COOKIE_NAME, userData.token, { httpOnly: true });

        res.json({
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email
        });

    } catch (error) {

        //status 409 - conflict - user with the same email already exists
        res.status(409).json({
            message: error.message,
        });
    }

});

router.get('/logout', (req, res) => {
    //TO DO - invalidate token - да се измисли механизъм за инвалидиране на токена
    res.clearCookie(process.env.COOKIE_NAME);
    res.status(204).end();
});

module.exports = router;