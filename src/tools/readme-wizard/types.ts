export type WizardMode = 'user' | 'project'

export interface TechItem {
  name: string
  url: string
}

export interface UserState {
  bioText: string
  jobTitle: string
  workplace: string
  currentlyLearning: string
  socials: Record<string, string>
  techStack: TechItem[]
}

export interface BadgeConfig {
  stars: boolean
  forks: boolean
  issues: boolean
  prs: boolean
  license: boolean
  lastCommit: boolean
  contributors: boolean
  custom: string[]
}

export interface ProjectState {
  name: string
  description: string
  repoUrl: string
  owner: string
  repo: string
  badges: BadgeConfig
  sections: { features: string; install: string; usage: string }
  techStack: TechItem[]
  licenseText: string
}

export interface SocialMeta {
  key: string
  label: string
  badge: string
  normalize: (id: string) => string
  url: (id: string) => string
}
