export type Category = "cybersecurity" | "networking" | "development" | "ai-ml";

type IconKey = "github" | "linkedin" | "twitter" | "external" | "pdf" | "globe";

export interface Project {
  title: string;
  year: string;
  href?: string;
  external?: boolean;
  inProgress?: boolean;
  categories: Category[];
  modal?: string;
}

export interface ProjectModal {
  id: string;
  title: string;
  subtitle: string;
  links: { label: string; href: string; icon?: IconKey }[];
}

/* The id is the URL segment: /projects/<id>. */
export const categories: { id: Category; label: string }[] = [
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "networking", label: "Networking" },
  { id: "development", label: "Development" },
  { id: "ai-ml", label: "AI/ML" },
];

export const projects: Project[] = [
  {
    title: "This Portfolio",
    year: "2026",
    categories: ["development"],
    modal: "portfolio",
  },
  {
    title: "Mane: Native macOS Ad Blocker",
    year: "2026",
    href: "https://github.com/Abdulla-AlBassam/mane",
    external: true,
    categories: ["development", "cybersecurity"],
  },
  {
    title: "Murmur: On-Device Dictation for macOS",
    year: "2026",
    href: "https://github.com/Abdulla-AlBassam/murmur",
    external: true,
    categories: ["development", "ai-ml"],
  },
  {
    title: "AI Page Reader: Local Text-to-Speech in the Browser",
    year: "2026",
    href: "https://github.com/Abdulla-AlBassam/AI-Page-Reader",
    external: true,
    categories: ["development", "ai-ml"],
  },
  {
    title: "Web Workflow Automation: Record a Journey, Get an API Call",
    year: "2026",
    href: "https://github.com/Abdulla-AlBassam/web-workflow-automation",
    external: true,
    categories: ["development", "ai-ml"],
  },
  {
    title: "Pentest Agentic Workflow v1: Model-Agnostic AI Co-pilot",
    year: "2026",
    href: "https://github.com/Abdulla-AlBassam/network-pentest-copilot",
    external: true,
    categories: ["cybersecurity", "development"],
  },
  {
    title: "Pentest Agentic Workflow v2: Model-Agnostic AI Co-pilot",
    year: "2026 – present",
    inProgress: true,
    href: "https://github.com/Abdulla-AlBassam/pentest-agentic-workflow",
    external: true,
    categories: ["cybersecurity", "development", "ai-ml"],
  },
  {
    title: "URL Triage Agent: Autonomous Phishing Investigator",
    year: "2026",
    href: "https://github.com/Abdulla-AlBassam/url-triage-agent",
    external: true,
    categories: ["cybersecurity", "ai-ml"],
  },
  {
    title: "Local Email Server with a Cascade AI Spam Filter",
    year: "2026",
    categories: ["ai-ml", "cybersecurity"],
    modal: "email-server",
  },
  {
    title: "Sweaty: Social Gaming Platform",
    year: "2025 – present",
    inProgress: true,
    categories: ["development"],
    modal: "sweaty",
  },
  {
    title: "World Cup 2026 Match Predictor",
    year: "2026",
    categories: ["development"],
    modal: "world-cup",
  },
  {
    title: "Lean In: Politics for a Modern Audience",
    year: "2026",
    categories: ["development"],
    modal: "lean-in",
  },
  {
    title: "Penetration Testing: Vulnerable VM",
    year: "2026",
    categories: ["cybersecurity"],
  },
  {
    title: "Cyb: Gamified Cybersecurity Learning Platform",
    year: "2025",
    href: "https://github.com/Abdulla-AlBassam/cyb",
    external: true,
    categories: ["cybersecurity", "development"],
  },
  {
    title: "Cryptographic Transaction Protocol Design",
    year: "2026",
    href: "/projects/docs/cryptographic-protocol.pdf",
    external: true,
    categories: ["cybersecurity"],
  },
  {
    title: "Enterprise Networking: Segmented WAN with Selective IPsec",
    year: "2025",
    href: "/projects/docs/enterprise-wan.pdf",
    external: true,
    categories: ["networking"],
  },
  {
    title: "Digital Forensics: Timeline Reconstruction",
    year: "2025",
    href: "/projects/docs/digital-forensics.pdf",
    external: true,
    categories: ["cybersecurity"],
  },
  {
    title: "Client Audit + Security Assessment Report",
    year: "2025",
    categories: ["cybersecurity"],
  },
  {
    title: "Networking: Secure VLAN Routing + Layer-2 Hardening",
    year: "2024",
    href: "/projects/docs/secure-vlan.pdf",
    external: true,
    categories: ["networking"],
  },
  {
    title: "Qualitative Study: Young-Adult Security Literacy",
    year: "2024",
    href: "/projects/docs/qualitative-study.pdf",
    external: true,
    categories: ["cybersecurity"],
  },
].sort((a, b) => sortKey(b.year) - sortKey(a.year));

function sortKey(year: string): number {
  if (/present|current/i.test(year)) return 9999;
  const matches = year.match(/\d{4}/g);
  return matches ? Math.max(...matches.map(Number)) : 0;
}

export const modals: ProjectModal[] = [
  {
    id: "portfolio",
    title: "This Portfolio",
    subtitle: "Astro static site on Vercel, self-assessed for security",
    links: [
      { label: "GitHub", href: "https://github.com/Abdulla-AlBassam/Portfolio", icon: "github" },
      { label: "Vulnerability Assessment", href: "/projects/docs/vulnerability-assessment.pdf", icon: "pdf" },
    ],
  },
  {
    id: "email-server",
    title: "Local Email Server with a Cascade AI Spam Filter",
    subtitle: "Dissertation project: hardened SMTP/IMAP stack with multi-stage AI filtering",
    links: [
      { label: "Thesis", href: "/projects/docs/dissertation.pdf", icon: "pdf" },
      { label: "GitHub", href: "https://github.com/Abdulla-AlBassam/mini-mail", icon: "github" },
    ],
  },
  {
    id: "sweaty",
    title: "Sweaty",
    subtitle: "A social platform for gamers · in active development",
    links: [
      { label: "sweatyapp.com", href: "https://sweatyapp.com", icon: "globe" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/abdulla-albassam/overlay/experience/2864877680/multiple-media-viewer/?profileId=ACoAAF0wWosB-M5smshM0TcBM7F127DOES9M6N8&treasuryMediaId=1773201904530", icon: "linkedin" },
      { label: "X / Twitter", href: "https://x.com/sweatyapp", icon: "twitter" },
    ],
  },
  {
    id: "world-cup",
    title: "World Cup 2026 Match Predictor",
    subtitle: "Predict every match of the 2026 World Cup; the whole bracket lives in the shareable URL",
    links: [
      { label: "Live site", href: "https://world-cup-2026-prediction-kappa.vercel.app", icon: "globe" },
      { label: "GitHub", href: "https://github.com/Abdulla-AlBassam/world-cup-2026-prediction", icon: "github" },
    ],
  },
  {
    id: "lean-in",
    title: "Lean In",
    subtitle: "Every UK party's manifesto position on any policy topic, quoted with page numbers",
    links: [
      { label: "Live site", href: "https://lean-in-ten.vercel.app", icon: "globe" },
      { label: "GitHub", href: "https://github.com/Abdulla-AlBassam/lean-in", icon: "github" },
    ],
  },
];
