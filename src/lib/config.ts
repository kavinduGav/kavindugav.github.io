export const siteConfig = {
  name: "Kavindu Gavesha",
  initials: "KG",
  title: "Kavindu Gavesha · Software Engineer",
  description:
    "Associate Software Engineer building backend, full-stack and Flutter mobile systems at OREL Group, Colombo.",
  url: "https://kavindugav.github.io",
  email: "kavindugav@gmail.com",
  location: "Colombo, LK",
  social: {
    github: "https://github.com/kavindugav",
    linkedin: "https://linkedin.com/in/kavindu-gavesha-027335161",
  },
  resumeUrl: "/Kavindu_Gavesha_Resume.pdf",
  stats: {
    // Single place to bump this as more systems ship.
    enterpriseSystems: "10+",
  },
  research: {
    // Flip to true once the IJACSA paper has a live link, and set paperUrl.
    paperPublished: false,
    paperUrl: "#",
    citation:
      "K. Gavesha, \"AI/ML-Based Biometric Identification for Canine Recognition,\" International Journal of Advanced Computer Science and Applications (IJACSA), accepted for publication, 2026.",
  },
  forms: {
    // Public Web3Forms access key — safe to expose client-side.
    web3formsKey: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? "",
  },
} as const;

export interface NavLink {
  href: string;
  label: string;
  accent?: boolean;
}

export const navLinks: NavLink[] = [
  { href: "/", label: "Work" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Let's talk", accent: true },
];
