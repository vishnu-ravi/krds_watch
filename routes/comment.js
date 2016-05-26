module.exports  =   function ( app, tabs ) {
    var Users   =   require('../models/users.js');
    var Posts   =   require('../models/posts.js');

    app.route('/comment/:id_post').get(function(req, res, user)
    {
        var email   =   req.session.email;
        var id_post =   req.params.id_post;

        try {
            if(typeof email === 'undefined')
                throw {msg: 'unAuthorized', status: 403};

            Users.findOne({email: email}, function(err, user) {

                if(typeof user === undefined || user == null)
                    throw {msg: 'unAuthorized', status: 403};

                if(err)
                    throw {msg: 'DB Error', status: 500};

                if(id_post == 'undefined')
                    throw {msg: 'Post Id Missing', status: 400};

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
        }
        catch(e) {
            var status  =   typeof e.status == 'undefined' ? 400 : e.status;
            res.status(status);
            res.json({ msg: e.msg});
        }
    }).post(function(req, res)
    {

    }).put(function(req, res)
    {

    }).delete(function(req, res)
    {

    });
}
