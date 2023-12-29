const Router = require("express")
const router = new Router()
const controller = require("./postController")
const {check} = require("express-validator")
const authCheck = require("./middlewares/authMiddleware")

router.post("/newPost", [
    check("text", "Add text to your post").notEmpty(),
    authCheck
], controller.newPost)
router.post("/editPost", [
    check("text", "Add text to your post").notEmpty(),
    authCheck
], controller.editPost)
router.post("/deletePost", [
    authCheck
], controller.deletePost)
router.get("/getPosts",[
    authCheck
], controller.getPosts)

module.exports = router