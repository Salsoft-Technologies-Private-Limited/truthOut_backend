const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
//models
const User = require("../models/User");
const Session = require("../models/Session");
//services
//const { sendEmail } = require("../service/mail");
//const { SendPushNotification } = require("../utils/Notification");
const UserModel = require("../models/User");
//const FriendsModel = require("../models/Friends");
const {
  createResetToken,
  validateEmail,
  generateCode,
  validateCode,
  comparePassword,
  verifyPassword,
  generateHash,
} = require("../queries/index");
const { generateEmail } = require("../service/mail");
exports.AdminLogin = async (req, res) => {
  console.log(req.body);
  try {
    let { email, password } = req.body;
    console.log("boddy", req.body);
    email = email.toLowerCase();
    //see if user exists
    const user = await UserModel.findOne({ email, role: "ADMIN" });
    console.log("Userfound", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const validpassword = await bcrypt.compare(password, user.password);
    if (!validpassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = user.generateAuthToken();

    const session = new Session({
      token: token,
      user: user.id,
      status: true,
      deviceId: req.body.deviceId,
      deviceType: req.body.deviceType,
    });
    await session.save();
    const notification2 = {
      notifiableId: user._id,
      notificationType: "Login Successful",
      title: `you are Successfully logged in `,
      body: `you are Successfully logged in`,
      payload: {
        type: "user",
        id: user._id,
      },
    };
    //let resp1 = await SendPushNotification(notification2);
    res.status(200).json({
      message: "Log in Successfull",
      token: token,
      user: user,
      //resp1: resp1,
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }

  //return json webtoken
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { email, password, role } = req.body;
    email = email.toLowerCase();
    //see if user exists
    const user = await UserModel.findOne({ email, role })
                  .populate("following", "fullName image _id")
                  .populate("followers", "fullName image _id")
                  .populate("subscriptionid");
    console.log("user", user);
    if (!user) {
      return res.status(400).json({ message: "User Doesnot Exist" });
    }

    if(user.status===2 && !user.isActive ) return res.status(400).json({ message: "User is inActive" });
    const validpassword = await bcrypt.compare(password, user.password);
    if (!validpassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    // if (role === "SERVICE_PROVIDER" && !user.status) {
    //   return res
    //     .status(400)
    //     .json({ message: "Cant Login Profile is not appproved yet" });
    // }
    const token = user.generateAuthToken();
    console.log('tokjen',token)
    const session = new Session({
      token: token,
      user: user.id,
      status: true,
      deviceId: req.body.deviceId,
      deviceType: req.body.deviceType,
    });
    await session.save();

    // const notification2 = {
    //   notifiableId: user._id,
    //   notificationType: "Login Successful",
    //   title: `you are Successfully logged in `,
    //   body: `you are Successfully logged in`,
    //   payload: {
    //     type: "user",
    //     id: user._id,
    //   },
    // };

    //let resp1 = await SendPushNotification(notification2);

    res.status(200).json({
      message: "Profile is Approved Log in Successfull",
      token,
      user
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.ChangePassword = async (req, res) => {
  let error = [];

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw errors.array()[0].msg;
  }
  try {
    const { currentpassword, newpassword, confirmpassword } = req.body;

    //see if user exists
    let user = await User.findOne({ _id: req.user._id });
    //   console.log(user)
    if (!user) {
      return res.status(400).json({ message: "user doesnot exist" });
    }
    //if password matches
    const validpassword = await bcrypt.compare(currentpassword, user.password);
    if (!validpassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    //if currrent password and new password matches
    if (currentpassword === newpassword) {
      return res.status(400).json({
        message: "please type new password which is not used earlier",
      });
    }
    //if password and confirm password matches
    if (newpassword !== confirmpassword) {
      return res
        .status(400)
        .json({ message: "confirm password doesnot match" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    user.password = bcrypt.hashSync(newpassword, salt);
    user.fullName = user.fullName;

    await user.save();
    res.status(200).json({
      message: "password updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }

  //return json webtoken
};
exports.recoverPassword = async (req, res) => {
  try {
    const { email: _email } = req.body;
    const email = validateEmail(_email);
    if (!email)
      return res.status(400).json({ message: "Invalid Email Address" });
      const user = await UserModel.findOne({ email });
      if (!user) {
        console.log("!user");
        return res.status(401).json({
          message: "Email not found"
        });
      }
    const status = generateCode();
    console.log("Status code", status);
    await createResetToken(email, status);
    // const html = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.
    // \n\n Your verification status is ${status}:\n\n
    // \n\n Click here \n\n
    // \n\n If you did not request this, please ignore this email and your password will remain unchanged.
    // </p>`;
    const encoded = Buffer.from(
      JSON.stringify({ email, code: status }),
      "ascii"
    ).toString("base64");
    const html = `
                  <div>
                    <p>
                      You are receiving this because you (or someone else) have requested the reset of the
                      password for your account.
                    </p>
                    <p>Your verification status is ${status}</p>
                    <p>
                      <strong>
                        If you did not request this, please ignore this email and your password will remain
                        unchanged.
                      </strong>
                    </p>
                  </div>
      `;
    await generateEmail(email, "Truthout - Password Reset", html);
    return res.status(201).json({
      message:
        "Recovery status Has Been Emailed To Your Registered Email Address",
      encodedEmail: encoded,
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.verifyRecoverCode = async (req, res) => {
  try {
    const { code, email: _email } = req.body;
    const email = validateEmail(_email);
    if (!email)
      return res.status(400).json({ message: "Invalid Email Address" });
    const isValidCode = await validateCode(code, email);
    if (isValidCode) {
      return res.status(200).json({ message: "Recovery status Accepted" });
    } else return res.status(400).json({ message: "Invalid Recovery status" });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirm_password, code, email: _email } = req.body;
    const email = validateEmail(_email);
    if (!email)
      return res.status(400).json({ message: "Invalid Email Address" });
    if (!comparePassword(password, confirm_password))
      return res.status(400).json({ message: "Password Not Equal" });
    const reset_status = await validateCode(code, email);
    if (!reset_status)
      return res.status(400).json({ message: "Invalid Recovery status" });

    const user = await User.findOne({ email: email });
    const is_equal = await verifyPassword(password, user.password);
    if (is_equal)
      return res.status(400).json({
        message:
          "Sorry! your new password can not be the same as your password",
      });

    user.password = await generateHash(password);
    await user.save();
    await res.status(201).json({
      message: "Password Updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     User.findOne(
//       { email: req.body.email.toLowerCase() },
//       async function (err, user) {
//         if (err) {
//           return res.status(500).json({ message: err.toString() });
//         }
//         if (!user)
//           return res.status(400).json({ message: "Invalid credentials." });

//         let code = Math.floor(100000 + Math.random() * 900000);

//         let token = await Token.findOne({ email: user.email });
//         if (token) {
//           token.remove();
//         }

//         let newtoken = new Token({
//           email: user.email,
//           token: code,
//         });
//         newtoken.save(function (err) {
//           if (err) {
//             return res.status(500).json({ error: err.toString() });
//           }

//           // user.passwordResetToken = token.token;
//           // user.passwordResetExpires = moment().add(12, "hours");

//           user.resetCode = code;
//           // user.passwordResetExpires = moment().add(1, "hours");

//           user.save(async function (err) {
//             if (err) {
//               return res.status(500).json({ message: err.toString() });
//             }

//             let resp = await sendEmail(user.email, code);

//             return res.status(200).json({
//               message: "password recovery code successfully sent to email.",
//             });
//           });
//         });
//       }
//     );
//   } catch (err) {
//     res.status(500).json({
//       message: err.toString(),
//     });
//   }
// };
// exports.VerifyCode = (req, res) => {
//   let error = [];
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     console.log(errors);
//     throw errors.array()[0].msg;
//   }
//   try {
//     // Find a matching token
//     Token.findOne({ token: req.body.email }, function (err, token) {
//       console.log("token", token);
//       if (err) {
//         return res.status(500).json({ message: err.toString() });
//       }
//       if (!token) {
//         return res.status(500).json({
//           message: "This code is not valid. OR Your code may have expired.",
//         });
//       }

//       if (token) {
//         return res.status(200).json({
//           message: "Code verified successfully, please set your new password ",
//         });
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: err.toString(),
//     });
//   }
//   // Validate password Input
// };
// exports.ResetPassword = (req, res) => {
//   try {
//     const errors = validationResult(req);
//     const { newpassword, confirmpassword } = req.body;
//     if (!errors.isEmpty()) {
//       console.log(errors);
//       throw errors.array()[0].msg;
//     }
//     // Find a matching token
//     Token.findOne({ token: req.params.token }, async function (err, token) {
//       if (err) {
//         return res.status(500).json({ message: err.message });
//       }
//       if (!token)
//         return res.status(400).json({
//           message: "This code is not valid. OR Your code may have expired.",
//         });

//       //see if user exists
//       let user = await User.findOne({ email: token.email });
//       if (!user) {
//         return res.status(400).json({
//           message: "Invalid Credentials.",
//         });
//       }
//       //if currrent password and new password matches show  error
//       const validpassword = await bcrypt.compare(newpassword, user.password);
//       if (validpassword)
//         return res.status(400).json({
//           message: "please type new password which is not used earlier",
//         });

//       //if password and confirm password matches
//       if (newpassword !== confirmpassword) {
//         return res
//           .status(400)
//           .json({ message: "confirm password doesnot match" });
//       }

//       //hash password
//       const salt = await bcrypt.genSalt(10);
//       user.password = bcrypt.hashSync(newpassword, salt);

//       token.remove();

//       await user.save();
//       res.status(200).json({
//         message: "password updated Successfully",
//       });
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: err.toString(),
//     });
//   }
//   // Validate password Input
// };
exports.Logout = async (req, res) => {
  try {
    const sessions = await Session.findOne({ user: req.user._id });
    (sessions.token = null),
      (sessions.status = false),
      (sessions.deviceId = null);
    await sessions.save();
    return res.status(200).send({ message: "User logout Successfullly" });
  } catch (error) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.LoadUser = async (req, res) => {
  try {
    console.log(req.user);
    let user = await User.findOne({ _id: req.user._id }).lean();
    const admin = await User.findOne({ role: "ADMIN" }).lean();
    // console.log(admin)
    //soa login
    // const { token, id } = await LoginUserSOA(driver._id);
    // driver.soa_id = id;
    // driver.soa_token = token;
    // console.log("SoaTokenId", token, id);
    if (!user) {
      return res.status(400).json({ message: "User doesnot exist" });
    }
    user.adminId = admin._id;

    res.status(200).json(user);
  } catch (err) {
    // console.error(error.message)
    res.status(500).json({
      message: err.toString(),
    });
  }
};
