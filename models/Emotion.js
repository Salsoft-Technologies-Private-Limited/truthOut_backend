const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const emotionSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
});
emotionSchema.set("timestamps", true);
emotionSchema.plugin(mongoosePaginate);
module.exports = Emotion = mongoose.model("Emotion", emotionSchema);
