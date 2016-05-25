module.exports  =   function ( app, tabs ) {
    var Users   =   require('../models/users.js');
    var Posts   =   require('../models/posts.js');
    var email  ;

    function common() {
        email   =   req.session.email;

        if(typeof email === 'undefined')
        {
            res.redirect('/');
            return;
        }

        Users.findOne({email: email}, function(err, user)
        {
            if(typeof user === undefined || user == null) {
                res.redirect('/');
                return;
            }

            if(err)
            {
                res.status(500)
                res.render('error');
            }

            next();
        });
    }

    app.route('/comment/:id_post').get(function(req, res, user)
    {
        email       =   req.session.email;
        var id_post =   req.params.id_post;

        if(typeof email === 'undefined')
        {
            res.redirect('/');
            return;
        }

        Users.findOne({email: email}, function(err, user)
        {
            if(typeof user === undefined || user == null) {
                res.status(500)
                res.render('error');
            }

            if(err || id_post == 'undefined')
            {
                res.status(500)
                res.render('error');
            }

            Posts.findOne({_id: id_post})
                .populate('comments.id_user')
                .select('_id comments')
                .lean()
                .exec(function(error, post) {
                    var renderedViews   =   {};

                    if(typeof post !== undefined && post.comments.length)
                    {
                        post.comments.forEach(function(comment, index) {
                            comment.id_post     =   post._id;
                            comment.owner_id    =   user._id;
                        });
                    }

                    res.render('partials/comments', {layout: false, post: post}, function(error, html)
                    {
                        renderedViews.html  =   html;

                        res.json(renderedViews);
                    });
                });
        });


    }).post(function(req, res)
    {

    }).put(function(req, res)
    {

    }).delete(function(req, res)
    {

    });
}
