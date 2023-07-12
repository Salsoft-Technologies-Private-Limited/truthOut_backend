const router = require("express").Router()
const { check } = require("express-validator")

//middleware
const auth = require("../middleware/Auth")
const admin = require('../middleware/Admin')

const VerificationPackageController = require("../controllers/VerificationPackageController")

router.post("/create-package", [auth, admin, [
    check("title", "Title is required").isString().withMessage("must be a String").not().isEmpty().withMessage("must not be empty"),
    check("amount", "Amount is required").isInt().withMessage("amount must be a Integer value").not().isString().withMessage("must not be a string"),
    check("type", "type is required").isIn(["Monthly", "Yearly"]).withMessage("The value can be either Monthly or Yearly").notEmpty().withMessage("Must add type"),
    check("description").optional().isString().withMessage("must be a String")
]], VerificationPackageController.createVerificationPackage)

router.get("/view", [auth, admin, [
    check("id").isMongoId().withMessage("Not Valid MongoID")
]], VerificationPackageController.ViewPost)

router.get("/list-package", auth, VerificationPackageController.listPackageForUser)

router.patch("/edit", [auth, admin, [
    check("id").isMongoId().withMessage("Not a valid ID"),
    check("title").optional().isString().withMessage("must be a String").not().isEmpty().withMessage("must not be empty"),
    check("amount").optional().isInt().withMessage("amount must be a Integer value").not().isString().withMessage("must not be a string"),
    check("type", "type is required").isIn(["Monthly", "Yearly"]).withMessage("The value can be either Monthly or Yearly").notEmpty().withMessage("Must add type"),
    check("description").optional().isString().withMessage("must be a String")
]], VerificationPackageController.editPackage)

router.get("/list-package-admin", [auth, admin], VerificationPackageController.listPackageForAdmin)

router.patch("/activate-package", [auth, admin, [
    check("id").isMongoId().withMessage("Not a valid ID")
]], VerificationPackageController.inActivate_Activate_Package)



router.post("/create-package-new", [auth, [
    check("title", "Title is required").isString().withMessage("must be a String").not().isEmpty().withMessage("must not be empty"),
    check("amount_1", "Amount 1 is required").isInt().withMessage("amount must be a Integer value").not().isString().withMessage("must not be a string"),
    check("amount_2", "Amount 2 is required").isInt().withMessage("amount must be a Integer value").not().isString().withMessage("must not be a string"),
    check("followers", "Followers count is required").isInt().withMessage("amount must be a Integer value").not().isString().withMessage("must not be a string"),
]], VerificationPackageController.verificationPackage)



module.exports = router