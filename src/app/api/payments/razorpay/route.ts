import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let amount = 0;
  try {
    const body = await req.json();
    amount = body.amount; // in INR (e.g. 99)
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId) {
      return NextResponse.json(
        { error: "Razorpay Key ID is not configured in .env.local" },
        { status: 500 }
      );
    }

    // If secret key is not set or is a placeholder, return a mock order details for simulated checkout
    if (!keySecret || keySecret === "dummy_secret_for_signature_verification") {
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        mock: true,
      });
    }

    // Prepare credentials for Razorpay API Basic Auth
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // in paise (e.g. ₹99 -> 9900 paise)
        currency: "INR",
        receipt: `receipt_kundli_${Date.now()}`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Razorpay API order creation failed, falling back to mock order. Error details:", errText);
      
      // Fallback to mock order so the checkout funnel never blocks in development
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        mock: true,
        warning: "API returned error, fell back to mock order."
      });
    }

    const order = await res.json();
    return NextResponse.json({ id: order.id, amount: order.amount, mock: false });
  } catch (err) {
    console.error("Razorpay API error:", err);
    // Safe fallback on network or unexpected errors
    return NextResponse.json({
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      mock: true,
      error: String(err)
    });
  }
}
