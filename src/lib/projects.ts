import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;

export async function getOrderedProjects(): Promise<Project[]> {
  const all = await getCollection("projects");
  return all.sort((a, b) => a.data.order - b.data.order);
}

export function projectHref(project: Project): string {
  return project.data.href ?? `/work/${project.id}`;
}

/** Entries that render their own /work/[slug] case-study page. */
export async function getCaseStudyProjects(): Promise<Project[]> {
  const ordered = await getOrderedProjects();
  return ordered.filter((p) => !p.data.href);
}

export async function getNextCaseStudy(slug: string): Promise<Project> {
  const caseStudies = await getCaseStudyProjects();
  const index = caseStudies.findIndex((p) => p.id === slug);
  return caseStudies[(index + 1) % caseStudies.length];
}
