import type { BusinessFormData } from "@/types/business";

/**
 * Valida los datos del formulario de negocio
 * @param formData - Datos del formulario a validar
 * @returns Objeto con los errores encontrados (vacío si no hay errores)
 */
export const validateBusinessForm = (
  formData: BusinessFormData,
): Partial<Record<keyof BusinessFormData, string>> => {
  const errors: Partial<Record<keyof BusinessFormData, string>> = {};

  if (!formData.name.trim()) {
    errors.name = "El nombre es obligatorio";
  }

  if (!formData.nif.trim()) {
    errors.nif = "El NIF es obligatorio";
  } else if (!/^[A-Z0-9]{9}$/i.test(formData.nif.trim())) {
    errors.nif = "El NIF debe tener 9 caracteres alfanuméricos";
  }

  if (!formData.address.trim()) {
    errors.address = "La dirección es obligatoria";
  }

  if (!formData.locality.trim()) {
    errors.locality = "La localidad es obligatoria";
  }

  if (!formData.province.trim()) {
    errors.province = "La provincia es obligatoria";
  }

  if (!formData.phone.trim()) {
    errors.phone = "El teléfono es obligatorio";
  } else if (!/^[0-9]{9}$/i.test(formData.phone.trim())) {
    errors.phone = "El teléfono debe tener 9 dígitos";
  }

  if (!formData.postal_code.trim()) {
    errors.postal_code = "El código postal es obligatorio";
  } else if (!/^[0-9]{5}$/i.test(formData.postal_code.trim())) {
    errors.postal_code = "El código postal debe tener 5 dígitos";
  }

  return errors;
};
