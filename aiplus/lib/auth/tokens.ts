import crypto from "crypto";

export const generateToken = (size = 32) => {
  return crypto.randomBytes(size).toString("hex");
};

export const generateNumericCode = (digits = 6) => {
  const max = Math.pow(10, digits) - 1;
  const num = crypto.randomInt(0, max + 1);
  return num.toString().padStart(digits, "0");
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
