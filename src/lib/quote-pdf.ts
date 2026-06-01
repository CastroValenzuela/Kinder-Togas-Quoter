import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type Level,
  type City,
  type PackageChoice,
  unitPrice,
  unitOriginalPrice,
  getDiscountPercent,
  packageLabel,
  levelLabel,
  cityLabel,
  formatMXN,
  formatDate,
  colorLabel,
  stolaLabel,
} from "./pricing";
import { LOGO_BASE64 } from "./logo-data";

export type QuoteData = {
  level?: Level;
  city?: City;
  pkg?: PackageChoice;
  quantity: number;
  school: string;
  contact: string;
  phone: string;
  date: string;
  email?: string;
  quoteNumber?: string;
  togaColor?: string;
  stolaColor?: string;
};

export function buildSummaryText(q: QuoteData): string {
  const unit = unitPrice(q.pkg, q.level);
  const total = unit * q.quantity;
  const selectedToga = (q.level !== "preescolar" || q.pkg?.kind === "A") ? colorLabel(q.togaColor) : "Negro";
  const stolaVal = stolaLabel(q.stolaColor);
  const cityText = q.city === "tijuana" ? "Tijuana" : (q.city === "ensenada" ? "Ensenada" : cityLabel(q.city));

  return [
    `Cotización Kinder Togas - Folio: ${q.quoteNumber || 'N/A'}`,
    "",
    `Nivel: ${levelLabel(q.level)}`,
    `Institución: ${q.school}`,
    `Solicitante: ${q.contact}`,
    `Teléfono: ${q.phone}`,
    `Fecha evento: ${q.date ? formatDate(q.date) : 'N/A'}`,
    `Sede / Ciudad: ${cityText}`,
    `Paquete: ${packageLabel(q.pkg, q.level)}`,
    `Color Toga: ${selectedToga}`,
    `Estola: ${stolaVal}`,
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
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 50;
  let currentY = 50;

  // Colors - Minimalist Palette
  const textColor: [number, number, number] = [30, 30, 30]; // Dark charcoal
  const mutedColor: [number, number, number] = [120, 120, 120]; // Gray
  const accentColor: [number, number, number] = [30, 35, 70]; // Navy blue for absolute highlights
  const lineColor: [number, number, number] = [230, 230, 230]; // Very light gray for dividers

  // --- HEADER ---
  // Logo
  doc.addImage(LOGO_BASE64, "PNG", margin, currentY, 55, 55);

  // Brand Name & Slogan (Top Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("KINDER TOGAS", pageW - margin, currentY + 15, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text("MOMENTOS QUE SE QUEDAN PARA SIEMPRE", pageW - margin, currentY + 28, { align: "right" });
  
  doc.setFontSize(9);
  doc.text("ventas@kindertogas.com | WA: 646 130 5987", pageW - margin, currentY + 42, { align: "right" });

  currentY += 80;

  // --- TITLE & META ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Cotización", margin, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(`FOLIO: ${q.quoteNumber || 'N/A'}`, pageW - margin, currentY - 5, { align: "right" });
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`, pageW - margin, currentY + 10, { align: "right" });

  currentY += 35;

  // Divider
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.setLineWidth(1);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 30;

  // --- CLIENT DETAILS (2 Columns, Minimal) ---
  const leftColX = margin;
  const rightColX = pageW / 2 + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text("PARA:", leftColX, currentY);
  doc.text("DETALLES DEL EVENTO:", rightColX, currentY);

  currentY += 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(q.school || "Institución no especificada", leftColX, currentY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nivel: ${levelLabel(q.level)}`, rightColX, currentY);

  currentY += 15;

  doc.setFontSize(10);
  doc.text(q.contact || "Sin nombre de contacto", leftColX, currentY);
  
  const cityText = q.city === "tijuana" ? "Tijuana" : (q.city === "ensenada" ? "Ensenada" : cityLabel(q.city));
  doc.text(`Sede: ${cityText}`, rightColX, currentY);

  currentY += 15;

  doc.text(q.phone || "Sin teléfono", leftColX, currentY);
  doc.text(`Fecha estimada: ${q.date ? formatDate(q.date) : 'Por definir'}`, rightColX, currentY);

  currentY += 45;

  // --- PRICING TABLE (Minimalist style) ---
  const unit = unitPrice(q.pkg, q.level);
  const originalUnit = unitOriginalPrice(q.pkg, q.level);
  const discountPercent = getDiscountPercent(q.pkg, q.level);
  const total = unit * q.quantity;

  const selectedToga = (q.level !== "preescolar" || q.pkg?.kind === "A") ? colorLabel(q.togaColor) : "Negro";
  const stolaVal = stolaLabel(q.stolaColor);

  const itemDescription = `Servicio integral de graduación: ${packageLabel(q.pkg, q.level)}\n• Toga color: ${selectedToga}\n• Estola color: ${stolaVal}\n• Incluye birrete premium.`;

  const tableBody: any[] = [];
  if (discountPercent > 0) {
    const originalTotal = originalUnit * q.quantity;
    const savings = (originalUnit - unit) * q.quantity;
    tableBody.push(
      [itemDescription, q.quantity.toString(), formatMXN(originalUnit), formatMXN(originalTotal)],
      [{ content: `Descuento Especial Aplicado (${discountPercent}%)`, styles: { fontStyle: "italic", textColor: [184, 158, 105] as [number, number, number] } }, "1", `-${formatMXN(originalUnit - unit)}`, `-${formatMXN(savings)}`]
    );
  } else {
    tableBody.push([itemDescription, q.quantity.toString(), formatMXN(unit), formatMXN(total)]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["DESCRIPCIÓN", "CANTIDAD", "UNITARIO", "TOTAL"]],
    body: tableBody,
    foot: [["", "", "TOTAL:", formatMXN(total)]],
    theme: "plain", // No backgrounds
    styles: { 
      font: "helvetica", 
      fontSize: 10, 
      cellPadding: 12,
      textColor: textColor
    },
    headStyles: { 
      fontStyle: "bold", 
      textColor: mutedColor, 
      fontSize: 8,
      halign: "left"
    },
    footStyles: { 
      fontStyle: "bold", 
      textColor: accentColor, 
      fontSize: 12,
      halign: "right"
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 70, halign: "center" },
      2: { cellWidth: 80, halign: "right" },
      3: { cellWidth: 90, halign: "right" }
    },
    didDrawPage: (data) => {
      // Custom clean borders for the table header and footer
      const table = data.table;
      doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      doc.setLineWidth(1);
      
      // Line under header
      const headerY = table.head[0].height + data.settings.startY!;
      doc.line(margin, headerY, pageW - margin, headerY);
      
      // Line above footer
      // @ts-expect-error accessing private property
      const footerY = table.cursor.y - table.foot[0].height;
      doc.line(margin, footerY, pageW - margin, footerY);
    }
  });

  // @ts-expect-error autotable adds lastAutoTable
  currentY = doc.lastAutoTable.finalY + 60;

  // --- NOTES & CONDITIONS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text("TÉRMINOS Y CONDICIONES", margin, currentY);
  
  currentY += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const col1 = [
    "• Todos los precios están expresados en Moneda Nacional (MXN).",
    "• La cotización tiene una vigencia estricta de 15 días.",
    "• Para agendar fecha y congelar precio, se requiere un 50% de anticipo.",
  ];
  const col2 = [
    "• El 50% restante deberá liquidarse 5 días antes de la entrega.",
    "• Se requiere un depósito en garantía reembolsable de $800 por equipo.",
    "• La estola es un recuerdo personalizado y pertenece al alumno.",
  ];

  col1.forEach((text, i) => doc.text(text, margin, currentY + (i * 15)));
  col2.forEach((text, i) => doc.text(text, pageW / 2 + 10, currentY + (i * 15)));
  
  // --- FOOTER ---
  const footerY = pageH - 40;
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.setLineWidth(1);
  doc.line(margin, footerY - 20, pageW - margin, footerY - 20);

  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text("Esta es una cotización informativa. No representa un contrato legal hasta el pago del anticipo.", pageW / 2, footerY, { align: "center" });
  doc.text("www.kindertogas.com", pageW / 2, footerY + 12, { align: "center" });

  doc.save(`Cotizacion_KinderTogas_${q.quoteNumber || 'N_A'}.pdf`);
}

