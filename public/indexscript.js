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
                    post = post[post.length-1].innerHTML
                    post = post.slice(0,post.length-61).replaceAll("<span>", "").split("</span>")
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


function createPostBase(data){
    token = localStorage.getItem("token")
    const post = document.createElement("div")
    post.classList.add("post")
    post.innerHTML += `<span>${data.post.author}</span>`
    const text = document.createElement("span")
    text.textContent = data.post.text
    post.append(text)
    let datetime = new Date(data.post.date)
    post.innerHTML += `<span>${datetime.getHours()>10 ? datetime.getHours() : `0${datetime.getHours()}`}:${datetime.getMinutes()>10 ? datetime.getMinutes() : `0${datetime.getMinutes()}`} ${datetime.getDate()}.${datetime.getMonth()+1}.${datetime.getFullYear()}`
    if(data.owner || data.admin){
        const deleteB = document.createElement("button")
        deleteB.textContent = "delete post"
        deleteB.addEventListener("click", async(e)=>{
            e.stopPropagation()
            await fetch("http://localhost:8000/post/deletePost",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify({
                    "postID":data.post._id
                })
            }).then(res => res.json())
            .then(res =>{
                if(res.message === "Post successfully deleted"){
                    socket.emit("reload")
                }else{
                    const error = document.createElement("span")
                    error.textContent = res.message
                    post.append(error)
                }
            })
        })
        post.append(deleteB)
    }
    if(data.owner){
        const editB = document.createElement("button")
        editB.textContent = "edit post"
        editB.addEventListener("click",(e)=>{
            e.stopPropagation()
            const editPost = document.createElement("div")
            editPost.classList.add("postEdit")
            const win = document.createElement("textarea")
            win.value = data.post.text
            const submit = document.createElement("button")
            submit.textContent = "submit"
            submit.addEventListener("click",async (e)=>{
                e.stopPropagation()
                if(win.value){
                    await fetch("http://localhost:8000/post/editPost",{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Authorization":`Bearer ${token}`
                        },
                        body:JSON.stringify({
                            "postID":data.post._id,
                            "text":win.value
                        })
                    }).then(res => res.json())
                    .then(res =>{
                        if(res.message == "Post successfully edited"){
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
        post.append(editB)
    }
    return post
}


function createCommentBase(data, postID){
    token = localStorage.getItem("token")
    const post = document.createElement("div")
    post.classList.add("comment")
    post.innerHTML += `<span>${data.post.author}</span>`
    const text = document.createElement("span")
    text.textContent = data.post.text
    post.append(text)
    let datetime = new Date(data.post.date)
    post.innerHTML += `<span>${datetime.getHours()>10 ? datetime.getHours() : `0${datetime.getHours()}`}:${datetime.getMinutes()>10 ? datetime.getMinutes() : `0${datetime.getMinutes()}`} ${datetime.getDate()}.${datetime.getMonth()+1}.${datetime.getFullYear()}`
    if(data.owner || data.admin){
        const deleteB = document.createElement("button")
        deleteB.textContent = "delete comment"
        deleteB.addEventListener("click", async(e)=>{
            await fetch("http://localhost:8000/comment/deleteComment",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify({
                    "commentID":data.post._id,
                    postID
                })
            }).then(res => res.json())
            .then(res =>{
                if(res.message === "Comment successfully deleted"){
                    socket.emit("reload")
                }else{
                    const error = document.createElement("span")
                    error.textContent = res.message
                    post.append(error)
                }
            })
        })
        post.append(deleteB)
    }
    if(data.owner){
        const editB = document.createElement("button")
        editB.textContent = "edit comment"
        editB.addEventListener("click",(e)=>{
            const editPost = document.createElement("div")
            editPost.classList.add("postEdit")
            const win = document.createElement("textarea")
            win.value = data.post.text
            const submit = document.createElement("button")
            submit.textContent = "submit"
            submit.addEventListener("click",async (e)=>{
                if(win.value){
                    await fetch("http://localhost:8000/comment/editComment",{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Authorization":`Bearer ${token}`
                        },
                        body:JSON.stringify({
                            postID,
                            "text":win.value,
                            "commentID":data.post._id
                        })
                    }).then(res => res.json())
                    .then(res =>{
                        if(res.message == "Comment successfully edited"){
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
        post.append(editB)
    }
    return post
}


function createCommentBlockBase(data){
    const commB = document.createElement("button")
    commB.textContent = `view comments (${data.comments.length}) ↓`
    const div = document.createElement("div")
    div.style.display = "none"
    div.classList.add("flexColumn")
    const commBlock = document.createElement("div")
    commBlock.classList.add("flexColumn")
    const commAddT = document.createElement("textarea")
    const commAddB = document.createElement("button")
    commAddB.textContent = "add comment"
    div.append(commBlock, commAddT, commAddB, )
    commB.addEventListener("click",(e)=>{
        if(div.style.display == "none"){
            commB.textContent = "hide comments ↑"
            div.style.display = "flex"
            if(data.comments.length > 0){
                if(!commBlock.innerHTML)
                    for(let comment of data.comments) commBlock.append(createCommentBase(comment, data.post._id))
            }else{
                commBlock.style.display = "none"
            }
            commAddB.addEventListener("click", async(e)=>{
                if(commAddT.value){
                    let text = commAddT.value
                    commAddT.value = ""
                    await fetch("http://localhost:8000/comment/newComment",{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            "Authorization":`Bearer ${token}`
                        },
                        body:JSON.stringify({
                            text,
                            "postID":data.post._id
                        })
                    }).then(res => res.json()).then(async res => {
                        if(res.message === "Comment successfully created"){
                            
                            socket.emit("reload")
                        }else{
                            const error = document.createElement("span")
                            error.textContent = res.message
                            div.append(error)
                        }
                    })
                }
            })
            
        }else{
            commB.textContent = `view comments (${data.comments.length}) ↓`
            div.style.display = "none"
        }
    })
    return [commB, div]
}


function createPostBlock(data){
    const post = createPostBase(data)
    post.append(...createCommentBlockBase(data))
    postBlock.append(post)
}

function createPopUp(array){
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
})
