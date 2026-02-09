import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  username: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

export const signAccessToken = (
  payload: AuthTokenPayload,
  expiresIn: jwt.SignOptions["expiresIn"] = "15m"
) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

export const signRefreshToken = (
  payload: AuthTokenPayload,
  expiresIn: jwt.SignOptions["expiresIn"] = "30d"
) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload & jwt.JwtPayload;
};
