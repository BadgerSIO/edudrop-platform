import crypto from "crypto";
const generateResetToken = () => {
  const prefix = "EDUDROP-"; // Custom prefix for the reset token
  let resetToken = `${prefix}${crypto.randomUUID()}`.substring(0, 25); // Generate initial ID

  // Remove trailing dashes or underscores, if any
  while (resetToken.endsWith("-") || resetToken.endsWith("_")) {
    resetToken = resetToken.slice(0, -1);
  }
  return resetToken;
};

export default generateResetToken;
