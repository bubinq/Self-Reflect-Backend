const passport = require("passport");
const router = require("express").Router();

const baseUrl = "http://localhost:5173/";

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  }
});

router.get("/logout", (req, res) => {
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
