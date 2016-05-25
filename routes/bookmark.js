module.exports  =   function ( app, tabs) {
    var Users   =   require('../models/users.js');
    var item_per_page   =   10;
    app.route('/bookmark').get(function (req, res) {
        var email   =   req.session.email;

        if(typeof email === undefined) {
            res.redirect('/');
            return;
        }

        var data    =   {};
        var is_ajax =   req.xhr;

        Users.findOne({email: email}, function(err, user)
        {
            if( ! err) {
                data.user   =   user;
                data.userJSON   =   JSON.stringify(user);
                
                if(user.is_admin)
                    tabs.push({key: 'tacking', name: 'Tracking'});
            }

            Object.keys(tabs).forEach(function(key) {
                tabs[key].active    =   '';
            });

            tabs[1].active  =   'active';
            data.tabs       =   tabs;
            data.activeKey  =   'bookmark';
            var Posts       =   require('../models/posts.js');

            if(user.bookmarks.length) {
                var id_posts    =   [];
                user.bookmarks.forEach(function(bookmark)
                {
                    id_posts.push(bookmark.id_post.toString());
                });

                var page    =   typeof req.query.page == 'undefined' ? 1 : req.query.page;

                Posts.find({_id: { $in: id_posts}})
                    .paginate(page, item_per_page)
                    .populate('id_user')
                    .populate('comments.id_user')
                    .exec(function(err, posts){
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
                            data.action =   '/bookmark';
                            res.render('index', {data: data});
                        }
                });
            }
            else {
                res.render('empty_bookmark', {data: data});
            }

        });

    }).post(function(req, res)
    {
        Users.findByIdAndUpdate(req.body.id_user,
            {$push: {"bookmarks": {id_post: req.body.id_post, date_added: Date()}}},
            {safe: true, upsert: true, new : true},
            function(err, model) {
                if(err)
                {
                    res.status(500);
                    res.json({ msg: 'DB Error', 'error': err});
                }
                else
                {
                    var index    =  model.bookmarks.length - 1;
                    res.json({ msg: 'Bookmark Successfully Added', id_bookmark: model.bookmarks[index]._id});
                }

            }
        );
    }).delete(function(req, res)
    {
        Users.findByIdAndUpdate(req.body.id_user,
            {$pull: {"bookmarks": {_id: req.body.id_bookmark}}},
            {safe: true, upsert: true, new : true},
            function(err, model) {
                if(err)
                {
                    res.status(500);
                    res.json({ msg: 'DB Error', 'error': err});
                }
                else
                    res.json({ msg: 'Bookmark Successfully Deleted'});
            }
        );
    });
}
