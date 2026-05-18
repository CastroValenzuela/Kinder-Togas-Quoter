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

  return [
    `Cotización Kinder Togas - Folio: ${q.quoteNumber || 'N/A'}`,
    "",
    `Nivel: ${levelLabel(q.level)}`,
    `Institución: ${q.school}`,
    `Solicitante: ${q.contact}`,
    `Teléfono: ${q.phone}`,
    `Fecha evento: ${q.date ? formatDate(q.date) : 'N/A'}`,
    `Ciudad: ${cityLabel(q.city)}`,
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
  const margin = 56;
  let currentY = 50;

  // Helper for colors
  const navy: [number, number, number] = [30, 35, 70];
  const gold: [number, number, number] = [184, 158, 105]; // Stylized gold/cream
  const lightGray: [number, number, number] = [245, 245, 250];

  // 1. WATERMARK (Light text in background)
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("KINDER TOGAS", pageW / 2, pageH / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();

  // 2. HEADER: Real Logo
  doc.addImage(LOGO_BASE64, "PNG", margin, currentY + 15, 50, 50);

  doc.setFontSize(14);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("KINDER TOGAS", margin + 65, currentY + 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("MOMENTOS QUE SE QUEDAN PARA SIEMPRE", margin + 65, currentY + 38);

  // Quote Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`FOLIO: ${q.quoteNumber || 'N/A'}`, pageW - margin, currentY + 25, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`, pageW - margin, currentY + 38, { align: "right" });
  
  currentY += 100;

  // 3. DETAILS BOX (Glassmorphism style)
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, currentY, pageW - (margin * 2), 110, 5, 5, "F");
  
  const detailsX = margin + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("DATOS DEL CLIENTE", detailsX, currentY + 20);
  
  doc.setDrawColor(navy[0], navy[1], navy[2]);
  doc.setLineWidth(0.5);
  doc.line(detailsX, currentY + 25, detailsX + 100, currentY + 25);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("Institución:", detailsX, currentY + 45);
  doc.text("Solicitante:", detailsX, currentY + 60);
  doc.text("Teléfono:", detailsX, currentY + 75);
  doc.text("Nivel:", detailsX, currentY + 90);
  doc.text("Alumnos:", detailsX, currentY + 105);

  doc.setFont("helvetica", "normal");
  doc.text(q.school || "N/A", detailsX + 70, currentY + 45);
  doc.text(q.contact || "N/A", detailsX + 70, currentY + 60);
  doc.text(q.phone || "N/A", detailsX + 70, currentY + 75);
  doc.text(levelLabel(q.level), detailsX + 70, currentY + 90);
  doc.text(String(q.quantity), detailsX + 70, currentY + 105);

  if (q.date) {
    doc.setFont("helvetica", "bold");
    doc.text("Fecha Evento:", detailsX + 250, currentY + 45);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(q.date), detailsX + 330, currentY + 45);
  }

  if (q.level) {
    const selectedToga = (q.level !== "preescolar" || q.pkg?.kind === "A") ? colorLabel(q.togaColor) : "Negro";
    const stolaVal = stolaLabel(q.stolaColor);

    doc.setFont("helvetica", "bold");
    doc.text("Color Toga:", detailsX + 250, currentY + 60);
    doc.setFont("helvetica", "normal");
    doc.text(selectedToga, detailsX + 330, currentY + 60);

    doc.setFont("helvetica", "bold");
    doc.text("Estola:", detailsX + 250, currentY + 75);
    doc.setFont("helvetica", "normal");
    doc.text(stolaVal, detailsX + 330, currentY + 75);
  }

  currentY += 140;

  // 4. SERVICE DESCRIPTION
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("DETALLES DEL SERVICIO", margin, currentY);
  currentY += 15;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const desc = `Servicio integral de graduación para nivel ${levelLabel(q.level)}. Incluye renta de toga y birrete de alta calidad, estola personalizada con logo de la institución y año de egreso. El servicio garantiza uniformidad y distinción para todos los graduados.`;
  const splitDesc = doc.splitTextToSize(desc, pageW - (margin * 2));
  doc.text(splitDesc, margin, currentY);
  currentY += splitDesc.length * 12 + 25;

  // 5. PRICING TABLE
  const unit = unitPrice(q.pkg, q.level);
  const total = unit * q.quantity;

  const selectedToga = (q.level !== "preescolar" || q.pkg?.kind === "A") ? colorLabel(q.togaColor) : "Negro";
  const stolaVal = stolaLabel(q.stolaColor);

  const itemDescription = `Paquete ${packageLabel(q.pkg, q.level)}\n(Toga: ${selectedToga}, Birrete, Estola: ${stolaVal})`;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["DESCRIPCIÓN", "CANTIDAD", "UNITARIO", "TOTAL"]],
    body: [
      [
        { content: itemDescription, styles: { fontStyle: "bold" } },
        q.quantity.toString(),
        formatMXN(unit),
        formatMXN(total)
      ]
    ],
    foot: [
      ["", "", "TOTAL GENERAL", formatMXN(total)]
    ],
    styles: { font: "helvetica", fontSize: 9, cellPadding: 10 },
    headStyles: { fillColor: navy, textColor: 255, halign: "center" },
    footStyles: { fillColor: [230, 230, 235], textColor: navy, fontStyle: "bold", halign: "right" },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" }
    }
  });

  // @ts-expect-error autotable adds lastAutoTable
  currentY = doc.lastAutoTable.finalY + 50;

  // 6. TERMS AND CONDITIONS (Two columns)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text("NOTAS Y CONDICIONES", margin, currentY);
  currentY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  
  const col1 = [
    "• Precios en Moneda Nacional (MXN).",
    "• Incluye renta de Toga, Birrete y Estola.",
    "• La estola se queda con el alumno.",
    "• Garantía reembolsable de $800 por equipo.",
  ];
  const col2 = [
    "• Vigencia de cotización: 15 días.",
    "• Se requiere 50% de anticipo para contrato.",
    "• Liquidación total 5 días antes del evento.",
    "• Sujeto a disponibilidad de agenda.",
  ];

  col1.forEach((text, i) => doc.text(text, margin, currentY + (i * 12)));
  col2.forEach((text, i) => doc.text(text, margin + 250, currentY + (i * 12)));
  
  currentY += 80;

  // 7. SIGNATURE AND CONTACT
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY + 40, margin + 150, currentY + 40);
  doc.setFontSize(8);
  doc.text("Firma de Autorización", margin, currentY + 52);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CONTACTO", pageW - margin, currentY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("WhatsApp: 646 130 5987", pageW - margin, currentY + 15, { align: "right" });
  doc.text("Email: ventas@kindertogas.com", pageW - margin, currentY + 27, { align: "right" });
  doc.text("Calle Ruiz y Cuarta #410, Ensenada", pageW - margin, currentY + 39, { align: "right" });

  // 8. FOOTER
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Esta es una cotización informativa y no representa un contrato legal hasta su firma y pago de anticipo.", pageW / 2, pageH - 30, { align: "center" });

  doc.save(`Cotizacion_KinderTogas_${q.quoteNumber || 'N_A'}.pdf`);
}
