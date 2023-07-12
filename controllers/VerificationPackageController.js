const VerificationPackage = require("../models/VerificationPackage")
const { validationResult, body } = require("express-validator")
const moment = require("moment")

exports.createVerificationPackage = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { title, amount, type, description } = req.body

    if (await VerificationPackage.findOne({ title: title.toLowerCase() })) {
      return res.status(400).json({ error: "This title alredy Exists" });
    }

    const verificationPackage = await VerificationPackage({
      title: title.toLowerCase(),
      amount,
      Type:type,
      description
    })

    await verificationPackage.save()
    res.status(200).json({
      verificationPackage
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

    const verificationPackage = await VerificationPackage.findById(req.body.id)
    res.status(200).send(verificationPackage)
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

    const verificationPackage = await VerificationPackage.findById(req.body.id)
    verificationPackage.title = req.body.title ?? verificationPackage.title
    verificationPackage.amount = req.body.amount ?? verificationPackage.amount
    verificationPackage.Type = req.body.type ?? verificationPackage.Type
    verificationPackage.description = req.body.description ?? verificationPackage.description

    await verificationPackage.save()
    res.status(200).json({
      verificationPackage
    })
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.listPackageForUser = async (req, res) => {
  try {
    const verificationPackage = await VerificationPackage.find({ Active: true })
    res.status(200).send(verificationPackage)
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
    const verificationPackage = await VerificationPackage.paginate(
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

    res.status(200).json(verificationPackage);
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

    const verificationPackage = await VerificationPackage.findById(req.body.id)
    verificationPackage.Active = !verificationPackage.Active
    await verificationPackage.save()

    res.status(200).send({ message: verificationPackage.Active ? "Ad Package is now Active" : "Ad Package is now inActive" })
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}


exports.verificationPackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, amount_1, amount_2, followers, Active } = req.body;

    // Check if a verification package already exists
    const existingPackage = await VerificationPackage.findOne();
    if (existingPackage) {
      // Update the existing verification package
      existingPackage.title = title;
      existingPackage.amount_1 = amount_1;
      existingPackage.amount_2 = amount_2;
      existingPackage.followers = followers;
      existingPackage.Active = Active;
      await existingPackage.save();
      return res.status(200).json({ verificationPackage: existingPackage });
    }

    // Create a new verification package
    const verificationPackage = new VerificationPackage({
      title,
      amount_1,
      amount_2,
      followers,
      Active,
    });

    await verificationPackage.save();
    res.status(200).json({ verificationPackage });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};