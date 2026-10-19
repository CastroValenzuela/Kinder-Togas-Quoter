import { describe, it, expect } from "vitest";
import { buildSummaryText, type QuoteData } from "./quote-pdf";

describe("quote-pdf helpers", () => {
  describe("buildSummaryText", () => {
    it("should generate a complete summary string from QuoteData", () => {
      const mockQuote: QuoteData = {
        level: "preescolar",
        city: "tijuana",
        pkg: { kind: "B", variant: "esencial" },
        quantity: 15,
        school: "Colegio de Prueba",
        contact: "Juan Pérez",
        phone: "6641234567",
        date: "2026-07-07",
        quoteNumber: "KT-9999",
        service: "renta",
        togaColor: "negro",
        stolaColor: "dorada",
      };

      const summary = buildSummaryText(mockQuote);
      expect(summary).toContain("Folio: KT-9999");
      expect(summary).toContain("Nivel: Preescolar");
      expect(summary).toContain("Colegio de Prueba");
      expect(summary).toContain("Sede / Ciudad: Tijuana");
      expect(summary).toContain("Cantidad de alumnos: 15");
      expect(summary).toContain("Total:");
      expect(summary).toContain("Color Toga: Negro");
    });

    it("should include custom toga color for preescolar paquete B in summary", () => {
      const mockQuote: QuoteData = {
        level: "preescolar",
        city: "tijuana",
        pkg: { kind: "B", variant: "esencial" },
        quantity: 15,
        school: "Colegio de Prueba",
        contact: "Juan Pérez",
        phone: "6641234567",
        date: "2026-07-07",
        quoteNumber: "KT-9999",
        service: "renta",
        togaColor: "azul",
        stolaColor: "dorada",
      };

      const summary = buildSummaryText(mockQuote);
      expect(summary).toContain("Color Toga: Azul");
    });

    it("should generate a multi-product summary string when items array has multiple products", () => {
      const mockMultiQuote: QuoteData = {
        level: "preescolar",
        city: "ensenada",
        quantity: 45,
        school: "Colegio Bilingüe",
        contact: "María González",
        phone: "6461234567",
        date: "2026-06-20",
        quoteNumber: "KT-V-EN-2026-101",
        service: "venta",
        items: [
          {
            id: "1",
            category: "togas",
            pkg: { kind: "B", variant: "toga_birrete_estola" },
            quantity: 30,
            unitPrice: 450,
            totalPrice: 13500,
            label: "Paquete Toga, Birrete y Estola",
            details: "Toga: Negro • Talla: M • Estola: Dorada",
          },
          {
            id: "2",
            category: "recuerdos",
            pkg: { kind: "B", variant: "oso_graduacion" },
            quantity: 15,
            unitPrice: 150,
            totalPrice: 2250,
            label: "Oso de Graduación",
            details: "Color: Azul",
          },
        ],
      };

      const summary = buildSummaryText(mockMultiQuote);
      expect(summary).toContain("Folio: KT-V-EN-2026-101");
      expect(summary).toContain("Colegio Bilingüe");
      expect(summary).toContain("Productos cotizados (2):");
      expect(summary).toContain("30x Paquete Toga, Birrete y Estola");
      expect(summary).toContain("15x Oso de Graduación");
      expect(summary).toContain("Total Cotización: $15,750 MXN");
    });
  });
});
