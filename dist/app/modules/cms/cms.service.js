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
exports.CMSService = void 0;
const cms_model_1 = require("./cms.model");
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const mediaCleanupHelper_1 = require("../../../helper/mediaCleanupHelper");
const extractCmsImageUrls = (doc) => {
    var _a;
    if (!doc)
        return [];
    const urls = [];
    if ((_a = doc.whyEduDrop) === null || _a === void 0 ? void 0 : _a.image)
        urls.push(doc.whyEduDrop.image);
    if (Array.isArray(doc.ourWorks)) {
        for (const work of doc.ourWorks) {
            if (work === null || work === void 0 ? void 0 : work.imageUrl)
                urls.push(work.imageUrl);
        }
    }
    if (Array.isArray(doc.testimonials)) {
        for (const item of doc.testimonials) {
            if (item === null || item === void 0 ? void 0 : item.imageUrl)
                urls.push(item.imageUrl);
        }
    }
    return urls;
};
const unlinkRemovedCmsImages = (oldUrls, nextDoc) => __awaiter(void 0, void 0, void 0, function* () {
    if (!nextDoc)
        return;
    const removed = (0, mediaCleanupHelper_1.computeRemovedUrls)(oldUrls, extractCmsImageUrls(nextDoc));
    yield Promise.all(removed.map((url) => (0, mediaCleanupHelper_1.safeUnlinkUpload)(url, "cms")));
});
const getSiteContentDoc = () => __awaiter(void 0, void 0, void 0, function* () {
    let content = yield cms_model_1.SiteContent.findOne({ slug: "global" });
    if (!content) {
        content = yield cms_model_1.SiteContent.create({ slug: "global" });
    }
    return content;
});
const getSiteContent = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield getSiteContentDoc();
});
const updateSiteContent = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield getSiteContentDoc();
    const oldUrls = extractCmsImageUrls(existing);
    const updateData = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined) {
            updateData[key] = value;
        }
    }
    const updated = yield cms_model_1.SiteContent.findByIdAndUpdate(existing._id, { $set: updateData }, { new: true, runValidators: true });
    if (updated) {
        yield unlinkRemovedCmsImages(oldUrls, updated);
    }
    return updated;
});
// Our Works CRUD
const addOurWork = (item) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield getSiteContentDoc();
    content.ourWorks.push(item);
    yield content.save();
    return content;
});
const updateOurWork = (id, updatedWork) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield getSiteContentDoc();
    const workItem = content.ourWorks.id(id);
    if (!workItem) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Work showcase not found");
    }
    const oldUrls = extractCmsImageUrls(content);
    Object.assign(workItem, updatedWork);
    yield content.save();
    yield unlinkRemovedCmsImages(oldUrls, content);
    return content;
});
const deleteOurWork = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield getSiteContentDoc();
    const oldUrls = extractCmsImageUrls(content);
    content.ourWorks = content.ourWorks.filter((w) => String(w._id) !== id);
    yield content.save();
    yield unlinkRemovedCmsImages(oldUrls, content);
    return content;
});
// Testimonials CRUD
const addTestimonial = (item) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield getSiteContentDoc();
    content.testimonials.push(item);
    yield content.save();
    return content;
});
const updateTestimonial = (id, updatedTestimonial) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield getSiteContentDoc();
    const item = content.testimonials.id(id);
    if (!item) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Testimonial not found");
    }
    const oldUrls = extractCmsImageUrls(content);
    Object.assign(item, updatedTestimonial);
    yield content.save();
    yield unlinkRemovedCmsImages(oldUrls, content);
    return content;
});
const deleteTestimonial = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield getSiteContentDoc();
    const oldUrls = extractCmsImageUrls(content);
    content.testimonials = content.testimonials.filter((t) => String(t._id) !== id);
    yield content.save();
    yield unlinkRemovedCmsImages(oldUrls, content);
    return content;
});
exports.CMSService = {
    getSiteContent,
    updateSiteContent,
    addOurWork,
    updateOurWork,
    deleteOurWork,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
};
