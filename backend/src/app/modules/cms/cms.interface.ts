import { Model } from "mongoose";

export interface IHeroMetricCMS {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  totalSponsored: string;
  progressPercent: number;
  donorCount: string;
  partnerSchoolCount: number;
  highlightText: string;
  trustStrip: { metric: string; label: string }[];
}

export interface IWhyEduDropCMS {
  eyebrow: string;
  heading: string;
  leadStatement: string;
  body: string;
  image: string;
  tags: { label: string; isPrimary?: boolean }[];
}

export interface IProcessStepCMS {
  step: string;
  title: string;
  description: string;
}

export interface IOurWorkCMS {
  _id?: string;
  title: string;
  alt?: string;
  description: string;
  caption: string;
  imageUrl: string;
  order?: number;
  active?: boolean;
}

export interface ITestimonialCMS {
  _id?: string;
  authorName: string;
  companyName: string;
  reviewText: string;
  imageUrl: string;
  order?: number;
  active?: boolean;
}

export interface IContactInfoCMS {
  phone: string;
  email: string;
  location: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}

export interface ISiteContentCMS {
  slug: string; // "global"
  hero: IHeroMetricCMS;
  whyEduDrop: IWhyEduDropCMS;
  howItWorks: IProcessStepCMS[];
  ourWorks: IOurWorkCMS[];
  testimonials: ITestimonialCMS[];
  contactInfo: IContactInfoCMS;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
}

export type CMSModel = Model<ISiteContentCMS, Record<string, unknown>>;
