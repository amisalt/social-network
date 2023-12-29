const logreg = document.getElementById("logreg"),
      getUsers = document.getElementById("getUsers"),
      span = document.getElementById("users"),
      postBlock = document.getElementById("posts"),
      leftBlock = document.getElementById("left"),
      createPost = document.getElementById("createPost"),
      notifics = document.getElementById("notifications")

const socket = io()
let token = localStorage.getItem("token")

logreg.addEventListener("click", ()=>{
    location.assign("/logreg")
})
getUsers.addEventListener("click", async()=>{
    token = localStorage.getItem("token")
    await fetch("http://localhost:8000/auth/getUsers", {
        method:"GET",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        }
    }).then(res=>res.json()).then(res=>span.textContent = JSON.stringify(res))
})


createPost.addEventListener("click", ()=>{
    token = localStorage.getItem("token")
    const newPost = document.createElement("div")
    newPost.classList.add("newPost")
    const label = document.createElement("span")
    label.textContent = "Text of new post: (>//<)"
    const input = document.createElement("textarea")
    const createB = document.createElement("button")
    createB.textContent = "Create!"
    createB.addEventListener("click",async ()=>{
        if(input.value){
            await fetch("http://localhost:8000/post/newPost", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify({
                    "text":input.value,
                    "date":new Date()
                })
            }).then(res=>res.json()).then(async (res) =>  {
                if(res.message === "Post successfully created"){
                    leftBlock.removeChild(newPost)
                    await getPosts()
                    let post = document.querySelectorAll(".post")
                    post = post[post.length-1].innerHTML.slice(0,54)
                    post = post.replace("</span>","")
                    post = post.split("<span>")
                    post.shift()
                    post[1] = post[1].replace("</span>","")
                    console.log(post);
                    socket.emit("newPost", JSON.stringify({"content":post}))
                    socket.emit("reload")
                }else{
                    const error = document.createElement("span")
                    error.textContent = res.message
                    newPost.append(error)
                }
            })
        }
    })
    newPost.append(label,input,createB)
    leftBlock.append(newPost)
})


function createPostBlock(data){
    token = localStorage.getItem("token")
    const post = document.createElement("div")
    post.classList.add("post")
    const author = document.createElement("span")
    author.textContent = data.author
    const text = document.createElement("span")
    text.textContent = data.text
    const date = document.createElement("span")
    date.textContent = data.date
    const deleteB = document.createElement("button")
    deleteB.textContent = "delete post"
    const editB = document.createElement("button")
    editB.textContent = "edit post"
    editB.addEventListener("click",()=>{
        const editPost = document.createElement("div")
        editPost.classList.add("postEdit")
        const win = document.createElement("textarea")
        const submit = document.createElement("button")
        submit.textContent = "submit"
        submit.addEventListener("click",async ()=>{
            if(win.value){
                await fetch("http://localhost:8000/post/editPost",{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":`Bearer ${token}`
                    },
                    body:JSON.stringify({
                        "postAuthor":author.textContent,
                        "postText":text.textContent,
                        "postDate":date.textContent,
                        "text":win.value
                    })
                }).then(res => res.json())
                .then(res =>{
                    if(res.message === "Post successfully edited"){
                        text.textContent = win.value
                        post.removeChild(editPost)
                        socket.emit("reload")
                    }else{
                        const error = document.createElement("span")
                        error.textContent = res.message
                        editPost.append(error)
                    }
                })
            }
        })
        editPost.append(win,submit)
        post.append(editPost)
    })
    deleteB.addEventListener("click", async()=>{
        await fetch("http://localhost:8000/post/deletePost",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({
                "author":author.textContent,
                "text":text.textContent,
                "date":date.textContent
            })
        }).then(res => res.json())
        .then(res =>{
            if(res.message === "Post successfully deleted"){
                postBlock.removeChild(post)
                socket.emit("reload")
            }else{
                const error = document.createElement("span")
                error.textContent = res.message
                post.append(error)
            }
        })
    })
    post.append(author,text,date,deleteB,editB)
    postBlock.append(post)
}

function createPopUp(array){
    console.log(array);
    let data = JSON.parse(array)
    data = data.content
    const notif = document.createElement("div")
    notif.classList.add("notif")
    for(let i = 0; i<data.length; i++){
        let span = document.createElement("span")
        span.textContent = data[i]
        notif.appendChild(span)
    }
    notifics.append(notif)
    notifics.style.display = "flex"
    notifics.style.animationPlayState = "paused"
    notifics.style.animation = "disappear 10s linear 0s 1 normal forwards"
    setTimeout(()=>{
        notifics.removeChild(notif)
    },10*1000)
}

async function getPosts(){
    token = localStorage.getItem("token")
    await fetch("http://localhost:8000/post/getPosts",{
        method:"GET",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        }
    }).then(res => res.json())
    .then(res => {
        console.log(res);
        postBlock.innerHTML = ""
        for(let i = 0; i<res.length; i++){
            createPostBlock(res[i])
        }
    })
}


getPosts()
socket.on("newPostMessage", data=>{
    clearInterval()
    createPopUp(data)
})
socket.on("reloadServer", ()=>{
    getPosts()
    console.log("reload");
})