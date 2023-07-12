const router = require("express").Router();
const VerificationController = require("../controllers/VerificationController")
const auth = require("../middleware/Auth")
const {check} =require("express-validator");

router.post ("/create",[auth,[
    check("id").isMongoId().withMessage("not Valid Mongo ID"),
    check("cardNumber").isCreditCard().withMessage("enter valid credit card Number"),
    check("cvv").isLength({ min: 3, max: 4 }).isNumeric(),
    check('cardExpiry').matches(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/).isLength({ min: 5, max: 7 }),
    check('cardHolderName').isLength({ min: 2, max: 50 }).isString(),
]],VerificationController.createVerification)


router.post ("/verify_account",[auth,[
    check("cardNumber").isCreditCard().withMessage("enter valid credit card Number"),
    check("cvv").isLength({ min: 3, max: 4 }).isNumeric(),
    check('cardExpiry').matches(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/).isLength({ min: 5, max: 7 }),
    check('cardHolderName').isLength({ min: 2, max: 50 }).isString(),
]],VerificationController.verifyAccount)


router.get("/getMyPayments",auth,VerificationController.getAllPayments)

module.exports = router