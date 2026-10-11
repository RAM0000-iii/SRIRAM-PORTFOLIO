import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.resolve(__dirname, 'data');
const PROJECTS_FILE = path.join(DB_DIR, 'projects.json');
const ADMIN_FILE = path.join(DB_DIR, 'admin.json');

export interface ProjectRecord {
  id: string;
  title: string;
  category: string;
  videoPath: string;
  thumbnailPath: string;
  description: string;
  techniques: string[];
  date: string;
  externalLink: string;
}

export interface AdminRecord {
  adminPin: string;
  updatedAt: string;
}

function ensureDB(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function getAllProjects(): ProjectRecord[] {
  ensureDB();
  if (!fs.existsSync(PROJECTS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects database:', err);
    return [];
  }
}

export function saveAllProjects(projects: ProjectRecord[]): void {
  ensureDB();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

export function createProject(project: ProjectRecord): ProjectRecord {
  const current = getAllProjects();
  const updated = [project, ...current];
  saveAllProjects(updated);
  return project;
}

export function updateProjectById(id: string, updates: Partial<ProjectRecord>): ProjectRecord | null {
  const current = getAllProjects();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;
  current[index] = { ...current[index], ...updates };
  saveAllProjects(current);
  return current[index];
}

export function deleteProjectById(id: string): boolean {
  const current = getAllProjects();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  saveAllProjects(filtered);
  return true;
}

export function getAdminSettings(): AdminRecord {
  ensureDB();
  if (!fs.existsSync(ADMIN_FILE)) {
    return { adminPin: '121314161820', updatedAt: new Date().toISOString() };
  }
  try {
    const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { adminPin: '121314161820', updatedAt: new Date().toISOString() };
  }
}

export function updateAdminPin(newPin: string): void {
  ensureDB();
  const record: AdminRecord = {
    adminPin: newPin,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(record, null, 2), 'utf-8');
}
