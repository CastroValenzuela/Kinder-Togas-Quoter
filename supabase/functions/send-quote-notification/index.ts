import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ""
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'kindertogas@gmail.com'

function levelLabel(l: string) {
  const m: Record<string, string> = { 
    preescolar: "Preescolar", 
    primaria: "Primaria", 
    secundaria: "Secundaria", 
    preparatoria: "Preparatoria", 
    universidad: "Universidad y Posgrado" 
  };
  return m[l] || l;
}

function cityLabel(c: string) {
  const m: Record<string, string> = { 
    ensenada: "Ensenada", 
    tijuana: "Tijuana / Rosarito / Tecate" 
  };
  return m[c] || "N/A";
}

function packageLabel(kind: string, variant: string | null, level: string) {
  if (kind === 'A') {
    if (level === 'universidad') return "Opción A — Impresión";
    return "Paquete A — Básico";
  }
  const labels: Record<string, string> = {
    hybrid: "Paquete B — B.2 Balance",
    max: "Paquete B — B.3 Premium",
    sec_b: "Paquete B — B.1 Diseño B1",
    sec_a: "Paquete B — B.2 Diseño B2",
    prep_b: "Paquete B — B.1 Diseño B1",
    prep_a: "Paquete B — B.2 Diseño B2",
    prep_c1: "Paquete C — C.1 Diseño C1",
    prep_c2: "Paquete C — C.2 Diseño C2",
    pri_c: "Paquete B — B.1 Básico Funcional",
    pri_b: "Paquete B — B.2 Clásico Equilibrado",
    pri_a: "Paquete B — B.3 Clásico Destacado",
    uni_b: "Opción B — Bordado Sencillo",
    uni_c: "Opción C — Bordado Premium",
  };
  return (variant && labels[variant]) || (kind === 'C' ? "Paquete C — Bordado" : "Paquete B — Personalizado");
}

function serviceLabel(s: string) {
  return s === 'renta' ? "Renta" : (s === 'venta' ? "Venta" : s);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const { record } = payload

    const dateStr = record.estimated_date ? new Date(record.estimated_date).toLocaleDateString('es-MX') : 'Por definir';

    // Premium Email Template
    const getHtmlBody = (isCustomer: boolean) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background-color: #1e2346; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">KINDER TOGAS</h1>
            <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Cotización de Servicio</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #334155; margin-bottom: 30px;">
              ` + (isCustomer ? `Hola <strong>${record.contact_name}</strong>, gracias por tu preferencia.` : 'Nueva cotización generada desde el sitio web.') + `
            </p>
            
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #1e2346;">
              <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Folio Oficial</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e2346;">` + record.quote_number + `</p>
            </div>

            <h2 style="font-size: 18px; color: #1e2346; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px;">Datos del Contacto</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 40%;">Institución</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + record.institution_name + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Solicitante</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + record.contact_name + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Teléfono</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + record.contact_phone + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + (record.contact_email || '-') + `</td></tr>
            </table>

            <h2 style="font-size: 18px; color: #1e2346; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px;">Especificaciones</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 40%;">Modalidad</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + serviceLabel(record.service_option) + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Nivel Escolar</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + levelLabel(record.school_level) + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Sede / Ciudad</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + cityLabel(record.city) + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Paquete</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + packageLabel(record.package_kind, record.package_variant, record.school_level) + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Fecha del Evento</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + dateStr + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Cantidad de Alumnos</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + record.student_count + `</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Precio Unitario</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; text-align: right;">` + formatMoney(record.unit_price) + `</td></tr>
            </table>

            <!-- Total Block -->
            <div style="background-color: #1e2346; border-radius: 8px; padding: 25px; text-align: center; margin-top: 40px;">
              <p style="margin: 0; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Total Estimado</p>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: -1px;">` + formatMoney(record.total_price) + `</p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">¿Tienes alguna duda o deseas confirmar disponibilidad?</p>
            <a href="https://wa.me/526461305987" style="display: inline-block; margin-top: 15px; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: bold; font-size: 14px;">Contáctanos por WhatsApp</a>
            <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px;">© ` + new Date().getFullYear() + ` Kinder Togas. Todos los derechos reservados.</p>
          </div>

        </div>
      </div>
    `;

    // 1. Send to Admin (Always)
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Cotizador Kinder Togas <cotizaciones@kindertogas.com>',
        reply_to: record.contact_email || undefined,
        to: [ADMIN_EMAIL],
        subject: '🎓 Nueva Cotización: ' + record.quote_number + ' - ' + record.institution_name,
        html: getHtmlBody(false),
      }),
    })

    // 2. Send to Customer (If email provided)
    if (record.contact_email && record.contact_email.trim() !== '') {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: 'Kinder Togas <cotizaciones@kindertogas.com>',
            reply_to: 'kindertogas@gmail.com',
            to: [record.contact_email],
            subject: 'Tu Cotización de Kinder Togas - Folio: ' + record.quote_number,
            html: getHtmlBody(true),
          }),
        })
      } catch (e) {
        console.error("Failed to send customer email", e);
      }
    }

    const data = await adminRes.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
