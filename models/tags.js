var mongoose    =   require("mongoose-q")();
var Schema      =   mongoose.Schema;
var tagSchema   =   new Schema({
    name: {type: String, required: true, unique: true}
});

var Tags        =   mongoose.model('Tags', tagSchema);
module.exports  =   Tags;
