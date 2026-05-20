import { useState } from 'react'
import type { ResumeData, PdfConfig } from './types'

const DEFAULT_RESUME: ResumeData = {
  contact: {
    fullName: 'Leonardo Espinosa',
    headline: 'Automation Test Lead',
    phone: '+52 55 1234 5678',
    email: 'leointhecode@gmail.com',
    location: 'CDMX, MX',
    website: 'https://leonardespi.me',
    linkedin: 'https://www.linkedin.com/in/leonardespi',
  },
  education: [
    { school: 'UNAM',    degree: 'B.Sc. Linguistics',                            startDate: '2025', endDate: 'Present', notes: 'GPA: 4.0/4.0', location: 'CDMX, MX' },
    { school: 'COS',     degree: 'A.Sc. Informatics',                            startDate: '2017', endDate: '2019',    notes: 'GPA: 3.9/4.0', location: 'CDMX, MX' },
    { school: 'UTEL',    degree: 'B.Sc. Computer Engineering',                   startDate: '2021', endDate: '2025',    notes: 'GPA: 3.8/4.0', location: 'CDMX, MX' },
    { school: 'ISTQB',   degree: 'Certified Tester Foundation Level (CTFL)',     startDate: '2024', endDate: '2024',    notes: '100%',         location: 'CDMX, MX' },
    { school: 'Google',  degree: 'Google Cloud Computing Foundations',           startDate: '2024', endDate: '2024',    notes: '100%',         location: 'Remote'    },
    { school: 'Postman', degree: 'Postman API Fundamentals Student Expert',      startDate: '2024', endDate: '2024',    notes: '100%',         location: 'Remote'    },
    { school: 'Google',  degree: 'BigQuery: Analytics & Machine Learning',       startDate: '2021', endDate: '2021',    notes: '100% & 4th place', location: 'Google CDMX' },
  ],
  experience: [
    {
      company: 'Zurich Insurance', title: 'L4 Test Automation Lead',
      startDate: 'Jun 2025', endDate: 'Present', location: 'Hybrid',
      bullets: [
        'Automated testing with Python, Selenium and Guidewire',
        'Manually tested complex insurance workflows on tight deadlines',
        'Performed testing on LLM Model with red teaming techniques',
        'Used Azure DevOps pipeline to ensure CI / CD',
        'Performed regression testing for minor and major releases',
        'Migrated legacy test cases to a new environment',
        'Led a QA team of 3 in Agile Development',
      ].join('\n'),
    },
    {
      company: 'Applica Inc', title: 'L3 Test Automation Engineer',
      startDate: 'Jun 2024', endDate: 'Jun 2025', location: 'Remote',
      bullets: [
        'Automated testing with CodeceptJS, Appium, Robot Framework, and Selenium — cut manual effort by 4 hours/sprint',
        'Improved test speed by 30% on new products via TestRail-based plans and cases',
        'Designed test plan and strategy reaching 95% of requirements coverage with zero critical defects escaping prod',
        'Ran cross-browser/device tests with Sauce Labs to ensure consistent UX',
        'Logged and tracked 300+ defects, contributing to a 30% reduction in post-release critical bugs',
        'Conducted UX testing with AXE devtools to validate usability and accessibility for vulnerable communities',
        'Built fintech-focused automation frameworks — boosted script reuse and maintainability',
        'Built and maintained CI/CD pipelines with Azure DevOps & Jenkins — sped up defect detection by 60%',
        'Led a team of 5 test engineers in Agile envs — ensured timely delivery of quality deliverables',
        'Mentored new hires, standardized QA processes — cut ramp-up time by 50%',
      ].join('\n'),
    },
    {
      company: 'Wipro', title: 'L2 Test Automation Engineer',
      startDate: 'Feb 2024', endDate: 'Jun 2024', location: 'On site',
      bullets: [
        'Automated regression tests with Selenium, Cucumber (BDD), and Slash — cut test time by 20%',
        'Built API tests in Postman to ensure backend reliability',
        'Mentored 4 junior QAs — boosted team\'s automation skills',
      ].join('\n'),
    },
    {
      company: 'Keywords Studios', title: 'L2 Test Automation Engineer',
      startDate: 'Nov 2022', endDate: 'Feb 2024', location: 'On site',
      bullets: [
        'Led manual QA for high-traffic game titles — ensured functional & localization quality',
        'Executed full regression testing for major and minor patches and releases',
        'Assisted on design of test plan and strategy reducing regression cycle time by 40%',
        'Piloted AI-driven testing for internal tools — evaluated efficiency and ethical implications',
      ].join('\n'),
    },
    {
      company: 'UNAM', title: 'L1 Automation Engineer',
      startDate: 'Aug 2020', endDate: 'Nov 2022', location: 'On site',
      bullets: [
        'Developed Selenium scripts in Python — saved 6 hours/week in manual tasks',
        'Created RESTful APIs for seamless system integration',
        'Worked on debian based Linux servers',
      ].join('\n'),
    },
  ],
  projects: [
    {
      name: 'Politics QA',
      url: 'https://polqa-framework.github.io/polqa-site/',
      description: 'A modular CLI framework to evaluate LLM outputs with reproducible runs, curated datasets, and prompt variants—covering both functional and qualitative criteria.',
    },
    {
      name: 'README Wizard',
      url: 'https://www.leonardespi.me/readme-wizard/',
      description: 'Generate a clean, minimal README (User or Project) that helps you craft professional, elegant markdowns without clutter — simple, structured, and beautiful.',
    },
    {
      name: 'Resume Builder',
      url: 'https://www.leonardespi.me/resume-builder/',
      description: 'A web application to create Harvard-style, ATS-friendly resumes with pixel-precise PDF export.',
    },
    {
      name: 'Blog',
      url: 'https://www.leonardespi.me/',
      description: 'Personal website built using Jekyll & Ruby and maintained on Github Pages.',
    },
  ],
  skills: [
    'Python, Java, JavaScript, Lua (basic)',
    'Selenium, Robot-Framework, Appium, Pytest, CodeceptJS, Cucumber, Cypress',
    'Postman, SoapUI, JMeter',
    'Git, Jenkins, Azure DevOps, Github Actions, Docker, Kubernetes',
    'Google Cloud Platform, Azure DevOps, Big Data GC',
    'Adversarial Testing, Red-team Testing, Bias Testing',
    'SQL Databases, PostgreSQL, Big Data Concepts',
    'Strategy & plan design, Jira, Confluence, TestRail, Xray, Zephyr',
  ].join('\n'),
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
