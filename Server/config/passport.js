// Server/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/users/auth/google/callback",
      profileFields: ['id', 'emails', 'name', 'picture']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: profile.emails[0].value },
              { auth_provider_id: profile.id }
            ]
          }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: profile.displayName,
              auth_provider: 'google',
              auth_provider_id: profile.id,
              profile_picture: profile.photos[0].value
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/users/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'picture']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: profile.emails[0].value },
              { auth_provider_id: profile.id }
            ]
          }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: `${profile.name.givenName} ${profile.name.familyName}`,
              auth_provider: 'facebook',
              auth_provider_id: profile.id,
              profile_picture: profile.photos[0].value
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;