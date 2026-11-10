export type IStoryOfEdudrop = {
  _id: string;
  title?: string;
  year?: number;
  date?: string;
  imageUrl: string;
  description: string;
};
export type IWeSupport = {
  _id: string;
  title: string;
  imageUrl: string;
  description: string;
};
export type ITestimonials = {
  _id: string;
  imageUrl: string;
  companyName: string;
  authorName: string;
  reviewText: string;
};
type Process = {
  _id: string;
  title: string;
  description: string;
};

export type ISupportYourSchool = {
  _id: string;
  subtitle: string;
  processes: Process[];
};
export type IOurRecentWork = {
  _id: string;
  title: string;
  alt: string;
  imageUrl: string;
  description: string;
  caption: string;
};
