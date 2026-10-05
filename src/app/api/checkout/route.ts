import { NextRequest, NextResponse } from 'next/server';
import { getRequests, saveRequests, ClientRequest } from '../../../lib/requestsDb';
import { getSessionUser } from '../../../lib/session';
import { getProducts } from '../../../lib/productsDb';
import { getCustomerRecord } from '../../../lib/customersDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, email, discordTag, fivemId, paymentMethod, pseudo } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Achat possible sans compte (invité) : seule une adresse e-mail est demandée.
    const deliveryEmail = String(email ?? '').trim().toLowerCase().slice(0, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(deliveryEmail)) {
      return NextResponse.json({ error: 'Please enter a valid delivery email.' }, { status: 400 });
    }

    const orderId = `YUF-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const clientPseudo = pseudo || discordTag || email.split('@')[0] || 'Collector';

    const sessionUser = getSessionUser(req);
    // Le prix vient du catalogue du serveur, jamais de celui envoyé par le navigateur.
    const catalog = getProducts();
    const buyable = (id: unknown) => catalog.find((c) => c.id === id && (c.status || 'published') === 'published' && !c.deletedAt);
    if (!Array.isArray(items) || items.some((it: any) => !buyable(it?.product?.id))) {
      return NextResponse.json({ error: 'One of the pieces in your cart is no longer available.' }, { status: 400 });
    }
    const orderItems = items.map((it: any) => {
      const p = buyable(it.product.id)!;
      return {
        name: p.name,
        reference: p.reference,
        price: p.price,
        quantity: Math.max(1, Math.min(99, Number(it.quantity) || 1)),
        productId: p.id,
      };
    });

    // Réduction personnelle du client connecté (donnée depuis Management › Customers), calculée par le serveur.
    const subtotal = orderItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const discountPercent = sessionUser ? getCustomerRecord(sessionUser.id).discountPercent || 0 : 0;
    const total = Math.round(subtotal * (1 - discountPercent / 100) * 100) / 100;

    const orderRecord: ClientRequest = {
      id: orderId,
      pseudo: clientPseudo,
      discordId: sessionUser?.discordId,
      // Client connecté : la commande va directement dans sa bibliothèque. Invité : rattachée plus tard
      // à son compte s'il en crée un avec cette adresse (une fois l'adresse vérifiée).
      userId: sessionUser?.id,
      // Le paiement n'est pas encore encaissé automatiquement : l'atelier le marque « Paid » depuis Orders.
      order: {
        items: orderItems,
        total,
        ...(discountPercent ? { subtotal, discountPercent } : {}),
        email: deliveryEmail,
        paymentMethod: paymentMethod ? String(paymentMethod).slice(0, 80) : undefined,
        status: 'pending',
        paymentStatus: 'unpaid',
        updatedAt: now.toISOString(),
      },
      subject: `[Order] ${orderItems.map((i: { quantity: number; name: string; price: number }) => `${i.quantity}x ${i.name} ($${i.price})`).join(', ')} - Total: $${total}${discountPercent ? ` (-${discountPercent}%)` : ''}`,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'answered',
      messages: [
        {
          id: `msg_${Date.now()}_1`,
          sender: 'client',
          text: `CLIENT: ${clientPseudo}\nEMAIL: ${email}\nDISCORD: ${discordTag || 'N/A'}\nFIVEM CFX ID: ${fivemId || 'Auto-Allocated'}\nPAYMENT METHOD: ${paymentMethod || 'Credit Card'}\nTOTAL: $${total}${discountPercent ? ` (-${discountPercent}%)` : ''}\n\nALLOCATED ASSETS:\n${orderItems.map((i: { quantity: number; name: string; reference?: string; price: number }) => `- ${i.quantity}x ${i.name} (Ref: ${i.reference || 'N/A'}, Price: $${i.price})`).join('\n')}`,
          createdAt: now.toISOString(),
        },
        {
          id: `msg_${Date.now()}_2`,
          sender: 'admin',
          text: `YUFO Atelier allocation confirmed. License key issued for ${clientPseudo}. The 3D assets (.ydd / .ytd) are linked to your FiveM Keymaster account and ready for instant in-game resource streaming.`,
          createdAt: new Date(now.getTime() + 1000).toISOString(),
        },
      ],
    };

    const allRequests = getRequests();
    allRequests.unshift(orderRecord);
    saveRequests(allRequests);

    return NextResponse.json({
      success: true,
      guest: !sessionUser,
      orderId,
      licenseKey: `CFX-ESCROW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      order: orderRecord,
    });
  } catch (error: any) {
    console.error('Error processing checkout:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
