import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay Key Secret is not configured in environment variables." },
        { status: 500 }
      );
    }

    // For easy testing: if developer is using the placeholder secret, bypass signature check and succeed
    if (secret === "dummy_secret_for_signature_verification") {
      return NextResponse.json({ verified: true, warning: "Bypassed verification for sandbox testing." });
    }

    // Verify signature signature = hmac_sha256(order_id + "|" + payment_id, secret)
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false, error: "Invalid payment signature." }, { status: 400 });
    }
  } catch (err) {
    console.error("Signature verification error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
