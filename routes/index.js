module.exports = function ( app, tabs ) {
    var item_per_page   =   10;
    app.route(['/home', '/']).get(function (req, res) {
        var email   =   req.session.email;
        var layout  =   'login';
        var data    =   {};

        var page    =   typeof req.query.page == 'undefined' ? 1 : req.query.page;
        var is_ajax =   req.xhr;

        Object.keys(tabs).forEach(function(key) {
            tabs[key].active    =   '';
        });

        tabs[0].active  =   'active';

        if(typeof email !== 'undefined') {
            var Users   =   require('../models/users.js');
            require('mongoose-pagination');

            Users.findOne({email: email}, function(err, user)
            {
                if( ! err)
                {
                    if(typeof user === undefined || user == null) {
                        res.redirect('/');
                        return;
                    }

                    layout      =   'index';
                    data.user   =   user;
                    data.userJSON   =   JSON.stringify(user);
                    
                    if(user.is_admin)
                        tabs.push({key: 'tacking', name: 'Tracking'});
                }

                data.tabs       =   tabs;
                data.activeKey  =   'home';

                var Posts   =   require('../models/posts.js');

                Posts.find({}).paginate(page, item_per_page).populate('id_user').populate('comments.id_user')
                .exec(function(err, posts) {
                    if(user.bookmarks.length) {
                        var i = 0;
                        posts.forEach(function(post) {
                            posts[i].user_id    =   user._id;
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
                    else {
                        var i = 0;

                        posts.forEach(function(post) {
                            posts[i].user_id    =   user._id;
                            i++;
                        });
                    }

                    data.posts  =   posts;

                    if(is_ajax)
                    {
                        var renderedViews   =   {};
                        res.app.render('partials/post', {layout: false, posts: data.posts}, function(error, html)
                        {
                            renderedViews.html  =   html;
                            renderedViews.is_next_page  =   posts.length == 0 ? 0 : 1;

                            res.json(renderedViews);
                        });
                    }
                    else
                    {
                        data.action =   '/home';
                        res.render(layout, {data: data});
                    }
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
        var Users   =   require('../models/users.js');
        var data    =   {};
        var is_ajax =   req.xhr;
        var email   =   req.session.email;
        var page    =   typeof req.query.page == 'undefined' ? 1 : req.query.page;

        var layout  =    'login';
        Object.keys(tabs).forEach(function(key) {
            tabs[key].active    =   '';
        });

        tabs[0].active  =   'active';

        if(typeof email !== 'undefined')
        {
            require('mongoose-pagination');
            var Users   =   require('../models/users.js');
            Users.findOne({email: email}, function(err, user)
            {
                if( ! err)
                {
                    if(typeof user === undefined || user == null) {
                        res.redirect('/');
                        return;
                    }

                    layout      =   'index';
                    data.user   =   user;
                    data.userJSON   =   JSON.stringify(user);

                    if(user.is_admin)
                        tabs.push({key: 'tracking', name: 'Tracking'});
                }

                data.tabs       =   tabs;
                data.activeKey  =   'home';

                var Posts   =   require('../models/posts.js');
                if(req.params.type == 'tag') {
                    Posts.find({ tags: req.params.key })
                        .paginate(page, item_per_page)
                        .populate('id_user')
                        .populate('comments.id_user')
                        .exec(function(error, posts) {
                            if(user.bookmarks.length) {
                                var i = 0;
                                posts.forEach(function(post) {
                                    posts[i].user_id    =   user._id;
                                    user.bookmarks.forEach(function(bookmark) {
                                        if(bookmark.id_post.toString() == post.id_post.toString()) {
                                            posts[i].is_bookmarked    =   true;
                                            posts[i].id_bookmark    =   bookmark._id;
                                            return;
                                        }
                                    });
                                    i++;
                                });
                            }else {
                                var i = 0;

                                posts.forEach(function(post) {
                                    posts[i].user_id    =   user._id;
                                    i++;
                                });
                            }

                            data.posts  =   posts;

                            if(is_ajax)
                            {
                                var renderedViews   =   {};
                                res.app.render('partials/post', {layout: false, posts: data.posts}, function(error, html)
                                {
                                    renderedViews.html  =   html;
                                    renderedViews.is_next_page  =   posts.length == 0 ? 0 : 1;

                                    res.json(renderedViews);
                                });
                            }
                            else
                            {
                                data.action =   req.url;
                                res.render(layout, {data: data});
                            }
                        });
                }
                else if(req.params.type == 'category') {
                    Posts.find({ categories: req.params.key })
                        .paginate(page, item_per_page)
                        .populate('id_user')
                        .populate('comments.id_user')
                        .exec(function(error, posts) {
                            if(user.bookmarks.length) {
                                var i = 0;
                                posts.forEach(function(post) {
                                    posts[i].user_id    =   user._id;
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
                            else {
                                var i = 0;

                                posts.forEach(function(post) {
                                    posts[i].user_id    =   user._id;
                                    i++;
                                });
                            }

                            data.posts  =   posts;
                            if(is_ajax)
                            {
                                var renderedViews   =   {};
                                res.app.render('partials/post', {layout: false, posts: data.posts}, function(error, html)
                                {
                                    renderedViews.html  =   html;
                                    renderedViews.is_next_page  =   posts.length == 0 ? 0 : 1;

                                    res.json(renderedViews);
                                });
                            }
                            else
                            {
                                data.action =   req.url;
                                res.render(layout, {data: data});
                            }
                        });
                }
                else if(req.params.type == 'keyword') {
                    var search      =   req.params.key;

                    Posts.find({
                             $or: [
                                 {categories: {$regex: new RegExp("^" + search.toLowerCase(), "i")}},
                                 {tags: {$regex: new RegExp("^" + search.toLowerCase(), "i")}},
                                 {description: {$regex: new RegExp("^" + search.toLowerCase(), "i")}}
                             ]
                         })
                        .paginate(page, item_per_page)
                        .populate('id_user')
                        .populate('comments.id_user')
                        .exec(function(error, posts) {
                            if(user.bookmarks.length) {
                                var i = 0;
                                posts.forEach(function(post) {
                                    posts[i].user_id    =   user._id;
                                    user.bookmarks.forEach(function(bookmark) {
                                        if(bookmark.id_post.toString() == post.id_post.toString()) {
                                            posts[i].is_bookmarked  =   true;
                                            posts[i].id_bookmark    =   bookmark._id;
                                            return;
                                        }
                                    });
                                    i++;
                                });
                            }
                            else {
                                var i = 0;

                                posts.forEach(function(post) {
                                    posts[i].user_id    =   user._id;
                                    i++;
                                });
                            }

                            data.posts  =   posts;
                            if(is_ajax)
                            {
                                var renderedViews   =   {};
                                res.app.render('partials/post', {layout: false, posts: data.posts}, function(error, html)
                                {
                                    renderedViews.html  =   html;
                                    renderedViews.is_next_page  =   posts.length == 0 ? 0 : 1;

                                    res.json(renderedViews);
                                });
                            }
                            else
                            {
                                data.action =   req.url;
                                res.render(layout, {data: data});
                            }
                        });
                }
                else {
                    res.render('error', {data: data});
                }
            });
        }
        else {
            res.render(layout, data);
        }
    });

    app.route('/users/:id_user').get(function (req, res)
    {
        var Users   =   require('../models/users.js');
        var data    =   {};
        var is_ajax =   req.xhr;
        var email   =   req.session.email;
        var layout  =   'login';
        var page    =   typeof req.params.page == 'undefine' ? 1 : req.params.page;

        Object.keys(tabs).forEach(function(key) {
            tabs[key].active    =   '';
        });

        tabs[0].active  =   'active';

        if(typeof email !== 'undefined' || typeof req.params.id_user == 'undefined') {
            var Users   =   require('../models/users.js');
            var page    =   typeof req.query.page == 'undefined' ? 1 : req.query.page;
            require('mongoose-pagination');

            Users.findOne({email: email}, function(err, user)
            {
                if(typeof user === undefined || user == null) {
                    res.redirect('/');
                    return;
                }

                if( ! err) {
                    layout      =   'index';
                    data.user   =   user;
                    data.userJSON   =   JSON.stringify(user);

                    if(user.is_admin)
                        tabs.push({key: 'tracking', name: 'Tracking'});
                }

                data.tabs       =   tabs;
                data.activeKey  =   'home';

                var Posts   =   require('../models/posts.js');

                Posts.find({ id_user: req.params.id_user })
                    .paginate(page, item_per_page)
                    .populate('id_user')
                    .populate('comments.id_user')
                    .exec(function(error, posts) {
                        if(user.bookmarks.length) {
                            var i = 0;
                            posts.forEach(function(post) {
                                posts[i].user_id    =   user._id;
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
                        else {
                            var i = 0;

                            posts.forEach(function(post) {
                                posts[i].user_id    =   user._id;
                                i++;
                            });
                        }

                        data.posts  =   posts;

                        if(is_ajax)
                        {
                            var renderedViews   =   {};
                            res.app.render('partials/post', {layout: false, posts: data.posts}, function(error, html)
                            {
                                renderedViews.html  =   html;
                                renderedViews.is_next_page  =   posts.length == 0 ? 0 : 1;

                                res.json(renderedViews);
                            });
                        }
                        else
                        {
                            data.action =   '/home';
                            res.render(layout, {data: data});
                        }
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
                if(err) {
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
            {safe: true, upsert: true},
            function(err, model) {
                if(err)
                {
                    res.status(500);
                    res.json({ msg: 'DB Error', 'error': err});
                }
                else
                    res.json({ msg: 'Comment Successfully Updated'});
        });
    }).delete(function (req, res) {
        var Posts   =   require('../models/posts.js');

        Posts.findByIdAndUpdate(req.body.id_post, {$pull: {'comments': {_id: req.body.id}}}, function(err, model) {
            if(err) {
                res.status(500);
                res.json({ msg: 'DB Error', 'error': err});
            }
            else
            {
                res.json({ msg: 'Comment Successfully Deleted'});
            }
        });
    });
}
