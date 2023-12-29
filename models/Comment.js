const {Schema, model} = require("mongoose")

const Comment = new Schema({
    author:{type:String, required:true, ref:"User"},
    text:{type:String},
    date:{type:Date, required:true},
    deleted:{type:Boolean, default:false}
})

module.exports = model("Comment", Comment)