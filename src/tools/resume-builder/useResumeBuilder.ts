import { useState } from 'react'
import type { ResumeData, PdfConfig } from './types'

const DEFAULT_RESUME: ResumeData = {
  contact: {
    fullName: 'Leonardo Espinosa',
    headline: 'Quality Architect & Tech Lead | Fintech · Cloud · Distributed Systems',
    phone: '(+52) 123 456 789',
    email: 'leointhecode@gmail.com',
    location: 'CDMX, MX',
    website: 'https://leonardespi.me',
    linkedin: 'https://www.linkedin.com/in/leonardespi',
  },
  education: [
    { school: 'UNAM',    degree: 'Computer Science',                                startDate: '2021', endDate: '2025',     notes: 'GPA: 3.7/4.0',      location: 'CDMX, MX' },
    { school: 'UNAM',    degree: 'B.Sc. Lengua y Literatura Española',              startDate: '2020', endDate: '2025',     notes: 'GPA: 4.0/4.0',      location: 'CDMX, MX' },
    { school: 'UTEL',    degree: 'B.Eng. Computational Systems',                    startDate: '2021', endDate: '2025',     notes: 'GPA: 3.8/4.0',      location: 'CDMX, MX' },
    { school: 'McGill',  degree: 'French Academic Skills, French Studies',          startDate: '2023', endDate: '2023',     notes: '',                   location: 'Montreal'  },
    { school: 'ISTQB',   degree: 'Certified Tester Foundation Level (CTFL)',        startDate: '2024', endDate: '2024',     notes: '100%',               location: 'CDMX, MX' },
    { school: 'Google',  degree: 'Google Cloud Computing Foundations',              startDate: '2024', endDate: '2024',     notes: '100%',               location: 'Remote'    },
    { school: 'Postman', degree: 'Postman API Fundamentals Student Expert',         startDate: '2024', endDate: '2024',     notes: '100%',               location: 'Remote'    },
    { school: 'Google',  degree: 'BigQuery: Analytics & Machine Learning',          startDate: '2021', endDate: '2021',     notes: '100% & 4th place',   location: 'Google CDMX' },
  ],
  experience: [
    {
      company: 'Clip', title: 'Tech Lead & Quality Architect',
      startDate: 'Jan 2026', endDate: 'Present', location: 'CDMX',
      bullets: [
        'Architect technical strategy and quality systems for one of Mexico\'s largest payments platforms, serving millions of merchants',
        'Partner with Architecture Design, Business, and Growth units to evaluate technical feasibility and ROI — translating architectural trade-offs into investment decisions',
        'Lead end-to-end governance across distributed engineering teams in China and Argentina, synchronizing release cycles and aligning testing strategy with system design',
        'Architect data integrity frameworks for sharded database environments handling high-volume fintech transactions, using SQL-driven validation layered into Java and TestNG tooling',
        'Design scalable automation suites that double as architectural verification — proving system behavior under load, latency constraints, and failure modes before production',
      ].join('\n'),
    },
    {
      company: 'Zurich Insurance', title: 'Tech Lead & Quality Architect',
      startDate: 'Apr 2025', endDate: 'Dec 2025', location: 'Mexico City',
      bullets: [
        'Owned architectural quality strategy for enterprise insurance releases on Guidewire across legacy and modern product workflows',
        'Designed standardized Gherkin and SQL frameworks that doubled as architectural validation, accelerating stakeholder feedback loops and reducing release risk',
        'Architected Azure DevOps CI/CD quality gates across all releases, governing migration of legacy test estates into a unified modern environment',
        'Pioneered LLM model testing using red-teaming and adversarial techniques to evaluate output reliability, safety, and bias — laying groundwork for AI governance at the org level',
        'Led a team of 5 engineers in an Agile environment, mentoring on systems thinking and architectural decision-making',
      ].join('\n'),
    },
    {
      company: 'Capmation Inc.', title: 'SDET & DevOps Engineer | Solutions Consultant',
      startDate: 'Jun 2024', endDate: 'Jun 2025', location: 'Remote',
      bullets: [
        'Embedded as technical consultant across enterprise clients in automotive, insurance, and SaaS sectors — designing CI/CD infrastructure and test architectures for systems with millions of end users',
        'Engineered CI/CD pipelines on Azure DevOps and Jenkins that reduced defect detection time by 60% and shortened release cycles for distributed engineering teams',
        'Architected automation frameworks across CodeceptJS, Appium, Robot Framework, and Selenium — cut manual regression effort by 4 hours/sprint and improved new-product test velocity by 30%',
        'Designed test plans and architectural validation strategies reaching 95% requirements coverage with zero critical defects escaping to production',
        'Led a team of 5 engineers in Agile environments — mentored new hires, standardized onboarding, and cut ramp-up time by 50%. Embedded accessibility and UX audits (AXE DevTools) into the delivery pipeline',
      ].join('\n'),
    },
    {
      company: 'Keywords Studios', title: 'Test Engineer / Project Lead',
      startDate: 'Nov 2022', endDate: 'Feb 2024', location: 'CDMX',
      bullets: [
        'Led quality engineering for high-traffic AAA game titles, delivering technical reports and architectural feedback under strict publisher deadlines',
        'Led a team of 5 engineers across functional, regression, and localization testing for major and minor releases — ensuring product quality across multiple platforms and regions',
        'Co-designed test plans and strategies that reduced regression cycle time by 40%, freeing capacity for exploratory and architectural validation work',
        'Spearheaded an AI-driven testing pilot evaluating architecture, efficiency, and ethical implications of internal LLM tooling',
        'Delivered comprehensive technical reports to publishers, translating engineering findings into business-readable risk assessments',
      ].join('\n'),
    },
    {
      company: 'UNAM', title: 'Software Engineer (Automation & Backend Systems)',
      startDate: 'Dec 2019', endDate: 'Nov 2022', location: 'CDMX',
      bullets: [
        'Architected scalable backend systems and automation tooling for one of Latin America\'s largest universities across legacy infrastructure and modern web services',
        'Designed Flask-based web systems and RESTful APIs with a focus on data integrity, modularity, and clean separation of concerns',
        'Engineered Python automation (Selenium-driven) that eliminated 6+ hours/week of manual operational work',
        'Managed Debian-based Linux server environments — handled deployment, monitoring, and incident response for production services',
        'Built RESTful integration layers connecting internal systems, reducing duplicate data flows and improving cross-department reliability',
      ].join('\n'),
    },
  ],
  projects: [
    {
      name: 'Valua',
      url: 'https://github.com/leonardespi/valua',
      description: 'valua is a professional, fast transpiler engineered to resolve runtime fragmentation within the Lua ecosystem. It translates modern Lua 5.5 source code into compatible Lua 5.1 streams, designed for native high-velocity execution under LuaJIT.',
    },
    {
      name: 'Politics QA',
      url: 'https://polqa-framework.github.io/polqa-site/',
      description: 'A modular CLI framework to evaluate LLM outputs with reproducible runs, curated datasets, and prompt variants—covering both functional and qualitative criteria.',
    },
    {
      name: 'Blog',
      url: 'https://www.leonardespi.me/',
      description: 'Personal website built using Astro & Typescript and maintained on Github Pages.',
    },
  ],
  skills: [
    'Python, Java, Typescript, Lua, SQL',
    'Selenium, Robot Framework, Appium, TestNG, CodeceptJS, Cucumber, Pytest, Playwright',
    'Postman, SoapUI, JMeter, native infrastructure creation',
    'Azure DevOps, Jenkins, GitHub Actions, Docker, Kubernetes',
    'Google Cloud Platform (GCP), Azure, Distributed Systems, Sharded Databases',
    'Solutions Architecture, Payments Infrastructure, E2E Architecture',
    'LLM Red-Teaming, Adversarial Testing, AI/LLM Evaluation, Bias Testing',
    'Jira, Confluence, TestRail, Xray, Zephyr, Gherkin',
    'Flask, REST APIs, Linux',
  ].join('\n'),
  sectionOrder: ['education', 'experience', 'projects', 'skills'] as const,
}

const DEFAULT_CONFIG: PdfConfig = {
  fontSize: 10.5,
  asLinks: { email: true, linkedin: true, website: true },
}

export function useResumeBuilder() {
  const [form, setForm] = useState<ResumeData>(DEFAULT_RESUME)
  const [compiled, setCompiled] = useState<ResumeData | null>(DEFAULT_RESUME)
  const [config, setConfig] = useState<PdfConfig>(DEFAULT_CONFIG)

  const compile = () => setCompiled(JSON.parse(JSON.stringify(form)))

  return { form, setForm, compiled, compile, config, setConfig }
}
