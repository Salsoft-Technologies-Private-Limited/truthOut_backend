const AdsPreference = require("../models/AdsPreference")
const User = require("../models/User")
const { validationResult } = require("express-validator")
const moment = require("moment")

exports.createPreference = async (req, res) => {
  try {
    const errors = validationResult(req)
    console.log(errors)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { PreferenceName, active } = req.body

    if (await AdsPreference.findOne({ PreferenceName: PreferenceName.toLowerCase() })) {
      return res.status(400).json({ error: "This Preference alredy Exists" });
    }

    const adsPreference = await AdsPreference({
      PreferenceName: PreferenceName.toLowerCase(),
      Active: active
    })

    await adsPreference.save()
    res.status(200).json({
      adsPreference
    })
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.listPreferenceForUser = async (req, res) => {
  try {
    const adsPreference = await AdsPreference.find({ Active: true })
    res.status(200).send(adsPreference)
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.inActivate_Activate_Preference = async (req, res) => {
  try {
    const error = validationResult(req)
    if (!error.isEmpty())
      return res.status(400).json({ errors: error.array() });

    const adsPreference = await AdsPreference.findById(req.body.id)
    adsPreference.Active = !adsPreference.Active
    await adsPreference.save()

    res.status(200).send({ message: adsPreference.Active ? "Ad Preference is now Active" : "Ad Preference is now inActive" })
  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}

exports.listPreferenceForAdmin = async (req, res) => {
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
        $or: [{ PreferenceName: { $regex: `${keyword}`, $options: "i" } },
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
    const adsPreference = await AdsPreference.paginate(
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

    res.status(200).json(adsPreference);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
}

exports.listMyPreference = async (req, res) => {
  try {
    let userId = req.user._id

    let user = await User.findById(userId).populate("advertismentPreference")

    if(!user){
 return res.status(400).send({error:"User not found"})
    }
      

    res.status(200).send({prefrences:user.advertismentPreference,status:true })


  } catch (error) {
    res.status(500).send({
      error: error
    })
  }
}


exports.updateMyPrefrences = async (req, res) => {
  try {
    let userId = req.user._id
    let { prefrences } = req.body

    if(!prefrences || prefrences.length == 0){
      return res.status(400).send({ error: "Please select atleast one preference" })
    }

    let user = await User.findById(userId)

    if (!user) {
      return res.status(400).send({ error: "User not found" })
    }

    user.advertismentPreference = prefrences;

    await user.save()
    
    res.status(200).send({ message:"prefrence updated Successfully", status: true })
  }
  catch (error) {
    res.status(500).send({
      error: error
    })
  }
}
