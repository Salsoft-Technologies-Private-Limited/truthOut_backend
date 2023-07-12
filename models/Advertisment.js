const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const {DeleteFile} = require("../helpers/helper")

const AdvertismentSchema = mongoose.Schema({
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    title: {
      type: String,
      required: true,
    },
    preference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ads-Preference",
      default: null,
    },
    Active: {
      type: Boolean,
      default: true,
    },
    images: {
      type: String,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ads-Package",
      required: true,
    },
    expiration: {
      type: Date,
    },
  });
  
  // Add TTL index on the expiration field
  AdvertismentSchema.index({ expiration: 1 }, { expireAfterSeconds: 0 });
  
  // Set the default value for the Active field based on the expiration date
  AdvertismentSchema.path("Active").default(function () {
    console.log(this.expiration)

    setTimeout(() => {
      DeleteFile([this.images]);
    }, this.expiration.getTime() - Date.now());

    return Date.now() < this.expiration;
  });
AdvertismentSchema.set("timestamps", true);
AdvertismentSchema.plugin(mongoosePaginate);
AdvertismentSchema.plugin(aggregatePaginate);
module.exports = Advertisment = mongoose.model("Advertisment", AdvertismentSchema);
