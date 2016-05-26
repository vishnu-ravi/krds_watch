module.exports = function ( app ) {
    var Users   =   require('../models/users.js');

    app.route('/user/notification').put(function(req, res) {
        var email           =   req.session.email;

        try {
            if(typeof email === 'undefined')
                throw {msg: 'unAuthorized', status: 403};

            Users.findOne({email: email}, function(err, user) {

                if(typeof user === undefined || user == null)
                    throw {msg: 'unAuthorized', status: 403};

                Users.findByIdAndUpdate(user._id,
                    {$set: {"data_notification_seen": Date()}},
                    {safe: true, upsert: true},
                    function(err, model) {
                        if(err)
                        {
                            res.status(500);
                            res.json({ msg: 'DB Error', 'error': err});
                        }
                        else
                        {
                            res.json({ msg: 'Date Notification Seen updated'});
                        }

                    }
                );
            });
        }
        catch(e) {
            var status  =   typeof e.status == 'undefined' ? 400 : e.status;
            res.status(status);
            res.json({ msg: e.msg});
        }
    });

    app.route('/user/').post(function(req, res)
    {
        var id_token    =   req.body.id_token;
        var https       =   require("https");
        var options     =
        {
            host: 'www.googleapis.com',
            path: '/oauth2/v3/tokeninfo?id_token=' + id_token,
            method: 'GET'
        };

        var request     =   https.get(options, function(response)
        {
            response.setEncoding('utf8');
            response.on('data', function (data)
            {
                data    =   JSON.parse(data);
                try
                {
                    if( ! data.email_verified)
                        throw {msg: 'Email Not verified'};

                    if(typeof data.email == 'undefined' || data.email.length == '0')
                        throw {msg: 'Empty or Invalid Email'};

                    Users.findOne({'email': data.email}, '_id', function(err, user)
                    {
                        if(err)
                            throw {msg: 'DB Error', status: 500};

                        var picture =   typeof data.picture === undefined || data.picture == null
                                            ?    '/images/profile_dummy.png' : data.picture;

                        if(user == null || user == undefined)
                        {
                            var newUser = Users({
                                email: data.email,
                                name: data.name,
                                picture: picture
                            });

                            newUser.save(function(err) {
                                if(err)
                                {
                                    res.status(500);
                                    res.json({ msg: 'DB Error', 'error': err});
                                    return;
                                }
                            });
                        }
                        else
                        {
                            var picture =   typeof data.picture === undefined || data.picture == null
                                                ?    '/images/profile_dummy.png' : data.picture;

                            Users.findByIdAndUpdate(user._id,
                                {$set: {'picture': picture, 'name': data.name}},
                                {safe: true, upsert: true},
                                function(err, model) {
                                    if(err)
                                    {
                                        res.status(500);
                                        res.json({ msg: 'DB Error', 'error': err});
                                        return;
                                    }
                                }
                            );
                        }
                        req.session.email   =   data.email;

                        res.status(200);
                        res.json({success: true});
                    });
                }
                catch (e)
                {
                    var status  =   typeof e.status == 'undefined' ? 400 : e.status;
                    res.status(status);
                    res.json({ msg: e.msg});
                }
            });
        });

        request.on('error', function(e) {
            res.status(500);
            res.json({ msg: e.message});
        });
    });
}
