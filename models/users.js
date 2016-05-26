var mongoose    =   require("mongoose-q")();
var Schema      =   mongoose.Schema;
var ObjectId    =   Schema.ObjectId;
var userSchema  =   new Schema({
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    picture: {type: String, required: true},
    category: {type: String, default: 'Global'},
    is_admin: {type: Boolean, default: 0},
    data_notification_seen: {type: Date},
    bookmarks: [{
        id_post: {type: mongoose.Schema.Types.ObjectId, ref: 'Posts'},
        date_added: {type: Date}
    }]
}, {timestamps: {createdAt: 'date_auth', updatedAt: 'date_last_visit'}});

userSchema.virtual('id_user').get(function(){
    return this._id;
});

var Users       =   mongoose.model('Users', userSchema);
module.exports  =   Users;
