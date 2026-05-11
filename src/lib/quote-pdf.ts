import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type Level,
  type City,
  type PackageChoice,
  unitPrice,
  packageLabel,
  levelLabel,
  cityLabel,
  formatMXN,
} from "./pricing";

export type QuoteData = {
  level?: Level;
  city?: City;
  pkg?: PackageChoice;
  quantity: number;
};

export function buildSummaryText(q: QuoteData): string {
  const unit = unitPrice(q.pkg);
  const total = unit * q.quantity;
  return [
    "Cotización Kinder Togas",
    "",
    `Nivel: ${levelLabel(q.level)}`,
    `Ciudad: ${cityLabel(q.city)}`,
    `Paquete: ${packageLabel(q.pkg)}`,
    `Cantidad de alumnos: ${q.quantity}`,
    `Precio unitario: ${formatMXN(unit)}`,
    `Total: ${formatMXN(total)}`,
    "",
    "Cotización válida 15 días.",
  ].join("\n");
}

export function generateQuotePDF(q: QuoteData): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 56;

  // Header wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 35, 70);
  doc.text("Kinder Togas", margin, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  doc.text("Cotización", margin, 88);

  const fecha = new Date().toLocaleDateString("es-MX", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc.text(fecha, pageW - margin, 88, { align: "right" });

  // Hairline
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(margin, 104, pageW - margin, 104);

  const unit = unitPrice(q.pkg);
  const total = unit * q.quantity;

  autoTable(doc, {
    startY: 130,
    margin: { left: margin, right: margin },
    head: [["Concepto", "Detalle"]],
    body: [
      ["Nivel escolar", levelLabel(q.level)],
      ["Ciudad", cityLabel(q.city)],
      ["Paquete", packageLabel(q.pkg)],
      ["Precio unitario", formatMXN(unit)],
      ["Cantidad de alumnos", String(q.quantity)],
    ],
    styles: { font: "helvetica", fontSize: 11, cellPadding: 10, textColor: [40, 40, 50] },
    headStyles: { fillColor: [30, 35, 70], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 250] },
  });

  // Total destacado
  // @ts-expect-error autotable adds lastAutoTable
  const endY: number = doc.lastAutoTable.finalY ?? 200;

  doc.setDrawColor(30, 35, 70);
  doc.setLineWidth(1);
  doc.line(margin, endY + 30, pageW - margin, endY + 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("TOTAL", margin, endY + 56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 35, 70);
  doc.text(formatMXN(total), pageW - margin, endY + 60, { align: "right" });

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text(
    "Cotización válida 15 días.",
    margin,
    doc.internal.pageSize.getHeight() - 40,
  );

  doc.save(`cotizacion-kinder-togas-${Date.now()}.pdf`);
}
