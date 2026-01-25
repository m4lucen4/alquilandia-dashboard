import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "@/types/invoices";
import { formatCurrency } from "@/helpers";

/**
 * Generates a PDF document for an invoice using jsPDF
 * @param invoice - Invoice data with all relations
 * @returns PDF blob
 */
export const generateInvoicePDF = async (
  invoice: Invoice,
): Promise<Blob> => {
  try {
    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header - FACTURA
    doc.setFontSize(24);
    doc.setTextColor(25, 118, 210); // Blue color
    doc.text("FACTURA", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

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

    // Business Information Box
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE LA EMPRESA", 20, yPosition);
    yPosition += 2;

    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPosition, pageWidth - 40, 28, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPosition, pageWidth - 40, 28, "S");
    yPosition += 6;

    doc.setFont("helvetica", "bold");
    doc.text(invoice.business?.name || "-", 24, yPosition);
    yPosition += 5;

    doc.setFont("helvetica", "normal");
    doc.text(`NIF: ${invoice.business?.nif || "-"}`, 24, yPosition);
    yPosition += 4;
    doc.text(invoice.business?.address || "", 24, yPosition);
    yPosition += 4;
    doc.text(
      `${invoice.business?.postal_code || ""} ${invoice.business?.locality || ""}, ${invoice.business?.province || ""}`,
      24,
      yPosition,
    );
    yPosition += 4;
    doc.text(`Teléfono: ${invoice.business?.phone || ""}`, 24, yPosition);
    yPosition += 10;

    // Invoice Type and Tax Type - Two columns
    const boxWidth = (pageWidth - 50) / 2;

    // Invoice Type Box (Blue)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TIPO DE FACTURA", 20, yPosition);

    doc.setFillColor(227, 242, 253);
    doc.rect(20, yPosition + 2, boxWidth, 12, "F");
    doc.setDrawColor(144, 202, 249);
    doc.rect(20, yPosition + 2, boxWidth, 12, "S");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.invoices_type?.invoices || "-", 24, yPosition + 8);
    doc.setFont("helvetica", "normal");
    doc.text(`${invoice.invoices_type?.percentage || 0}%`, 24, yPosition + 12);

    // Tax Type Box (Green)
    const secondBoxX = 20 + boxWidth + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TIPO DE IMPUESTO", secondBoxX, yPosition);

    doc.setFillColor(232, 245, 233);
    doc.rect(secondBoxX, yPosition + 2, boxWidth, 12, "F");
    doc.setDrawColor(129, 199, 132);
    doc.rect(secondBoxX, yPosition + 2, boxWidth, 12, "S");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.taxes_type?.name || "-", secondBoxX + 4, yPosition + 8);
    doc.setFont("helvetica", "normal");
    doc.text(`${invoice.taxes_type?.tax || 0}%`, secondBoxX + 4, yPosition + 12);

    yPosition += 20;

    // Budget Lines Table
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("LÍNEAS DE PRESUPUESTO", 20, yPosition);
    yPosition += 5;

    const tableData = invoice.budgetlines.map((line, index) => [
      (index + 1).toString(),
      line.nombre || "-",
      line.categoria || "-",
      line.unidades?.toString() || "1",
      formatCurrency(line.precioUd || 0),
      formatCurrency(line.totalPrice || 0),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Nombre", "Categoría", "Unidades", "Precio Ud.", "Total"]],
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
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    });

    // Get Y position after table
    // @ts-expect-error - autoTable adds finalY to doc
    yPosition = doc.lastAutoTable.finalY + 10;

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

    // Total line
    yPosition += 2;
    doc.setDrawColor(0, 0, 0);
    doc.line(summaryX - 10, yPosition - 2, pageWidth - 20, yPosition - 2);

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
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Factura generada el ${new Date(invoice.created_at || "").toLocaleDateString("es-ES")}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );

    // Convert to Blob
    const pdfBlob = doc.output("blob");

    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
