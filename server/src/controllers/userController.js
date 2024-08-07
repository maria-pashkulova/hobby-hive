const router = require('express').Router();

const userService = require('../services/userService');
const eventService = require('../services/eventService');

//middlewares
const auth = require('../middlewares/authenticationMiddleware');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    //Invalid inputs by the user (server responds with a 400 response code);
    if (!email || !password) {
        return res.status(400).json({ message: 'Имейла и паролата са задължителни!' })
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
        return res.status(400).json({ message: 'Име, фамилия, имейл и парола са задължителни!' })
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


//users?search=Мария
router.get('/', auth, async (req, res) => {
    const { search } = req.query;
    const currUserId = req.user._id;

    try {
        const users = await userService.getAll(search, currUserId);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});


//задължително преди долния път, съдържащ /:userId
//a parametric path inserted just before a literal one takes the precedence over the literal one.
router.get('/my-groups', auth, async (req, res) => {

    const currentUserId = req.user._id;
    const page = parseInt(req.query.page || '0');
    const limit = parseInt(req.query.limit || '3')


    try {
        const userGroupsResult = await userService.getGroupsWithMembership(currentUserId, page, limit);

        res.json(userGroupsResult);

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log('Error in get user groups:', error.message);
    }
});

//get current user details to populate update user profile edit form

router.get('/my-details', auth, async (req, res) => {

    res.status(200).json(req.user);

})

//GET ALL events for visible date range on calendar FOR CURRENT LOGGED IN USER
//- the events he has created (automatically marked as Attending) + all the events other users created and he marked himself as going
//MY CALENDAR: 

router.get('/my-calendar', auth, async (req, res) => {

    const currUserId = req.user._id;
    const { start, end } = req.query;

    try {
        const userEvents = await eventService.getUserAttendingEventsInRange(currUserId, start, end);
        res.json(userEvents);

    } catch (error) {
        res.status(500).json({ message: 'Сървърна грешка!' });
    }
})


//оставям :userId да се взима от параметрите за да се запази
//Uniform interface (REST)

router.put('/:userId', auth, async (req, res) => {

    const { firstName, lastName, email, password, newProfilePic, currProfilePic } = req.body;
    const currUserId = req.user._id; //този който прави заявката
    const userIdToUpdate = req.params.userId; //този който ще бъде редактиран

    try {
        const userData = await userService.updateUser(currUserId, userIdToUpdate, firstName, lastName, email, password, newProfilePic, currProfilePic);

        res.json(userData);

    } catch (error) {
        //500 status code -> ако cloudinary върне грешка

        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in update user:', error.message);
    }
});




module.exports = router;