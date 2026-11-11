import mongoose from "mongoose";
import config from "./config";
import { resetDatabaseToSeed } from "./helper/seedHelper";

async function seedDatabase() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is not configured in .env");
  }
  await mongoose.connect(config.databaseUrl);
  console.log("Connected to MongoDB:", config.databaseUrl);

  await resetDatabaseToSeed();

  await mongoose.disconnect();
  console.log("EduDrop database seeding complete!");
}

seedDatabase().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
