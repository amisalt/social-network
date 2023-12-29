const User = require("./models/User")
const Post = require("./models/Post")
const {validationResult} = require("express-validator")
const jwt = require("jsonwebtoken")
const {secret} = require("./config")

class PostController{
    async newPost(req,res){
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({"message":"Creating post error"})
            }
            const {text,date} = req.body
            const post = new Post({"author":req.user.id,text,date})
            await post.save()
            res.json({message:"Post successfully created"})
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
    async editPost(req,res){
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({"message":"Creating post error"})
            }
            const {text, postAuthor, postText, postDate} = req.body
            const authorUser = await User.findOne({"username":postAuthor})
            if(req.user.id != authorUser._id){
                return res.status(400).json({"message":"User is not author of the post"})
            }
            const post = await Post.findOne({"author":authorUser._id, "text":postText, "date":postDate})
            if (post.deleted){
                return res.status(400).json({"message":"Post is not existing"})
            }
            post.text = text
            await post.save()
            res.json({message:"Post successfully edited"})
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e}) 
        }
    }
    async deletePost(req,res){
        try{
            const {author,text,date} = req.body
            const authorUser = await User.findOne({"username":author})
            if(req.user.id != authorUser._id && !req.user.roles.includes("ADMIN")){
                return res.status(400).json({"message":"User is not author of the post"})
            }
            const post = await Post.findOne({"author":authorUser._id,text,date})
            if (post.deleted){
                return res.status(400).json({"message":"Post is not existing"})
            }
            post.deleted = true
            await post.save()
            res.json({message:"Post successfully deleted"})
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e}) 
        }
    }
    async getPosts(req,res){
        try{
            const posts = await Post.find({"deleted":false})
            const authors = {}
            for(let i = 0; i<posts.length; i++){
                authors[posts[i].author] = ""
            }
            for(let author of Object.keys(authors)){
                let user = await User.findById(author)
                authors[author] = user.username
            }
            for(let i = 0; i<posts.length; i++){
                posts[i].author = authors[posts[i].author]
            }
            res.json(posts)
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e}) 
        }
    }
}

module.exports = new PostController()