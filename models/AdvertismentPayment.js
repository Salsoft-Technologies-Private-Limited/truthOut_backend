const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Advertisment_payments = new mongoose.Schema({
  Advertisment_package_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ads-Package",
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
Advertisment_payments.plugin(mongoosePaginate);
Advertisment_payments.plugin(aggregatePaginate);

Advertisment_payments.set("timestamps", true);

module.exports = mongoose.model("Advertisment-payments", Advertisment_payments);
