const Emoji = require("../models/Emotion");
const moment = require("moment");
const { validationResult } = require("express-validator");
exports.CreateEmotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      throw errors.array()[0].msg;
    }
    let emoji_image =
      req.files &&
      req.files.emoji_image &&
      req.files.emoji_image[0] &&
      req.files.emoji_image[0].path;
    const { name } = req.body;
    let emoji = await Emoji.findOne({
      name: name.toLowerCase(),
    });
    if (emoji) {
      return res.status(400).json({ msg: "Emotion Already Exists" });
    }
    emoji = new Emoji({
      name: name.toLowerCase(),
      image: emoji_image,
    });
    await emoji.save();
    return res.status(200).json({
      message: "New Emoji Created SuccessFully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.getAllEmotions = async (req, res) => {
  try {
    const { page, limit, fieldname, order, keyword, selection, from, to } =
      req.query;
    const currentpage = page ? { page: parseInt(page, 10) } : {};
    const per_page = limit ? { limit: parseInt(limit, 10) } : {};
    const CurrentField = fieldname ? fieldname : "createdAt";
    const currentOrder = order ? parseInt(order, 10) : -1;
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] = currentOrder;

    // console.log(keyword);

    const search = keyword
      ? {
          $or: [
            { name: { $regex: `${keyword.toLowerCase()}`, $options: "i" } },
            { id: { $regex: `${keyword.toLowerCase()}`, $options: "i" } },
          ],
        }
      : {};

    const Selectionfilter = selection ? { status: selection } : {};

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

    const emotions = await Emoji.paginate(
      {
        ...search,
        ...Selectionfilter,
        ...Datefilter,
      },
      {
        ...currentpage,
        ...per_page,
        lean: true,
        sort: "-_id",
      }
    );

    await res.status(200).send(emotions);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.get_all_emotions = async (req, res) => {
  const {emoji_name}=req.query
  try {
    const emoji = await Emoji.find({"name" : {$regex : emoji_name}}).lean();
    await res.status(200).json({
      emoji,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: err.toString(),
    });
  }
};
