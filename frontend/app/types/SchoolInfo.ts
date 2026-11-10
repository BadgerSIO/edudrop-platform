export type ICampusNeed = {
  _id?: string;
  itemTitle: string;
  productSlug?: string;
  targetQuantity: number;
  fulfilledQuantity: number;
  priority?: "high" | "medium" | "low";
};

export type ISchoolInfo = {
  school: string;
  _id: string;
  slug: string;
  bursar?:
    | string
    | {
        _id?: string;
        id?: string;
        name?: {
          firstName?: string;
          lastName?: string;
        };
        email?: string;
        contactNo?: string;
        presentAddress?: string;
        permanentAddress?: string;
        active?: boolean;
        profileImage?: string;
      };
  principal?: string;
  vicePrincipal?: string;
  schoolWebsiteLink?: string;
  schoolLogo?: string;
  featuredImage?: string;
  schoolName: string;
  shortDescription?: string;
  heroTitle?: string;
  heroBackgroundImage?: string;
  sectionOneTitle?: string;
  sectionOneDescription?: string;
  sectionOneImage?: string;
  sectionOneImageAlt?: string;
  sectionTwoTitle?: string;
  sectionTwoDescription?: string;
  gallery?: {
    imageUrl: string;
    title?: string;
    _id?: string;
    id?: string;
  }[];
  schoolStats?: {
    title: string;
    _id?: string;
    id?: string;
  }[];
  achievements?: {
    title: string;
    _id?: string;
    id?: string;
  }[];
  campusNeeds?: ICampusNeed[];
  metaTitle?: string;
  metaDescription?: string;
  schoolOther?: string;
  active?: boolean;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
