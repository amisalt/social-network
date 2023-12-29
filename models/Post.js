const {Schema, model} = require("mongoose")

const Post = new Schema({
    author:{type:String, required:true, ref:"User"},
    text:{type:String},
    date:{type:Date, required:true},
    deleted:{type:Boolean, default:false},
    comments:[{type:String, ref:"Comment"}]
})

module.exports = model("Posts", Post)