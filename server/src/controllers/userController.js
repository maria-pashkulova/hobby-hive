const router = require('express').Router();
const userService = require('../services/userService');
//middlewares
const auth = require('../middlewares/authenticationMiddleware');
const { validateUserInputData } = require('../middlewares/inputValidationMiddlewares/userInputValidationMiddlewares');
const { registerInputSchema, loginInputSchema, updateUserInputSchema } = require('../inputValidationShemas/userInputValidationSchema');


router.post('/login', validateUserInputData(loginInputSchema), async (req, res, next) => {


    try {
        const userData = await userService.login(req.body);

        //15*60*1000 = 900 000 ms = 15 min - cookie expiration - used for debugging purposes
        //60*60*1000 = 3 600 000 ms = 60 min = 1 hour; TODO: refresh token 
        res.cookie(process.env.COOKIE_NAME, userData.accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });

        res.json({
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email,
            profilePic: userData.profilePic
        });

    } catch (error) {
        next(error)
    }

})

router.post('/register', validateUserInputData(registerInputSchema), async (req, res, next) => {

    try {
        const userData = await userService.register(req.body);

        res.cookie(process.env.COOKIE_NAME, userData.accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });

        res.json({
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email,
            profilePic: userData.profilePic
        });

    } catch (error) {
        next(error);
    }

});


router.get('/logout', auth, (req, res) => {
    //TODO - mechanism for token invalidation
    res.clearCookie(process.env.COOKIE_NAME);
    res.status(204).end();
});

//users?search=Мария
router.get('/', auth, async (req, res, next) => {
    const { search } = req.query;
    const currUserId = req.user._id;

    try {
        const users = await userService.getAll(search, currUserId);
        res.json(users);
    } catch (error) {
        next(error);
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
        next(error);
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
        const userEvents = await userService.getUserAttendingEventsInRange(currUserId, start, end);
        res.json(userEvents);

    } catch (error) {
        res.status(500).json({ message: 'Сървърна грешка!' });
    }
})


//:userId да се взима от параметрите, за да се запази
//Uniform interface (REST)

router.put('/:userId', auth, validateUserInputData(updateUserInputSchema), async (req, res, next) => {

    const currUserId = req.user._id; //този който прави заявката
    const userIdToUpdate = req.params.userId; //този който ще бъде редактиран

    try {
        const userData = await userService.updateUser(currUserId, userIdToUpdate, req.body);

        res.json(userData);

    } catch (error) {
        next(error);
    }
});




module.exports = router;