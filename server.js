const express = require('express')
const app = express();
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var cookieParser = require('cookie-parser');

//var config = require('./config');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(cookieParser());
app.use(function(req, res, next) {  
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});  

var port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    console.log('GET \'/\' url!!')
    res.send('Hello World!');
})

let users = require('./api/users');
let send = require('./api/send');
let images = require('./api/images');
app.use('/api/users', users);
app.use('/api/send', send);
app.use('/api/images', images);

//const mongodbUri = config.mongodbUri();
const mongodbUri = 'mongodb://localhost:27017'
mongoose.connect(mongodbUri, {
    // useMongoClient: true
    // useNewUrlParser: true
});
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to mongod server..');
})
// db.on('disconnect', connect);

server = app.listen(port, '0.0.0.0', function() {
    console.log('server is running on port '+port);
});

const io = require('socket.io')(server);
io.on('connection', function(socket) {
    console.log(socket.id)
    socket.on('SEND_MESSAGE', function(data) {
        io.emit('MESSAGE', data)
        console.log(data);
    });
});

