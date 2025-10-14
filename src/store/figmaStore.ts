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

// Debug logging
console.error("🔍 Figma Store Debug:");
console.error(`   FIGMA_API_KEY: ${FIGMA_API_KEY ? 'SET (length: ' + FIGMA_API_KEY.length + ')' : 'NOT SET'}`);
console.error(`   FIGMA_FILE_KEY: ${FIGMA_FILE_KEY || 'NOT SET'}`);
console.error(`   FIGMA_MOCK_MODE: ${process.env.FIGMA_MOCK_MODE}`);
console.error(`   USE_MOCK_DATA: ${USE_MOCK_DATA}`);

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const FIGMA_API_BASE = "https://api.figma.com/v1";

/**
 * Exported types for transformed components (what we return to users)
 */
export type FigmaComponent = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  type?: string;
  aliases?: string[];
};

export type FigmaVariable = {
  id: string;
  name: string;
  resolvedType: string;
  valuesByMode: Record<string, any>;
};

export type FigmaData = {
  components: FigmaComponent[];
  variables: Record<string, FigmaVariable[]>;
  aliases: Record<string, string>;
};

/**
 * Internal Figma API response types
 */
interface FigmaApiComponent {
  key: string;
  name: string;
  description: string;
  remote: boolean;
  documentationLinks: Array<{ uri: string; label?: string }>;
}

interface FigmaApiVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, any>;
}

interface FigmaFileResponse {
  document: any;
  components: Record<string, FigmaApiComponent>;
  schemaVersion: number;
}

interface FigmaVariablesResponse {
  meta: {
    variableCollections: Record<string, any>;
    variables: Record<string, FigmaApiVariable>;
  };
}

/**
 * Read mock Figma data from the projects directory
 */
