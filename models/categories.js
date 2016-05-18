var mongoose        =   require("mongoose");
var Schema          =   mongoose.Schema;
var categorySchema  =   new Schema({
    name: {type: String, required: true, unique: true}
});

var Categories      =   mongoose.model('Categories', categorySchema);
module.exports      =   Categories;
