# Cotizador Kinder Togas

Experiencia de cotización en 4 pasos con estética minimalista (blanco, serif sofisticada, acento azul marino), animaciones Framer Motion, PDF con jsPDF y envío vía mailto. Sin backend.

## Dependencias a instalar

- `framer-motion`
- `jspdf`
- `jspdf-autotable`

## Sistema de diseño (`src/styles.css`)

- Tokens oklch: fondo blanco puro, texto gris carbón, mutados grises suaves, acento azul marino profundo (~`oklch(0.28 0.09 265)`), crema sutil para estados seleccionados.
- Import Google Fonts: **Fraunces** (display serif) + **Inter** (cuerpo). Tracking amplio en labels uppercase.
- Bordes hairline, sin sombras pesadas.
- `lang="es"` en `__root.tsx` + metadata SEO en español (title, description, og:*).

## Archivos a crear / modificar

```
src/routes/index.tsx              -> hospeda <Quoter/>, reemplaza placeholder
src/routes/__root.tsx             -> lang="es", metadata SEO ES
src/styles.css                    -> tokens, fuentes
src/lib/pricing.ts                -> constantes editables + tipos
src/lib/quote-pdf.ts              -> generación PDF (jsPDF + autotable)
src/components/quoter/Quoter.tsx           -> contenedor de estado + transiciones
src/components/quoter/Stepper.tsx          -> barra de progreso 4 segmentos
src/components/quoter/StepLevel.tsx        -> grid 2x3 niveles
src/components/quoter/StepService.tsx      -> Renta / Venta (bloqueada)
src/components/quoter/StepConfig.tsx       -> ciudad + paquete + cantidad
src/components/quoter/StepSummary.tsx      -> recibo + acciones
src/components/quoter/FloatingTotal.tsx    -> barra fija inferior (paso 3)
src/components/quoter/EmailModal.tsx       -> Dialog con mailto
src/components/quoter/SelectableCard.tsx   -> tarjeta reutilizable
```

## Estado y tipos

Todo el estado vive en `Quoter.tsx` con `useState` y se pasa por props:

```ts
type Level = 'preescolar'|'primaria'|'secundaria'|'preparatoria'|'universidad'|'posgrado';
type ServiceType = 'renta'|'venta';
type City = 'tijuana'|'ensenada';
type PackageChoice =
  | { kind: 'A' }
  | { kind: 'B', variant: 'standard'|'hybrid'|'max' };

type QuoteState = {
  step: 1|2|3|4;
  level?: Level;
  service?: ServiceType;
  city?: City;
  pkg?: PackageChoice;
  quantity: number; // min 1
};
```

Total con `useMemo`: `precioUnitario(pkg) * quantity`.

## Pasos

**1 — Nivel:** grid 2×3 (1 col móvil) de `SelectableCard` con iconos Lucide (Baby, BookOpen, School, GraduationCap, University, Award).

**2 — Servicio:** dos tarjetas grandes. Renta activa. Venta `opacity-40`, `cursor-not-allowed`, `aria-disabled`, badge "Próximamente".

**3 — Configuración:** tres bloques separados por divisores hairline:
- Ciudad: dos pill buttons (Tijuana / Ensenada), seleccionado se llena de azul marino.
- Paquete: radio cards A y B con precio. B expande con `AnimatePresence` (height auto + fade) sub-opciones B.1 Estándar Duo, B.2 Híbrido, B.3 Max Duo, cada una con precio.
- Cantidad: stepper − / número grande / +, input editable, mínimo 1.

**4 — Resumen:** desglose tipo recibo (nivel, ciudad, paquete + variante, precio × cantidad, total grande). Botones: **Descargar PDF** (primario) y **Enviar por Email** (outline).

## Stepper

4 segmentos con etiquetas (`01 Nivel`, `02 Servicio`, `03 Configuración`, `04 Resumen`). Activo azul marino, completado gris medio, pendiente gris claro. Línea de progreso animada con `layoutId`. En móvil colapsa a puntos.

## Barra flotante de total

Visible **solo en paso 3**. Fija abajo, ancho del contenedor, fondo blanco, borde superior hairline + sombra sutil. Texto "Total estimado · $X,XXX MXN" + botón "Continuar →". Slide-up al aparecer. Oculta en pasos 1, 2, 4.

## Precios (`src/lib/pricing.ts`)

```ts
export const PRICES = {
  A: 350,
  B_STANDARD: 450, // B.1 9x12 ambos lados
  B_HYBRID: 550,   // B.2 9x12 + 9x35
  B_MAX: 650,      // B.3 9x35 ambos lados
} as const;
```

Catálogos de niveles, ciudades y paquetes también exportados desde aquí para edición fácil.

## PDF (`src/lib/quote-pdf.ts`)

A4 limpio. Header "Kinder Togas · Cotización" + fecha. Tabla `jspdf-autotable` con desglose. Total destacado. Pie: "Cotización válida 15 días".

## Email (mailto)

`EmailModal` (shadcn `Dialog`) con inputs Nombre y Correo. Al enviar abre `mailto:correo?subject=Cotización Kinder Togas&body=<resumen>`. Sin envío real.

## Animaciones (Framer Motion)

- Transición entre pasos: slide horizontal 15px + fade, 250ms ease-out.
- Expansión Paquete B: `AnimatePresence` con height/opacity.
- Hover tarjetas: scale 1.01 + transición de borde.
- Barra flotante: slide-up.

## Accesibilidad

Labels en radios, `aria-disabled` en Venta, foco visible con ring azul marino, navegación por teclado en cards.

## Fuera de alcance

Sin backend, sin persistencia, sin envío real de email, sin precios por ciudad, paso 3 solo si Renta.
