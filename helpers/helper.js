const path = require("path")
const fs = require("fs")

exports.ToCapitalCase = (string) => {
  let newString = string.toLowerCase();
  return newString.charAt(0).toUpperCase() + newString.slice(1);
};
exports.DeleteFile = (fileAddressArray)=>{
  fileAddressArray.map((fileAddress)=>{
    const filePath = path.join(__dirname, `../${fileAddress}`);

    // Use the fs.unlink() method to delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  })
}

exports.DeductPayment = async(card_expiry,card_number,card_cvv,amount,res)=>{
  const stripe = require("stripe")(process.env.STRIPE_KEY)

  let charge = "";
  let m = card_expiry.split("/");
  let cardNumber = card_number;
  let token = await stripe.tokens.create({
    card: {
      number: cardNumber,
      exp_month: m[0],
      exp_year: m[1],
      cvc: card_cvv,
    },
  });
  if (token.error) {
    // throw new Error (token.error);
    res.status(400).json({ message: token.error });
    return false
  }
  charge = await stripe.charges.create({
    amount: amount * 100,
    description: "Truth Out  ",
    currency: "usd",
    source: token.id,
  });

  return charge
}