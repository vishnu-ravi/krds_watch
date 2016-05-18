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
        var id_post =   req.param.id_post;

        Posts.find({id_post: id_post})
            .populate('id_user')
            .populate('comments.id_user')
            .exec(function(error, posts) {
                res.json(posts);
            });
    }).post(function(req, res)
    {

    }).put(function(req, res)
    {

    }).delete(function(req, res)
    {

    });
}
