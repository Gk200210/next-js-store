import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import db from '@/utils/db';

const razorpay = new Razorpay({
  key_id: process.env.key_id as string,
  key_secret: process.env.key_secret as string,
});

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const razorpay_payment_id = searchParams.get('razorpay_payment_id');
    const razorpay_order_id = searchParams.get('razorpay_order_id');
    const razorpay_signature = searchParams.get('razorpay_signature');

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return Response.json(
        { error: 'Missing Razorpay params' },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 🧾 Step 1: Verify Razorpay Signature
    // ---------------------------------------------------
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.key_secret as string)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return Response.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 🧾 Step 2: Retrieve cart & order ID from Razorpay notes
    // ---------------------------------------------------

    // Fetch order details from Razorpay
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    const orderId = razorpayOrder.notes?.orderId;
    const cartId = razorpayOrder.notes?.cartId;

    if (!orderId || !cartId) {
      return Response.json(
        { error: 'orderId or cartId missing in notes' },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 🧾 Step 3: Mark Order as Paid and Delete Cart
    // ---------------------------------------------------

    await db.order.update({
      where: { id: String(orderId) },
      data: { isPaid: true },
    });

    await db.cart.delete({
      where: { id: String(cartId) },
    });

  } catch (err) {
    console.error(err);
    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }

  redirect('/orders');
};
