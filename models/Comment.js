const {Schema, model} = require("mongoose")

const Comment = new Schema({
    author:{type:String, required:true, ref:"User"},
    text:{type:String},
    date:{type:Date, required:true},
    post:{type:String, required:true, ref:"Posts"}
})

module.exports = model("Comment", Comment)