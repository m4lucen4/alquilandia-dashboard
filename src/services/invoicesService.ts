import { supabase } from "@/config/supabase";
import type {
  CreateInvoiceData,
  CreateCorrectiveInvoiceData,
  UpdateInvoiceData,
  Invoice,
} from "@/types/invoices";
import type { Json } from "@/types/supabase";
import { generateInvoicePDF } from "./pdfService";
import { formatInvoiceNumber } from "@/helpers";

const buildInvoicePdfFileName = (
  invoiceNumber: number,
  createdAt: string | undefined,
  clientName: string,
  budgetReference: number,
): string => {
  const num = formatInvoiceNumber(invoiceNumber, createdAt).replaceAll(
    /[/\\:*?"<>|]/g,
    "_",
  );
  const client = clientName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .replaceAll(/[/\\:*?"<>|]/g, "")
    .replaceAll(/\s+/g, "_");
  return `${num}_${client}_${budgetReference}.pdf`;
};

/**
 * Gets all invoices with business information
 *
 * @param businessId - Optional business ID to filter by
 * @param budgetReference - Optional budget reference to filter by
 * @param page - Optional page number (0-indexed)
 * @param pageSize - Optional page size
 * @returns Object with invoices array and total count
 * @throws Error if fetch fails
 */
export const getAllInvoices = async (
  businessId?: string,
  budgetReference?: string,
  page?: number,
  pageSize?: number,
): Promise<{ invoices: Invoice[]; total: number }> => {
  let query = supabase.from("invoices").select(
    `
      *,
      business:business_id (
        id,
        name,
        is_default
      ),
      invoices_type:invoices_type_id (
        id,
        invoices,
        percentage,
        concept,
        show_budgetlines
      )
    `,
    { count: "exact" },
  );

  // Apply filters if provided
  if (businessId) {
    query = query.eq("business_id", businessId);
  }

  if (budgetReference) {
    query = query.eq("budget_reference", budgetReference);
  }

  // Fetch all data without pagination to sort globally
  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching invoices:", error);
    throw new Error(
      error.message ||
        "No se pudieron cargar las facturas. Por favor, inténtelo de nuevo.",
    );
  }

  // Sort client-side: first by business.is_default (true first), then by invoice_number (descending)
  const sortedInvoices = ((data || []) as Invoice[]).sort((a, b) => {
    // First, sort by is_default (true comes first)
    const aIsDefault = a.business?.is_default ?? false;
    const bIsDefault = b.business?.is_default ?? false;

    if (aIsDefault !== bIsDefault) {
      return bIsDefault ? 1 : -1; // true (1) comes before false (0)
    }

    // Then, sort by invoice_number (descending)
    return (b.invoice_number || 0) - (a.invoice_number || 0);
  });

  // Apply pagination after sorting
  let paginatedInvoices = sortedInvoices;
  if (page !== undefined && pageSize !== undefined) {
    const from = page * pageSize;
    const to = from + pageSize;
    paginatedInvoices = sortedInvoices.slice(from, to);
  }

  return {
    invoices: paginatedInvoices,
    total: count || 0,
  };
};

/**
 * Gets invoice by budget reference
 *
 * @param budgetReference - Budget reference number
 * @returns Invoice if found, null otherwise
 * @throws Error if fetch fails
 */
export const getInvoiceByBudgetReference = async (
  budgetReference: number,
): Promise<Invoice | null> => {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      business:business_id (
        id,
        name,
        nif,
        address,
        locality,
        province,
        phone,
        postal_code,
        additional_data
      ),
      invoices_type:invoices_type_id (
        id,
        invoices,
        percentage,
        concept,
        show_budgetlines
      ),
      taxes_type:taxes_type_id (
        id,
        name,
        tax
      ),
      original_invoice:original_invoice_id (
        invoice_number
      )
    `,
    )
    .eq("budget_reference", budgetReference)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching invoice by budget reference:", error);
    throw new Error(
      error.message ||
        "No se pudo cargar la factura. Por favor, inténtelo de nuevo.",
    );
  }

  return data as Invoice;
};

/**
 * Gets all invoices by budget reference
 *
 * @param budgetReference - Budget reference number
 * @returns Array of invoices
 * @throws Error if fetch fails
 */
export const getInvoicesByBudgetReference = async (
  budgetReference: number,
): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      business:business_id (
        id,
        name,
        nif,
        address,
        locality,
        province,
        phone,
        postal_code,
        additional_data
      ),
      invoices_type:invoices_type_id (
        id,
        invoices,
        percentage,
        concept,
        show_budgetlines
      ),
      taxes_type:taxes_type_id (
        id,
        name,
        tax
      ),
      original_invoice:original_invoice_id (
        invoice_number
      )
    `,
    )
    .eq("budget_reference", budgetReference)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices by budget reference:", error);
    throw new Error(
      error.message ||
        "No se pudieron cargar las facturas. Por favor, inténtelo de nuevo.",
    );
  }

  return (data || []) as Invoice[];
};

