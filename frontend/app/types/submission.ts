export type ISubmissions = {
  _id: string;
  bursar?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  seen?: boolean;
  status?: "unread" | "read" | "replied" | "archived";
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
};
