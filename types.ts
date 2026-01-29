export enum RoleType {
  SOFTWARE_DEVELOPER = 'Software Developer'
}

export interface ApplicationFormData {
  firstName: string;
  lastName: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  gender: string;
  techStack: string[];
  yearsOfExperience: string;
  personalSites: string;
  isWorkingNow: string;
  isImmediatelyAvailable: string;
  compensationPreference: string;
  salaryExpectation: string;
  currency: string;
  portfolioSamples: string;
  location: string;
  lastFinishedProject: string;
  currentProject: string;
  email: string;
  phoneAreaCode: string;
  phoneNumber: string;
  appliedRole: RoleType;
}

export interface JobDetail {
  title: string;
  description: string;
  requirements: string[];
  equityTerms: string;
}