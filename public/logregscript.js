const regUsername = document.getElementById("reglogin"),
      regPassword = document.getElementById("regpassword"),
      regPasswordRep = document.getElementById("passwordRep"),
      regButton = document.getElementById("reg"),
      regForm = document.getElementById("regForm"),
      logUsername = document.getElementById("loglogin"),
      logPassword = document.getElementById("logpassword"),
      logButton = document.getElementById("log"),
      logForm = document.getElementById("logForm")
      logIn = document.getElementById("logIn"),
      signUp = document.getElementById("signUp"),
      regError = document.getElementById("regError"),
      logError = document.getElementById("logError")

logIn.classList.add("active")
logIn.addEventListener("click", ()=>{
    logIn.classList.add("active")
    logForm.style.display = "flex"
    regForm.style.display = "none"
    signUp.classList.remove("active")
})
signUp.addEventListener("click", ()=>{
    signUp.classList.add("active")
    regForm.style.display = "flex"
    logForm.style.display = "none"
    logIn.classList.remove("active")
})

logButton.addEventListener("click",async ()=>{
    const username = logUsername.value
    const password = logPassword.value
    if(username && password){
        let token = await fetch("http://localhost:8000/auth/login", {
            method:"POST",
            headers:{
                "Content-Type":"application/json;charset=utf-8"
            },
            body: JSON.stringify({
                "username":username,
                "password":password
            })
        }).then(res=>res.json())
        if(token.token){
            localStorage.setItem("token", token.token)
            location.assign("/")
        }
        else{
            logError.textContent = token.message
        }
    }
})
regButton.addEventListener("click",async ()=>{
    const username = regUsername.value
    const password = regPassword.value
    const reppass = regPasswordRep.value
    if(username && password===reppass && password && reppass){
        let message = await fetch("http://localhost:8000/auth/registration", {
            method:"POST",
            headers:{
                "Content-Type":"application/json;charset=utf-8"
            },
            body: JSON.stringify({
                "username":username,
                "password":password
            })
        }).then(res=>res.json())
        console.log(message);
        if(message.message === "Successfull registration"){
            let token = await fetch("http://localhost:8000/auth/login", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json;charset=utf-8"
                },
                body: JSON.stringify({
                    "username":username,
                    "password":password
                })
            }).then(res=>res.json())
            if(token.token){
                localStorage.setItem("token", token.token)
                location.assign("/")
            }
            else{
                regError.textContent = token.message
            }
        }else{
            regError.textContent = message.message
        }
    }
})