const Router = require("express")
const router = new Router()
const controller = require("./commentController")
const {check} = require("express-validator")
const authCheck = require("./middlewares/authMiddleware")

router.post("/newComment", [
    check("text", "Add text to your comment").notEmpty(),
    authCheck
], controller.newComment)

router.post("/editComment", [
    check("text", "Add text to your comment").notEmpty(),
    authCheck
], controller.editComment)

router.post("/deleteComment", [
    authCheck
], controller.deleteComment)

router.post("/getComments", [
    authCheck
], controller.getComments)

module.exports = router
