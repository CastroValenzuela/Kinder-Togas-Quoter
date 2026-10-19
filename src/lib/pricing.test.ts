import { describe, it, expect } from "vitest";
import {
  colorLabel,
  stolaLabel,
  formatMXN,
  formatDate,
  getPriceKey,
  unitPrice,
  unitOriginalPrice,
  getDiscountPercent,
  bundleToQuoteItems,
  isSameProductConfig,
} from "./pricing";

describe("pricing helper functions", () => {
  describe("colorLabel", () => {
    it("should format valid colors correctly", () => {
      expect(colorLabel("negro")).toBe("Negro");
      expect(colorLabel("rojo")).toBe("Rojo");
      expect(colorLabel("MAGENTA")).toBe("Turquesa");
    });

    it("should return fallback for unknown or empty colors", () => {
      expect(colorLabel(undefined)).toBe("—");
      expect(colorLabel("unknown_color")).toBe("unknown_color");
    });
  });

  describe("stolaLabel", () => {
    it("should format valid stola colors correctly", () => {
      expect(stolaLabel("oro")).toBe("Dorado");
      expect(stolaLabel("morado")).toBe("Morado");
      expect(stolaLabel("azul_pastel")).toBe("Azul Pastel");
    });

    it("should return fallback for empty stolas", () => {
      expect(stolaLabel(undefined)).toBe("—");
    });
  });

  describe("formatMXN", () => {
    it("should format numbers as MXN currency with no decimals", () => {
      const formatted = formatMXN(1500);
      expect(formatted).toContain("1,500");
      expect(formatted).toContain("$");
    });
  });

  describe("formatDate", () => {
    it("should format date strings correctly", () => {
      expect(formatDate("2026-07-07")).toContain("julio");
      expect(formatDate("2026-07-07")).toContain("2026");
    });

    it("should return original value for invalid format", () => {
      expect(formatDate("not-a-date")).toBe("not-a-date");
      expect(formatDate("")).toBe("—");
    });
  });

  describe("getPriceKey", () => {
    it("should return correct price keys for renta", () => {
      expect(getPriceKey({ kind: "A" }, "preescolar", "renta")).toBe("A_PREESCOLAR");
      expect(getPriceKey({ kind: "B", variant: "esencial" }, "preescolar", "renta")).toBe(
        "B_ESENCIAL_PREESCOLAR",
      );
      expect(getPriceKey({ kind: "B", variant: "hybrid" }, "preescolar", "renta")).toBe(
        "B_BALANCE_PREESCOLAR",
      );
      expect(getPriceKey({ kind: "B", variant: "max" }, "preescolar", "renta")).toBe(
        "B_PREMIUM_PREESCOLAR",
      );

      expect(getPriceKey({ kind: "A" }, "primaria", "renta")).toBe("A_PRIMARIA");
      expect(getPriceKey({ kind: "B", variant: "pri_c" }, "primaria", "renta")).toBe("PRI_C");
      expect(getPriceKey({ kind: "B", variant: "pri_b" }, "primaria", "renta")).toBe("PRI_B");
      expect(getPriceKey({ kind: "B", variant: "pri_a" }, "primaria", "renta")).toBe("PRI_A");

      expect(getPriceKey({ kind: "A" }, "secundaria", "renta")).toBe("A_SECUNDARIA");
      expect(getPriceKey({ kind: "B", variant: "sec_b" }, "secundaria", "renta")).toBe("SEC_B");
      expect(getPriceKey({ kind: "B", variant: "sec_a" }, "secundaria", "renta")).toBe("SEC_A");

      expect(getPriceKey({ kind: "A" }, "preparatoria", "renta")).toBe("A_PREPARATORIA");
      expect(getPriceKey({ kind: "B", variant: "prep_b" }, "preparatoria", "renta")).toBe("PREP_B");
      expect(getPriceKey({ kind: "B", variant: "prep_a" }, "preparatoria", "renta")).toBe("PREP_A");
      expect(getPriceKey({ kind: "C", variant: "prep_c1" }, "preparatoria", "renta")).toBe(
        "PREP_C1",
      );
      expect(getPriceKey({ kind: "C", variant: "prep_c2" }, "preparatoria", "renta")).toBe(
        "PREP_C2",
      );

      expect(getPriceKey({ kind: "A" }, "universidad", "renta")).toBe("UNI_A");
      expect(getPriceKey({ kind: "B", variant: "uni_b" }, "universidad", "renta")).toBe("UNI_B");
      expect(getPriceKey({ kind: "B", variant: "uni_c" }, "universidad", "renta")).toBe("UNI_C");
    });

    it("should return correct price keys for venta", () => {
      expect(getPriceKey({ kind: "B", variant: "esencial" }, "preescolar", "venta")).toBe(
        "V_E1_PREESCOLAR",
      );
      expect(getPriceKey({ kind: "B", variant: "hybrid" }, "preescolar", "venta")).toBe(
        "V_E2_PREESCOLAR",
      );
      expect(getPriceKey({ kind: "B", variant: "max" }, "preescolar", "venta")).toBe(
        "V_E3_PREESCOLAR",
      );
      expect(getPriceKey({ kind: "B", variant: "birrete_decorado" }, "preescolar", "venta")).toBe(
        "V_B_DECORADO",
      );
      expect(getPriceKey({ kind: "B", variant: "birrete_liso" }, "preescolar", "venta")).toBe(
        "V_B_LISO",
      );
      expect(getPriceKey({ kind: "B", variant: "borla_dije" }, "preescolar", "venta")).toBe(
        "V_B_BORLA_DIJE",
      );
      expect(getPriceKey({ kind: "B", variant: "borla_clasica" }, "preescolar", "venta")).toBe(
        "V_B_BORLA_CLASICA",
      );
    });

    it("should return undefined for invalid packages", () => {
      expect(getPriceKey(undefined)).toBeUndefined();
    });
  });

  describe("unitPrice and discount logic", () => {
    it("should calculate original price correctly for both renta and venta", () => {
      expect(unitOriginalPrice({ kind: "A" }, "preescolar", "renta")).toBe(350);
      expect(unitOriginalPrice({ kind: "B", variant: "birrete_decorado" }, "preescolar", "venta")).toBe(250);
    });

    it("should return zero for invalid parameters", () => {
      expect(unitOriginalPrice(undefined)).toBe(0);
    });

    it("should return correct discount percent", () => {
      expect(getDiscountPercent({ kind: "A" }, "preescolar")).toBe(0);
    });

    it("should calculate unit price with/without discounts correctly", () => {
      expect(unitPrice({ kind: "A" }, "preescolar")).toBe(350);
    });
  });

  describe("bundleToQuoteItems", () => {
    it("should convert a basic package without addons into a single QuoteItem", () => {
      const items = bundleToQuoteItems({
        pkg: { kind: "A" },
        level: "preescolar",
        service: "renta",
        togaColor: "negro",
        stolaColor: "dorada",
        totalQuantity: 25,
      });

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("main-package");
      expect(items[0].quantity).toBe(25);
      expect(items[0].totalPrice).toBe(350 * 25);
    });

    it("should include size distribution in details when enabled", () => {
      const items = bundleToQuoteItems({
        pkg: { kind: "A" },
        level: "preescolar",
        service: "renta",
        togaColor: "negro",
        stolaColor: "dorada",
        totalQuantity: 25,
        useSizeDistribution: true,
        sizes: { XS: 5, S: 10, M: 10, L: 0, XL: 0 },
      });

      expect(items).toHaveLength(1);
      expect(items[0].details).toContain("5 XS");
      expect(items[0].details).toContain("10 S");
      expect(items[0].details).toContain("10 M");
    });

    it("should generate quote items for all active addons", () => {
      const items = bundleToQuoteItems({
        pkg: { kind: "A" },
        level: "preescolar",
        service: "renta",
        togaColor: "negro",
        stolaColor: "dorada",
        totalQuantity: 20,
        addons: {
          oso: { enabled: true, quantity: 20, color: "rosa" },
          medalla: { enabled: true, quantity: 20, variant: "personalizada" },
          borla: { enabled: true, quantity: 20 },
          docente: { enabled: true, quantity: 3 },
        },
      });

      // 1 main package + 4 addons = 5 items
      expect(items).toHaveLength(5);

      const osoItem = items.find((i: any) => i.id === "addon-oso");
      expect(osoItem).toBeDefined();
      expect(osoItem.quantity).toBe(20);
      expect(osoItem.totalPrice).toBe(150 * 20);
      expect(osoItem.details).toContain("Rosa");

      const medallaItem = items.find((i: any) => i.id === "addon-medalla");
      expect(medallaItem).toBeDefined();
      expect(medallaItem.quantity).toBe(20);
      expect(medallaItem.label).toContain("Personalizada");
      expect(medallaItem.totalPrice).toBe(45 * 20);

      const borlaItem = items.find((i: any) => i.id === "addon-borla");
      expect(borlaItem).toBeDefined();
      expect(borlaItem.totalPrice).toBe(25 * 20);

      const docenteItem = items.find((i: any) => i.id === "addon-docente");
      expect(docenteItem).toBeDefined();
      expect(docenteItem.quantity).toBe(3);
    });
  });

  describe("isSameProductConfig (Amazon-style deduplication)", () => {
    it("identifies identical product configurations as matching", () => {
      const item1: any = {
        category: "togas",
        level: "preescolar",
        service: "venta",
        pkg: { kind: "B", variant: "toga_birrete_estola" },
        togaColor: "negro",
        stolaColor: "dorada",
        togaSize: "M",
      };
      const item2: any = {
        category: "togas",
        level: "preescolar",
        service: "venta",
        pkg: { kind: "B", variant: "toga_birrete_estola" },
        togaColor: "negro",
        stolaColor: "dorada",
        togaSize: "M",
      };
      expect(isSameProductConfig(item1, item2)).toBe(true);
    });

    it("identifies different sizes or colors as distinct line items", () => {
      const item1: any = {
        category: "togas",
        level: "preescolar",
        service: "venta",
        pkg: { kind: "B", variant: "toga_birrete_estola" },
        togaColor: "negro",
        stolaColor: "dorada",
        togaSize: "M",
      };
      const itemDifferentSize: any = {
        ...item1,
        togaSize: "G",
      };
      const itemDifferentColor: any = {
        ...item1,
        stolaColor: "azul",
      };
      expect(isSameProductConfig(item1, itemDifferentSize)).toBe(false);
      expect(isSameProductConfig(item1, itemDifferentColor)).toBe(false);
    });
  });
});


