module.exports  =   function ( app, tabs) {
    var Users   =   require('../models/users.js');

    app.route('/bookmark').get(function (req, res) {
        var email   =   req.session.email;

        if(typeof email === 'undefined') {
            res.redirect('/');
            return;
        }

        var data    =   {};
        Users.findOne({email: email}, function(err, user)
        {
            if( ! err) {
                data.user   =   user;

                if(user.is_admin)
                    tabs.push({key: 'tacking', name: 'Tracking'});
            }

            Object.keys(tabs).forEach(function(key) {
                tabs[key].active    =   '';
            });

            tabs[1].active  =   'active';
            data.tabs       =   tabs;
            var Posts       =   require('../models/posts.js');

            if(user.bookmarks.length) {
                var id_posts    =   [];
                user.bookmarks.forEach(function(bookmark)
                {
                    id_posts.push(bookmark.id_post.toString());
                });

                var page    =   typeof req.params.page == 'undefine' ? 1 : req.params.page;

                Posts.find({_id: { $in: id_posts}})
                    .populate('id_user')
                    .populate('comments.id_user')
                    .exec(function(err, posts){
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
                        data.posts  =   posts;
                        //res.json(data.posts);
                        res.render('index', {data: data});
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
