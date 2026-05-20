import type { UserState, ProjectState } from './types'
import { SOCIALS } from './socials'

export function generateUserReadme(state: UserState): string {
  const bio = [
    state.bioText.trim(),
    state.jobTitle ? `**Current role:** ${state.jobTitle}` : '',
    state.workplace ? `**Company:** ${state.workplace}` : '',
    state.currentlyLearning ? `**Learning:** ${state.currentlyLearning}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const socialBadges = SOCIALS.filter((s) => state.socials[s.key]?.trim())
    .map((s) => {
      const id = s.normalize(state.socials[s.key])
      const href = s.url(id)
      return `[![${s.label}](${s.badge})](${href})`
    })
    .join(' ')

  const techSection =
    state.techStack.length > 0
      ? state.techStack.map((t) => `![${t.name}](${t.url})`).join(' ')
      : '(no tech stack selected)'

  return [
    '## Bio',
    bio || '(add a bio above)',
    '',
    socialBadges || '(no socials selected)',
    '',
    '#### Tech Stack',
    techSection,
    '',
    '<!-- Proudly created with DevKit README Wizard -->',
  ].join('\n')
}

export function generateProjectReadme(state: ProjectState): string {
  const base = 'https://img.shields.io'
  const { owner, repo } = state

  const badges = [
    state.badges.stars && `![Stars](${base}/github/stars/${owner}/${repo}?style=for-the-badge)`,
    state.badges.forks && `![Forks](${base}/github/forks/${owner}/${repo}?style=for-the-badge)`,
    state.badges.issues && `![Issues](${base}/github/issues/${owner}/${repo}?style=for-the-badge)`,
    state.badges.prs && `![PRs](${base}/github/issues-pr/${owner}/${repo}?style=for-the-badge)`,
    state.badges.license && `![License](${base}/github/license/${owner}/${repo}?style=for-the-badge)`,
    state.badges.lastCommit &&
      `![Last Commit](${base}/github/last-commit/${owner}/${repo}?style=for-the-badge)`,
    state.badges.contributors &&
      `![Contributors](${base}/github/contributors/${owner}/${repo}?style=for-the-badge)`,
    ...state.badges.custom.map((u) => `![Custom](${u})`),
  ]
    .filter(Boolean)
    .join(' ')

  const techSection =
    state.techStack.length > 0
      ? state.techStack.map((t) => `![${t.name}](${t.url})`).join(' ')
      : ''

  return [
    `# ${state.name || state.repo || 'My Project'}`,
    '',
    badges,
    '',
    state.description || '(short description here)',
    '',
    techSection ? `## Tech Stack\n\n${techSection}\n` : '',
    '## Features',
    state.sections.features || '- Feature 1',
    '',
    '## Installation',
    '```bash',
    state.sections.install || 'npm install',
    '```',
    '',
    '## Usage',
    '```bash',
    state.sections.usage || 'npm run dev',
    '```',
    '',
    '## License',
    state.licenseText || 'MIT — see LICENSE file',
    '',
    '<!-- Proudly created with DevKit README Wizard -->',
  ]
    .filter((line) => line !== null)
    .join('\n')
}
