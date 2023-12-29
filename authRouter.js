const Router = require("express")
const router = new Router()
const controller = require("./authController")
const {check} = require("express-validator")
const authCheck = require("./middlewares/authMiddleware")
const rolesMiddleware = require("./middlewares/rolesMiddleware")

router.post("/registration", 
[
    check("username", "Empty username").notEmpty(), 
    check("password", "Short password. Length over 4 and under 8 characters is recommended").isLength({min:4,max:8})
],
controller.registration)
router.post("/login", controller.login)
router.get("/getUsers", 
[
    authCheck,
    rolesMiddleware(["ADMIN"])
],
controller.getUsers)

module.exports = router