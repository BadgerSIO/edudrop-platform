import { IOurRecentWork, ITestimonials } from "@/app/types/Homepage";
import { IContactInfo } from "@/app/types/ContactInfo";

export interface IHeroMetric {
  totalSponsored: string;
  progressPercent: number;
  donorCount: string;
  partnerSchoolCount: number;
  highlightText: string;
}

export interface IWhyEduDrop {
  eyebrow: string;
  heading: string;
  leadStatement: string;
  body: string;
  image: string;
  tags: { label: string; isPrimary?: boolean }[];
}

export interface IProcessStep {
  step: string;
  title: string;
  description: string;
}

export const heroMetricData: IHeroMetric = {
  totalSponsored: "$148,920.00",
  progressPercent: 86,
  donorCount: "1,250+ donors",
  partnerSchoolCount: 48,
  highlightText: "Help stock classrooms for the upcoming semester",
};

export const trustStripData = [
  { metric: "100%", label: "Direct-to-Bursar Delivery" },
  { metric: "48", label: "Verified Partner Schools" },
  { metric: "12,400+", label: "Cases of Water Delivered" },
  { metric: "0%", label: "Cash Diverted to Overhead" },
  { metric: "Monthly", label: "Campus Delivery Audits" },
];

export const whyEduDropData: IWhyEduDrop = {
  eyebrow: "Who We Are",
  heading: "Driven by Wellness, Built on Total Transparency",
  leadStatement:
    "Your donation never disappears into overhead. Every single dollar becomes physical supplies delivered directly to the school gate.",
  body: "School bursars publish their exact monthly requirements for pure spring water, classroom dispensers, sanitizers, and paper supplies. Donors select a verified campus, choose the quantity to sponsor, and our team consolidates and delivers every case directly into classroom hands.",
  image: "/home/w7.webp",
  tags: [
    { label: "100% Direct Delivery", isPrimary: true },
    { label: "Verified Campus Needs" },
    { label: "Pure Spring Water" },
    { label: "Hygiene Essentials" },
    { label: "Alumni & Parent Led" },
  ],
};

export const howItWorksSteps: IProcessStep[] = [
  {
    step: "01",
    title: "Choose a Verified School",
    description:
      "Pick your alma mater or a partner school in your local area and inspect their bursar's active classroom supply requests.",
  },
  {
    step: "02",
    title: "Sponsor Water & Essentials",
    description:
      "Choose the exact items and quantities to sponsor—from spring water cases to classroom dispensers—with a one-time or monthly gift.",
  },
  {
    step: "03",
    title: "Direct Campus Delivery",
    description:
      "EduDrop consolidates all community orders and delivers directly to the school bursar on scheduled monthly delivery dates with full photo confirmation.",
  },
];

export const ourWorkData: IOurRecentWork[] = [
  {
    _id: "work-1",
    title: "Oakridge Technical High School",
    alt: "Oakridge Technical High School hydration delivery",
    description:
      "40 cases of EduDrop Spring Water and classroom dispensers for the engineering and science wings.",
    caption: "Oakridge Technical High School",
    imageUrl: "/home/w1.webp",
  },
  {
    _id: "work-2",
    title: "St. Clara Academy",
    alt: "St. Clara Academy classroom supply drive",
    description:
      "Parent council sponsored 25 cases of pure water and sanitization refills for the fall semester.",
    caption: "St. Clara Academy",
    imageUrl: "/home/w8.webp",
  },
  {
    _id: "work-3",
    title: "Westfield Collegiate Institute",
    alt: "Westfield Collegiate student wellness program",
    description:
      "Installed 8 new hot and cold classroom hydration stations funded by alumni recurring contributions.",
    caption: "Westfield Collegiate Institute",
    imageUrl: "/home/w3.webp",
  },
  {
    _id: "work-4",
    title: "Crestview Preparatory High School",
    alt: "Crestview Preparatory supply distribution",
    description:
      "Delivered recycled paper towel packages and eco-friendly cone cups across classroom water dispensers.",
    caption: "Crestview Preparatory High School",
    imageUrl: "/home/w4.webp",
  },
  {
    _id: "work-5",
    title: "Pinecrest High School",
    alt: "Pinecrest High School spring water delivery",
    description:
      "Over 60 cases of EduDrop natural spring water delivered to the athletics department and central cafeteria.",
    caption: "Pinecrest High School",
    imageUrl: "/home/w5.webp",
  },
  {
    _id: "work-6",
    title: "Lincoln Charter Academy",
    alt: "Lincoln Charter Academy student hydration station",
    description:
      "Placed manual bottle pumps and dispensers in primary grades to encourage daily hydration habits.",
    caption: "Lincoln Charter Academy",
    imageUrl: "/home/w6.webp",
  },
];

export const testimonialsData: ITestimonials[] = [
  {
    _id: "test-1",
    imageUrl: "/home/user1.webp",
    companyName: "Oakridge Alumni Association",
    authorName: "Darrell Steward",
    reviewText:
      "EduDrop took the guesswork out of giving. Knowing our alumni donations turn into physical water cases delivered straight to the bursar gives our members complete peace of mind.",
  },
  {
    _id: "test-2",
    imageUrl: "/home/user4.webp",
    companyName: "St. Clara Parent Council",
    authorName: "Theresa Webb",
    reviewText:
      "Our classrooms used to struggle with basic water dispenser refills. Now, monthly deliveries arrive like clockwork, fully funded by community sponsors.",
  },
  {
    _id: "test-3",
    imageUrl: "/home/user2.webp",
    companyName: "Westfield Community Foundation",
    authorName: "Marvin McKinney",
    reviewText:
      "The bursar dashboard and real-time school needs list took the guesswork out of giving. Our students now have fresh hydration stations in every hallway.",
  },
];

export const contactInfoData: IContactInfo = {
  _id: "contact-1",
  phone: "+1 (555) 234-8900",
  email: "hello@edudrop.org",
  location: "450 Education Way, Suite 200, Austin, TX 78701",
  facebook: "https://www.facebook.com/edudrop",
  instagram: "https://www.instagram.com/edudrop",
  youtube: "https://www.youtube.com/@edudrop",
  tiktok: "https://www.tiktok.com/@edudrop",
};