/**
 * Creates a new invoice in Supabase with PDF generation
 * Invoice number is auto-generated by the database trigger
 *
 * @param invoiceData - Data for the new invoice
 * @returns The created invoice with PDF URL
 * @throws Error if creation fails
 */
export const createInvoice = async (
  invoiceData: CreateInvoiceData,
): Promise<Invoice> => {
  const insertData = {
    business_id: invoiceData.business_id,
    invoices_type_id: invoiceData.invoices_type_id,
    taxes_type_id: invoiceData.taxes_type_id,
    budget_reference: invoiceData.budget_reference,
    budgetlines: invoiceData.budgetlines as unknown as Json,
    price: invoiceData.price as unknown as Json,
    client_name: invoiceData.client_name || "",
    client_nif: invoiceData.client_nif || "",
    client_email: invoiceData.client_email || "",
    client_address: invoiceData.client_address || "",
    client_locality: invoiceData.client_locality || "",
    client_postal_code: invoiceData.client_postal_code || "",
    client_phone: invoiceData.client_phone || "",
    additional_data: invoiceData.additional_data || "",
    coupon_discount: invoiceData.coupon_discount || 0,
    ...(invoiceData.created_at && { created_at: invoiceData.created_at }),
  };

  // Step 1: Create the invoice
  // Note: Using 'as any' to bypass Supabase type inference issue
  // The insertData object is correctly typed, but Supabase's generic type isn't propagating
  const { data: createdInvoice, error: createError } = (await supabase
    .from("invoices")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select()
    .single()) as { data: Invoice | null; error: { message?: string } | null };

  if (createError || !createdInvoice) {
    console.error("Error creating invoice:", createError);
    throw new Error(
      createError?.message ||
        "No se pudo crear la factura. Por favor, inténtelo de nuevo.",
    );
  }

  try {
    // Get the complete invoice with all relations
    const { data: fullInvoice, error: fetchError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        business:business_id (
          id,
          name,
          nif,
          address,
          locality,
          province,
          phone,
          postal_code,
          additional_data
        ),
        invoices_type:invoices_type_id (
          id,
          invoices,
          percentage,
          concept,
          show_budgetlines
        ),
        taxes_type:taxes_type_id (
          id,
          name,
          tax
        ),
        original_invoice:original_invoice_id (
          invoice_number
        )
      `,
      )
      .eq("id", createdInvoice.id as string)
      .single();

    if (fetchError || !fullInvoice) {
      console.error("Error fetching full invoice:", fetchError);
      throw new Error("No se pudo obtener los datos completos de la factura.");
    }

    // Generate PDF
    const pdfBlob = await generateInvoicePDF(fullInvoice as Invoice);

    // Upload PDF to Supabase Storage
    const invoice = fullInvoice as Invoice;
    const fileName = buildInvoicePdfFileName(
      invoice.invoice_number,
      invoice.created_at,
      invoiceData.client_name || "",
      invoice.budget_reference,
    );
    const { error: uploadError } = await supabase.storage
      .from("invoices-pdf")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading PDF:", uploadError);
      throw new Error(
        `No se pudo subir el PDF: ${uploadError.message || "Error desconocido"}`,
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("invoices-pdf")
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Update invoice with PDF URL
    // Note: Using type assertion to bypass Supabase type inference issue
    // The update object is correctly typed, but Supabase's generic type isn't propagating
    const { data: updatedInvoice, error: updateError } = (await supabase
      .from("invoices")
      // @ts-expect-error - Supabase type inference bug: incorrectly infers update param as 'never'
      .update({ pdf_url: pdfUrl })
      .eq("id", createdInvoice.id as string)
      .select(
        `
        *,
        business:business_id (
          id,
          name,
          nif,
          address,
          locality,
          province,
          phone,
          postal_code,
          additional_data
        ),
        invoices_type:invoices_type_id (
          id,
          invoices,
          percentage,
          concept,
          show_budgetlines
        ),
        taxes_type:taxes_type_id (
          id,
          name,
          tax
        ),
        original_invoice:original_invoice_id (
          invoice_number
        )
      `,
      )
      .single()) as {
      data: Invoice | null;
      error: { message?: string } | null;
    };

    if (updateError || !updatedInvoice) {
      console.error("Error updating invoice with PDF URL:", updateError);
      // Even if update fails, we still return the invoice
      return { ...(fullInvoice as Invoice), pdf_url: pdfUrl } as Invoice;
    }

    return updatedInvoice as Invoice;
  } catch (error) {
    console.error(
      "Error in invoice creation process:",
      error instanceof Error ? error.message : error,
    );
    // If PDF generation/upload fails, we still have the invoice created
    // Return it without PDF URL
    return createdInvoice as Invoice;
  }
};

/**
 * Creates a corrective invoice from an existing invoice
 * The corrective invoice will have the same data but with negative amounts
 *
 * @param correctiveData - Data with the original invoice ID
 * @returns The created corrective invoice with PDF URL
 * @throws Error if creation fails
 */
export const createCorrectiveInvoice = async (
  correctiveData: CreateCorrectiveInvoiceData,
): Promise<Invoice> => {
  // Step 1: Get the original invoice with all its data
  const { data: original, error: fetchError } = await supabase
    .from("invoices")
    .select(
      `
      *,
      business:business_id (
        id,
        name,
        nif,
        address,
        locality,
        province,
        phone,
        postal_code,
        additional_data
      ),
      invoices_type:invoices_type_id (
        id,
        invoices,
        percentage,
        concept,
        show_budgetlines
      ),
      taxes_type:taxes_type_id (
        id,
        name,
        tax
      )
    `,
    )
    .eq("id", correctiveData.original_invoice_id)
    .single();

  if (fetchError || !original) {
    console.error("Error fetching original invoice:", fetchError);
    throw new Error(
      fetchError?.message ||
        "No se pudo encontrar la factura original. Por favor, inténtelo de nuevo.",
    );
  }

  const originalInvoiceData = original as Invoice;

  // Step 2: Create budget lines with negative prices
  const negativeBudgetlines = originalInvoiceData.budgetlines.map((line) => ({
    ...line,
    precioUd: -Math.abs(line.precioUd || 0),
    totalPrice: -Math.abs(line.totalPrice || 0),
    costetotal: -Math.abs(line.costetotal || 0),
  }));

  // Step 3: Create price object with negative values
  const negativePrice = {
    costSend: -Math.abs(originalInvoiceData.price?.costSend || 0),
    subTotalWithExtras: -Math.abs(
      originalInvoiceData.price?.subTotalWithExtras || 0,
    ),
    userDiscountPercentage:
      originalInvoiceData.price?.userDiscountPercentage || 0,
    userDiscount: -Math.abs(originalInvoiceData.price?.userDiscount || 0),
    extras: -Math.abs(originalInvoiceData.price?.extras || 0),
    total: -Math.abs(originalInvoiceData.price?.total || 0),
    vat: -Math.abs(originalInvoiceData.price?.vat || 0),
    packs: -Math.abs(originalInvoiceData.price?.packs || 0),
    subTotal: -Math.abs(originalInvoiceData.price?.subTotal || 0),
    withIVA: originalInvoiceData.price?.withIVA || false,
    alreadyPaid: -Math.abs(originalInvoiceData.price?.alreadyPaid || 0),
  };

  // Step 4: Create the corrective invoice
  const insertData = {
    business_id: originalInvoiceData.business_id,
    invoices_type_id: originalInvoiceData.invoices_type_id,
    taxes_type_id: originalInvoiceData.taxes_type_id,
    budget_reference: originalInvoiceData.budget_reference,
    budgetlines: negativeBudgetlines as unknown as Json,
    price: negativePrice as unknown as Json,
    client_name: originalInvoiceData.client_name || "",
    client_nif: originalInvoiceData.client_nif || "",
    client_email: originalInvoiceData.client_email || "",
    client_address: originalInvoiceData.client_address || "",
    client_locality: originalInvoiceData.client_locality || "",
    client_postal_code: originalInvoiceData.client_postal_code || "",
    client_phone: originalInvoiceData.client_phone || "",
    is_corrective: true,
    original_invoice_id: correctiveData.original_invoice_id,
    corrective_reason: correctiveData.corrective_reason || "",
  };

  const { data: createdInvoice, error: createError } = (await supabase
    .from("invoices")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select()
    .single()) as { data: Invoice | null; error: { message?: string } | null };

  if (createError || !createdInvoice) {
    console.error("Error creating corrective invoice:", createError);
    throw new Error(
      createError?.message ||
        "No se pudo crear la factura rectificativa. Por favor, inténtelo de nuevo.",
    );
  }

  try {
    // Get the complete invoice with all relations
    const { data: fullInvoice, error: fetchFullError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        business:business_id (
          id,
          name,
          nif,
          address,
          locality,
          province,
          phone,
          postal_code,
          additional_data
        ),
        invoices_type:invoices_type_id (
          id,
          invoices,
          percentage,
          concept,
          show_budgetlines
        ),
        taxes_type:taxes_type_id (
          id,
          name,
          tax
        ),
        original_invoice:original_invoice_id (
          invoice_number
        )
      `,
      )
      .eq("id", createdInvoice.id as string)
      .single();

    if (fetchFullError || !fullInvoice) {
      console.error("Error fetching full corrective invoice:", fetchFullError);
      throw new Error(
        "No se pudo obtener los datos completos de la factura rectificativa.",
      );
    }

    // Generate PDF
    const pdfBlob = await generateInvoicePDF(fullInvoice as Invoice);

    // Upload PDF to Supabase Storage
    const fileName = `invoice_corrective_${createdInvoice.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("invoices-pdf")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading corrective PDF:", uploadError);
      throw new Error(
        `No se pudo subir el PDF: ${uploadError.message || "Error desconocido"}`,
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("invoices-pdf")
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Update invoice with PDF URL
    const { data: updatedInvoice, error: updateError } = (await supabase
      .from("invoices")
      // @ts-expect-error - Supabase type inference bug
      .update({ pdf_url: pdfUrl })
      .eq("id", createdInvoice.id as string)
      .select(
        `
        *,
        business:business_id (
          id,
          name,
          nif,
          address,
          locality,
          province,
          phone,
          postal_code,
          additional_data
        ),
        invoices_type:invoices_type_id (
          id,
          invoices,
          percentage,
          concept,
          show_budgetlines
        ),
        taxes_type:taxes_type_id (
          id,
          name,
          tax
        ),
        original_invoice:original_invoice_id (
          invoice_number
        )
      `,
      )
      .single()) as {
      data: Invoice | null;
      error: { message?: string } | null;
    };

    if (updateError || !updatedInvoice) {
      console.error(
        "Error updating corrective invoice with PDF URL:",
        updateError,
      );
      return { ...(fullInvoice as Invoice), pdf_url: pdfUrl } as Invoice;
    }

    return updatedInvoice as Invoice;
  } catch (error) {
    console.error(
      "Error in corrective invoice creation process:",
      error instanceof Error ? error.message : error,
    );
    return createdInvoice as Invoice;
  }
};

/**
 * Updates an existing invoice in Supabase with PDF regeneration
 *
 * @param invoiceId - ID of the invoice to update
 * @param data - Updated invoice data
 * @returns The updated invoice with new PDF URL
 * @throws Error if update fails
 */
export const updateInvoice = async (
  invoiceId: string,
  data: UpdateInvoiceData,
): Promise<Invoice> => {
  try {
    // Step 1: First, fetch the current invoice with all relations to generate the PDF
    const { data: currentInvoice, error: fetchError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        business:business_id (
          id,
          name,
          nif,
          address,
          locality,
          province,
          phone,
          postal_code,
          additional_data
        ),
        invoices_type:invoices_type_id (
          id,
          invoices,
          percentage,
          concept,
          show_budgetlines
        ),
        taxes_type:taxes_type_id (
          id,
          name,
          tax
        ),
        original_invoice:original_invoice_id (
          invoice_number
        )
      `,
      )
      .eq("id", invoiceId)
      .single();

    if (fetchError || !currentInvoice) {
      console.error("Error fetching invoice:", fetchError);
      throw new Error("No se pudo obtener la factura.");
    }

    // Step 2: Generate new PDF with updated data
    const invoiceForPdf = {
      ...(currentInvoice as Invoice),
      business_id: data.business_id,
      invoices_type_id: data.invoices_type_id,
      taxes_type_id: data.taxes_type_id,
      budgetlines: data.budgetlines,
      price: data.price,
      client_name: data.client_name || "",
      client_nif: data.client_nif || "",
      client_email: data.client_email || "",
      client_address: data.client_address || "",
      client_locality: data.client_locality || "",
      client_postal_code: data.client_postal_code || "",
      client_phone: data.client_phone || "",
      additional_data: data.additional_data || "",
      ...(data.created_at && { created_at: data.created_at }),
    } as Invoice;

    const pdfBlob = await generateInvoicePDF(invoiceForPdf);

    // Step 3: Delete the old PDF if it exists (extract filename from stored pdf_url)
    const oldPdfUrl = (currentInvoice as Invoice).pdf_url || "";
    const oldFileName = oldPdfUrl
      ? decodeURIComponent(oldPdfUrl.split("/").pop()?.split("?")[0] || "")
      : "";
    if (oldFileName) {
      const { error: deleteError } = await supabase.storage
        .from("invoices-pdf")
        .remove([oldFileName]);
      if (deleteError) {
        console.log(
          "Note: Could not delete old PDF (might not exist):",
          deleteError.message,
        );
      }
    }

    // Step 4: Upload the new PDF with meaningful filename
    const inv = currentInvoice as Invoice;
    const fileName = buildInvoicePdfFileName(
      inv.invoice_number,
      data.created_at || inv.created_at,
      data.client_name || inv.client_name || "",
      inv.budget_reference,
    );
    const { error: uploadError } = await supabase.storage
      .from("invoices-pdf")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Error uploading updated PDF:", uploadError);
      throw new Error(
        `No se pudo subir el PDF: ${uploadError.message || "Error desconocido"}`,
      );
    }

    // Step 5: Get public URL with cache busting timestamp
    const { data: urlData } = supabase.storage
      .from("invoices-pdf")
      .getPublicUrl(fileName);

    // Add timestamp to force cache refresh
    const pdfUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Step 6: Update the invoice with all data including the PDF URL in a single operation
    const updateData = {
      business_id: data.business_id,
      invoices_type_id: data.invoices_type_id,
      taxes_type_id: data.taxes_type_id,
      budgetlines: data.budgetlines as unknown as Json,
      price: data.price as unknown as Json,
      client_name: data.client_name || "",
      client_nif: data.client_nif || "",
      client_email: data.client_email || "",
      client_address: data.client_address || "",
      client_locality: data.client_locality || "",
      client_postal_code: data.client_postal_code || "",
      client_phone: data.client_phone || "",
      additional_data: data.additional_data || "",
      coupon_discount: data.coupon_discount ?? 0,
      pdf_url: pdfUrl,
      ...(data.created_at && { created_at: data.created_at }),
    };

    const { data: updatedInvoice, error: updateError } = (await supabase
      .from("invoices")
      // @ts-expect-error - Supabase type inference bug
      .update(updateData)
      .eq("id", invoiceId)
      .select(
        `
        *,
        business:business_id (
          id,
          name,
          nif,
          address,
          locality,
          province,
          phone,
          postal_code,
          additional_data
        ),
        invoices_type:invoices_type_id (
          id,
          invoices,
          percentage,
          concept,
          show_budgetlines
        ),
        taxes_type:taxes_type_id (
          id,
          name,
          tax
        ),
        original_invoice:original_invoice_id (
          invoice_number
        )
      `,
      )
      .single()) as {
      data: Invoice | null;
      error: { message?: string } | null;
    };

    if (updateError || !updatedInvoice) {
      console.error("Error updating invoice:", updateError);
      throw new Error(
        updateError?.message ||
          "No se pudo actualizar la factura. Por favor, inténtelo de nuevo.",
      );
    }

    return updatedInvoice as Invoice;
  } catch (error) {
    console.error(
      "Error in invoice update process:",
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
};

/**
 * Gets all original invoice IDs that have a corrective invoice.
 * Used to mark invoices as rectified regardless of pagination.
 *
 * @returns Array of original invoice IDs that have been rectified
 */
export const getRectifiedInvoiceIds = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("original_invoice_id")
    .eq("is_corrective", true);

  if (error) {
    console.error("Error fetching rectified invoice IDs:", error);
    return [];
  }

  return ((data as { original_invoice_id: string | null }[] | null) || [])
    .map((row) => row.original_invoice_id)
    .filter((id): id is string => Boolean(id));
};
