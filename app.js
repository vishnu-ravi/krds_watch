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

mongoose.connect('mongodb://vishnu:vishnu@ds043917.mongolab.com:43917/heroku_brncjw7n');
//mongoose.connect('mongodb://localhost/krds_watch');

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
require('./routes/comment.js')(app);
require('./routes/reset.js')(app);

var port    =   process.env.PORT || 3000;
var server  =   app.listen(port);
var io      =   require('socket.io')(server);
var online_user =   {};

function getUserSession(post_owner_id) {
    var keys    =   [];

    for(var prop in online_user) {
        if(online_user.hasOwnProperty(prop)) {
             if( online_user[ prop ] === post_owner_id )
                 keys.push(prop);
        }
    }

    return keys;
}

io.on('connection', function(socket) {
    function sendNotifications(user_sessions, type, data) {
        var notfication_data    =   {};

        if(type == 'comment')
        {
            notfication_data['msg']     =   data.user_name + ' Commented on Your Post';
            notfication_data['type']    =   type;
            notfication_data['id_post'] =   data.id_post;
        }

        user_sessions.forEach(function(item, index) {
            console.log(item ,item.substring(2));
            socket.broadcast.to(item.substring(2)).emit('notification', notfication_data)
        });
    }

    function saveNotification(commentInfo, type) {

    }

    socket.on('register', function(userInfo) {
        online_user[this.id]    =   userInfo.id_user;

    });

    socket.on('comment', function(commentInfo) {
        var user_sessions   =   getUserSession(commentInfo.post_owner_id);

        if(user_sessions.length > 0)
            sendNotifications(user_sessions ,'comment', commentInfo);

        saveNotification(commentInfo, 'comment');
    });

    socket.on('disconnect', function(){
        delete online_user[this.id];
    });
});

console.log('listening on', port, process.env.PORT);