async function readMockData(projectId: string) {
  const mockPath = path.join(ROOT, projectId, "mocks", "figma.json");
  try {
    const raw = await fs.readFile(mockPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to read mock Figma data: ${error}`);
  }
}

/**
 * Fetch file data from Figma REST API
 */
async function fetchFigmaFile(fileKey: string): Promise<FigmaFileResponse> {
  if (!FIGMA_API_KEY) {
    throw new Error("FIGMA_API_KEY must be set to use Figma API");
  }

  const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
    headers: {
      "X-Figma-Token": FIGMA_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch variables (design tokens) from Figma REST API
 */
async function fetchFigmaVariables(fileKey: string): Promise<FigmaVariablesResponse> {
  if (!FIGMA_API_KEY) {
    throw new Error("FIGMA_API_KEY must be set to use Figma API");
  }

  const response = await fetch(
    `${FIGMA_API_BASE}/files/${fileKey}/variables/local`,
    {
      headers: {
        "X-Figma-Token": FIGMA_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Transform Figma API response to our format
 */
function transformFigmaData(fileData: FigmaFileResponse, variablesData: FigmaVariablesResponse) {
  // Transform components
  const components = Object.entries(fileData.components).map(([key, comp]) => ({
    id: key,
    name: comp.name,
    description: comp.description || "",
    tags: [], // TODO: Extract tags from description or properties
  }));

  // Transform variables to tokens - organize by category
  const variablesByCategory: Record<string, any[]> = {
    colors: [],
    spacing: [],
    borderRadius: [],
    typography: [],
    other: [],
  };

  Object.entries(variablesData.meta.variables).forEach(([key, variable]) => {
    // Get the default mode value (first mode in the object)
    const modes = Object.values(variable.valuesByMode);
    const value = modes[0]; // Use first mode as default

    const tokenData = {
      id: key,
      name: variable.name,
      resolvedType: variable.resolvedType,
      valuesByMode: variable.valuesByMode,
    };

    // Categorize the variable
    const category = categorizeVariableName(variable.name, variable.resolvedType);
    variablesByCategory[category].push(tokenData);
  });

  // Simple aliases - can be enhanced later
  const aliases: Record<string, string> = {};
  components.forEach((c) => {
    const lower = c.name.toLowerCase();
    aliases[lower] = c.name;
    // Add common variants
    if (lower.includes("/")) {
      const parts = lower.split("/");
      aliases[parts[parts.length - 1]] = c.name;
    }
  });

  return {
    components,
    variables: variablesByCategory,
    aliases,
  };
}

/**
 * Categorize a variable by name and type
 */
function categorizeVariableName(name: string, type: string): string {
  const lower = name.toLowerCase();
  
  if (lower.includes("color") || type === "COLOR") {
    return "colors";
  }
  if (lower.includes("spacing") || lower.includes("gap") || lower.includes("padding") || lower.includes("margin")) {
    return "spacing";
  }
  if (lower.includes("radius") || lower.includes("corner")) {
    return "borderRadius";
  }
  if (lower.includes("font") || lower.includes("text") || lower.includes("line-height")) {
    return "typography";
  }
  
  return "other";
}

/**
 * Fetch data from Figma REST API
 */
async function fetchFromFigmaAPI(fileKey: string) {
  console.error("🌐 Fetching from Figma API...");
  
  try {
    // Fetch both file data and variables in parallel
    const [fileData, variablesData] = await Promise.all([
      fetchFigmaFile(fileKey),
      fetchFigmaVariables(fileKey),
    ]);

    return transformFigmaData(fileData, variablesData);
  } catch (error) {
    console.error("❌ Figma API error:", error);
    throw error;
  }
}

/**
 * Get cache file path for a project
 */
function getCachePath(projectId: string) {
  return path.join(ROOT, projectId, "cache", "figma-components.json");
}

/**
 * Read from cache if valid, otherwise return null
 */
async function readCache(projectId: string) {
  try {
    const cachePath = getCachePath(projectId);
    const raw = await fs.readFile(cachePath, "utf8");
    const cache = JSON.parse(raw);

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
async function writeCache(projectId: string, data: any, ttl = CACHE_TTL) {
  const cachePath = getCachePath(projectId);
  await fs.mkdir(path.dirname(cachePath), { recursive: true });

  const cache = {
    data,
    timestamp: new Date().toISOString(),
    ttl,
  };

  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf8");
}

/**
 * Main function to get Figma data - handles mock mode and caching
 */
export async function getFigmaData(projectId: string, forceRefresh = false) {
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cached = await readCache(projectId);
    if (cached) {
      console.error("💾 Using cached Figma data");
      return cached;
    }
  }

  // Get data from source (mock or API)
  let data;
  if (USE_MOCK_DATA) {
    console.error("📦 Using mock Figma data");
    data = await readMockData(projectId);
  } else {
    if (!FIGMA_FILE_KEY) {
      throw new Error("FIGMA_FILE_KEY must be set");
    }
    data = await fetchFromFigmaAPI(FIGMA_FILE_KEY);
  }

  // Update cache
  await writeCache(projectId, data);
  return data;
}

/**
 * Get a specific component by ID or name (with alias support)
 */
export async function getComponent(projectId: string, identifier: string) {
  const data = await getFigmaData(projectId);

  // Try direct match by ID
  let component = data.components.find((c: any) => c.id === identifier);
  if (component) return component;

  // Try direct match by name
  component = data.components.find((c: any) => c.name === identifier);
  if (component) return component;

  // Try alias match
  const canonicalName = data.aliases[identifier.toLowerCase()];
  if (canonicalName) {
    component = data.components.find((c: any) => c.name === canonicalName);
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
) {
  const data = await getFigmaData(projectId);
  let components = data.components;

  if (options?.tag) {
    components = components.filter((c: any) => c.tags?.includes(options.tag));
  }

  if (options?.search) {
    const query = options.search.toLowerCase();
    components = components.filter(
      (c: any) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.tags?.some((t: string) => t.toLowerCase().includes(query))
    );
  }

  return components;
}

/**
 * Get all design tokens (variables)
 */
export async function getTokens(projectId: string) {
  const data = await getFigmaData(projectId);
  // Flatten all variables into a single array
  const allVariables: any[] = [];
  if (typeof data.variables === 'object') {
    Object.values(data.variables).forEach((category: any) => {
      if (Array.isArray(category)) {
        allVariables.push(...category);
      }
    });
  }
  return allVariables;
}

/**
 * Sync tokens to project tokens file
 */
export async function syncTokensToProject(projectId: string, forceRefresh?: boolean) {
  const data = await getFigmaData(projectId, forceRefresh);
  const tokensPath = path.join(ROOT, projectId, "design-tokens.json");

  // Transform to design tokens format
  const designTokens = {
    $schema: "https://design-tokens.org/schema.json",
    colors: {},
    typography: {},
    spacing: {},
    borderRadius: {},
    other: {},
  } as any;

  let totalCount = 0;

  // Process each category
  Object.entries(data.variables).forEach(([category, tokens]: [string, any]) => {
    if (!Array.isArray(tokens)) return;

    tokens.forEach((token: any) => {
      const value = token.valuesByMode?.default || Object.values(token.valuesByMode || {})[0];
      designTokens[category][token.name] = {
        $value: value,
        $type: token.resolvedType,
        $description: `Synced from Figma: ${token.id}`,
      };
      totalCount++;
    });
  });

  await fs.writeFile(tokensPath, JSON.stringify(designTokens, null, 2), "utf8");
  return { path: tokensPath, count: totalCount };
}

/**
 * Invalidate cache - force next read to fetch fresh data
 */
export async function invalidateCache(projectId: string) {
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
export async function getCacheStatus(projectId: string) {
  try {
    const cachePath = getCachePath(projectId);
    const raw = await fs.readFile(cachePath, "utf8");
    const cache = JSON.parse(raw);

    const age = Date.now() - new Date(cache.timestamp).getTime();
    const valid = age < cache.ttl;

    return {
      exists: true,
      age,
      valid,
      timestamp: cache.timestamp,
    };
  } catch {
    return { exists: false };
  }
}
