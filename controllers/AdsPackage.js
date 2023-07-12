const AdsPackage = require("../models/AdsPackage")
const { validationResult, body } = require("express-validator")
const moment = require("moment")

exports.createAdsPackage = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { title, amount, days, description } = req.body

    if (await AdsPackage.findOne({ title: title.toLowerCase() })) {
      return res.status(400).json({ error: "This title alredy Exists" });
    }

    const adsPackage = await AdsPackage({
      title: title.toLowerCase(),
      amount,
      days,
      description,
      Active: true
    })

    await adsPackage.save()
    res.status(200).json({
      adsPackage
    })
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.ViewPost = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const adsPackage = await AdsPackage.findById(req.body.id)
    res.status(200).send(adsPackage)
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.editPackage = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const adsPackage = await AdsPackage.findById(req.body.id)
    adsPackage.title = req.body.title ?? adsPackage.title
    adsPackage.amount = req.body.amount ?? adsPackage.amount
    adsPackage.days = req.body.days ?? adsPackage.days
    adsPackage.description = req.body.description ?? adsPackage.description

    await adsPackage.save()
    res.status(200).json({
      adsPackage
    })
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.listPackageForUser = async (req, res) => {
  try {
    const adsPackage = await AdsPackage.find({ Active: true })
    res.status(200).send(adsPackage)
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.listPackageForAdmin = async (req, res) => {
  try {
    const { page, limit, fieldname, order, keyword, selection, from, to } =
      req.query;
    const currentpage = page ? parseInt(page, 10) : 1;
    const per_page = limit ? parseInt(limit, 10) : 5;
    const CurrentField = fieldname ? fieldname : "createdAt";
    const currentOrder = order ? parseInt(order, 10) : -1;
    const sort = {};
    sort[CurrentField] = currentOrder;
    const searchParam = keyword
      ? {
        $or: [{ title: { $regex: `${keyword}`, $options: "i" } },
        ]
      }
      : {};
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
    const adsPackage = await AdsPackage.paginate(
      {
        ...searchParam,
        ...Datefilter,
      },
      {
        page: currentpage,
        limit: per_page,
        lean: true,
        sort: "-_id",
      }
    );

    res.status(200).json(adsPackage);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
}

exports.inActivate_Activate_Package = async (req, res) => {
  try {
    const error = validationResult(req)
    if (!error.isEmpty())
      return res.status(400).json({ errors: error.array() });

    const adsPackage = await AdsPackage.findById(req.body.id)
    adsPackage.Active = !adsPackage.Active
    await adsPackage.save()

    res.status(200).send({ message: adsPackage.Active ? "Ad Package is now Active" : "Ad Package is now inActive" })
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}