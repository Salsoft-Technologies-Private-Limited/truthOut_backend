const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    let extension = file.originalname;
    console.log("extension", extension);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log("uniqueSuffix", uniqueSuffix);
    cb(null, uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("file", file);
  if (file.fieldname == "user_image" || file.fieldname == "emoji_image" || file.fieldname == "video_files" || file.fieldname == "post_pics" || file.fieldname ==="ad_image") {
    console.log("block1");
    if (
      file.mimetype.includes("image/jpeg") ||
      file.mimetype.includes("image/png") ||
      file.mimetype.includes("video/") ||
      file.mimetype.includes("application/pdf")
    ) {
      console.log("block2");
      cb(null, true);
    } else {
      cb(null, false);
    }
  } else {
    cb(null, false);
  }
};
module.exports = {
  fileFilter,
  fileStorage,
};
