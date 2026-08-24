export type ProjectMediaRole = 'before' | 'during' | 'after' | 'general';
export type ProjectPublicationState = 'draft' | 'approved' | 'archived';

export interface FutureProjectPhoto {
  mediaRef: string;
  role: ProjectMediaRole;
  publicEligible: boolean;
}

export interface FutureProjectRecord {
  id: string;
  slug: string;
  serviceTags: string[];
  city?: string;
  region?: string;
  projectType?: string;
  completedOn?: string;
  description?: string;
  tags?: string[];
  publicationState: ProjectPublicationState;
  websitePermission: boolean;
  highlighted?: boolean;
  presentationPriority?: number;
  photos: FutureProjectPhoto[];
}

export const canDisplayProject = (project: FutureProjectRecord) => project.publicationState === 'approved' && project.websitePermission;

export const selectHomepageProjects = (projects: FutureProjectRecord[]) => projects
  .filter(canDisplayProject)
  .sort((a, b) => Number(Boolean(b.highlighted)) - Number(Boolean(a.highlighted)) || (b.presentationPriority ?? 0) - (a.presentationPriority ?? 0) || (b.completedOn ?? '').localeCompare(a.completedOn ?? ''));

export const selectServiceProjects = (projects: FutureProjectRecord[], serviceSlug: string) => projects
  .filter((project) => canDisplayProject(project) && project.serviceTags.includes(serviceSlug))
  .sort((a, b) => (b.presentationPriority ?? 0) - (a.presentationPriority ?? 0) || (b.completedOn ?? '').localeCompare(a.completedOn ?? ''));

// East Coast Foam currently has owner-authorized service imagery, but no verified
// publishable project records. Public components deliberately use that imagery as
// service photography until a record passes the contract and permission checks.
export const currentPublicProjects: FutureProjectRecord[] = [];
