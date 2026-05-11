import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { buildSummaryText, type QuoteData } from "@/lib/quote-pdf";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  quote: QuoteData;
};

export function EmailModal({ open, onOpenChange, quote }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Cotización Kinder Togas");
    const body = encodeURIComponent(
      `Hola,\n\nMi nombre es ${name || "(sin nombre)"} y me interesa la siguiente cotización:\n\n${buildSummaryText(quote)}\n\nMi correo: ${email}\n\nGracias.`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Enviar cotización por email</DialogTitle>
          <DialogDescription>
            Te abrimos tu cliente de correo con el resumen prellenado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="q-name" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Nombre
            </Label>
            <Input
              id="q-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Correo
            </Label>
            <Input
              id="q-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-full bg-navy text-navy-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Abrir correo
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
