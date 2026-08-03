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
  });
});
