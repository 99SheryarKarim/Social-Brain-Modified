const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/databaseModels");

const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findByEmail(email);
        const isNewUser = !user;

        if (!user) {
          const randomPassword = Math.random().toString(36).slice(-10);
          user = await User.create(email, randomPassword);
          // Send welcome email to new Google users
          sendWelcomeEmail(email).catch(console.error);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
