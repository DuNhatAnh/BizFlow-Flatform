export interface ParsedMetadata {
  description: string;
  minStock: number | null;
  location: string | null;
}

export function parseDescriptionMetadata(rawDescription: string | null): ParsedMetadata {
  if (!rawDescription) {
    return { description: "", minStock: null, location: null };
  }

  let description = rawDescription;
  let minStock: number | null = null;
  let location: string | null = null;

  // Regex to extract [MinStock: X]
  const minStockRegex = /\[MinStock:\s*(\d+)\]/;
  const minStockMatch = description.match(minStockRegex);
  if (minStockMatch) {
    minStock = parseInt(minStockMatch[1], 10);
    description = description.replace(minStockRegex, "");
  }

  // Regex to extract [Location: Y]
  const locationRegex = /\[Location:\s*([^\]]+)\]/;
  const locationMatch = description.match(locationRegex);
  if (locationMatch) {
    location = locationMatch[1].trim();
    description = description.replace(locationRegex, "");
  }

  return {
    description: description.trim(),
    minStock,
    location
  };
}

export function buildDescriptionMetadata(description: string, minStock: number | null, location: string | null): string {
  let result = (description || "").trim();
  if (minStock !== null && !isNaN(minStock)) {
    result += ` [MinStock: ${minStock}]`;
  }
  if (location && location.trim()) {
    result += ` [Location: ${location.trim()}]`;
  }
  return result.trim();
}
