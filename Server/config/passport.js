// Server/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const LocalStrategy = require('passport-local').Strategy;


// Google Strategy


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/users/auth/google/callback`, // Backend callback URL
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await prisma.user.findFirst({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              username: profile.displayName,
              auth_provider: 'google',
              auth_provider_id: profile.id,
              profile_picture: profile.photos[0].value,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Error in GoogleStrategy:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize and deserialize user for session handling
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.FRONTEND_URL}/users/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'picture'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: `${profile.name.givenName} ${profile.name.familyName}`,
              auth_provider: 'facebook',
              auth_provider_id: profile.id,
              profile_picture: profile.photos[0].value,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Facebook Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: 'email' }, // Adjust fields based on your schema
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) {
          return done(null, false, { message: 'Incorrect credentials.' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;