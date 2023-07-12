const Payment = require("../models/Payment");
const paymentModel = require("../models/Payment")
const Subscription = require("../models/Subscription");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const moment = require("moment")

exports.SubscriptionPayment = async (req, res) => {
  try {
    const { subscription, payment_type, card_number, card_expiry, card_cvv } =
      req.body;
    let subscriptionData = await Subscription.findOne({ _id: subscription });
    console.log("subscriptionData", subscriptionData);
    if (!subscriptionData) {
      throw new Error("Subscription doesnot Exist");
    }
    if (subscriptionData.is_paid) {
      return res.status(400).json({ message: "Subscription Already Paid" });
    }
    let charge = "";
    let m = card_expiry.split("/");
    let cardNumber = card_number;
    let token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: m[0],
        exp_year: m[1],
        cvc: card_cvv,
      },
    });
    if (token.error) {
      // throw new Error (token.error);
      return res.status(400).json({ message: token.error });
    }
    charge = await stripe.charges.create({
      amount: subscriptionData.subscriptionprice * 100,
      description: "Truth Out  ",
      currency: "usd",
      source: token.id,
    });
    console.log("Charges", charge);
    let paymentLog = new Payment({
      subscription: subscription,
      charge_id: charge.id ? charge.id : null,
      amount: subscriptionData.subscriptionprice,
      user: req.user._id ? req.user._id : null,
      type: payment_type,
      status: charge.id ? "paid" : "unpaid",
    });
    await paymentLog.save();
    subscriptionData.is_paid = true;
    await subscriptionData.save();
    res.status(200).json({
      message: "Payment Successfully Paid",
      subscription: subscriptionData,
    });
  } catch (err) {
    res.status(500).send({
      message: err.toString(),
    });
  }
};

//for admin side
exports.GET_ALL_PAYMENT_LOGS = async (req, res) => {
  try {
    const { page, limit, fieldname, order, keyword, selection, from, to } =
      req.query;
    const currentpage = page ? parseInt(page, 10) : 1;
    const per_page = limit ? parseInt(limit, 10) : 5;
    const CurrentField = fieldname ? fieldname : "createdAt";
    const currentOrder = order ? parseInt(order, 10) : -1;
    const sort = {};
    sort[CurrentField] = currentOrder;
    const searchParam = keyword
      ? {
          $or: [{ name: { $regex: `${keyword}`, $options: "i" } }],
        }
      : {};
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
    }
    const payments = await paymentModel.paginate(
      {
        ...searchParam,
        ...Datefilter,
      },
      {
        page: currentpage,
        limit: per_page,
        lean: true,
        sort: "-_id",
        populate:[{ path: "user", select: ["fullName","email"] },{ path: "subscription", select: "subscriptiontype" },]
      }
    );

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

//for individual user
exports.GET_MY_PAYMENTS = async (req, res) => {
  try {
    const { page, limit, fieldname, order, keyword, selection, from, to } =
      req.query;
    const currentpage = page ? parseInt(page, 10) : 1;
    const per_page = limit ? parseInt(limit, 10) : "";
    const CurrentField = fieldname ? fieldname : "createdAt";
    const currentOrder = order ? parseInt(order, 10) : -1;
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] = currentOrder;

    const searchParam = keyword
      ? {
          $or: [{ name: { $regex: `${keyword}`, $options: "i" } }],
        }
      : {};

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
    }
    const payments = await paymentModel.paginate(
      {
        user: req.user._id,
        ...searchParam,
        ...Datefilter,
      },
      {
        ...currentpage,
        ...per_page,
        lean: true,
        sort: "-_id",
      }
    );

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.GET_PAYMENT_DETAIL_BY_ID = async (req, res) => {
  let payment_id = req.params.payment_id;
  try {
    const payment = await paymentModel.findOne({
      _id: payment_id,
    });

    if (!payment)
      return res.status(400).json({ message: "payment Detail not found" });

    return res.json(payment);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
