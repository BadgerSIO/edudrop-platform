import mongoose, { SortOrder } from "mongoose";
import { paginationHelper } from "../../../helper/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/paginationOptions";
import { schoolSearchableFields } from "./school.constants";
import { ISchool, ISchoolFilters } from "./school.interface";
import { School } from "./school.model";
import { IBursar } from "../bursar/bursar.interface";
import { IUser } from "../user/user.interface";
import { Bursar } from "../bursar/bursar.model";
import ApiError from "../../../error/ApiError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import { ISchoolInfo } from "../schoolInfo/schoolInfo.interface";
import { SchoolInfo } from "../schoolInfo/schoolInfo.model";
import { slugify } from "../../../helper/slugify";
import { senderMail, transport } from "../../../config/nodemailer";
import emailTemplate from "../../../shared/emailTemplate";
import { NotificationService } from "../notification/notification.services";

const generateUniqueSchoolSlug = async (
  baseName: string,
  currentId?: string
): Promise<string> => {
  let slug = slugify(baseName);
  let counter = 1;
  while (true) {
    const query: any = { slug, isDeleted: { $ne: true } };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await School.findOne(query);
    if (!existing) {
      return slug;
    }
    slug = `${slugify(baseName)}-${counter}`;
    counter++;
  }
};

const createSchool = async (
  schoolinfo: ISchool,
  bursarData: IBursar,
  userData: Partial<IUser>
): Promise<ISchool | null> => {
  schoolinfo.active = false;
  schoolinfo.status = "pending";
  schoolinfo.isDeleted = false;
  schoolinfo.slug = await generateUniqueSchoolSlug(schoolinfo.name);
  schoolinfo.amountReceived = 0;

  userData.role = "bursar";
  userData.email = bursarData.email;

  bursarData.presentAddress = "";
  bursarData.permanentAddress = "";
  bursarData.profileImage = "";
  bursarData.active = false;
  bursarData.enabled = false;

  let newSchoolAllData: ISchool | null = null;
  const schoolSingleInfo: Partial<ISchoolInfo> = {};
  const session = await mongoose.startSession();

  let emailRecipient = "";
  let emailPassword = "";

  try {
    session.startTransaction();

    const newSchool = await School.create([schoolinfo], { session });
    if (!newSchool.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create School");
    }
    const newSchoolId = newSchool[0]._id;
    bursarData.school = newSchoolId;

    const newBursar = await Bursar.create([bursarData], { session });
    if (!newBursar.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create Bursar");
    }
    const bursarId = newBursar[0]._id;

    // create school single info
    schoolSingleInfo.school = newSchoolId;
    schoolSingleInfo.schoolName = schoolinfo.name;
    schoolSingleInfo.bursar = bursarId;
    schoolSingleInfo.slug = schoolinfo.slug;
    schoolSingleInfo.active = false;
    schoolSingleInfo.enabled = false;

    const newSingleSchool = await SchoolInfo.create([schoolSingleInfo], {
      session,
    });
    if (!newSingleSchool.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to create single school info"
      );
    }

    userData.bursar = bursarId;
    const newUser = await User.create([userData], { session });
    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create user");
    }

    const updatedSchool = await School.findOneAndUpdate(
      { _id: newSchoolId },
      { $set: { bursar: bursarId } },
      { new: true, session }
    )
      .populate("bursar")
      .session(session);

    if (!updatedSchool) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to update School");
    }

    newSchoolAllData = updatedSchool;
    emailRecipient = bursarData.email;
    emailPassword = userData.password || "";

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // Send onboarding email safely outside the database transaction
  if (emailRecipient && emailPassword) {
    try {
      const bursarPayload = {
        username: emailRecipient,
        password: emailPassword,
      };
      await transport.sendMail({
        from: `${senderMail}`,
        to: emailRecipient,
        subject: "Bursar Account Created - EduDrop Foundation",
        text: `Your bursar account has been created for ${schoolinfo.name}.`,
        html: emailTemplate("bursarAccount", bursarPayload),
      });
    } catch (mailError) {
      console.error("Failed to send bursar welcome email:", mailError);
    }
  }

  return newSchoolAllData;
};

