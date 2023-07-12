const User = require("../models/User")
const {validationResult} = require("express-validator")
const {DeductPayment} = require("../helpers/helper")
const VerificationPackage = require("../models/VerificationPackage")
const VerificationPayments = require("../models/VerificationPayment")
const moment = require("moment")

exports.createVerification = async(req,res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
        const {cardNumber,cvv,cardHolderName,cardExpiry,id}= req.body
        const verificationPackage = await VerificationPackage.findById(id)
        const charge = await DeductPayment(cardExpiry,cardNumber,cvv,verificationPackage.amount,res)
        if(charge){
            const verificationPaymentLog = VerificationPayments({
                Verification_id:id,
                user: req.user._id,
                charge_id: charge.id,
                amount:charge.amount/100
            })
            await verificationPaymentLog.save()

            const user = await User.findById(req.user._id)
            user.verification_package = verificationPackage._id;
            user.verification_expiration = verificationPackage.Type === "Monthly"? 
                new Date().setMonth(new Date().getMonth() + 1): new Date().setFullYear(new Date().getFullYear() + 1)
            
            await user.save()
            
            res.status(200).json({message:"user Successfully Verified"})
        }else{
            return
        }
    } catch (error) {
        res.status(500).send({
            error: error
          })   
    }
}

exports.verifyAccount = async(req,res) =>{
  const user = await User.findById(req.user._id)

  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {

    if(!user) {
      return res.status(400).json("user not found");
    }else if(user?.is_verified){
      return res.status(400).json("user already verified");
    }
    const verificationPackage = await VerificationPackage.findOne();
    if(!verificationPackage){
      return res.status(400).json("verification package not set by admin");
    }
    const {cardNumber,cvv,cardHolderName,cardExpiry}= req.body

    let amount = user?.followers?.length >= verificationPackage.followers ? verificationPackage.amount_1 : verificationPackage.amount_2 

    const charge = await DeductPayment(cardExpiry,cardNumber,cvv,amount,res)

    if(charge){
      const verificationPaymentLog = VerificationPayments({
          Verification_id:verificationPackage._id,
          user: req.user._id,
          charge_id: charge.id,
          amount:charge.amount/100
      })
      await verificationPaymentLog.save()

      user.is_verified = true;

      await user.save();

      return res.send("User verified Successfully")

    }


  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
}

exports.getAllPayments = async (req, res) => {
    try {
      const { page, limit, fieldname, order, keyword, from, to } = req.query;
      const currentpage = page ? parseInt(page, 10) : 1;
      const per_page = limit ? parseInt(limit, 10) : 10;
      const CurrentField = fieldname ? fieldname : "createdAt";
      const currentOrder = order ? parseInt(order, 10) : -1;
      const offset = (currentpage - 1) * per_page;
      const sort = {};
      sort[CurrentField] = currentOrder;
  
      const searchParam = keyword
        ? {
            name: { $regex: `${keyword}`, $options: "i" },
          }
        : {};
  
      let dateFilter = {};
      if (from && to) {
        dateFilter = {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(to).endOf("day").toDate(),
          },
        };
      } else if (from) {
        dateFilter = {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (to) {
        dateFilter = {
          createdAt: {
            $lte: moment(to).endOf("day").toDate(),
          },
        };
      }
  
      const query = {
        user: req.user._id,
        ...searchParam,
        ...dateFilter,
      };
  
      const options = {
        page: currentpage,
        limit: per_page,
        lean: true,
        sort,
      };
  
      const payments = await VerificationPayments.paginate(query, options);
  
      res.status(200).json(payments);
    } catch (err) {
      res.status(500).json({
        message: err.toString(),
      });
    }
  };