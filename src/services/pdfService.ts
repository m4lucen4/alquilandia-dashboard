import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "@/types/invoices";
import type { Budget } from "@/types/budgets";
import type { Business } from "@/types/business";
import { formatCurrency, formatInvoiceNumber } from "@/helpers";
import { calculateBudgetTotal } from "@/helpers/budgets";
import logoImage from "@/assets/logo.png";

/**
 * Generates a PDF document for an invoice using jsPDF
 * @param invoice - Invoice data with all relations
 * @returns PDF blob
 */
export const generateInvoicePDF = async (invoice: Invoice): Promise<Blob> => {
  try {
    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Logo (top left)
    try {
      doc.addImage(logoImage, "PNG", 20, yPosition, 35, 30);
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }

    // Business data (top right, next to logo)
    const businessAlignX = pageWidth - 20;
    let businessY = yPosition;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.business?.name || "-", businessAlignX, businessY, {
      align: "right",
    });
    businessY += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `NIF: ${invoice.business?.nif || "-"}`,
      businessAlignX,
      businessY,
      { align: "right" },
    );
    businessY += 4;

    const businessAddress = doc.splitTextToSize(
      invoice.business?.address || "",
      75,
    );
    businessAddress.forEach((line: string) => {
      doc.text(line, businessAlignX, businessY, { align: "right" });
      businessY += 4;
    });

    doc.text(
      `${invoice.business?.postal_code || ""} ${invoice.business?.locality || ""}`.trim(),
      businessAlignX,
      businessY,
      { align: "right" },
    );
    businessY += 4;
    if (invoice.business?.province) {
      doc.text(invoice.business.province, businessAlignX, businessY, {
        align: "right",
      });
      businessY += 4;
    }
    doc.text(
      `Tel: ${invoice.business?.phone || ""}`,
      businessAlignX,
      businessY,
      { align: "right" },
    );

    yPosition += 35;

    // Invoice and Budget Reference
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Nº Factura: ${formatInvoiceNumber(invoice.invoice_number, invoice.created_at)}`,
      20,
      yPosition,
    );
    doc.text(
      `Fecha: ${new Date(invoice.created_at || "").toLocaleDateString("es-ES")}`,
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Nº Presupuesto: ${invoice.budget_reference}`, 20, yPosition);
    yPosition += 12;

    // Client data
    const columnWidth = pageWidth - 40;
    const boxHeight = 30;

    doc.setFillColor(232, 245, 233);
    doc.rect(20, yPosition + 2, columnWidth, boxHeight, "F");
    doc.setDrawColor(129, 199, 132);
    doc.rect(20, yPosition + 2, columnWidth, boxHeight, "S");

    let clientY = yPosition + 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.client_name || "-", 24, clientY);
    clientY += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`NIF: ${invoice.client_nif || "-"}`, 24, clientY);
    clientY += 4;

    const clientAddress = doc.splitTextToSize(
      invoice.client_address || "",
      columnWidth - 8,
    );
    doc.text(clientAddress, 24, clientY);
    clientY += clientAddress.length * 4;

    doc.text(
      `${invoice.client_postal_code || ""} ${invoice.client_locality || ""}`,
      24,
      clientY,
    );
    clientY += 4;
    doc.text(`Tel: ${invoice.client_phone || ""}`, 24, clientY);
    clientY += 4;
    doc.text(`Email: ${invoice.client_email || ""}`, 24, clientY);

    yPosition += boxHeight + 12;

    // Corrective Invoice Notice (only for corrective invoices)
    if (invoice.is_corrective) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(211, 47, 47);
      doc.text("FACTURA RECTIFICATIVA", 20, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      // Build corrective notice text
      const originalInvoiceNumber =
        invoice.original_invoice?.invoice_number || "N/A";
      let correctiveNotice = `Factura rectificativa correspondiente a la factura ${originalInvoiceNumber}`;

      if (
        invoice.corrective_reason &&
        invoice.corrective_reason.trim() !== ""
      ) {
        correctiveNotice += `\n${invoice.corrective_reason}`;
      }

      const correctiveLines = doc.splitTextToSize(
        correctiveNotice,
        pageWidth - 44,
      );
      const correctiveHeight = correctiveLines.length * 5 + 4;

      doc.setFillColor(255, 235, 238);
      doc.rect(20, yPosition, pageWidth - 40, correctiveHeight, "F");
      doc.setDrawColor(244, 67, 54);
      doc.rect(20, yPosition, pageWidth - 40, correctiveHeight, "S");

      doc.text(correctiveLines, 24, yPosition + 5);
      yPosition += correctiveHeight + 8;
    }

    // Concept + Additional data
    const conceptText = [
      invoice.invoices_type?.concept,
      invoice.additional_data,
    ]
      .filter(Boolean)
      .join("\n");

    if (conceptText) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("CONCEPTO", 20, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      doc.setFillColor(255, 248, 225);
      const conceptLines = doc.splitTextToSize(conceptText, pageWidth - 44);
      const conceptHeight = conceptLines.length * 5 + 4;

      doc.rect(20, yPosition, pageWidth - 40, conceptHeight, "F");
      doc.setDrawColor(255, 193, 7);
      doc.rect(20, yPosition, pageWidth - 40, conceptHeight, "S");

      doc.text(conceptLines, 24, yPosition + 5);
      yPosition += conceptHeight + 8;
    }

    // Budget Lines Table (only if show_budgetlines is true)
    if (invoice.invoices_type?.show_budgetlines !== false) {
      yPosition += 5;

      const tableData = invoice.budgetlines.map((line, index) => [
        (index + 1).toString(),
        line.elemento || "-",
        line.units?.toString() || "1",
        formatCurrency(line.precioUd || 0),
        formatCurrency(line.totalPrice || 0),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["#", "Nombre", "Unidades", "Precio Ud.", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 80 },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 30, halign: "right" },
        },
        margin: { left: 20, right: 20, bottom: 45 },
      });

      // Get Y position after table
      // @ts-expect-error - autoTable adds finalY to doc
      yPosition = doc.lastAutoTable.finalY + 10;

      // Page break if price summary wouldn't fit before footer
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
    } else {
      // If budget lines are not shown, add some spacing
      yPosition += 5;
    }

    // Price Summary (right aligned)
    const summaryX = pageWidth - 70;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Subtotal
    doc.text("Subtotal:", summaryX, yPosition, { align: "right" });
    doc.text(
      formatCurrency(invoice.price?.subTotal || 0),
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );
    yPosition += 5;

    // Extras
    if (invoice.price?.extras && invoice.price.extras > 0) {
      doc.text("Extras:", summaryX, yPosition, { align: "right" });
      doc.text(
        formatCurrency(invoice.price.extras),
        pageWidth - 20,
        yPosition,
        { align: "right" },
      );
      yPosition += 5;
    }

    // Gastos de transporte (always shown)
    doc.text("Gastos de transporte:", summaryX, yPosition, { align: "right" });
    doc.text(
      formatCurrency(invoice.price?.costSend || 0),
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );
    yPosition += 5;

    // Descuento
    if (invoice.price?.userDiscount && invoice.price.userDiscount > 0) {
      doc.setTextColor(211, 47, 47); // Red color
      doc.text("Descuento:", summaryX, yPosition, { align: "right" });
      doc.text(
        `-${formatCurrency(invoice.price.userDiscount)}`,
        pageWidth - 20,
        yPosition,
        { align: "right" },
      );
      doc.setTextColor(0, 0, 0);
      yPosition += 5;
    }

    // IVA
    if (invoice.price?.vat !== undefined) {
      doc.text(`IVA (${invoice.taxes_type?.tax ?? 0}%):`, summaryX, yPosition, { align: "right" });
      doc.text(formatCurrency(invoice.price.vat), pageWidth - 20, yPosition, {
        align: "right",
      });
      yPosition += 5;
    }

    yPosition += 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TOTAL:", summaryX, yPosition, { align: "right" });
    doc.text(
      formatCurrency(invoice.price?.total || 0),
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );

    // Footer
    let footerY = pageHeight - 10;

    // Additional data from business (if exists)
    if (invoice.business?.additional_data) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);

      const additionalDataLines = doc.splitTextToSize(
        invoice.business.additional_data,
        pageWidth - 40,
      );

      // Calculate starting position for additional data
      const additionalDataHeight = additionalDataLines.length * 3;
      footerY = pageHeight - 15 - additionalDataHeight;

      doc.text(additionalDataLines, pageWidth / 2, footerY, {
        align: "center",
      });

      footerY = pageHeight - 10;
    }

    // Convert to Blob
    const pdfBlob = doc.output("blob");

    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

