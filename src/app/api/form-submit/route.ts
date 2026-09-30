import { NextRequest, NextResponse } from 'next/server';
import { getRequests, saveRequests, ClientRequest } from '../../../lib/requestsDb';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = {
        firstName: formData.get('f-name') || formData.get('firstName') || '',
        lastName: formData.get('l-name') || formData.get('lastName') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        discordId: formData.get('discordId') || '',
        category: formData.get('category') || 'Custom 3D Commission',
        budget: formData.get('budget') || '$1,500 - $5,000',
        message: formData.get('message') || formData.get('vision') || '',
        newsletter: formData.get('newsletter') === 'yes' || formData.get('newsletter') === 'true',
      };
    }

    const firstName = String(body.firstName || body['f-name'] || '').trim();
    const lastName = String(body.lastName || body['l-name'] || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || body.discord || '').trim();
    const discordId = String(body.discordId || '').trim();
    const message = String(body.message || body.vision || '').trim();
    const category = String(body.category || 'Bespoke FiveM 3D Piece').trim();
    const budget = String(body.budget || 'Custom Allocation').trim();

    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: 'Required fields missing: First Name, E-mail and Vision description are required.' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const now = new Date();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const inquiryId = `YUF-INQ-${randomSuffix}`;

    const requests = getRequests();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

    const newRequest: ClientRequest = {
      id: inquiryId,
      pseudo: fullName,
      discordId: discordId || undefined,
      subject: `[Custom Inquiry] ${category} (${budget})`,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'pending',
      messages: [
        {
          id: `msg_${Date.now()}_1`,
          sender: 'client',
          text: `CLIENT: ${fullName}\nEMAIL: ${email}\nPHONE/DISCORD: ${phone}\nCATEGORY: ${category}\nBUDGET: ${budget}\n\nVISION & SPECS:\n${message}`,
          createdAt: now.toISOString(),
        },
      ],
    };

    requests.unshift(newRequest);
    saveRequests(requests);

    return NextResponse.json({
      success: true,
      inquiryId,
      message: 'Your custom inquiry has been securely received by our Client Relations & Orfèvre Department. You will be contacted within 72 hours.',
      request: newRequest,
    });
  } catch (error: any) {
    console.error('Error handling form submit:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
