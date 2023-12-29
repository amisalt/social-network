const User = require("./models/User.js")
const Role = require("./models/Role.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {validationResult} = require("express-validator")
const {secret} = require("./config.js")

const generateAccessToken = (id, roles)=>{
    const payload = {id,roles}
    return jwt.sign(payload, secret, {expiresIn:"24h"})
}

class AuthController{
    async registration(req,res){
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({message:"Registration error", errors})
            }
            const {username,password} = req.body
            const candidate = await User.findOne({username})
            if(candidate){
                return res.status(400).json({message:"User is already existing"})
            }
            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await Role.findOne({value:"USER"})
            const user = new User({username, password:hashPassword, roles:[userRole.value]})
            await user.save();
            res.json({message:"Successfull registration", errors})
        }catch(e){
            console.error(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
    async login(req,res){
        try{
            const {username,password} = req.body
            const user = await User.findOne({username})
            if(!user){
                return res.status(400).json({message:`User ${username} is not existing`})
            }
            const validPassword = bcrypt.compareSync(password,user.password)
            if(!validPassword){
                return res.status(400).json({message:`Invalid password`})
            }
            const token = generateAccessToken(user._id, user.roles)
            return res.json({token})
        }catch(e){
            console.error(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
    async getUsers(req,res){
        try{
            // ! Он не может превратить model в json
            const users = await User.find()
            res.json(users);

            // const userRole = new Role()
            // const adminRole = new Role({value:"ADMIN"})
            // await userRole.save()
            // await adminRole.save()
            // res.json({message:200})
        }catch(e){
            console.error(e);
            res.status(400).json({message:"Unhandled error", e})
        }
    }
}
module.exports = new AuthController()