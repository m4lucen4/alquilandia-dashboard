import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "@/types/invoices";
import { formatCurrency } from "@/helpers";
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
    let yPosition = 20;

    // Logo (top left)
    try {
      doc.addImage(logoImage, "PNG", 20, yPosition, 35, 30);
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }

    // Header - FACTURA
    // doc.setFontSize(24);
    // doc.setTextColor(25, 118, 210);
    // doc.text("FACTURA", pageWidth / 2, yPosition + 15, { align: "center" });
    yPosition += 35;

    // Invoice and Budget Reference
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Nº Factura: ${invoice.invoice_number}`, 20, yPosition);
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

    // Fiscal Data - Two columns (Vendor and Client)
    const columnWidth = (pageWidth - 50) / 2;
    const boxHeight = 38;

    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPosition + 2, columnWidth, boxHeight, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPosition + 2, columnWidth, boxHeight, "S");

    let vendorY = yPosition + 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.business?.name || "-", 24, vendorY);
    vendorY += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`NIF: ${invoice.business?.nif || "-"}`, 24, vendorY);
    vendorY += 4;

    const businessAddress = doc.splitTextToSize(
      invoice.business?.address || "",
      columnWidth - 8,
    );
    doc.text(businessAddress, 24, vendorY);
    vendorY += businessAddress.length * 4;

    doc.text(
      `${invoice.business?.postal_code || ""} ${invoice.business?.locality || ""}`,
      24,
      vendorY,
    );
    vendorY += 4;
    doc.text(invoice.business?.province || "", 24, vendorY);
    vendorY += 4;
    doc.text(`Tel: ${invoice.business?.phone || ""}`, 24, vendorY);

    // CLIENT - Right Column
    const clientX = 20 + columnWidth + 10;

    doc.setFillColor(232, 245, 233);
    doc.rect(clientX, yPosition + 2, columnWidth, boxHeight, "F");
    doc.setDrawColor(129, 199, 132);
    doc.rect(clientX, yPosition + 2, columnWidth, boxHeight, "S");

    let clientY = yPosition + 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.client_name || "-", clientX + 4, clientY);
    clientY += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`NIF: ${invoice.client_nif || "-"}`, clientX + 4, clientY);
    clientY += 4;

    const clientAddress = doc.splitTextToSize(
      invoice.client_address || "",
      columnWidth - 8,
    );
    doc.text(clientAddress, clientX + 4, clientY);
    clientY += clientAddress.length * 4;

    doc.text(
      `${invoice.client_postal_code || ""} ${invoice.client_locality || ""}`,
      clientX + 4,
      clientY,
    );
    clientY += 4;
    doc.text(`Tel: ${invoice.client_phone || ""}`, clientX + 4, clientY);

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

    // Concept (if exists)
    if (invoice.invoices_type?.concept) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("CONCEPTO", 20, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      doc.setFillColor(255, 248, 225);
      const conceptLines = doc.splitTextToSize(
        invoice.invoices_type.concept,
        pageWidth - 44,
      );
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
        margin: { left: 20, right: 20 },
      });

      // Get Y position after table
      // @ts-expect-error - autoTable adds finalY to doc
      yPosition = doc.lastAutoTable.finalY + 10;
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

    // IVA
    if (invoice.price?.vat !== undefined) {
      doc.text("IVA:", summaryX, yPosition, { align: "right" });
      doc.text(formatCurrency(invoice.price.vat), pageWidth - 20, yPosition, {
        align: "right",
      });
      yPosition += 5;
    }

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
    const pageHeight = doc.internal.pageSize.getHeight();
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
