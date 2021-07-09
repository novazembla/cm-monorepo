import passport from "passport";
import { JwtStrategy, ExtractJwt } from "passport-jwt";

import { tokenTypes } from "../services/authentication";

const userService = require("../dao/user");

const jwtOptions = {
  secretOrKey: process.env.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error("Invalid token type");
    }
    const user = await userService.getUserById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};

export const passportMiddleware = passport.initialize();

export default {
  passportMiddleware,
};
