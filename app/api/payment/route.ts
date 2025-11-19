import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import db from '@/utils/db';

const razorpay = new Razorpay({
  key_id: process.env.key_id as string,
  key_secret: process.env.key_secret as string,
});

export const POST = async (req: Request) => {
  try {
    const requestHeaders = new Headers(req.headers);
    const origin = requestHeaders.get('origin');

    const { orderId, cartId } = await req.json();

    // 🧾 Fetch order
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    // 🛒 Fetch cart
    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });

    if (!order || !cart) {
      return NextResponse.json(null, {
        status: 404,
        statusText: 'Not Found',
      });
    }

    // -------------------------------
    // 🔥 USD → INR CONVERSION
    // -------------------------------

    const USD_TO_INR = 83; // OR fetch live rate

    // Total in USD
    const totalUSD = cart.cartItems.reduce((acc, item) => {
      return acc + item.product.price * item.amount;
    }, 0);

    // Convert USD → INR
    const totalINR = totalUSD * USD_TO_INR;

    // Razorpay needs amount in paise, integer only
    const amountInPaise = Math.round(totalINR * 100);

    // 🧾 Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      notes: {
        orderId,
        cartId,
      },
    });

    // Send response
    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      cartItems: cart.cartItems.map((item) => ({
        name: item.product.name,
        quantity: item.amount,
        priceUSD: item.product.price,
      })),
      returnUrl: `${origin}/payment/success`,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
};
