export const slugify = (text: string) => {
  return (
    text
    .toString()
    .toLowerCase()
    // Replace German special chars with fallbacks
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    // Also handle capital versions (if not lowercased yet)
    .replace(/Ä/g, "ae")
    .replace(/Ö/g, "oe")
    .replace(/Ü/g, "ue")
    // Slavic characters
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "d")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    // Other European special characters
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    // Remove accents from any remaining letters (é, á, ñ, etc.)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove all non-word chars (keep letters, numbers, and -)
    .replace(/[^a-z0-9-]/g, "")
    // Replace multiple hyphens with single one
    .replace(/--+/g, "-")
    // Trim hyphens from start and end
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .trim() // Trim - from end of text
};

export const isObject = (objValue: any) => {
  return (
    objValue && typeof objValue === "object" && objValue.constructor === Object
  );
};

export const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));
