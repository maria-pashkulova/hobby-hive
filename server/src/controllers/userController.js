const router = require('express').Router();

const userService = require('../services/userService');
const auth = require('../middlewares/authenticationMiddleware');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    //Invalid inputs by the user (server responds with a 400 response code);
    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required!' })
    }

    try {
        const userData = await userService.login(email, password);

        //httpOnly: true + React ?
        //15*60*1000 = 900 000 ms = 15 min - cookie expiration
        res.cookie(process.env.COOKIE_NAME, userData.accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });

        res.json({
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email,
            profilePic: userData.profilePic
        });

    } catch (error) {
        res.status(401).json({
            message: error.message
        })
    }

})

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    //Invalid inputs by the user(server responds with a 400 response code);
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'First name, Last name, email, password are required!' })
    }

    //TODO: validate email format
    // console.log(req.body);

    try {

        const userData = await userService.register(firstName, lastName, email, password);

        //15*60*1000 = 900 000 ms = 15 min - cookie expiration
        res.cookie(process.env.COOKIE_NAME, userData.accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });

        res.json({
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email,
            profilePic: userData.profilePic
        });

    } catch (error) {

        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }

});


//protected route- дори и да направя заявка без куки ппц не гърми и си връща просто response
//но засега го правя да е protected въпреки че за момента няма разлика дали е protected или не
router.get('/logout', auth, (req, res) => {
    //TO DO - invalidate token - да се измисли механизъм за инвалидиране на токена
    res.clearCookie(process.env.COOKIE_NAME);
    res.status(204).end();
});

//да преглеждаш други users мисля
router.get('/:userId', auth, async (req, res) => {
    const { userId } = req.params;
    try {

        const user = await userService.getUser(userId);
        res.status(200).json(user);

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in get user profile:', error.message);
    }
})

router.put('/:userId', auth, async (req, res) => {

    const { firstName, lastName, email, password, profilePic, bio } = req.body;
    const currUserId = req.user._id; //този който прави заявката
    const userIdToUpdate = req.params.userId; //този който ще бъде редактриан

    try {
        const userData = await userService.updateUser(currUserId, userIdToUpdate, firstName, lastName, email, password, profilePic, bio);

        res.json(userData);

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in update user:', error.message);
    }
});

module.exports = router;