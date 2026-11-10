import bcrypt from "bcrypt";
import config from "../config";
const saltRounds = Number(config.bcrypt_salt); // Number of salt rounds (cost factor)

export const securePass = async (plainPassword: string | Buffer) => {
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
};
