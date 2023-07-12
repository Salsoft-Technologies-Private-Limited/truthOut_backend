const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const SubscriptionSchema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subscriptionname: { type: String, required: true },
    subscriptiontype: { type: String, required: true },
    subscriptionprice: { type: Number, required: true },
    description: { type: String },
    subscriptionduration: { type: Number, required: true },
    expiryDate: {
      type: Date,
    },
    is_paid: {
      type: Boolean,
      default: false,
    },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.plugin(mongoosePaginate);

module.exports = Subscription = mongoose.model(
  "Subscription",
  SubscriptionSchema
);
