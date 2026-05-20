const sendEmail = require("../utils/sendEmail");

exports.registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // MAIL TRIGGER: Jab user register ho jaye
    await sendEmail(
      user.email, 
      "Registration Successful!", 
      `Welcome ${user.name}, your account as ${user.role} has been created.`
    );

    res.status(201).json({ message: "User registered and email sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};