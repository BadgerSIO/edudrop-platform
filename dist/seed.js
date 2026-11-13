"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const seedHelper_1 = require("./helper/seedHelper");
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.default.databaseUrl) {
            throw new Error("DATABASE_URL is not configured in .env");
        }
        yield mongoose_1.default.connect(config_1.default.databaseUrl);
        console.log("Connected to MongoDB:", config_1.default.databaseUrl);
        yield (0, seedHelper_1.resetDatabaseToSeed)();
        yield mongoose_1.default.disconnect();
        console.log("EduDrop database seeding complete!");
    });
}
seedDatabase().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});
