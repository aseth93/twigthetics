export type ImageAsset = {
  src: string;
  alt: string;
};

export type Brand = {
  name: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
};

export type Links = {
  instagram: string;
  guideCheckout: string;
  applicationEndpoint: string;
};

export type CoachMetric = {
  value: string;
  label: string;
};

export type Coach = {
  name: string;
  title: string;
  handle: string;
  summary: string;
  bio: string;
  metrics: CoachMetric[];
  portrait: ImageAsset;
  heroImage: ImageAsset;
  aboutImage: ImageAsset;
};

export type CoachingOffer = {
  title: string;
  summary: string;
  audience: string;
  deliverables: string[];
  commitments: string[];
  ctaLabel: string;
};

export type GuideModule = {
  title: string;
  description: string;
};

export type GuideOffer = {
  title: string;
  summary: string;
  statusNote: string;
  ctaLabel: string;
  placeholderLabel: string;
  features: string[];
  modules: GuideModule[];
};

export type Transformation = {
  id: string;
  label: string;
  title: string;
  summary: string;
  timeframe: string;
  result: string;
  image?: ImageAsset;
  comparison?: {
    before: ImageAsset & { caption: string };
    after: ImageAsset & { caption: string };
  };
};

export type Testimonial = {
  quote: string;
  name: string;
  result: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ApplicationFormField = {
  name: string;
  label: string;
  type: "text" | "email" | "url" | "select" | "textarea";
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type SiteConfig = {
  brand: Brand;
  links: Links;
  coach: Coach;
  coachingOffer: CoachingOffer;
  guideOffer: GuideOffer;
  transformations: Transformation[];
  testimonials: Testimonial[];
  faq: FaqItem[];
  process: ProcessStep[];
  applicationFields: ApplicationFormField[];
};
