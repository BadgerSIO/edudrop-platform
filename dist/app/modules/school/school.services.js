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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paginationHelper_1 = require("../../../helper/paginationHelper");
const school_constants_1 = require("./school.constants");
const school_model_1 = require("./school.model");
const bursar_model_1 = require("../bursar/bursar.model");
const ApiError_1 = __importDefault(require("../../../error/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("../user/user.model");
const schoolInfo_model_1 = require("../schoolInfo/schoolInfo.model");
const slugify_1 = require("../../../helper/slugify");
const nodemailer_1 = require("../../../config/nodemailer");
const emailTemplate_1 = __importDefault(require("../../../shared/emailTemplate"));
const notification_services_1 = require("../notification/notification.services");
const generateUniqueSchoolSlug = (baseName, currentId) => __awaiter(void 0, void 0, void 0, function* () {
    let slug = (0, slugify_1.slugify)(baseName);
    let counter = 1;
    while (true) {
        const query = { slug, isDeleted: { $ne: true } };
        if (currentId) {
            query._id = { $ne: currentId };
        }
        const existing = yield school_model_1.School.findOne(query);
        if (!existing) {
            return slug;
        }
        slug = `${(0, slugify_1.slugify)(baseName)}-${counter}`;
        counter++;
    }
});
const createSchool = (schoolinfo, bursarData, userData) => __awaiter(void 0, void 0, void 0, function* () {
    schoolinfo.active = false;
    schoolinfo.status = "pending";
    schoolinfo.isDeleted = false;
    schoolinfo.slug = yield generateUniqueSchoolSlug(schoolinfo.name);
    schoolinfo.amountReceived = 0;
    userData.role = "bursar";
    userData.email = bursarData.email;
    bursarData.presentAddress = "";
    bursarData.permanentAddress = "";
    bursarData.profileImage = "";
    bursarData.active = false;
    bursarData.enabled = false;
    let newSchoolAllData = null;
    const schoolSingleInfo = {};
    const session = yield mongoose_1.default.startSession();
    let emailRecipient = "";
    let emailPassword = "";
    try {
        session.startTransaction();
        const newSchool = yield school_model_1.School.create([schoolinfo], { session });
        if (!newSchool.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create School");
        }
        const newSchoolId = newSchool[0]._id;
        bursarData.school = newSchoolId;
        const newBursar = yield bursar_model_1.Bursar.create([bursarData], { session });
        if (!newBursar.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create Bursar");
        }
        const bursarId = newBursar[0]._id;
        // create school single info
        schoolSingleInfo.school = newSchoolId;
        schoolSingleInfo.schoolName = schoolinfo.name;
        schoolSingleInfo.bursar = bursarId;
        schoolSingleInfo.slug = schoolinfo.slug;
        schoolSingleInfo.active = false;
        schoolSingleInfo.enabled = false;
        const newSingleSchool = yield schoolInfo_model_1.SchoolInfo.create([schoolSingleInfo], {
            session,
        });
        if (!newSingleSchool.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create single school info");
        }
        userData.bursar = bursarId;
        const newUser = yield user_model_1.User.create([userData], { session });
        if (!newUser.length) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create user");
        }
        const updatedSchool = yield school_model_1.School.findOneAndUpdate({ _id: newSchoolId }, { $set: { bursar: bursarId } }, { new: true, session })
            .populate("bursar")
            .session(session);
        if (!updatedSchool) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to update School");
        }
        newSchoolAllData = updatedSchool;
        emailRecipient = bursarData.email;
        emailPassword = userData.password || "";
        yield session.commitTransaction();
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        yield session.endSession();
    }
    // Send onboarding email safely outside the database transaction
    if (emailRecipient && emailPassword) {
        try {
            const bursarPayload = {
                username: emailRecipient,
                password: emailPassword,
            };
            yield nodemailer_1.transport.sendMail({
                from: `${nodemailer_1.senderMail}`,
                to: emailRecipient,
                subject: "Bursar Account Created - EduDrop Foundation",
                text: `Your bursar account has been created for ${schoolinfo.name}.`,
                html: (0, emailTemplate_1.default)("bursarAccount", bursarPayload),
            });
        }
        catch (mailError) {
            console.error("Failed to send bursar welcome email:", mailError);
        }
    }
    return newSchoolAllData;
});
const getAllSchool = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerms } = filters, filterableData = __rest(filters, ["searchTerms"]);
    const andConditions = [{ isDeleted: { $ne: true } }];
    if (searchTerms) {
        andConditions.push({
            $or: school_constants_1.schoolSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerms,
                    $options: "i",
                },
            })),
        });
    }
    if (Object.keys(filterableData).length) {
        andConditions.push({
            $and: Object.entries(filterableData).map(([fields, value]) => {
                if (fields === "active") {
                    return { [fields]: value === "true" || value === true };
                }
                return { [fields]: value };
            }),
        });
    }
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortCondition = {};
    if (sortBy && sortOrder) {
        sortCondition[sortBy] = sortOrder;
    }
    else {
        sortCondition["createdAt"] = "desc";
    }
    const whereCondition = andConditions.length > 0 ? { $and: andConditions } : {};
    const schools = yield school_model_1.School.find(whereCondition)
        .populate("bursar")
        .sort(sortCondition)
        .skip(skip)
        .limit(limit);
    const total = yield school_model_1.School.countDocuments(whereCondition);
    // Fetch schoolLogos from SchoolInfo for table display
    const schoolIds = schools.map((s) => s._id);
    const schoolInfos = yield schoolInfo_model_1.SchoolInfo.find({ school: { $in: schoolIds } }, { school: 1, schoolLogo: 1, featuredImage: 1, campusNeeds: 1 }).lean();
    const infoMap = new Map();
    schoolInfos.forEach((info) => {
        if (info.school) {
            infoMap.set(info.school.toString(), info);
        }
    });
    const data = schools.map((s) => {
        const obj = s.toObject();
        const info = infoMap.get(s._id.toString());
        return Object.assign(Object.assign({}, obj), { schoolLogo: (info === null || info === void 0 ? void 0 : info.schoolLogo) || "", featuredImage: (info === null || info === void 0 ? void 0 : info.featuredImage) || "", campusNeeds: (info === null || info === void 0 ? void 0 : info.campusNeeds) || [] });
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: data,
    };
});
const getSingleSchoolBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield school_model_1.School.findOne({
        slug,
        isDeleted: { $ne: true },
    }).populate("bursar");
    return result;
});
const getSchoolStatus = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const bursar = yield bursar_model_1.Bursar.findOne({ email }, { school: 1 }).lean();
    if (!bursar) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "School not found");
    }
    const result = yield school_model_1.School.findById(bursar.school, {
        active: 1,
        status: 1,
        name: 1,
        slug: 1,
    });
    return result;
});
const updateSchoolById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSchool = yield school_model_1.School.findById(id);
    if (!existingSchool) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "School not found");
    }
    // If school name changes, ensure slug is unique and propagate to SchoolInfo
    if (payload.name && payload.name !== existingSchool.name) {
        payload.slug = yield generateUniqueSchoolSlug(payload.name, id);
        yield schoolInfo_model_1.SchoolInfo.updateMany({ school: id }, { $set: { schoolName: payload.name, slug: payload.slug } });
    }
    if (payload.active !== undefined) {
        payload.status = payload.active ? "active" : "pending";
        yield schoolInfo_model_1.SchoolInfo.updateMany({ school: id }, { $set: { active: payload.active, enabled: payload.active } });
    }
    const result = yield school_model_1.School.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    }).populate("bursar");
    return result;
});
const updateSchoolStatus = (slug, _adminemail) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSchool = yield school_model_1.School.findOne({ slug });
    if (!existingSchool) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "School not found");
    }
    const newActive = !existingSchool.active;
    const newStatus = newActive ? "active" : "pending";
    const updatedSchool = yield school_model_1.School.findByIdAndUpdate(existingSchool._id, { active: newActive, status: newStatus }, { new: true, runValidators: true }).populate("bursar");
    if (existingSchool.bursar) {
        yield bursar_model_1.Bursar.findByIdAndUpdate(existingSchool.bursar, {
            active: newActive,
            enabled: newActive,
        });
    }
    // Synchronize SchoolInfo active status
    yield schoolInfo_model_1.SchoolInfo.updateMany({ school: existingSchool._id }, { $set: { active: newActive, enabled: newActive } });
    // Send status email & in-app notification asynchronously
    if (existingSchool.bursar) {
        user_model_1.User.findOne({ bursar: existingSchool.bursar }, { _id: 1, email: 1 })
            .lean()
            .then((findUser) => {
            if (findUser === null || findUser === void 0 ? void 0 : findUser._id) {
                notification_services_1.NotificationService.createNotificationSafe({
                    user: findUser._id,
                    message: `${(updatedSchool === null || updatedSchool === void 0 ? void 0 : updatedSchool.name) || existingSchool.name} portal ${newActive ? "activated" : "paused"} by Admin`,
                    link: "/bursar-dashboard/school-profile",
                    read: false,
                }).catch(console.error);
            }
            if (findUser === null || findUser === void 0 ? void 0 : findUser.email) {
                nodemailer_1.transport
                    .sendMail({
                    from: `${nodemailer_1.senderMail}`,
                    to: findUser.email,
                    subject: `School Account ${newActive ? "Activated" : "Deactivated"}`,
                    html: (0, emailTemplate_1.default)("bursarAccountStatus", { active: newActive }),
                })
                    .catch(console.error);
            }
        })
            .catch(console.error);
    }
    return updatedSchool;
});
const deleteSchoolById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.School.findById(id);
    if (!school) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "School not found");
    }
    // Soft delete school
    const updatedSchool = yield school_model_1.School.findByIdAndUpdate(id, { isDeleted: true, status: "archived", active: false }, { new: true });
    // Soft-disable bursar and user accounts
    if (school.bursar) {
        yield bursar_model_1.Bursar.findByIdAndUpdate(school.bursar, {
            active: false,
            enabled: false,
        });
        yield user_model_1.User.findOneAndUpdate({ bursar: school.bursar }, { active: false, status: "blocked" });
        yield schoolInfo_model_1.SchoolInfo.updateMany({ bursar: school.bursar }, { active: false, enabled: false });
    }
    yield schoolInfo_model_1.SchoolInfo.updateMany({ school: id }, { active: false, enabled: false });
    return updatedSchool;
});
exports.SchoolService = {
    createSchool,
    getAllSchool,
    getSingleSchoolBySlug,
    deleteSchoolById,
    updateSchoolById,
    updateSchoolStatus,
    getSchoolStatus,
    generateUniqueSchoolSlug,
};
