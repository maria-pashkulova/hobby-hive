const router = require('express').Router();
const { oauth2Client } = require('../config/googleApiConfig.js');
const { saveEventInGoogleCalendar } = require('../services/googleCalendarService.js');

const { saveRefreshTokenToDatabase, deleteInvalidRefreshTokenFromDatabase } = require('../services/googleTokensService.js');


router.post('/google-calendar/oauth2callback', async (req, res) => {

    const currUserId = req.user._id;
    const { code } = req.body;

    try {
        const { tokens } = await oauth2Client.getToken(code);

        // store the refresh_token in my database!
        await saveRefreshTokenToDatabase(currUserId, tokens.refresh_token);

        res.json({ message: 'Успешно позволихте достъп до Вашия Google календар!' });

    } catch (googleapisLibError) {
        res.status(googleapisLibError.status).json(googleapisLibError.response.data);
    }

});

router.post('/google-calendar', async (req, res) => {

    const currUserId = req.user._id;
    const eventData = req.body;

    try {

        const response = await saveEventInGoogleCalendar(currUserId, eventData);
        res.json(response)
    } catch (error) {
        console.log(error);

        //Custom error response and google apis library errors response
        if (error.statusCode === 403 || error.statusCode == 400) {
            return res.status(error.statusCode).json({ message: error.message });
        } else if (error.status === 400 && error.response.data.error === 'invalid_grant') {
            //Delete expired or revoked refresh token from DB for the current user
            await deleteInvalidRefreshTokenFromDatabase(currUserId);
            return res.status(403).json(error.response.data);
        } else if (error.status === 403) {
            //handle hard-deleted event
            return res.status(400).json(error.response);
        }
        //If other possible errors occur - JS Error objects or googleapis library error objects

        res.status(500).json({ message: error.message || error.response.data.error_description });
    }
})




module.exports = router;