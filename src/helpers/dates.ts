/**
 * Formatea una fecha en formato dd/mm/yyyy
 * @param dateString - Fecha a formatear
 * @returns Fecha formateada
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
