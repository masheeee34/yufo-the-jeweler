import { NextRequest, NextResponse } from 'next/server';
import { getRequests, saveRequests, ClientRequest } from '../../../lib/requestsDb';
import { getSessionUser } from '../../../lib/session';
import { getProducts } from '../../../lib/productsDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, email, discordTag, fivemId, paymentMethod, totalPrice, pseudo } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Delivery email is required' }, { status: 400 });
    }

    const orderId = `YUF-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const itemsSummary = items
      .map((it: any) => `${it.quantity}x ${it.product?.name || 'Asset'} ($${it.product?.price || 0})`)
      .join(', ');

    const clientPseudo = pseudo || discordTag || email.split('@')[0] || 'Collector';

    const sessionUser = getSessionUser(req);
    // Le prix vient du catalogue du serveur, jamais de celui envoyé par le navigateur.
    const catalog = getProducts();
    const orderItems = items.map((it: any) => {
      const p = catalog.find((c) => c.id === it.product?.id);
      return {
        name: String(p?.name || it.product?.name || 'Asset').slice(0, 120),
        reference: p?.reference || (it.product?.reference ? String(it.product.reference).slice(0, 60) : undefined),
        price: p ? p.price : 0,
        quantity: Math.max(1, Math.min(99, Number(it.quantity) || 1)),
        productId: p?.id,
      };
    });

    const orderRecord: ClientRequest = {
      id: orderId,
      pseudo: clientPseudo,
      discordId: sessionUser?.discordId,
      // Le paiement n'est pas encore encaissé automatiquement : l'atelier le marque « Paid » depuis Orders.
      order: {
        items: orderItems,
        total: orderItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0),
        email: String(email).slice(0, 200),
        paymentMethod: paymentMethod ? String(paymentMethod).slice(0, 80) : undefined,
        status: 'pending',
        paymentStatus: 'unpaid',
        updatedAt: now.toISOString(),
      },
      subject: `[Paid Allocation] ${itemsSummary} - Total: $${totalPrice}`,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'answered',
      messages: [
        {
          id: `msg_${Date.now()}_1`,
          sender: 'client',
          text: `CLIENT: ${clientPseudo}\nEMAIL: ${email}\nDISCORD: ${discordTag || 'N/A'}\nFIVEM CFX ID: ${fivemId || 'Auto-Allocated'}\nPAYMENT METHOD: ${paymentMethod || 'Credit Card'}\nTOTAL: $${totalPrice}\n\nALLOCATED ASSETS:\n${items.map((i: any) => `- ${i.quantity}x ${i.product?.name} (Ref: ${i.product?.reference || 'N/A'}, Price: $${i.product?.price})`).join('\n')}`,
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
      orderId,
      licenseKey: `CFX-ESCROW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      order: orderRecord,
    });
  } catch (error: any) {
    console.error('Error processing checkout:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
