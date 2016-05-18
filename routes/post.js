module.exports = function (app, tabs) {
    var Posts   =   require('../models/posts.js');

    app.route('/post').get(function (req, res)
    {
        var email   =   req.session.email;

        if(typeof email === 'undefined')
        {
            res.redirect('/');
            return;
        }

        var Users = require('../models/users.js');

        Users.findOne({email: email}, function(err, user)
        {
            if(err)
            {
                res.status(500)
                res.render('error');
            }
            var Tags   =    require('../models/tags.js');

            Object.keys(tabs).forEach(function(key) {
                tabs[key].active    =   '';
            });
            tabs[2].active  =   'active';

            Tags.find({}, function (err, tags) {
                if(tags != null)
                    tags    =   Object.keys(tags).map(function (key) {return tags[key]['name']});
                else
                    tags    =   [];

                var Categories   =    require('../models/categories.js');

                Categories.find({}, function (err, categories) {

                    if(categories != null)
                        categories    =   Object.keys(categories).map(function (key) {return categories[key].name;});
                    else
                        categories    =   [];

                    var data    =   {};
                    data.user   =   user;
                    data.tabs   =   tabs;
                    data.tags   =   tags;
                    data.categories   =   categories;
                    res.render('post', data);
                });
            });
        });
    }).post(function(req, res)
    {
        var Posts   =   require('../models/posts.js');
        var Tags    =   require('../models/tags.js');
        var tags_to_insert  =   [];
        var data    =   JSON.parse(req.body.data);

        Tags.find({}, function (err, tags)
        {
            if(typeof data.tags != 'undefined')
            {
                var user_tags   =   data.tags;

                if(typeof tags != 'undefine' && tags.length)
                {
                    var tags_arr = [];
                    for (var i = 0; i < tags.length; i++) {
                        tags_arr.push(tags[i].name);
                    }

                    for(var i in user_tags)
                    {
                        if(tags_arr.indexOf(user_tags[i]) == -1)
                            tags_to_insert.push({name: user_tags[i]});
                    }
                }
                else
                {
                    for(var i in user_tags)
                    {
                        tags_to_insert.push({name: user_tags[i]});
                    }
                }
            }

            if(tags_to_insert.length)
                Tags.collection.insert(tags_to_insert, function(){});

            var newPost = Posts({
                id_user: data.id_user,
                description: data.description,
                url: data.url,
                is_highlighted: data.is_highlighted,
                categories: data.categories,
                tags: data.tags,
                title: data.title,
                preview_description: data.preview_description,
                image: data.image
            });
            newPost.save(function(err) {
                if(err)
                {
                    res.status(500);
                    res.json({ msg: 'DB Error', 'error': err});
                }
                else
                    res.json({ msg: 'Successfully Created'});
            });
        });
    }).put(function(req, res)
    {

    }).delete(function(req, res)
    {
        var Posts   =   require('../models/posts.js');
        var id_post    =   req.body.id_post;

        Posts.find({_id: id_post}).remove().exec(function(err, data) {
            if(err) {
                res.status(500);
                res.json({ msg: 'DB Error', 'error': err});
            }
            else
                res.json({ msg: 'Post Successfully Deleted'});
        });
    });

    app.route('/post/url').post(function (req, res)
    {
        var url         =   req.body.url;
        var expression  =   /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex       =   new RegExp(expression);

        if( ! url.match(regex)) {
            res.status(400);
            res.json({msg:'Invalid Url'});
        }

        var scrape      =   require('html-metadata');
        var request     =   require('request');

        var options     =   {
    		url: url,
    		jar: request.jar(), // Cookie jar
    		headers: {
			    'User-Agent': 'webscraper'
            }
        };

        scrape(options, function(error, metadata){
            if(error) {
                res.status(400);
                res.json({msg: error});
                return;
            }

            if(metadata == null || typeof metadata.general === undefined) {
                res.status(400);
                res.json({msg: 'Invalid URL'});
                return;
            }

            var title       =   metadata.general.title;
            var description =   metadata.general.description;
            var image       =   null;

            if('openGraph' in metadata) {
                if( ! title && 'title' in metadata.openGraph)
                    title   =   metadata.openGraph.title;

                if( ! description && 'description' in metadata.openGraph)
                {
                    description   =   metadata.openGraph.description;
                    console.log(description);
                }

                if('image' in metadata.openGraph)
                {
                    if(metadata.openGraph.image.length > 1)
                        image   =   metadata.openGraph.image[0].url;
                    else
                        image   =   metadata.openGraph.image.url;
                }
            }

            if( ! image || image.match(/\.(jpeg|jpg|gif|png)/) == null)
                image   =   '/images/setting_icon.png';

        	res.json({title: title, description: description, image: image, metadata: metadata});
        });
    });
}
