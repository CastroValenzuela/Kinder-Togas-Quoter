import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type Level,
  type City,
  type PackageChoice,
  type ServiceType,
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
  service?: ServiceType;
  togaColor?: string;
  stolaColor?: string;
  togaSize?: string;
};

export function buildSummaryText(q: QuoteData): string {
  const unit = unitPrice(q.pkg, q.level, q.service);
  const total = unit * q.quantity;
  const selectedToga = colorLabel(q.togaColor);
  const stolaVal = stolaLabel(q.stolaColor);
  const cityText = q.city === "tijuana" ? "Tijuana" : (q.city === "ensenada" ? "Ensenada" : cityLabel(q.city));
  const variant = q.pkg && "variant" in q.pkg ? q.pkg.variant : undefined;

  const rows = [
    `Cotización Kinder Togas - Folio: ${q.quoteNumber || 'N/A'}`,
    "",
    `Nivel: ${levelLabel(q.level)}`,
    `Institución: ${q.school}`,
    `Solicitante: ${q.contact}`,
    `Teléfono: ${q.phone}`,
    `Fecha evento: ${q.date ? formatDate(q.date) : 'N/A'}`,
    `Sede / Ciudad: ${cityText}`,
    `Paquete: ${packageLabel(q.pkg, q.level, q.service)}`,
  ];

  if (q.service === "venta") {
    if (q.level === "preescolar" && (variant === "toga_completa" || variant === "toga_borla")) {
      rows.push(`Color Toga: ${selectedToga}`);
      if (q.togaSize) {
        rows.push(`Talla de Toga: ${q.togaSize}`);
      }
      if (variant === "toga_completa") {
        rows.push(`Estola: ${stolaVal}`);
      }
    } else if (variant === "medalla_standard" || variant === "medalla_personalizada") {
      // Medallas no tienen color
    } else if (variant === "oso_graduacion") {
      rows.push(`Color del Oso: ${q.stolaColor === "azul" ? "Azul" : "Rosa"}`);
    } else if (variant?.startsWith("birrete_")) {
      rows.push(`Color de Birrete: ${stolaVal}`);
    } else if (variant?.startsWith("borla_")) {
      rows.push(`Color de Borla: ${stolaVal}`);
    } else {
      rows.push(`Estola: ${stolaVal}`);
    }
  } else {
    const togaColorText = (q.level !== "preescolar" || q.pkg?.kind === "A") ? selectedToga : "Negro";
    rows.push(`Color Toga: ${togaColorText}`);
    rows.push(`Estola: ${stolaVal}`);
  }

  rows.push(
    `Cantidad de alumnos: ${q.quantity}`,
    `Precio unitario: ${formatMXN(unit)}`,
    `Total: ${formatMXN(total)}`,
    "",
    "Cotización válida 15 días."
  );

  return rows.join("\n");
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
  doc.text("kindertogas@gmail.com | WA: 646 130 5987", pageW - margin, currentY + 42, { align: "right" });

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

  doc.text(`Tel: ${q.phone || "Sin teléfono"}`, leftColX, currentY);
  doc.text(`Fecha estimada: ${q.date ? formatDate(q.date) : 'Por definir'}`, rightColX, currentY);

  currentY += 15;

  if (q.email) {
    doc.text(`Email: ${q.email}`, leftColX, currentY);
    currentY += 15;
  }

  currentY += 30;

  // --- PRICING TABLE (Minimalist style) ---
  const unit = unitPrice(q.pkg, q.level, q.service);
  const originalUnit = unitOriginalPrice(q.pkg, q.level, q.service);
  const discountPercent = getDiscountPercent(q.pkg, q.level, q.service);
  const total = unit * q.quantity;

  const selectedToga = colorLabel(q.togaColor);
  const stolaVal = stolaLabel(q.stolaColor);
  const togaSizeStr = q.togaSize ? `\n• Talla: ${q.togaSize}` : "";
  const variant = q.pkg && "variant" in q.pkg ? q.pkg.variant : undefined;

  let itemDescription = "";
  if (q.service === "venta") {
    if (q.level === "preescolar" && (variant === "toga_completa" || variant === "toga_borla")) {
      if (variant === "toga_completa") {
        itemDescription = `Paquete Toga Completa (Venta Preescolar):\n• Incluye Toga, Birrete y Estola\n• Color de Toga: ${selectedToga}${togaSizeStr}\n• Color de Estola: ${stolaVal}`;
      } else {
        itemDescription = `Paquete Toga y Birrete (Venta Preescolar):\n• Incluye Toga y Birrete con Borla del Año (Sin Estola)\n• Color de Toga: ${selectedToga}${togaSizeStr}`;
      }
    } else if (variant === "medalla_standard") {
      itemDescription = `Medalla Estándar (Venta Preescolar):\n• Medalla conmemorativa clásica de graduación.`;
    } else if (variant === "medalla_personalizada") {
      itemDescription = `Medalla Personalizada (Venta Preescolar):\n• Medalla grabada con nombre y detalles personalizados.`;
    } else if (variant === "oso_graduacion") {
      itemDescription = `Oso de Graduación (Venta Preescolar):\n• Oso de peluche de graduación con mini toga y birrete\n• Color del Oso: ${q.stolaColor === "azul" ? "Azul" : "Rosa"}`;
    } else if (variant?.startsWith("birrete_")) {
      itemDescription = `Birrete de graduación: ${packageLabel(q.pkg, q.level, q.service)}\n• Color de Birrete: ${stolaVal}`;
    } else if (variant?.startsWith("borla_")) {
      itemDescription = `Borla conmemorativa: ${packageLabel(q.pkg, q.level, q.service)}\n• Color de Borla: ${stolaVal}`;
    } else {
      itemDescription = `Estola personalizada de graduación: ${packageLabel(q.pkg, q.level, q.service)}\n• Estola color: ${stolaVal}\n• Impresión/acabado premium.`;
    }
  } else {
    const togaColorText = (q.level !== "preescolar" || q.pkg?.kind === "A") ? selectedToga : "Negro";
    itemDescription = `Servicio integral de graduación: ${packageLabel(q.pkg, q.level, q.service)}\n• Toga color: ${togaColorText}\n• Estola color: ${stolaVal}\n• Incluye birrete premium.`;
  }

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
      halign: "left",
      lineWidth: { bottom: 1 },
      lineColor: lineColor
    },
    footStyles: { 
      fontStyle: "bold", 
      textColor: accentColor, 
      fontSize: 12,
      halign: "right",
      lineWidth: { top: 1 },
      lineColor: lineColor
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 70, halign: "center" },
      2: { cellWidth: 80, halign: "right" },
      3: { cellWidth: 90, halign: "right" }
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
  const col2 = q.service === "venta" ? [
    "• El 50% restante deberá liquidarse 5 días antes de la entrega.",
    "• Pedido mínimo: 12 piezas.",
    "• La estola es un recuerdo personalizado y pertenece al alumno.",
  ] : [
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

