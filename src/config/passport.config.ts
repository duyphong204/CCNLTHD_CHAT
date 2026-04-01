import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { UnauthorizedException } from "../utils/app-error";
import { Env } from "./env.config";
import { container } from "../container/di-container";

const customCookieExtractor = (req: any) => {
  const token = req?.cookies?.accessToken;
  if (!token) {
    throw new UnauthorizedException("Unauthorized access");
  }
  return token;
};

// 2. Cấu hình Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: customCookieExtractor,
      secretOrKey: Env.JWT_SECRET,
      audience: ["user"],
      algorithms: ["HS256"],
    },
    async (payload, done) => {
      try {
        const userId = payload.userId;
        const userService = container.getUserService();
        const user = userId ? await userService.findById(userId) : null;

        return done(null, user || false);
      } catch (error) {
        return done(null, false);
      }
    },
  ),
);

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});
