const { google } = require('googleapis');

//Used to exchange code for access token, refresh token and ID token with the required scopes
//for accessing Google Calendar API
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

exports.oauth2Client = oauth2Client;

//Set oauth2Clients as a global level option so there is no need to specify it for every request.
google.options({
    auth: oauth2Client
});

//Service client
//Used to make calls to Google Calendar API, using credentials (access and refresh tokens)
exports.calendar = google.calendar('v3')

exports.scopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar.events.owned'
]

