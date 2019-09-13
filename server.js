const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const cors = require('cors');
const db = require('./db-config.js');
const path = require('path');
const config = require('./config-env');

const auth = require('./routes/auth');
const profile = require('./routes/profile');
const product = require('./routes/product');
const comments = require('./routes/comment')

// CONFIG REDIS
const client = redis.createClient(config.redis_config);
client.on('connect', () => {
    console.log('Redis client connected');
});
client.on('error', (err) => {
    console.log('Something went wrong ' + err);
});

const app = express();

//CONFIGURE SOCKET.IO 
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('socketIo', io);//Passing socket to routers.

//DECLARING PORT.
const PORT = process.env.PORT || 8000;

//MONGOOSE CONFIGURATION.
const mongoose = require('mongoose');
mongoose.connect(db.dbUri, { useNewUrlParser: true, useFindAndModify: false }, (err) => {
    if (!err) {
        return console.log('Successfully connected to Database.');
    }
    console.log('Something went wrong with DB connection.')
});

//MAKE DIST DIRECTORY ACCESSIBLE.
app.use(express.static('./public'));
app.use(express.static('dist/Garage-Sale1'));

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.set('trust proxy', 1);
app.use(session({
    secret: 'holly',
    resave: false,
    saveUninitialized: true
}));


server.listen(PORT, (err) => {
    if (!err) return console.log('Server is listen on port: ' + PORT);
    console.log('Something went wrong with connection.');
});

//Routes.
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/product', product);
app.use('/comments', comments);

app.get('/*', (req, res) => {
    var options = {
        root: path.join(__dirname, 'dist')
    }
    res.sendFile('Garage-Sale1/index.html', options);
});
  













