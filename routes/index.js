module.exports = function ( app, tabs ) {

    app.route(['/home', '/']).get(function (req, res) {
        var email   =   req.session.email;
        var layout  =    'login';
        var data    =   {};
        var page    =   typeof req.params.page == 'undefine' ? 1 : req.params.page;
        Object.keys(tabs).forEach(function(key) {
            tabs[key].active    =   '';
        });

        tabs[0].active  =   'active';

        if(typeof email !== 'undefined') {
            var Users = require('../models/users.js');

            Users.findOne({email: email}, function(err, user)
            {
                if( ! err)
                {
                    layout      =   'index';
                    data.user   =   user;

                    if(user.is_admin)
                        tabs.push({key: 'tacking', name: 'Tracking'});
                }

                data.tabs   =   tabs;

                var Posts   =   require('../models/posts.js');
                Posts.find({})
                    .populate('id_user')
                    .populate('comments.id_user')
                    .exec(function(error, posts) {
                        if(user.bookmarks.length) {
                            var i = 0;
                            posts.forEach(function(post) {
                                user.bookmarks.forEach(function(bookmark) {
                                    if(bookmark.id_post.toString() == post.id_post.toString()) {
                                        posts[i].is_bookmarked    =   true;
                                        posts[i].id_bookmark    =   bookmark._id;
                                        return;
                                    }
                                });
                                i++;
                            });
                        }
                        data.posts  =   posts;
                        console.log(posts[0]);
                        //res.json(data.posts);
                        res.render(layout, data);
                    });
            });
        }
        else {
            res.render(layout, data);
        }
    });

    app.route('/logout').get(function(req, res)
    {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    });

    app.route('/home/search/:type/:key').get(function (req, res)
    {
        var Users = require('../models/users.js');
        var data  = {};

        var email   =   req.session.email;
        var page    =   typeof req.params.page == 'undefine' ? 1 : req.params.page;
        var layout  =    'login';
        Object.keys(tabs).forEach(function(key) {
            tabs[key].active    =   '';
        });

        tabs[0].active  =   'active';

        if(typeof email !== 'undefined')
        {
            var Users = require('../models/users.js');
            Users.findOne({email: email}, function(err, user)
            {
                if( ! err)
                {
                    layout      =   'index';
                    data.user   =   user;

                    if(user.is_admin)
                        tabs.push({key: 'tracking', name: 'Tracking'});
                }

                data.tabs   =   tabs;
                var Posts   =   require('../models/posts.js');
                if(req.params.type == 'tag') {
                    Posts.find({ tags: req.params.key })
                        .populate('id_user')
                        .populate('comments.id_user')
                        .exec(function(error, posts) {
                            if(user.bookmarks.length) {
                                var i = 0;
                                posts.forEach(function(post) {
                                    user.bookmarks.forEach(function(bookmark) {
                                        if(bookmark.id_post.toString() == post.id_post.toString()) {
                                            posts[i].is_bookmarked    =   true;
                                            posts[i].id_bookmark    =   bookmark._id;
                                            return;
                                        }
                                    });
                                    i++;
                                });
                            }
                            data.posts  =   posts;
                            //res.json(data.posts);
                            res.render(layout, data);
                        });
                }
                else if(req.params.type == 'category') {
                    Posts.find({ categories: req.params.key })
                        .populate('id_user')
                        .populate('comments.id_user')
                        .exec(function(error, posts) {
                            if(user.bookmarks.length) {
                                var i = 0;
                                posts.forEach(function(post) {
                                    user.bookmarks.forEach(function(bookmark) {
                                        if(bookmark.id_post.toString() == post.id_post.toString()) {
                                            posts[i].is_bookmarked    =   true;
                                            posts[i].id_bookmark    =   bookmark._id;
                                            return;
                                        }
                                    });
                                    i++;
                                });
                            }
                            data.posts  =   posts;
                            //res.json(data.posts);
                            res.render(layout, data);
                        });
                }
                else if(req.params.type == 'keyword') {
                    var to_search   =   new RegExp('^'+ req.params.key + '$', "i");
                    console.log(to_search);
                    Posts.find({
                         $or: [
                             { categories:  to_search},
                             {tags: to_search}
                         ]
                     })
                        .populate('id_user')
                        .populate('comments.id_user')
                        .exec(function(error, posts) {
                            if(user.bookmarks.length) {
                                var i = 0;
                                posts.forEach(function(post) {
                                    user.bookmarks.forEach(function(bookmark) {
                                        if(bookmark.id_post.toString() == post.id_post.toString()) {
                                            posts[i].is_bookmarked    =   true;
                                            posts[i].id_bookmark    =   bookmark._id;
                                            return;
                                        }
                                    });
                                    i++;
                                });
                            }
                            data.posts  =   posts;
                            //res.json(data.posts);
                            res.render(layout, data);
                        });
                }
                else {
                    res.render('error');
                }
            });
        }
        else {
            res.render(layout, data);
        }
    });

    app.route('/users/:id_user').get(function (req, res)
    {
        var Users = require('../models/users.js');
        var data  = {};

        var email   =   req.session.email;
        var layout  =    'login';
        var page    =   typeof req.params.page == 'undefine' ? 1 : req.params.page;
        Object.keys(tabs).forEach(function(key) {
            tabs[key].active    =   '';
        });

        tabs[0].active  =   'active';

        if(typeof email !== 'undefined' || typeof req.params.id_user == 'undefined')
        {
            var Users = require('../models/users.js');
            Users.findOne({email: email}, function(err, user)
            {
                if( ! err)
                {
                    layout      =   'index';
                    data.user   =   user;

                    if(user.is_admin)
                        tabs.push({key: 'tracking', name: 'Tracking'});
                }

                data.tabs   =   tabs;
                var Posts   =   require('../models/posts.js');

                Posts.find({ id_user: req.params.id_user })
                    .populate('id_user')
                    .populate('comments.id_user')
                    .exec(function(error, posts) {
                        if(user.bookmarks.length) {
                            var i = 0;
                            posts.forEach(function(post) {
                                user.bookmarks.forEach(function(bookmark) {
                                    if(bookmark.id_post.toString() == post.id_post.toString()) {
                                        posts[i].is_bookmarked    =   true;
                                        posts[i].id_bookmark    =   bookmark._id;
                                        return;
                                    }
                                });
                                i++;
                            });
                        }
                        data.posts  =   posts;
                        //res.json(data.posts);
                        res.render(layout, data);
                    });
            });
        }
        else {
            res.render(layout, data);
        }
    });

    app.route('/post/comment').post(function (req, res) {
        var Posts   =   require('../models/posts.js');

        Posts.findByIdAndUpdate(req.body.id_post,
            {$push: {"comments": {id_user: req.body.id_user, comment: req.body.comment, date: Date.now()}}},
            {safe: true, upsert: true, new : true},
            function(err, model) {
                if(err)
                {
                    res.status(500);
                    res.json({ msg: 'DB Error', 'error': err});
                }
                else
                    res.json({ msg: 'Comment Successfully Added'});
            }
        );
    }).put(function (req, res) {
        var Posts   =   require('../models/posts.js');

        var update = {};
        update['comments.' + req.body.index + '.comment']      =  req.body.comment;
        update['comments.' + req.body.index + '.date']   =  Date.now();

        Posts.findByIdAndUpdate(req.body.id_post,
            {$set: update},
            {safe: true, upsert: true, new : true},
            function(err, model) {
                if(err)
                {
                    res.status(500);
                    res.json({ msg: 'DB Error', 'error': err});
                }
                else
                    res.json({ msg: 'Successfully Updated'});
        });
    }).delete(function (req, res) {
        var Posts   =   require('../models/posts.js');

        /*var update = {};
        update['comments.' + req.body.index]      =   1;
        Posts.findByIdAndUpdate(req.body.id_post, {$unset: update}, {safe: true, upsert: true, new : true},
        function(){
            Posts.findByIdAndUpdate(req.body.id_post,
                {$pull: {"comments" : null}},
                function(err, model) {
                    if(err)
                    {
                        res.status(500);
                        res.json({ msg: 'DB Error', 'error': err});
                    }
                    else
                        res.json({ msg: 'Successfully Deleted'});
            });
        });*/
        console.log(req.body.id);
        //Posts.update({_id: req.body.id_post}, {$pullAll: {}}
        Posts.findByIdAndUpdate(req.body.id_post, {$pull: {'comments': {_id: req.body.id}}}, function(err, model) {
            if(err)
            {
                res.status(500);
                res.json({ msg: 'DB Error', 'error': err});
            }
            else
            {console.log(model);
                res.json({ msg: 'Successfully Deleted'});

            }

        });
    });
}
