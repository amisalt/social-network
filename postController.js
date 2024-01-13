const User = require("./models/User")
const Post = require("./models/Post")
const Comment = require("./models/Comment")
const {validationResult} = require("express-validator")

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
            if (!post){
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
            if (!post){
                return res.status(400).json({"message":"Post is not existing"})
            }
            const related_comments = await Comment.find({"post":post._id})
            for(comment of related_comments){
                await Comment.findByIdAndDelete(comment._id)
            }
            await Post.findByIdAndDelete(post._id)
            res.json({message:"Post successfully deleted"})
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e}) 
        }
    }
    async getPosts(req,res){
        try{
            let currentUserId = req.user.id
            const currentUser = await User.findById(currentUserId)
            const admin = currentUser.roles.includes("ADMIN")
            const posts = await Post.find()
            const authors = {}
            for(let i = 0; i<posts.length; i++){
                authors[posts[i].author] = ""
            }
            for(let author of Object.keys(authors)){
                let user = await User.findById(author)
                authors[author] = [user.username]
                if(user._id == currentUserId) authors[author].push(1)
                else authors[author].push(0)
            }
            for(let i = 0; i<posts.length; i++){
                let author = authors[posts[i].author]
                posts[i].author = author[0]
                const comments = await fetch(""http://localhost:8000/comment/getComments",{
                    method:"GET",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":req.headers.authorization.split(" ")[1]
                    }
                }).then(res=>res.json()).then(res=>{
                    
                })
                
                posts[i] = {post:posts[i], owner:author[1], admin, comments}
            }
            res.json(posts)
        }catch(e){
            console.log(e);
            res.status(400).json({message:"Unhandled error", e}) 
        }
    }
}

module.exports = new PostController()
