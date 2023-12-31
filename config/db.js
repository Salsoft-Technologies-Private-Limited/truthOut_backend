const mongoose = require("mongoose");
const config = require("config");
const db = config.get("MongoURI");
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://dev74.onlinetestingserver.com:27017/truthout", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("mongo db Connected");
  } catch (error) {
    console.error(error.message);
    // exit process with failure
    process.exit(1);
  }
};
module.exports = connectDB;
