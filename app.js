var express     =   require('express'), mongoose = require("mongoose"), path = require('path');
var expressHbs  =   require('express-handlebars');
var session     =   require('express-session');
var bodyParser  =   require("body-parser");
var app         =   express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: '6ED6E23EB2467846F7383CAC77432',
    resave: false,
    saveUninitialized: true
}));
app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs', helpers: require("./public/javascript/app/helper.js").helpers}));
app.set('view engine', 'hbs');
//mongoose.connect('mongodb://vishnu:vishnu@ds043917.mongolab.com:43917/heroku_brncjw7n');
mongoose.connect('mongodb://localhost/krds_watch');

var  tabs   =   [{
    key: 'home',
    name: 'Home',
    active: ''
},{
    key: 'bookmark',
    name: 'Bookmarks',
    active: ''
},{
    key: 'post',
    name: 'Post',
    active: ''
}];

require('./routes')(app, tabs);
require('./routes/user.js')(app);
require('./routes/post.js')(app, tabs);
require('./routes/bookmark.js')(app, tabs);

var port    =   process.env.PORT || 3000;
var server = app.listen(port);
console.log('listening on', port, process.env.PORT);
