const {Schema, model} = require("mongoose")

const Post = new Schema({
    author:{type:String, required:true, ref:"User"},
    text:{type:String},
    date:{type:Date, required:true}
})

module.exports = model("Posts", Post)