"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteContent = void 0;
const mongoose_1 = require("mongoose");
const CMSSchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true, default: "global" },
    hero: {
        eyebrow: { type: String, default: "School Hydration & Hygiene Platform" },
        headline: { type: String, default: "Empower Classrooms with Clean Water & Health Essentials" },
        subheadline: {
            type: String,
            default: "EduDrop connects donors and alumni directly with partner school bursars to supply pure water cases, dispensers, sanitizers, and paper supplies with 100% transparency.",
        },
        totalSponsored: { type: String, default: "$148,920.00" },
        progressPercent: { type: Number, default: 86 },
        donorCount: { type: String, default: "1,250+ donors" },
        partnerSchoolCount: { type: Number, default: 48 },
        highlightText: {
            type: String,
            default: "Help stock classrooms for the upcoming semester",
        },
        trustStrip: [
            {
                metric: { type: String, required: true },
                label: { type: String, required: true },
            },
        ],
    },
    whyEduDrop: {
        eyebrow: { type: String, default: "Who We Are" },
        heading: {
            type: String,
            default: "Driven by Wellness, Built on Total Transparency",
        },
        leadStatement: {
            type: String,
            default: "Your donation never disappears into overhead. Every single dollar becomes physical supplies delivered directly to the school gate.",
        },
        body: {
            type: String,
            default: "School bursars publish their exact monthly requirements for pure spring water, classroom dispensers, sanitizers, and paper supplies. Donors select a verified campus, choose the quantity to sponsor, and our team consolidates and delivers every case directly into classroom hands.",
        },
        image: { type: String, default: "/home/w7.webp" },
        tags: [
            {
                label: { type: String, required: true },
                isPrimary: { type: Boolean, default: false },
            },
        ],
    },
    howItWorks: [
        {
            step: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },
        },
    ],
    ourWorks: [
        {
            title: { type: String, required: true },
            alt: { type: String },
            description: { type: String, required: true },
            caption: { type: String, required: true },
            imageUrl: { type: String, required: true },
            order: { type: Number, default: 0 },
            active: { type: Boolean, default: true },
        },
    ],
    testimonials: [
        {
            authorName: { type: String, required: true },
            companyName: { type: String, required: true },
            reviewText: { type: String, required: true },
            imageUrl: { type: String, required: true },
            order: { type: Number, default: 0 },
            active: { type: Boolean, default: true },
        },
    ],
    contactInfo: {
        phone: { type: String, default: "+1 (555) 234-8900" },
        email: { type: String, default: "hello@edudrop.org" },
        location: {
            type: String,
            default: "450 Education Way, Suite 200, Austin, TX 78701",
        },
        linkedin: {
            type: String,
            default: "https://www.linkedin.com/in/saad-ibne-omar/",
        },
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        youtube: { type: String, default: "" },
        tiktok: { type: String, default: "" },
    },
    seo: {
        metaTitle: { type: String, default: "EduDrop — School Donation & Hydration Platform" },
        metaDescription: {
            type: String,
            default: "Sponsor clean spring water, hydration stations, and essential classroom supplies directly to verified partner schools.",
        },
        keywords: { type: String, default: "education, school donations, clean water, bursar, classroom hydration" },
    },
}, {
    timestamps: true,
});
exports.SiteContent = (0, mongoose_1.model)("SiteContent", CMSSchema);
