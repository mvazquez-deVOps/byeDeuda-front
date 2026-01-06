
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PLANS } from '@/lib/plans';
import { adminAuth } from '@/lib/admin-firebase';
import { cookies } from 'next/headers';

// Initialize Stripe with the secret key directly.
// This should come from environment variables in a real app.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});


export async function POST(req: Request) {
  try {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "No autenticado. Por favor, inicia sesión de nuevo." }, { status: 401 });
    }
    
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;
    const email = decodedClaims.email;

    const { planName } = await req.json();

    // 1. Input validation
    if (!userId || !email || !planName) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos: userId, email y planName son obligatorios.' }, { status: 400 });
    }

    // 2. Security validation: Find the plan in our config by its name
    const plan = Object.values(PLANS).find(p => p.name === planName);

    if (!plan || !plan.priceId) {
      console.error(`Nombre de plan inválido o desconocido: ${planName}`);
      return NextResponse.json({ error: `Nombre de Plan Inválido: ${planName}.` }, { status: 400 });
    }
    
    console.log(`[Checkout] Creando sesión para usuario: ${userId}, plan: ${planName}, priceId: ${plan.priceId}`);

    // 3. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: { userId }, // Pass the user ID to the webhook
      success_url: `${new URL(req.url).origin}/dashboard?success=true`,
      cancel_url: `${new URL(req.url).origin}/dashboard/subscription?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en la API de checkout de Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
