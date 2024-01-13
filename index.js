const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const PORT = 8000
const app = express()
const http = require("http")
const server = http.createServer(app)
const {Server} = require("socket.io")
const io = new Server(server)
const authRouter = require("./authRouter.js")
const postRouter = require("./postRouter.js")
const commentRouter = require("./commentRouter.js")

app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded())
app.use("/auth", authRouter)
app.use("/post", postRouter)
app.use("/comment", commentRouter)

const start = async ()=>{
    try{
        await mongoose.connect("mongodb+srv://ami:lol123@cluster0.vrefeva.mongodb.net/")
        server.listen(PORT, ()=>{
            console.log("server started ><");
        })
        io.on("connection", (socket)=>{
            console.log(`user connected ${socket.id}`);
            socket.on("newPost", (data)=>{
                socket.broadcast.emit("newPostMessage",data)
            })
            socket.on("reload", ()=>{
                io.emit("reloadServer")
            })
        })
        app.get("/", (req,res)=>{
            res.setHeader("Content-Type", "text/html")
            res.sendFile(path.join(__dirname, "public/index.html"))
        })
        app.get("/logreg", (req,res)=>{
            res.setHeader("Content-Type", "text/html")
            res.sendFile(path.join(__dirname, "public/logreg.html"))
        })
    }catch(e){
        console.error(e);
    }
}
start()
