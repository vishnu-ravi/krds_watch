module.exports = function (app, tabs) {
    var Posts   =   require('../models/posts.js');

    app.route('/reset/all').get(function(req, res)
    {
        var Tags    =   require('../models/tags.js');
        var Users   =   require('../models/users.js');
        var Categories = require('../models/categories.js');

        Posts.remove({}, function(){});
        Tags.remove({}, function(){});
        Users.remove({}, function(){});
        Categories.remove({}, function(){});

        res.send('All Cleared');
    });

    app.route('/reset/posts').get(function(req, res)
    {
        Posts.remove({}, function(){});
        res.send('Posts Cleared');
    });

    app.route('/reset/tags').get(function(req, res)
    {
        var Tags    =   require('../models/tags.js');
        Tags.remove({}, function(){});
        res.send('Tags Cleared');
    });

    app.route('/reset/Users').get(function(req, res)
    {
        Posts.remove({}, function(){});

        var Users   =   require('../models/users.js');
        Users.remove({}, function(){});
        res.send('Users Cleared');
    });

    app.route('/reset/categories').get(function(req, res)
    {
        var Categories = require('../models/categories.js');

        Categories.remove({}, function(){});
        res.send('Categories Cleared');
    });

    app.route('/get/categories', function(req, res)
    {
        var Categories = require('../models/categories.js');

        Categories.find({}, function(err, contents) {
            res.send(contents);
        });
    });

    app.route('/add/categories').get(function(req, res)
    {
        var Categories = require('../models/categories.js');

        var categories = [
            {
                name: 'Global'
            },
            {
                name: 'Dev'
            },
            {
                name: 'CSS'
            },
            {
                name: 'PM'
            },
            {
                name: 'QA'
            },
            {
                name: 'CM'
            }
        ];
        function onInsert(err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.info('%d categories were successfully stored.', docs.length);
            }
        }

        Categories.collection.insert(categories, onInsert);

        res.send('Categories Inserted');
    });
}
