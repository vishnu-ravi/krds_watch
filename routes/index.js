module.exports = function ( app, tabs ) {
    var item_per_page   =   10;
    var Posts           =   require('../models/posts.js');
    var Users           =   require('../models/users.js');
    var Notifications   =   require('../models/notifications.js');
    var q               =   require('q');

    app.route('/logout').get(function(req, res)
    {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    });

    function common(req, res, type) {
        var email   =   req.session.email;
        var layout  =   'login';
        var data    =   {};
        var is_ajax =   req.xhr;
        var page    =   typeof req.query.page == 'undefined' ? 1 : req.query.page;
        var is_ajax =   req.xhr;

        Object.keys(tabs).forEach(function(key) {
            tabs[key].active    =   '';
        });

        tabs[0].active  =   'active';

        if(typeof email === undefined || email == null) {
            res.render(layout, data);
            return;
        }

        require('mongoose-pagination');

        Users.findOne({email: email}, function(err, user) {
            if(err) {
                data.msg    =   err;
                res.render('error', {data: data});
                return;
            }

            if(typeof user === undefined || user == null) {
                res.redirect('/');
                return;
            }

            layout          =   'index';
            data.user       =   user;
            data.userJSON   =   JSON.stringify(user);

            if(user.is_admin)
                tabs.push({key: 'tacking', name: 'Tracking'});

            data.tabs       =   tabs;
            data.activeKey  =   'home';

            var promises    =   [];

            if(typeof user.data_notification_seen === undefined || user.data_notification_seen == null)
                promises.push(Notifications.count({owner_id: user._id}).exec());
            else
                promises.push(Notifications.count({owner_id: user._id, date_sent: {$gt: user.data_notification_seen}}).exec());

            if(type == 'home') {
                promises.push(Posts.count({}).exec());
                promises.push(Posts.find({}).paginate(page, item_per_page).populate('id_user').populate('comments.id_user').sort({date_posted: 'desc'}).exec());
            }
            else if(type == 'tag') {
                promises.push(Posts.count({tags: req.params.key}).exec());
                promises.push(Posts.find({ tags: req.params.key }).paginate(page, item_per_page).populate('id_user').populate('comments.id_user').sort({date_posted: 'desc'}).exec());
            }
            else if(type == 'category') {
                promises.push(Posts.count({categories: req.params.key}).exec());
                promises.push(Posts.find({ categories: req.params.key }).paginate(page, item_per_page).populate('id_user').populate('comments.id_user').sort({date_posted: 'desc'}).exec());
            }
            else if(type == 'keyword') {
                var search      =   req.params.key;

                promises.push(Posts.count({
                         $or: [
                             {categories: {$regex: new RegExp("^" + search.toLowerCase(), "i")}},
                             {tags: {$regex: new RegExp("^" + search.toLowerCase(), "i")}},
                             {description: {$regex: new RegExp("^" + search.toLowerCase(), "i")}}
                         ]
                     }).exec());
                promises.push(Posts.find({
                         $or: [
                             {categories: {$regex: new RegExp("^" + search.toLowerCase(), "i")}},
                             {tags: {$regex: new RegExp("^" + search.toLowerCase(), "i")}},
                             {description: {$regex: new RegExp("^" + search.toLowerCase(), "i")}}
                         ]
                     }).paginate(page, item_per_page).populate('id_user').populate('comments.id_user').sort({date_posted: 'desc'}).exec());
            }
            else if(type == 'user') {
                promises.push(Posts.count({id_user: req.params.id_user}).exec());
                promises.push(Posts.find({ id_user: req.params.id_user }).paginate(page, item_per_page).populate('id_user').populate('comments.id_user').sort({date_posted: 'desc'}).exec());
            }

            q.all(promises).then(function(results) {
                var notification_count  =   results[0];
                var posts_count         =   results[1];

                var posts   =   results[2];

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
                        renderedViews.is_next_page  =   posts_count > page * item_per_page;

                        res.json(renderedViews);
                    });
                }
                else
                {
                    data.notification_count =   notification_count == 0 ? '' : notification_count;
                    data.action =   req.url;
                    res.render(layout, {data: data});
                }
            });
        });
    }

    app.route(['/home', '/']).get(function (req, res) {
        common(req, res, 'home');
    });

    app.route('/home/search/:type/:key').get(function (req, res)
    {
        common(req, res, req.params.type);
    });

    app.route('/users/:id_user').get(function (req, res)
    {
        common(req, res, 'user');
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
