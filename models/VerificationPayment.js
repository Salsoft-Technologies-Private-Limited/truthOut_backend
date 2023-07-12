const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Verification_payments = new mongoose.Schema({
  Verification_id: { // this is verification package ID
    type: mongoose.Schema.Types.ObjectId,
    ref: "Verification-Package",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  charge_id: {
    type: String,
  },

  amount: {
    type: Number,
  },

});
Verification_payments.plugin(mongoosePaginate);
Verification_payments.plugin(aggregatePaginate);

Verification_payments.set("timestamps", true);

module.exports = mongoose.model("Verification-payments", Verification_payments);
