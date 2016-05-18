module.exports = function ( app ) {
    var Users = require('../models/users.js');
    app.route('/user/').get(function (req, res)
    {

    }).post(function(req, res)
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

                        if(user == null || user == undefined)
                        {
                            var newUser = Users({
                                email: data.email,
                                name: data.name,
                                picture: data.picture
                            });

                            newUser.save(function(err) {
                                if(err)
                                {
                                    res.status(500);
                                    res.json({ msg: 'DB Error', 'error': err});
                                }
                            });
                        }
                        else
                        {
                            Users.findByIdAndUpdate(user._id,
                                {$set: {'picture': data.picture, 'name': data.name}},
                                {safe: true, upsert: true, new : true},
                                function(err, model) {
                                    if(err)
                                    {
                                        res.status(500);
                                        res.json({ msg: 'DB Error', 'error': err});
                                    }
                                }
                            );
                        }
                    });
                    req.session.email   =   data.email;

                    res.status(200);
                    res.json({success: true});
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
