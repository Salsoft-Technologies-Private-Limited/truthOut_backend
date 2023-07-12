const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const Schema = mongoose.Schema;
const validator = require("validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const slugify = require("slugify");
const {getAllAdvertismentPreference} = require("./helper")

const locationSchema = new mongoose.Schema({
  type: {
    type: String, // Don't do `{ location: { type: String } }`
    enum: ["Point"], // 'location.type' must be 'Point'
  },
  coordinates: {
    type: [Number],
    index: "2dsphere",
  },
});
const educationSchema = new mongoose.Schema({
  school:String,
  degree_level:{type:String  },
  location:locationSchema
})
const UserSchema = new mongoose.Schema(
  {
    blockedUser:{
      type:[mongoose.Schema.Types.ObjectId],
      ref:"user",
      default:[]
    },
    image: {
      type: String,
    },
    fullName: {
      type: String,
      // lowercase: true,
      required: [true, "FullName is required"],
    },
    relationship_status:String,
    firstname: {
      type: String,
      lowercase: true,
      // required: [true, "Firstname is required"],
    },
    slug: String,
    fullname: String,
    lastname: {
      type: String,
      lowercase: true,
      // required: [true, "Lastname is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provied a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provied a password"],
      minlength: 8,
    },
    bio: {
      type: String,
      default: null,
    },
    resetCode: { type: Number, default: "" },
    isActive: {
      type: Boolean,
      default: true,
    },
    city: {
      type: String,
      default: null,
    },
    subscriptionid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    country: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    zip_code: {
      type: String,
      default: null,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
    followerCount: {
      type: Number,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    phone_no: {
      type: String,
      default: null,
    },
    cardholdername: {
      type: String,
      default: null,
    },
    cardnumber: {
      type: String,
      default: null,
    },
    cvv: {
      type: String,
      default: null,
    },
    expirydate: {
      type: String,
      default: null,
    },
    subscriptionExpiryDate: {
      type: String,
      default: null,
    },
    location: {
      type: locationSchema,
    },

    country: {
      type: String,
      default: null,
    },

    date_of_birth: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    appleId: {
      type: String,
      default: null,
    },
    status: {
      type: Number,
      default: 0,
      enum: [0, 1, 2],
    },
    gender:{
      type: String,
      enum: ["M", "F", "O"],
    },
    education:[educationSchema],
    soa_id: String,
    soa_token: String,

    stripe_customer: String,
    verification_expiration:{
      type:Date,
      default:null,
    },
    is_verified:{
      type:Boolean,
      default:false
    },
    verification_package:{
      type: mongoose.Schema.Types.ObjectId, ref: "Verification-Package"
    },
    advertismentPreference:[{
      type:mongoose.Schema.Types.ObjectId,
      ref: "Ads-Preference",
      // default:async function(){
      //   const preference = await getAllAdvertismentPreference()
      //   console.log(">>>>>>>",preference)
      //   return preference
      // }
    }]
  },

  {
    timestamps: true,
    emitIndexErrors: true,
    autoIndex: false,
    autoCreate: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
UserSchema.plugin(mongoosePaginate);
UserSchema.pre("save", function (next) {
  this.slug = slugify(this.firstname + " " + this.lastname, { lower: true });
  next();
});
UserSchema.pre("save", async function (next) {
  if (this.advertismentPreference.length == 0) {
  const {getAllAdvertismentPreference} = require("./helper")
  this.advertismentPreference = await getAllAdvertismentPreference();
  console.log(">>>>>>>>>>>>>>>", await getAllAdvertismentPreference())
  next();
  }
});

UserSchema.post(/^find/, async function (doc) {
  if (doc?.advertisementPreference?.length == 0) {
      doc.advertisementPreference = await getAllAdvertismentPreference() || [];
      await doc.save();
  }
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      isActive: this.isActive,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

module.exports = User = mongoose.model("user", UserSchema);
