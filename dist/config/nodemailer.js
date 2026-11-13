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
exports.transport = exports.senderMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_1 = __importDefault(require("./index"));
exports.senderMail = index_1.default.smtp.from;
// When SMTP_HOST is not set, emails are serialized and logged to the console instead of sent.
const baseTransport = index_1.default.smtp.host
    ? nodemailer_1.default.createTransport({
        host: index_1.default.smtp.host,
        port: index_1.default.smtp.port,
        secure: index_1.default.smtp.port === 465,
        auth: { user: index_1.default.smtp.user, pass: index_1.default.smtp.pass },
    })
    : nodemailer_1.default.createTransport({ jsonTransport: true });
exports.transport = {
    sendMail: (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
        if (!index_1.default.smtp.host) {
            const recipient = Array.isArray(mailOptions.to)
                ? mailOptions.to.join(", ")
                : mailOptions.to;
            console.log("\n📬 ================ [EMAIL DISPATCHED (DEV/DEMO)] ================");
            console.log(`To:      ${recipient}`);
            console.log(`From:    ${mailOptions.from || exports.senderMail}`);
            console.log(`Subject: ${mailOptions.subject}`);
            if (mailOptions.text) {
                console.log(`Content: ${mailOptions.text}`);
            }
            console.log("==================================================================\n");
        }
        return baseTransport.sendMail(mailOptions);
    }),
};
