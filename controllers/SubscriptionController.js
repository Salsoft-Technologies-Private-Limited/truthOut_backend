const Subscription = require("../models/Subscription");
const Payment =  require("../models/Payment")
const User = require("../models/User")
const ToCapitalCase = require("../helpers/helper");
const moment = require("moment");
const { validationResult } = require("express-validator");
const { CreateNotification } = require("../utils/Notification");
const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.createSubscription = async (req, res) => {
  const {
    subscriptionname,
    subscriptionprice,
    subscriptiontype,
    subscriptionduration,
    description,
  } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const subscription = new Subscription({
      subscriptionname,
      subscriptionprice,
      subscriptiontype,
      subscriptionduration,
      description,
    });
    console.log("Before Saving Subscription");
    if (subscriptiontype === "MONTHLY") {
      subscription.expiryDate = moment(subscription.createdAt).add(
        subscriptionduration,
        "M"
      );
    } else if (subscriptiontype === "YEARLY") {
      subscription.expiryDate = moment(subscription.createdAt).add(
        subscriptionduration,
        "Y"
      );
    }
    await subscription.save();
    const notification = {
      notificationType: "Subscription",
      title: "New Subscription Added",
      body: `${subscriptionname} of type ${subscriptiontype} Added By Admin`,
      payload: {
        type: "Admin",
        id: req.user._id,
      },
    };
    CreateNotification(notification);
    console.log("Final Before Saving Subscription");
    return res.status(200).json({ msg: "Subscription Created", subscription });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
};
exports.getSubscriptionById = async (req, res) => {
  let subscription_id = req.params.id;
  console.log("Ayayyayya");
  try {
    let subscription = await Subscription.findOne({
      _id: subscription_id,
    }).lean();
    if (!subscription)
      return res.status(400).json({ message: "Subscription Detail not found" });
    return res.status(200).json(subscription);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.editSubcription = async (req, res) => {
  const {
    subscriptionname,
    subscriptionprice,
    subscriptiontype,
    subscriptionduration,
  } = req.body;
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
    const subscription = await Subscription.findById(req.params.id);
    if (subscription) {
      subscription.subscriptionname = subscriptionname
        ? subscriptionname
        : subscription.subscriptionname;
      subscription.subscriptionprice = subscriptionprice
        ? subscriptionprice
        : subscription.subscriptionprice;
      subscription.subscriptiontype = subscriptiontype
        ? subscriptiontype
        : subscription.subscriptiontype;
      subscription.subscriptionduration = subscriptionduration
        ? subscriptionduration
        : subscription.subscriptionduration;
    }
    if (subscriptiontype === "MONTHLY") {
      subscription.expiryDate = moment(subscription.createdAt).add(
        subscriptionduration,
        "M"
      );
    } else if (subscriptiontype === "YEARLY") {
      subscription.expiryDate = moment(subscription.createdAt).add(
        subscriptionduration,
        "Y"
      );
    }
    await subscription.save();
    return res
      .status(200)
      .json({ msg: "Subscription Updated Successfully", subscription });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
};
exports.toggleStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    console.log("subscription", subscription);
    subscription.status = subscription.status == true ? false : true;
    await subscription.save();
    console.log("Subscription", subscription);
    res.status(200).json({
      msg: subscription.status
        ? "Subscriptiom Activated"
        : "Subscriptiom Deactivated",
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
};
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndRemove(req.params.id);
    if (!subscription) {
      res.status(200).json({ msg: "No Subscription Found" });
    }
    res.status(200).json({ msg: "Subscription was successfully deleted" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
};
exports.getAllSubscriptions = async (req, res) => {
  const { page, limit, fieldname, order, from, to, keyword, selection } =
    req.query;
  const currentpage = page ? parseInt(page, 10) : 1;
  const per_page = limit ? parseInt(limit, 10) : 5;
  const CurrentField = fieldname ? fieldname : "createdAt";
  const currentOrder = order ? parseInt(order, 10) : -1;
  let offset = (currentpage - 1) * per_page;
  const sort = {};
  sort[CurrentField] = currentOrder;
  // return res.json(sort)

  let Datefilter = "";
  if (from && to) {
    Datefilter =
      from && to
        ? {
            createdAt: {
              $gte: moment(from).startOf("day").toDate(),
              $lte: moment(to).endOf("day").toDate(),
            },
          }
        : {};
    console.log("fromto", Datefilter);
  } else if (from) {
    console.log("from");
    Datefilter = from
      ? {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(new Date()).endOf("day").toDate(),
          },
        }
      : {};
    console.log("from", Datefilter);
  } else if (to) {
    console.log.apply("to");
    Datefilter = to
      ? { createdAt: { $lte: moment(to).endOf("day").toDate() } }
      : {};
    console.log("to", Datefilter);
  }
  const search = keyword
    ? {
        $or: [
          { subscriptionname: { $regex: `${keyword}`, $options: "i" } },
          // { lastname: { $regex: `${keyword}`, $options: "i" } },
          // { phone_no: { $regex: `${keyword}`, $options: "i" } },

          // { email: { $regex: `${keyword}`, $options: "i" } },
          // { subject: { $regex: `${keyword}`, $options: "i" } },
          // { message: { $regex: `${keyword}`, $options: "i" } },
        ],
      }
    : {};

  const Selectionfilter = selection ? { status: selection } : {};

  try {
    const subscriptions = await Subscription.paginate(
      {
        ...search,
        ...Datefilter,
        ...Selectionfilter,
      },
      {
        page: currentpage,
        limit: per_page,
        lean: true,
        sort: "-_id",
      }
    );
    let _subscriptions = subscriptions.docs.map((subscription) => {
      return {
        ...subscription,
        name:subscription.subscriptionname,
        price:subscription.subscriptionprice,
        type:subscription.subscriptiontype,
        duration:subscription.subscriptionduration,
      };
    });
    
    res.status(200).json({_subscriptions});
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
};
exports.updateSubscriptionPlan =  async(req,res)=>{
  try{
    const { id, cardHolderName, cardNumber,cvv,expiry_date } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let subscriptionData = await Subscription.findOne({ _id: id });
    console.log("subscriptionData", subscriptionData);
    if (!subscriptionData) {
      throw new Error("Subscription doesnot Exist");
    }
    if (subscriptionData.is_paid) {
      return res.status(400).json({ message: "Subscription Already Paid" });
    }
    let charge = "";
    let m = expiry_date.split("/");
    let token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: m[0],
        exp_year: m[1],
        cvc: cvv,
      },
    });
    console.log(1234)
    if (token.error) {
      // throw new Error (token.error);
      return res.status(400).json({ message: token.error });
    }
    console.log(1234)
    charge = await stripe.charges.create({
      amount: subscriptionData.subscriptionprice * 100,
      description: "Truth Out  ",
      currency: "usd",
      source: token.id,
    });
    console.log("Charges", charge);
    let paymentLog = new Payment({
      subscription: id,
      charge_id: charge.id ? charge.id : null,
      amount: subscriptionData.subscriptionprice,
      user: req.user._id ? req.user._id : null,
      status: charge.id ? "paid" : "unpaid",
    });
    await paymentLog.save();
    const user = await User.findById(req.user._id)
    user.subscriptionid = id
    await user.save()
    subscriptionData.is_paid = true;
    await subscriptionData.save();
    res.status(200).json({
      message: "Payment Successfully Paid",
      subscription: subscriptionData,
    });

  }catch(err){
    res.status(500).send({msg:"server error"})
  }
  
}