// Transforma vocales a clases de caracteres para búsqueda regex en el backend
// Paridad con ProductsSelection.js legacy
export function normalizeElementoToRegex(term: string): string {
  return term
    .replaceAll('a', "[a,á,à,ä]")
    .replaceAll('e', "[e,é,è,ë]")
    .replaceAll('i', "[i,í,ì,ï]")
    .replaceAll('o', "[o,ó,ò,ö]")
    .replaceAll('u', "[u,ú,ù,ü]")
    .replaceAll('A', "[A,Á,À,Ä]")
    .replaceAll('E', "[E,É,È,Ë]")
    .replaceAll('I', "[I,Í,Ì,Ï]")
    .replaceAll('O', "[O,Ó,Ò,Ö]")
    .replaceAll('U', "[U,Ú,Ù,Ü]");
}

export function buildCatalogFiltersQuery({
  elemento,
  categoria,
  subcategoria,
}: {
  elemento?: string;
  categoria?: string;
  subcategoria?: string;
}): string {
  const parts: string[] = [];
  if (elemento?.trim()) {
    parts.push(`elemento=${normalizeElementoToRegex(elemento.trim())}`);
  }
  if (categoria) {
    parts.push(`categoria=${categoria}`);
  }
  if (subcategoria) {
    parts.push(`subcategoria=${subcategoria}`);
  }
  return parts.join("&");
}
