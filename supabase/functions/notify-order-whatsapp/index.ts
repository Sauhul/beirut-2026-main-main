/**
 * Supabase Edge Function: notify-order-whatsapp
 *
 * Envía la notificación de un nuevo pedido directamente al WhatsApp del dueño del negocio
 * (por defecto 573128527325) utilizando la API de WhatsApp Business de Meta,
 * UltraMsg, Twilio o webhook equivalente.
 *
 * Secrets en Supabase:
 *   WHATSAPP_BUSINESS_TOKEN     — Token de acceso permanente de Meta (o API key)
 *   WHATSAPP_BUSINESS_PHONE_ID  — Phone Number ID en Meta Cloud API
 *   WHATSAPP_BUSINESS_RECIPIENT — Número destino (default: 573128527325)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  recipient?: string;
  message: string;
  order?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const recipient = body.recipient || Deno.env.get("WHATSAPP_BUSINESS_RECIPIENT") || "573128527325";
    const token = Deno.env.get("WHATSAPP_BUSINESS_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_BUSINESS_PHONE_ID");

    if (!body.message) {
      return new Response(JSON.stringify({ error: "Missing message body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Envío vía Meta WhatsApp Business Cloud API si las credenciales existen
    if (token && phoneId) {
      const metaRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: { preview_url: false, body: body.message },
        }),
      });

      const metaData = await metaRes.json();

      return new Response(JSON.stringify({ success: metaRes.ok, data: metaData }), {
        status: metaRes.ok ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[WhatsApp Local Simulation] Notificación enviada al dueño (${recipient}):\n${body.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        simulated: true,
        recipient,
        message: "Notificación procesada correctamente",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error en notify-order-whatsapp:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
