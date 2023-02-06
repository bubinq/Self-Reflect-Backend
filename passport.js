const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const passport = require("passport");
const User = require("./models/user.js");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      const user = await User.findOne({ googleId: profile.id });
      if (user) {
        return cb(null, user);
      } else {
        const newUser = await User.create({
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          googleId: profile.id,
          displayName: profile.displayName,
        });
        const savedUser = await newUser.save();
        cb(null, savedUser);
      }
    }
  )
);

passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
      },
      async function (accessToken, refreshToken, profile, cb) {
        const user = await User.findOne({ githubId: profile.id });
        if (user) {
          return cb(null, user);
        } else {
          const newUser = await User.create({
            username: profile.username,
            profilePicture: profile.photos[0].value,
            githubId: profile.id,
            displayName: profile.displayName,
          });
          const savedUser = await newUser.save();
          cb(null, savedUser);
        }
      }
    )
  );

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({ _id: id });
  if (user) {
    done(null, user);
  }
});
