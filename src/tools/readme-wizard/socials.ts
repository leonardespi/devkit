import type { SocialMeta } from './types'

export const SOCIALS: SocialMeta[] = [
  {
    key: 'bluesky', label: 'Bluesky',
    badge: 'https://img.shields.io/badge/bluesky-0285FF?style=for-the-badge&logo=bluesky&logoColor=%23FFFFFF',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://bsky.app/profile/${id}`,
  },
  {
    key: 'linkedin', label: 'LinkedIn',
    badge: 'https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://linkedin.com/in/${id}`,
  },
  {
    key: 'x', label: 'X (Twitter)',
    badge: 'https://img.shields.io/badge/X-black.svg?style=for-the-badge&logo=X&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://x.com/${id}`,
  },
  {
    key: 'github', label: 'GitHub',
    badge: 'https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://github.com/${id}`,
  },
  {
    key: 'instagram', label: 'Instagram',
    badge: 'https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://instagram.com/${id}`,
  },
  {
    key: 'youtube', label: 'YouTube',
    badge: 'https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white',
    normalize: (id) => (id.startsWith('@') ? id : `@${id}`),
    url: (id) => `https://youtube.com/${id}`,
  },
  {
    key: 'twitch', label: 'Twitch',
    badge: 'https://img.shields.io/badge/Twitch-%239146FF.svg?style=for-the-badge&logo=Twitch&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://twitch.tv/${id}`,
  },
  {
    key: 'discord', label: 'Discord',
    badge: 'https://img.shields.io/badge/Discord-%237289DA.svg?style=for-the-badge&logo=discord&logoColor=white',
    normalize: (id) => id.trim(),
    url: (id) => `https://discord.gg/${id}`,
  },
  {
    key: 'reddit', label: 'Reddit',
    badge: 'https://img.shields.io/badge/Reddit-%23FF4500.svg?style=for-the-badge&logo=Reddit&logoColor=white',
    normalize: (id) => id.replace(/^u\//, ''),
    url: (id) => `https://reddit.com/user/${id}`,
  },
  {
    key: 'medium', label: 'Medium',
    badge: 'https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white',
    normalize: (id) => (id.startsWith('@') ? id.slice(1) : id),
    url: (id) => `https://medium.com/@${id}`,
  },
  {
    key: 'stackoverflow', label: 'Stack Overflow',
    badge: 'https://img.shields.io/badge/-Stackoverflow-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white',
    normalize: (id) => id.trim(),
    url: (id) => `https://stackoverflow.com/users/${id}`,
  },
  {
    key: 'codepen', label: 'CodePen',
    badge: 'https://img.shields.io/badge/Codepen-000000?style=for-the-badge&logo=codepen&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://codepen.io/${id}`,
  },
  {
    key: 'behance', label: 'Behance',
    badge: 'https://img.shields.io/badge/Behance-1769ff?style=for-the-badge&logo=behance&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://behance.net/${id}`,
  },
  {
    key: 'mastodon', label: 'Mastodon',
    badge: 'https://img.shields.io/badge/-MASTODON-%232B90D9?style=for-the-badge&logo=mastodon&logoColor=white',
    normalize: (id) => id.trim(),
    url: (id) => {
      if (id.includes('/')) return `https://${id.replace(/^https?:\/\//, '')}`
      const handle = id.startsWith('@') ? id : `@${id}`
      return `https://mastodon.social/${handle}`
    },
  },
  {
    key: 'patreon', label: 'Patreon',
    badge: 'https://img.shields.io/badge/Patreon-000000?style=for-the-badge&logo=patreon&logoColor=white',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://www.patreon.com/${id}`,
  },
  {
    key: 'buymeacoffee', label: 'Buy Me a Coffee',
    badge: 'https://img.shields.io/badge/buymeacoffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=000',
    normalize: (id) => id.replace(/^@/, ''),
    url: (id) => `https://www.buymeacoffee.com/${id}`,
  },
  {
    key: 'email', label: 'Email',
    badge: 'https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white',
    normalize: (id) => id.trim(),
    url: (id) => `mailto:${id}`,
  },
]

export const SOCIAL_BY_KEY = Object.fromEntries(SOCIALS.map((s) => [s.key, s]))
export const EMPTY_SOCIALS = Object.fromEntries(SOCIALS.map((s) => [s.key, '']))
