
export interface Supplier {
  id: string;
  name: string;
  type: 'Supplier' | 'Trader';
  address: string;
  country: string;
  website: string;
  contact: string;
  materialMatch: string;
  certifications: string[];
  reliabilityScore: number;
  whyScore: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  suppliers: Supplier[];
  sources: GroundingSource[];
  summary: string;
}

export interface SourcingParams {
  material: string;
  keywords?: string;
  countryFilter?: string;
  additionalRequirements?: string;
  imageData?: string;
  imageMimeType?: string;
}

export interface ReliabilityReport {
  snapshot: {
    legalName: string;
    location: string;
    incorporationYear: string;
    ownership: string;
    coreActivities: string;
  };
  score: {
    value: number;
    category: string;
  };
  financials: {
    creditworthiness: string;
    paymentBehavior: string;
    redFlags: string[];
  };
  tradeHistory: {
    experienceYears: string;
    markets: string;
    consistency: string;
    inspections: string;
  };
  compliance: {
    registrationStatus: string;
    certifications: string[];
    legalIssues: string;
  };
  reputation: {
    summary: string;
    feedback: string;
    onlinePresence: string;
  };
  riskFlags: string[];
  verdict: {
    status: 'Safe' | 'Caution' | 'Not Recommended';
    conditions?: string;
  };
  mitigation: {
    paymentTerms: string;
    verificationActions: string;
    safeguards: string;
  };
  executiveSummary: string;
}
