var mongoose            =   require("mongoose");
var mongoose_paginate   =   require('mongoose-paginate');
var Schema              =   mongoose.Schema;
var ObjectId            =   Schema.ObjectId;

var postSchema          =   new Schema({
    id_user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    description: {type: String},
    is_highlighted: {type: Boolean, default: 0},
    url: {type: String},
    categories: {type: Array, index: true},
    tags: {type: Array, index: true},
    title: {type: String},
    preview_description: {type: String},
    image: {type: String},
    is_deleted: {type: Boolean, default: 0},
    comments: [{
        id_user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
        comment: {type: String},
        date: {type: Date}
    }]
}, {timestamps: {createdAt: 'date_posted', updatedAt: 'date_edited'}});

postSchema.plugin(mongoose_paginate);

postSchema.virtual('id_post').get(function(){
    return this._id;
});

var Posts       =   mongoose.model('Posts', postSchema);
module.exports  =   Posts;
