const passport = require("passport");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

const baseUrl = "http://localhost:5173";

router.post("/login/local", passport.authenticate("local"), (req, res) => {
  res.status(200).json(req.user);
});

router.post("/register/local", async (req, res) => {
  const { email, password, repass } = req.body;
  try {
    if (password !== repass) {
      throw new Error("Passwords must match!");
    }
    if (password.length < 8 || password.length > 24) {
      throw new Error("Use a more secure password.");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const user = new User({
      email: email,
      password: hashedPass,
    });
    const savedUser = await user.save();

    req.login(savedUser);
    // res.status(200).json(savedUser);
  } catch (error) {
    if (error.code === 11000) {
      const keyVal = error.keyValue;
      res.status(400).json({
        message: `${
          keyVal.hasOwnProperty("email") ? "E-mail" : "Name"
        } is already taken!`,
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  }
});

router.get("/logout", (req, res) => {
  console.log("User", req.user);
  console.log("Session", req.session);
  req.logOut();
  res.redirect(baseUrl);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: baseUrl,
    failureRedirect: baseUrl,
  })
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["email", "profile"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: baseUrl,
    failureRedirect: baseUrl,
  })
);

module.exports = router;
