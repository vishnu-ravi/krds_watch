var mongoose    =   require("mongoose-q")();
var Schema      =   mongoose.Schema;
var notificationSchema   =   new Schema({
    id_user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    owner_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    id_post: {type: mongoose.Schema.Types.ObjectId, ref: 'Posts'},
    type: {type: String},
    message: {type: String},
    is_seen: {type: Boolean, default: false}
}, {timestamps: {createdAt: 'date_sent', updatedAt: 'date_viewed'}});

var Notification    =   mongoose.model('Notifications', notificationSchema);
module.exports      =   Notification;
