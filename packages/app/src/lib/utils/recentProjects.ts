/**
 * Utilities for managing recent projects in localStorage
 */

export interface RecentProject {
  /** Project title from clap metadata */
  title: string
  /** File name used when saving */
  fileName: string
  /** Timestamp when last opened/saved */
  lastAccessed: number
  /** File handle if available (for File System Access API) */
  fileHandle?: FileSystemFileHandle
}

const STORAGE_KEY = 'clapper-recent-projects'
const MAX_RECENT_PROJECTS = 10

/**
 * Get all recent projects from localStorage
 */
export function getRecentProjects(): RecentProject[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const projects: RecentProject[] = JSON.parse(stored)
    // Sort by most recent first
    return projects.sort((a, b) => b.lastAccessed - a.lastAccessed)
  } catch (err) {
    console.error('Failed to load recent projects:', err)
    return []
  }
}

/**
 * Add or update a recent project
 */
export function addRecentProject(project: Omit<RecentProject, 'lastAccessed'>): void {
  if (typeof window === 'undefined') return
  
  try {
    const projects = getRecentProjects()
    
    // Remove existing entry with same fileName if exists
    const filtered = projects.filter(p => p.fileName !== project.fileName)
    
    // Add new entry at the beginning
    const updated: RecentProject[] = [
      {
        ...project,
        lastAccessed: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT_PROJECTS) // Keep only the most recent ones
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to save recent project:', err)
  }
}

/**
 * Remove a project from recent list
 */
export function removeRecentProject(fileName: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const projects = getRecentProjects()
    const filtered = projects.filter(p => p.fileName !== fileName)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (err) {
    console.error('Failed to remove recent project:', err)
  }
}

/**
 * Clear all recent projects
 */
export function clearRecentProjects(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear recent projects:', err)
  }
}

/**
 * Get a sanitized filename from a project title
 */
export function getProjectFileName(title: string): string {
  if (!title || title.trim() === '') {
    return 'untitled_project.clap'
  }
  
  // Remove invalid filename characters and normalize
  const sanitized = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Replace invalid chars with underscore
    .replace(/\s+/g, '_') // Replace whitespace with underscore
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
  
  // Ensure it has .clap extension
  return sanitized.endsWith('.clap') ? sanitized : `${sanitized}.clap`
}
