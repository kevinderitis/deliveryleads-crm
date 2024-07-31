import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getClientByEmail, createNewClient } from '../dao/clientDAO.js';
import config from './config.js';

passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, done) {
    let email = profile.emails[0].value;
    let name = profile.displayName;
    try {
      let user = await getClientByEmail(email);

      if (!user) {
        let newUser = await createNewClient(name, email);
        console.log('Nuevo usuario creado:', newUser);
        return done(null, newUser);
      } else {
        return done(null, user);
      }
    } catch (err) {
      return done(err);
    }
  }
));


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

export default passport;