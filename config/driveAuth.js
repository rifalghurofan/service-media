const { google } = require("googleapis");
require("dotenv").config();

// authentication for google access
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

module.exports = google.drive({ version: 'v3', auth: oauth2Client });
