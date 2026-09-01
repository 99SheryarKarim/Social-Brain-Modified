require('dotenv').config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/databaseModels");

const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

if (googleClientId && googleClientSecret && googleCallbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
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
} else {
  console.warn("Google OAuth env vars are missing; skipping Passport Google strategy initialization.");
}

module.exports = passport;