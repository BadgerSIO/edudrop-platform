import mongoose from "mongoose";
import { IGenericErrorMessages } from "../interfaces/error";

const handleCastError = (error: mongoose.Error.CastError) => {
  const errors: IGenericErrorMessages[] = [
    {
      path: error?.path,
      message: "Invalid Id",
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: "Cast Error",
    errorMessage: errors,
  };
};

export default handleCastError;
