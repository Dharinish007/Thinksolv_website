// Single source of truth for company facts, nav, and reusable CTA copy.
// Facts marked CONFIRM are unverified — do not present as final without sign-off.

export const site = {
  name: 'ThinkSolv',
  legalName: 'Thinksolv Technologies', // CONFIRM exact legal entity name
  tagline: 'Building software, thoughtfully.',
  description:
    'ThinkSolv builds focused Chrome extensions and Google Workspace apps for document-centric work — designed for clarity, deep integration, and little to no learning curve.',
  url: 'https://www.thinksolv.com',
  founded: 2022,
  location: 'India', // CONFIRM city / registered address
  email: 'hello@thinksolv.com', // CONFIRM primary contact address
  docsUrl: 'https://docs.thinksolv.com', // CONFIRM
  social: {
    // CONFIRM handles / remove any that don't exist
    linkedin: '',
    x: '',
    chromeStore: '',
  },
} as const;

export const cta = {
  primary: { label: 'Talk to Us', href: '/contact' },
  secondary: { label: 'Explore Products', href: '/products' },
} as const;

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

// Proof metrics. Only `users` is sourced from the live site; the rest are CONFIRM.
export const metrics = [
  { value: 150000, suffix: '+', label: 'Users globally', confirm: false },
  { value: 6, suffix: '', label: 'Products shipped', confirm: true },
  { value: 2022, suffix: '', label: 'Building since', confirm: false, raw: true },
  { value: 7, suffix: '', label: 'People on the team', confirm: false },
] as const;

// Company timeline — sourced from the provided brief.
export const timeline = [
  { year: '2022', title: 'ThinkSolv begins', body: 'Founded as a one-person company with a first-principles approach to everyday software.' },
  { year: '2023', title: 'A second builder', body: 'The team grows to two, deepening focus on the Google Workspace and Chrome ecosystem.' },
  { year: '2024', title: 'Product ecosystem grows', body: 'Document-centric tools expand across Docs, Sheets and Drive workflows.', confirm: true }, // CONFIRM specifics — hidden until verified
  { year: '2026', title: 'A team of seven', body: 'Founder/CEO, technical and marketing functions supporting 150,000+ users.' },
] as const;

export const values = [
  { title: 'Simplicity by intent', body: 'Complexity is easy. We choose simplicity deliberately, because it lowers mental overhead for the people using our tools.' },
  { title: 'First principles', body: 'We understand the real problem before choosing tools or architectures — often the best fix is removing the task entirely.' },
  { title: 'Built to last', body: 'We favor long-term utility over short-term novelty, shipping software that stays reliable at scale.' },
  { title: 'Out of the way', body: 'When a tool fades into the background and just works, it is doing exactly what it should.' },
] as const;
