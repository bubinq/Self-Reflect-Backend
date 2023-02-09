const passport = require("passport");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

const baseUrl = "http://localhost:5173/";

router.post("/register", async (req, res) => {
  const { email, repass } = req.body;
  let pass = req.body.password;
  try {
    if (pass !== repass) {
      throw new Error("Passwords must match!");
    }
    if (pass.length < 8 || pass.length > 24) {
      throw new Error("Use a more secure password.");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(pass, salt);
    const user = new User({
      email: email,
      password: hashedPass,
    });

    const savedUser = await user.save();

    const { password, ...details } = savedUser._doc;

    const token = jwt.sign(savedUser.id, process.env.JWT_KEY);

    res.cookie("accessToken", token, { httpOnly: true });
    res.status(201).json(details);
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

router.post("/local/login", async (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  try {
    const searchedUser = await User.findOne({ email: email });

    if (!searchedUser) {
      throw new Error("E-mail or Password is invalid!");
    }

    const isMatching = await bcrypt.compare(pass, searchedUser.password);

    if (!isMatching) {
      throw new Error("E-mail or Password is invalid!");
    }

    const token = jwt.sign(searchedUser.id, process.env.JWT_KEY);
    const { password, ...details } = searchedUser._doc;

    req.session = null;
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(201).json(details);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  }
});

router.get("/logout", (req, res) => {
  try {
    req.logOut();
    res.cookie("accessToken", "none", {
      expires: new Date(Date.now() + 3 * 1000),
      httpOnly: true,
    });
    res.status(200).redirect(baseUrl);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
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
