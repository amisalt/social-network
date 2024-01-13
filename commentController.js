const User = require("./models/User")
const Post = require("./models/Post")
const Comment = require("./models/Comment")
const {validationResult} = require("express-validator")

class CommentController{
    async newComment(req,res){
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({"message":"Creating comment error"})
            }
            const {text, postAuthor, postText, postDate} = req.body
            const post = await Post.findOne({"author":postAuthor, "text":postText, "date":postDate})
            if(!post){
                return res.status(400).json({"message":"Post is not existing"})
            }
            const comment = new Comment({"author":req.user.id, text, "date":new Date(), "post":post._id})
            await comment.save()
            res.json({message:"Comment successfully created"})
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
    async editComment(req,res){
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({"message":"Creating comment error"})
            }
            const {text, postAuthor, postText, postDate, commentAuthor, commentText, commentDate} = req.body
            const authorUser = await User.findOne({"username":commentAuthor})
            if(!authorUser._id == req.user.id){
                return res.status(400).json({"message":"User is not author of the comment"})
            }
            const post = await Post.findOne({"author":postAuthor, "text":postText, "date":postDate})
            if(!post){
                return res.status(400).json({"message":"Post is not existing"})
            }
            const comment = await Comment.findOne({"author":commentAuthor, "text":commentText, "date":commentDate, "post":post._id})
            if(!comment){
                return res.status(400).json({"message":"Comment is not existing"})
            }
            comment.text = text
            await comment.save()
            res.json({message:"Comment successfully edited"})
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
    async deleteComment(req,res){
        try{
            const {author, text, date, postText, postDate, postAuthor} = req.body
            const authorUser = await User.findOne({"username":commentAuthor})
            if(!authorUser._id == req.user.id && !req.user.roles.includes("ADMIN")){
                return res.status(400).json({"message":"User is not author of the comment"})
            }
            const post = await Post.findOne({"author":postAuthor,"text":postText,"date":postDate})
            if(!post){
                return res.status(400).json({"message":"Post is not existing"})
            }
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
    async getComments(req,res){
        try{
            
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
}

module.exports = new CommentController()