module.exports = function ( app ) {
    var Notifications   =   require('../models/notifications.js');
    var Users           =   require('../models/users.js');
    var q               =   require('q');

    app.route('/notifications').get(function (req, res) {
        var email           =   req.session.email;
        var item_per_page   =   10;
        var page            =   typeof req.query.page == 'undefined'
                                    ? 1
                                    : req.query.page;

        require('mongoose-pagination');

        try {
            if(typeof email === undefined || email == null || email == 'undefined')
                throw {msg: 'unAuthorized', status: 403};

            Users.findOne({email: email}, function(err, user) {

                if(typeof user === undefined || user == null)
                    throw {msg: 'unAuthorized', status: 403};

                var promises    =   [
                    Notifications.count({}).exec(),
                    Notifications.find({owner_id: user._id})
                        .paginate(page, item_per_page)
                        .populate('id_user')
                        .populate('owner_id')
                        .sort({date_sent: 'desc'})
                        .exec()
                ];

                q.all(promises).then(function(results) {
                    var count           =   results[0];
                    var notifications   =   results[1];
                    var renderedViews   =   {};

                    res.app.render('partials/notification', {layout: false, notifications: notifications}, function(error, html)
                    {
                        renderedViews.html          =   html;
                        renderedViews.is_next_page  =   count > page * item_per_page;

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
    }).put(function(req, res) {
        var email   =   req.session.email;

        try {
            if(typeof email === undefined || email == null || email == 'undefined')
                throw {msg: 'unAuthorized', status: 403};

            if(req.body.id_notification == null || typeof req.body.id_notification == 'undefined')
                throw {msg: 'Empty Notification ID', status: 400};

            Users.findOne({email: email}, function(err, user) {
                if(typeof user === undefined || user == null)
                    throw {msg: 'unAuthorized', status: 403};

                Notifications.findOneAndUpdate({_id: req.body.id_notification, owner_id: user._id},
                    {$set: {is_seen: true}},
                    {safe: true},
                    function(err, model) {
                        if(err)
                        {
                            res.status(500);
                            res.json({ msg: 'DB Error', 'error': err});
                        }
                        else
                            res.json({ msg: 'Successfully Updated'});
                });
            });
        }
        catch(e) {
            var status  =   typeof e.status == 'undefined' ? 400 : e.status;
            res.status(status);
            res.json({ msg: e.msg});
        }
    });
};
