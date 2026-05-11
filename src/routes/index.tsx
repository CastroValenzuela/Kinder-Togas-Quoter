import { createFileRoute } from "@tanstack/react-router";
import { Quoter } from "@/components/quoter/Quoter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinder Togas — Cotizador de togas y birretes" },
      {
        name: "description",
        content:
          "Cotiza en minutos togas y birretes para graduación. Renta para preescolar, primaria, secundaria, preparatoria y universidad en Tijuana y Ensenada.",
      },
      { property: "og:title", content: "Kinder Togas — Cotizador" },
      {
        property: "og:description",
        content:
          "Cotiza tu paquete de graduación en 4 pasos. Descarga tu cotización en PDF.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Quoter />;
}
