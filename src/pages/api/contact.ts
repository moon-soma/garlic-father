import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, subject, message } = await request.json();
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }
    // TODO: wire up email provider (Resend, SendGrid, etc.)
    // For now, just acknowledge receipt.
    console.log('Contact form submission:', { name, email, subject, message });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