const getAllSchool = async (
  filters: ISchoolFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<ISchool[]>> => {
  const { searchTerms, ...filterableData } = filters;
  const andConditions: any[] = [{ isDeleted: { $ne: true } }];

  if (searchTerms) {
    andConditions.push({
      $or: schoolSearchableFields.map((field) => ({
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
          return { [fields]: value === "true" || (value as any) === true };
        }
        return { [fields]: value };
      }),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  } else {
    sortCondition["createdAt"] = "desc";
  }

  const whereCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const schools = await School.find(whereCondition)
    .populate("bursar")
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);

  const total = await School.countDocuments(whereCondition);

  // Fetch schoolLogos from SchoolInfo for table display
  const schoolIds = schools.map((s) => s._id);
  const schoolInfos = await SchoolInfo.find(
    { school: { $in: schoolIds } },
    { school: 1, schoolLogo: 1, featuredImage: 1, campusNeeds: 1 }
  ).lean();

  const infoMap = new Map();
  schoolInfos.forEach((info) => {
    if (info.school) {
      infoMap.set(info.school.toString(), info);
    }
  });

  const data = schools.map((s) => {
    const obj = s.toObject();
    const info = infoMap.get(s._id.toString());
    return {
      ...obj,
      schoolLogo: info?.schoolLogo || "",
      featuredImage: info?.featuredImage || "",
      campusNeeds: info?.campusNeeds || [],
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: data as any,
  };
};

const getSingleSchoolBySlug = async (slug: string): Promise<ISchool | null> => {
  const result = await School.findOne({
    slug,
    isDeleted: { $ne: true },
  }).populate("bursar");
  return result;
};

const getSchoolStatus = async (email: string): Promise<ISchool | null> => {
  const bursar = await Bursar.findOne({ email }, { school: 1 }).lean();
  if (!bursar) {
    throw new ApiError(httpStatus.NOT_FOUND, "School not found");
  }
  const result = await School.findById(bursar.school, {
    active: 1,
    status: 1,
    name: 1,
    slug: 1,
  });
  return result;
};

const updateSchoolById = async (
  id: string,
  payload: Partial<ISchool>
): Promise<ISchool | null> => {
  const existingSchool = await School.findById(id);

  if (!existingSchool) {
    throw new ApiError(httpStatus.NOT_FOUND, "School not found");
  }

  // If school name changes, ensure slug is unique and propagate to SchoolInfo
  if (payload.name && payload.name !== existingSchool.name) {
    payload.slug = await generateUniqueSchoolSlug(payload.name, id);
    await SchoolInfo.updateMany(
      { school: id },
      { $set: { schoolName: payload.name, slug: payload.slug } }
    );
  }

  if (payload.active !== undefined) {
    payload.status = payload.active ? "active" : "pending";
    await SchoolInfo.updateMany(
      { school: id },
      { $set: { active: payload.active, enabled: payload.active } }
    );
  }

  const result = await School.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate("bursar");

  return result;
};

const updateSchoolStatus = async (
  slug: string,
  _adminemail?: string
): Promise<ISchool | null> => {
  const existingSchool = await School.findOne({ slug });

  if (!existingSchool) {
    throw new ApiError(httpStatus.NOT_FOUND, "School not found");
  }

  const newActive = !existingSchool.active;
  const newStatus = newActive ? "active" : "pending";

  const updatedSchool = await School.findByIdAndUpdate(
    existingSchool._id,
    { active: newActive, status: newStatus },
    { new: true, runValidators: true }
  ).populate("bursar");

  if (existingSchool.bursar) {
    await Bursar.findByIdAndUpdate(existingSchool.bursar, {
      active: newActive,
      enabled: newActive,
    });
  }

  // Synchronize SchoolInfo active status
  await SchoolInfo.updateMany(
    { school: existingSchool._id },
    { $set: { active: newActive, enabled: newActive } }
  );

  // Send status email & in-app notification asynchronously
  if (existingSchool.bursar) {
    User.findOne({ bursar: existingSchool.bursar }, { _id: 1, email: 1 })
      .lean()
      .then((findUser) => {
        if (findUser?._id) {
          NotificationService.createNotificationSafe({
            user: findUser._id,
            message: `${updatedSchool?.name || existingSchool.name} portal ${
              newActive ? "activated" : "paused"
            } by Admin`,
            link: "/bursar-dashboard/school-profile",
            read: false,
          }).catch(console.error);
        }
        if (findUser?.email) {
          transport
            .sendMail({
              from: `${senderMail}`,
              to: findUser.email,
              subject: `School Account ${newActive ? "Activated" : "Deactivated"}`,
              html: emailTemplate("bursarAccountStatus", { active: newActive }),
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  }

  return updatedSchool;
};

const deleteSchoolById = async (id: string): Promise<ISchool | null> => {
  const school = await School.findById(id);
  if (!school) {
    throw new ApiError(httpStatus.NOT_FOUND, "School not found");
  }

  // Soft delete school
  const updatedSchool = await School.findByIdAndUpdate(
    id,
    { isDeleted: true, status: "archived", active: false },
    { new: true }
  );

  // Soft-disable bursar and user accounts
  if (school.bursar) {
    await Bursar.findByIdAndUpdate(school.bursar, {
      active: false,
      enabled: false,
    });
    await User.findOneAndUpdate(
      { bursar: school.bursar },
      { active: false, status: "blocked" }
    );
    await SchoolInfo.updateMany(
      { bursar: school.bursar },
      { active: false, enabled: false }
    );
  }
  await SchoolInfo.updateMany(
    { school: id },
    { active: false, enabled: false }
  );

  return updatedSchool;
};

export const SchoolService = {
  createSchool,
  getAllSchool,
  getSingleSchoolBySlug,
  deleteSchoolById,
  updateSchoolById,
  updateSchoolStatus,
  getSchoolStatus,
  generateUniqueSchoolSlug,
};
