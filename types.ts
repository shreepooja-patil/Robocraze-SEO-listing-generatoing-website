export interface TechnicalSpec {
  name: string;
  value: string;
}

export interface ProductListing {
  productTitleWebsite: string;
  productTitleAmazon: string;
  bulletPoints: string[];
  seoDescription: string;
  technicalSpecifications: TechnicalSpec[];
  searchKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  suggestedTags: string[];
}

export interface CompetitorAnalysis {
  competitorName: string;
  productUrl: string;
  price?: string;
  eyeCatchingDetails: string;
}

export interface CategoryMapping {
  productName: string;
  assignedCategory: string;
  reasoning: string;
}

export enum AppTab {
  LISTING = 'listing',
  COMPETITOR = 'competitor',
  CATEGORY = 'category'
}