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

    //Google Maps API Key.
    apiKey:"AIzaSyCofVUjA3wviN9YpTnA8i4QJ6BZ1qdXIG4"
}