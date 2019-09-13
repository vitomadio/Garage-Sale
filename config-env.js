require('dotenv').config();

module.exports = {
    //Nodemailer environment.
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    user: process.env.USER_EMAIL,
    refresh_token: process.env.REFRESH_TOKEN,
    access_token: process.env.ACCESS_TOKEN,

    //URL 
    baseUrl: 'http://localhost:8000',

    //Redis config params.
    redis_config: process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : null
}