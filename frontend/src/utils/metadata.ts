export interface ParsedMetadata {
  description: string;
  minStock: number | null;
  location: string | null;
  imageUrl: string | null;
}

export function parseDescriptionMetadata(rawDescription: string | null): ParsedMetadata {
  if (!rawDescription) {
    return { description: "", minStock: null, location: null, imageUrl: null };
  }

  let description = rawDescription;
  let minStock: number | null = null;
  let location: string | null = null;
  let imageUrl: string | null = null;

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

  // Regex to extract [ImageUrl: Z]
  const imageUrlRegex = /\[ImageUrl:\s*([^\]]+)\]/;
  const imageUrlMatch = description.match(imageUrlRegex);
  if (imageUrlMatch) {
    imageUrl = imageUrlMatch[1].trim();
    description = description.replace(imageUrlRegex, "");
  }

  return {
    description: description.trim(),
    minStock,
    location,
    imageUrl
  };
}

export function buildDescriptionMetadata(
  description: string,
  minStock: number | null,
  location: string | null,
  imageUrl: string | null
): string {
  let result = (description || "").trim();
  if (minStock !== null && !isNaN(minStock)) {
    result += ` [MinStock: ${minStock}]`;
  }
  if (location && location.trim()) {
    result += ` [Location: ${location.trim()}]`;
  }
  if (imageUrl && imageUrl.trim()) {
    result += ` [ImageUrl: ${imageUrl.trim()}]`;
  }
  return result.trim();
}
