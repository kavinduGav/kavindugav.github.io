// Placeholder project data for the Home grid and (soon) the /work/[slug] template.
// This will move into a src/content/projects/*.md collection in the next build step;
// the shape stays the same so pages using it won't need to change.

export type ProjectCategory = "Web" | "Mobile" | "Research";

export interface Project {
  slug: string;
  title: string;
  description: string;
  tag: string;
  category: ProjectCategory;
  media: string;
  /** Where the Home card links — a /work/ page, or straight out to /research. */
  href: string;
}

export const projects: Project[] = [
  {
    slug: "warehouse-management-system",
    title: "Warehouse Management System",
    description: "SAP integration, delivery scheduling, dashboards",
    tag: "Next.js",
    category: "Web",
    media: "video demo: operator flow (data blurred)",
    href: "/work/warehouse-management-system",
  },
  {
    slug: "orel-mobile-suite",
    title: "OREL Mobile Suite",
    description: "i'OREL · Rewards · Rep · 3,000+ daily users",
    tag: "Flutter",
    category: "Mobile",
    media: "phone recording",
    href: "/work/orel-mobile-suite",
  },
  {
    slug: "canine-biometric-id",
    title: "Canine Biometric ID",
    description: "Nose-print ML · IJACSA 2026",
    tag: "AI/ML",
    category: "Research",
    media: "model diagram",
    href: "/research",
  },
  {
    slug: "crm-system",
    title: "CRM System",
    description: "Dynamic workflows, DMS, JWT, RBAC",
    tag: "Microservices",
    category: "Web",
    media: "screenshot: workflows",
    href: "/work/crm-system",
  },
  {
    slug: "orel-insights",
    title: "OREL Insights",
    description: "Cross-system dashboards and exports",
    tag: "React",
    category: "Web",
    media: "screenshot: random data",
    href: "/work/orel-insights",
  },
  {
    slug: "learning-management-system",
    title: "Learning Management System",
    description: "Courses, submissions, grading",
    tag: "Next.js",
    category: "Web",
    media: "screenshot: grading",
    href: "/work/learning-management-system",
  },
];

/** The /work/[slug] pages only — excludes Research, which links straight to /research. */
export const workProjects = projects.filter((p) => p.href.startsWith("/work/"));

export function nextWorkProject(slug: string): Project {
  const index = workProjects.findIndex((p) => p.slug === slug);
  return workProjects[(index + 1) % workProjects.length];
}
