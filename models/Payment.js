const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const payment = new mongoose.Schema({
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  charge_id: {
    type: String,
  },
  payload: {},
  amount: {
    type: Number,
  },
  status: {
    type: String,
  },
  type: {
    type: String,
  },
  method: {
    type: String,
  },
  is_expired: {
    type: String,
    default: false,
  },
});
payment.plugin(mongoosePaginate);
payment.plugin(aggregatePaginate);

payment.set("timestamps", true);

payment.pre(/^find/, function (next) {
  this.populate({
    path: "booking",
    populate: {
      path: "user",
    },
  });
  next();
});
module.exports = Payment = mongoose.model("Payment", payment);
