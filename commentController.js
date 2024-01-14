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
            const {text, postID} = req.body
            const post = await Post.findById(postID)
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
            const {text, postID, commentID} = req.body
            const post = await Post.findById(postID)
            if(!post){
                return res.status(400).json({"message":"Post is not existing"})
            }
            const comment = await Comment.findById(commentID)
            if(!comment){
                return res.status(400).json({"message":"Comment is not existing"})
            }
            if(!comment.author == req.user.id){
                return res.status(400).json({"message":"User is not author of the comment"})
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
            const {commentID, postID} = req.body
            const post = await Post.findById(postID)
            if(!post){
                return res.status(400).json({"message":"Post is not existing"})
            }
            const comment = await Comment.findById(commentID)
            if(!comment){
                return res.status(400).json({"message":"Comment is not existing"})
            }
            if(!comment.author == req.user.id && !req.user.roles.includes("ADMIN")){
                return res.status(400).json({"message":"User is not author of the comment"})
            }
            await Comment.findByIdAndDelete(comment._id)
            res.json({"message":"Comment successfully deleted"})
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
    async getComments(req,res){
        try{
            let currentUserId = req.user.id
            const {postID} = req.body
            const post = await Post.findById(postID)
            if(!post){
                return res.status(400).json({"message":"Post is not existing"})
            }
            const currentUser = await User.findById(currentUserId)
            const admin = currentUser.roles.includes("ADMIN")
            const comments = await Comment.find({"post":post._id})
            const authors = {}
            for(let i = 0; i<comments.length; i++){
                authors[comments[i].author] = ""
            }
            for(let author of Object.keys(authors)){
                let user = await User.findById(author)
                authors[author] = [user.username]
                if(user._id == currentUserId) authors[author].push(1)
                else authors[author].push(0)
            }
            for(let i = 0; i<comments.length; i++){
                let author = authors[comments[i].author]
                comments[i].author = author[0]
                comments[i] = {post:comments[i], owner:author[1], admin}
            }
            res.json(comments)
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
}

module.exports = new CommentController()
