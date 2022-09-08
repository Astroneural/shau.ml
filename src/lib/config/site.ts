import type { SiteConfig } from '$lib/types/site'

export const site: SiteConfig = {
  protocol: 'https://',
  domain: import.meta.env.URARA_SITE_DOMAIN ?? 'shaum.ml',
  title: 'Shaum',
  subtitle: '',
  lang: 'en-US',
  description: 'My personal website',
  author: {
    name: 'Shaumprovo Debnath',
    photo: 'https://lh3.googleusercontent.com/a-/AFdZuco1-otaW8cEIh0nG-ZW8QS5pJkfIBapVlI-nzz6WQ=s432-p-rw-no',
    status: '📖', // other options include: 🍁🎱🔮🎶📖🖊☂❄ᓚᘏᗢ🌌🟣⚛ᨐ
    bio: 'Hello, world!'
  },
  themeColor: '#3D4451'
}
