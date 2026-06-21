import { describe, it, expect } from "vitest";
import {
  unitPrice,
  unitOriginalPrice,
  getDiscountPercent,
  packageLabel,
  getPriceKey,
  type PackageChoice,
} from "./pricing";

describe("Pricing Calculations (Core Business Engine)", () => {
  it("should calculate correct unit prices for pre-school rent (default values)", () => {
    const pkgA: PackageChoice = { kind: "A" };
    const pkgB_esencial: PackageChoice = { kind: "B", variant: "esencial" };
    const pkgB_balance: PackageChoice = { kind: "B", variant: "hybrid" };
    const pkgB_premium: PackageChoice = { kind: "B", variant: "max" };

    expect(unitPrice(pkgA, "preescolar", "renta")).toBe(350);
    expect(unitPrice(pkgB_esencial, "preescolar", "renta")).toBe(450);
    expect(unitPrice(pkgB_balance, "preescolar", "renta")).toBe(480);
    expect(unitPrice(pkgB_premium, "preescolar", "renta")).toBe(510);
  });

  it("should calculate correct unit prices for pre-school recuerdos sales (default values)", () => {
    const medallaStd: PackageChoice = { kind: "B", variant: "medalla_standard" };
    const medallaPers: PackageChoice = { kind: "B", variant: "medalla_personalizada" };
    const osoGrad: PackageChoice = { kind: "B", variant: "oso_graduacion" };

    expect(unitPrice(medallaStd, "preescolar", "venta")).toBe(35);
    expect(unitPrice(medallaPers, "preescolar", "venta")).toBe(45);
    expect(unitPrice(osoGrad, "preescolar", "venta")).toBe(150);
  });

  it("should calculate correct unit prices for pre-school togas sales (default values)", () => {
    const togaCompleta: PackageChoice = { kind: "B", variant: "toga_completa" };
    const togaBorla: PackageChoice = { kind: "B", variant: "toga_borla" };

    expect(unitPrice(togaCompleta, "preescolar", "venta")).toBe(450);
    expect(unitPrice(togaBorla, "preescolar", "venta")).toBe(380);
  });

  it("should resolve correct pricing database keys", () => {
    expect(getPriceKey({ kind: "A" }, "preescolar", "renta")).toBe("A_PREESCOLAR");
    expect(getPriceKey({ kind: "B", variant: "medalla_standard" }, "preescolar", "venta")).toBe("V_MEDALLA_STANDARD");
    expect(getPriceKey({ kind: "B", variant: "medalla_personalizada" }, "preescolar", "venta")).toBe("V_MEDALLA_PERSONALIZADA");
    expect(getPriceKey({ kind: "B", variant: "oso_graduacion" }, "preescolar", "venta")).toBe("V_OSO_GRADUACION");
    expect(getPriceKey({ kind: "B", variant: "toga_completa" }, "preescolar", "venta")).toBe("V_TOGA_BIRRETE_ESTOLA");
  });

  it("should output correct human-readable package labels", () => {
    expect(packageLabel({ kind: "A" }, "preescolar", "renta")).toBe("Paquete A — Básico");
    expect(packageLabel({ kind: "B", variant: "medalla_standard" }, "preescolar", "venta")).toBe("Medalla Estándar");
    expect(packageLabel({ kind: "B", variant: "medalla_personalizada" }, "preescolar", "venta")).toBe("Medalla Personalizada");
    expect(packageLabel({ kind: "B", variant: "oso_graduacion" }, "preescolar", "venta")).toBe("Oso de Graduación");
    expect(packageLabel({ kind: "B", variant: "toga_completa" }, "preescolar", "venta")).toBe("Toga Completa (Toga, Birrete y Estola)");
  });
});
