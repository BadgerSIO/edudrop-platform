export type ISchool = {
  _id: string;
  slug: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    _id?: string;
    id?: string;
  };
  contactNo: string;
  amountReceived?: number;
  enabled?: boolean;
  active?: boolean;
  status?: "active" | "pending" | "suspended" | "archived";
  isDeleted?: boolean;
  schoolLogo?: string;
  featuredImage?: string;
  campusNeeds?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  bursar?: {
    _id?: string;
    name?: {
      firstName: string;
      lastName: string;
    };
    gender?: string;
    email?: string;
    contactNo?: string;
    presentAddress?: string;
    permanentAddress?: string;
    school?: string;
    enabled?: boolean;
    active?: boolean;
    profileImage?: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
    id?: string;
  };
  id?: string;
};
