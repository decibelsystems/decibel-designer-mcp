// src/store/figmaStore.ts
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../projects");

// Environment variables for Figma API
const FIGMA_API_KEY = process.env.FIGMA_API_KEY;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;
const USE_MOCK_DATA = !FIGMA_API_KEY || process.env.FIGMA_MOCK_MODE === "true";

export type FigmaComponent = {
  id: string;
  name: string;
  description?: string;
  type: string;
  properties: Record<string, any>;
  fills?: any[];
  strokes?: any[];
  textStyle?: string;
  autoLayout?: Record<string, any>;
  variants?: string[];
  tags?: string[];
  aliases?: string[];
};

export type FigmaStyle = {
  id: string;
  name: string;
  [key: string]: any;
};

export type FigmaVariable = {
  id: string;
  name: string;
  resolvedType: string;
  valuesByMode: Record<string, any>;
  scopes?: string[];
  codeSyntax?: Record<string, string>;
};

export type FigmaData = {
  meta: {
    lastSync: string;
    fileKey: string;
    fileName: string;
  };
  components: FigmaComponent[];
  styles: {
    text: FigmaStyle[];
    color: FigmaStyle[];
  };
  variables: {
    colors: FigmaVariable[];
    spacing: FigmaVariable[];
    borderRadius: FigmaVariable[];
  };
  aliases: Record<string, string>;
};

type CacheEntry = {
  data: FigmaData;
  timestamp: string;
  ttl: number; // in milliseconds
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Read mock Figma data from the projects directory
 */
async function readMockData(projectId: string): Promise<FigmaData> {
  const mockPath = path.join(ROOT, projectId, "mocks", "figma.json");
  try {
    const raw = await fs.readFile(mockPath, "utf8");
    return JSON.parse(raw) as FigmaData;
  } catch (error) {
    throw new Error(`Failed to read mock Figma data: ${error}`);
  }
}

/**
 * Fetch data from Figma REST API
 */
async function fetchFromFigmaAPI(): Promise<FigmaData> {
  if (!FIGMA_API_KEY || !FIGMA_FILE_KEY) {
    throw new Error("FIGMA_API_KEY and FIGMA_FILE_KEY must be set to use Figma API");
  }

  // TODO: Implement actual Figma API calls
  // This is a placeholder for Phase 1
  throw new Error("Figma API integration not yet implemented - use mock mode");
}

/**
 * Get cache file path for a project
 */
function getCachePath(projectId: string): string {
  return path.join(ROOT, projectId, "cache", "figma-components.json");
}

/**
 * Read from cache if valid, otherwise return null
 */
async function readCache(projectId: string): Promise<FigmaData | null> {
  try {
    const cachePath = getCachePath(projectId);
    const raw = await fs.readFile(cachePath, "utf8");
    const cache: CacheEntry = JSON.parse(raw);
    
    const age = Date.now() - new Date(cache.timestamp).getTime();
    if (age < cache.ttl) {
      return cache.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Write data to cache
 */
async function writeCache(projectId: string, data: FigmaData, ttl: number = CACHE_TTL): Promise<void> {
  const cachePath = getCachePath(projectId);
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  
  const cache: CacheEntry = {
    data,
    timestamp: new Date().toISOString(),
    ttl,
  };
  
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf8");
}

/**
 * Main function to get Figma data - handles mock mode and caching
 */
export async function getFigmaData(projectId: string, forceRefresh: boolean = false): Promise<FigmaData> {
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cached = await readCache(projectId);
    if (cached) {
      return cached;
    }
  }

  // Get data from source (mock or API)
  let data: FigmaData;
  
  if (USE_MOCK_DATA) {
    console.error("📦 Using mock Figma data");
    data = await readMockData(projectId);
  } else {
    console.error("🌐 Fetching from Figma API");
    data = await fetchFromFigmaAPI();
  }

  // Update cache
  await writeCache(projectId, data);
  
  return data;
}

/**
 * Get a specific component by ID or name (with alias support)
 */
export async function getComponent(
  projectId: string,
  identifier: string
): Promise<FigmaComponent | null> {
  const data = await getFigmaData(projectId);
  
  // Try direct match by ID
  let component = data.components.find(c => c.id === identifier);
  if (component) return component;
  
  // Try direct match by name
  component = data.components.find(c => c.name === identifier);
  if (component) return component;
  
  // Try alias match
  const canonicalName = data.aliases[identifier.toLowerCase()];
  if (canonicalName) {
    component = data.components.find(c => c.name === canonicalName);
    if (component) return component;
  }
  
  return null;
}

/**
 * List all components with optional filtering
 */
export async function listComponents(
  projectId: string,
  options?: { tag?: string; search?: string }
): Promise<FigmaComponent[]> {
  const data = await getFigmaData(projectId);
  let components = data.components;
  
  if (options?.tag) {
    components = components.filter(c => c.tags?.includes(options.tag!));
  }
  
  if (options?.search) {
    const query = options.search.toLowerCase();
    components = components.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.tags?.some(t => t.toLowerCase().includes(query))
    );
  }
  
  return components;
}

/**
 * Get all design tokens (variables)
 */
export async function getTokens(projectId: string): Promise<FigmaData["variables"]> {
  const data = await getFigmaData(projectId);
  return data.variables;
}

/**
 * Invalidate cache - force next read to fetch fresh data
 */
export async function invalidateCache(projectId: string): Promise<void> {
  const cachePath = getCachePath(projectId);
  try {
    await fs.unlink(cachePath);
    console.error("🗑️  Cache invalidated");
  } catch {
    // Cache file doesn't exist, that's fine
  }
}

/**
 * Get cache status information
 */
export async function getCacheStatus(projectId: string): Promise<{
  exists: boolean;
  age?: number;
  valid?: boolean;
}> {
  try {
    const cachePath = getCachePath(projectId);
    const raw = await fs.readFile(cachePath, "utf8");
    const cache: CacheEntry = JSON.parse(raw);
    
    const age = Date.now() - new Date(cache.timestamp).getTime();
    const valid = age < cache.ttl;
    
    return {
      exists: true,
      age,
      valid,
    };
  } catch {
    return { exists: false };
  }
}