interface BudgetClientData {
  client_name: string;
  client_nif: string;
  client_address: string;
  client_locality: string;
  client_postal_code: string;
  client_phone: string;
}

/**
 * Generates a PDF document for a budget using jsPDF
 * @param budget - Budget data
 * @param business - Selected business (issuer)
 * @param clientData - Client data extracted from budget
 * @param includeVAT - Whether to include VAT in the total
 * @param date - Document date (ISO string or YYYY-MM-DD)
 * @returns PDF blob
 */
export const generateBudgetPDF = async (
  budget: Budget,
  business: Business,
  clientData: BudgetClientData,
  includeVAT: boolean,
  date: string,
): Promise<Blob> => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Logo (top left)
    try {
      doc.addImage(logoImage, "PNG", 20, yPosition, 35, 30);
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }

    // Business data (top right)
    const businessAlignX = pageWidth - 20;
    let businessY = yPosition;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(business.name, businessAlignX, businessY, { align: "right" });
    businessY += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`NIF: ${business.nif}`, businessAlignX, businessY, {
      align: "right",
    });
    businessY += 4;

    const businessAddress = doc.splitTextToSize(business.address || "", 75);
    businessAddress.forEach((line: string) => {
      doc.text(line, businessAlignX, businessY, { align: "right" });
      businessY += 4;
    });

    doc.text(
      `${business.postal_code || ""} ${business.locality || ""}`.trim(),
      businessAlignX,
      businessY,
      { align: "right" },
    );
    businessY += 4;
    if (business.province) {
      doc.text(business.province, businessAlignX, businessY, {
        align: "right",
      });
      businessY += 4;
    }
    doc.text(`Tel: ${business.phone || ""}`, businessAlignX, businessY, {
      align: "right",
    });

    yPosition += 35;

    // Budget title and reference number
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`PRESUPUESTO Nº: ${budget.budgetReference}`, 20, yPosition);
    doc.text(
      `Fecha y dirección del evento: ${new Date(budget.eventDate).toLocaleDateString("es-ES")}`,
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    if (budget.address?.trim()) {
      const addressLines = doc.splitTextToSize(budget.address.trim(), 90);
      addressLines.forEach((line: string) => {
        doc.text(line, pageWidth - 20, yPosition, { align: "right" });
        yPosition += 5;
      });
    }
    doc.text(
      `Fecha: ${new Date(date).toLocaleDateString("es-ES")}`,
      20,
      yPosition,
    );
    yPosition += 6;

    if (budget.technician?.role === "TECHNICIAN" && budget.technician?.firstName) {
      doc.text(`Le atendió: ${budget.technician.firstName}`, 20, yPosition);
      yPosition += 6;
    }

    yPosition += 2;

    // Client data box
    const columnWidth = pageWidth - 40;
    const boxHeight = 30;

    doc.setFillColor(232, 245, 233);
    doc.rect(20, yPosition + 2, columnWidth, boxHeight, "F");
    doc.setDrawColor(129, 199, 132);
    doc.rect(20, yPosition + 2, columnWidth, boxHeight, "S");

    let clientY = yPosition + 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(budget.client || "-", 24, clientY);
    clientY += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`NIF: ${clientData.client_nif || "-"}`, 24, clientY);
    clientY += 4;

    const clientAddress = doc.splitTextToSize(
      clientData.client_address || "",
      columnWidth - 8,
    );
    doc.text(clientAddress, 24, clientY);
    clientY += clientAddress.length * 4;

    doc.text(
      `${clientData.client_postal_code || ""} ${clientData.client_locality || ""}`,
      24,
      clientY,
    );
    clientY += 4;
    doc.text(`Tel: ${clientData.client_phone || ""}`, 24, clientY);
    clientY += 4;
    doc.text(`Email: ${budget.user?.email || ""}`, 24, clientY);

    yPosition += boxHeight + 12;

    // Comments (client) and internal comments
    if (budget.comments?.trim()) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Comentarios del cliente:", 20, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      const commentLines = doc.splitTextToSize(budget.comments.trim(), pageWidth - 44);
      const commentHeight = commentLines.length * 5 + 4;

      doc.setFillColor(227, 242, 253);
      doc.rect(20, yPosition, pageWidth - 40, commentHeight, "F");
      doc.setDrawColor(100, 181, 246);
      doc.rect(20, yPosition, pageWidth - 40, commentHeight, "S");

      doc.text(commentLines, 24, yPosition + 5);
      yPosition += commentHeight + 6;
    }

    if (budget.commentsalquilandia?.trim()) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Notas internas:", 20, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      const internalLines = doc.splitTextToSize(budget.commentsalquilandia.trim(), pageWidth - 44);
      const internalHeight = internalLines.length * 5 + 4;

      doc.setFillColor(255, 243, 224);
      doc.rect(20, yPosition, pageWidth - 40, internalHeight, "F");
      doc.setDrawColor(255, 167, 38);
      doc.rect(20, yPosition, pageWidth - 40, internalHeight, "S");

      doc.text(internalLines, 24, yPosition + 5);
      yPosition += internalHeight + 6;
    }

    // Budget Lines Table
    yPosition += 5;

    const tableData = budget.budgetLines.map((line, index) => [
      (index + 1).toString(),
      line.elemento || "-",
      (line.units || line.unidades || 1).toString(),
      formatCurrency(line.precioUd || 0),
      formatCurrency(line.totalPrice || 0),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Nombre", "Unidades", "Precio Ud.", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20, bottom: 45 },
    });

    // @ts-expect-error - autoTable adds finalY to doc
    yPosition = doc.lastAutoTable.finalY + 10;

    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    // Price Summary
    const totals = calculateBudgetTotal(budget);
    const summaryX = pageWidth - 70;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const subTotal = budget.price?.subTotal || 0;
    const extras = budget.price?.extras || 0;
    const costSend = budget.price?.costSend || 0;
    const couponDiscount = budget.totalCouponDiscount || 0;

    doc.text("Subtotal:", summaryX, yPosition, { align: "right" });
    doc.text(formatCurrency(subTotal), pageWidth - 20, yPosition, {
      align: "right",
    });
    yPosition += 5;

    if (extras > 0) {
      doc.text("Extras:", summaryX, yPosition, { align: "right" });
      doc.text(formatCurrency(extras), pageWidth - 20, yPosition, {
        align: "right",
      });
      yPosition += 5;
    }

    doc.text("Gastos de transporte:", summaryX, yPosition, { align: "right" });
    doc.text(formatCurrency(costSend), pageWidth - 20, yPosition, {
      align: "right",
    });
    yPosition += 5;

    if (couponDiscount > 0) {
      doc.setTextColor(211, 47, 47);
      doc.text("Descuento:", summaryX, yPosition, { align: "right" });
      doc.text(
        `-${formatCurrency(couponDiscount)}`,
        pageWidth - 20,
        yPosition,
        { align: "right" },
      );
      doc.setTextColor(0, 0, 0);
      yPosition += 5;
    }

    if (includeVAT) {
      doc.text("IVA (21%):", summaryX, yPosition, { align: "right" });
      doc.text(formatCurrency(totals.iva), pageWidth - 20, yPosition, {
        align: "right",
      });
      yPosition += 5;
    }

    yPosition += 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("TOTAL:", summaryX, yPosition, { align: "right" });
    doc.text(
      formatCurrency(includeVAT ? totals.total : totals.base),
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );

    // Footer
    if (business.additional_data) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);

      const additionalDataLines = doc.splitTextToSize(
        business.additional_data,
        pageWidth - 40,
      );

      const additionalDataHeight = additionalDataLines.length * 3;
      const footerY = pageHeight - 15 - additionalDataHeight;

      doc.text(additionalDataLines, pageWidth / 2, footerY, {
        align: "center",
      });
    }

    return doc.output("blob");
  } catch (error) {
    console.error("Error generating budget PDF:", error);
    throw error;
  }
};
