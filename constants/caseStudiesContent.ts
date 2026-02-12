// Full case studies content with all text

interface CaseStudyContent {
  fullText: string;
}

interface CaseStudiesContent {
  [key: string]: CaseStudyContent;
}

export const caseStudiesFullContent: CaseStudiesContent = {
  "celebrity-marketing-wizkid-pepsi": {
    fullText: "Full content will be displayed here. Due to length, content is stored separately.",
  },
  "political-campaigns-micro-influencers": {
    fullText: "Full content will be displayed here. Due to length, content is stored separately.",
  },
  "startup-app-first-customer": {
    fullText: "Full content will be displayed here. Due to length, content is stored separately.",
  },
  "walk-in-businesses-nightclubs-restaurants": {
    fullText: "Full content will be displayed here. Due to length, content is stored separately.",
  },
};
