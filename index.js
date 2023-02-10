const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/auth.js");
const passport = require("passport");
const passportSetup = require("./passport.js");

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEYS],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Connected to DB");
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Cannot connect to MongoDB", err);
  });
