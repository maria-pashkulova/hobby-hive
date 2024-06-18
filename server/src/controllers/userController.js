const router = require('express').Router();

const userService = require('../services/userService');
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

    const users = await userService.getAll(search, currUserId);

    res.json(users);

});


//задължително преди долния път
//a parametric path inserted just before a literal one takes the precedence over the literal one.
router.get('/my-groups', auth, async (req, res) => {
    try {
        const user = await userService.getGroupsWithMembership(req.user._id).lean();


        const groupsWithMembersCount = user.groups.map(group => ({
            _id: group._id,
            name: group.name,
            category: group.category,
            description: group.description,
            location: group.location,
            imageUrl: group.imageUrl,
            membersCount: group.members.length
        }));


        res.json(groupsWithMembersCount);

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log('Error in get user groups:', error.message);
    }
});


//няма да го имам като функционалност сега
//да преглеждаш други users мисля
// router.get('/:userId', auth, async (req, res) => {
//     const { userId } = req.params;
//     try {

//         const user = await userService.getUser(userId);
//         res.status(200).json(user);

//     } catch (error) {
//         res.status(error.statusCode || 500).json({ message: error.message });
//         console.log('Error in get user profile:', error.message);
//     }
// })


//оставям :userId да се взима от параметрите за да се запази
//Uniform interface (REST)

router.put('/:userId', auth, async (req, res) => {

    const { firstName, lastName, email, password, profilePic } = req.body;
    const currUserId = req.user._id; //този който прави заявката
    const userIdToUpdate = req.params.userId; //този който ще бъде редактриан

    try {
        const userData = await userService.updateUser(currUserId, userIdToUpdate, firstName, lastName, email, password, profilePic);

        res.json(userData);

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in update user:', error.message);
    }
});


module.exports = router;