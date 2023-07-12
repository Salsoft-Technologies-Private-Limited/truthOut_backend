const Reset = require("../models/Reset");
const bcrypt = require("bcryptjs");
const Verify = require("../models/Verify");
//const User = require("../models/User");
// const { LoginUserSOA } = require("../service/soaChat");

// exports.loginSOASystem = async (id) => {
//   const user = await User.findById(id);
//   const { token, id: soa_id } = await LoginUserSOA(user._id);
//   user.soa_id = soa_id;
//   user.soa_token = token;
//   await user.save();
// };
exports.createResetToken = async (email, code) => {
  const token = await Reset.findOne({ email });
  if (token) await token.remove();
  const newToken = new Reset({
    email,
    code,
  });
  await newToken.save();
};
exports.createVerifyToken = async (email, code) => {
  const token = await Verify.findOne({ email });
  if (token) await token.remove();
  const newToken = new Verify({
    email,
    code,
  });
  console.log('newToken',newToken)
  await newToken.save();
};

exports.validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  if (re.test(email)) return email.toLowerCase();
  else return false;
};

exports.generateCode = () => Math.floor(1000 + Math.random() * 9000);

exports.validateCode = async (code, email) =>
  await Reset.findOne({ code, email });

exports.comparePassword = (password, confirm_password) =>
  password === confirm_password;

exports.verifyPassword = async (password_to_comapre, password_base) =>
  await bcrypt.compare(password_to_comapre, password_base);

exports.generateHash = async (string) => await bcrypt.hash(string, 12);
