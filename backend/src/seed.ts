import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import config from "./config";

function parseExtendedJson(value: any): any {
  if (Array.isArray(value)) {
    return value.map(parseExtendedJson);
  }
  if (value && typeof value === "object") {
    if ("$oid" in value && typeof value.$oid === "string") {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    if ("$date" in value && typeof value.$date === "string") {
      return new Date(value.$date);
    }
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = parseExtendedJson(v);
    }
    return result;
  }
  return value;
}

async function seedDatabase() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is not configured in .env");
  }
  await mongoose.connect(config.databaseUrl);
  console.log("Connected to MongoDB:", config.databaseUrl);

  const seedDir = path.join(process.cwd(), "seed");
  const files = fs
    .readdirSync(seedDir)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const collectionName = path.basename(file, ".json");
    const raw = fs.readFileSync(path.join(seedDir, file), "utf-8");
    const docs = parseExtendedJson(JSON.parse(raw));

    const collection = mongoose.connection.collection(collectionName);
    await collection.deleteMany({});
    if (Array.isArray(docs) && docs.length > 0) {
      await collection.insertMany(docs);
    }
    console.log(
      `Seeded collection "${collectionName}" (${Array.isArray(docs) ? docs.length : 0} documents)`
    );
  }

  await mongoose.disconnect();
  console.log("EduDrop database seeding complete!");
}

seedDatabase().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
