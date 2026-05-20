export type Contact = {
  fullName: string;
  headline?: string;
  phone?: string;
  email?: string;
  location?: string;
  website?: string;
  linkedin?: string;
};

export type EducationItem = {
  school: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  location?: string;
};

export type ExperienceItem = {
  company: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  bullets?: string; // newline separated
};

export type ProjectItem = {
  name: string;
  url?: string;
  description?: string; // newline separated
};

export type ResumeData = {
  contact: Contact;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: string; // comma separated
};

export type PdfConfig = {
  fontSize: number; // 9..12 typical
  asLinks: {
    email: boolean;
    linkedin: boolean;
    website: boolean;
  };
};
