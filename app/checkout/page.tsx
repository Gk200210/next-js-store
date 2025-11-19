'use client';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import  { useCallback } from 'react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId');
  const cartId = searchParams.get('cartId');

  const openRazorpayCheckout = useCallback(async () => {
    // 1️⃣ Create Razorpay Order on your backend
    const response = await axios.post('/api/razorpay', {
      orderId,
      cartId,
    });

    const { razorpayOrderId, amount, currency, user } = response.data;

    // 2️⃣ Load Razorpay script dynamically
    const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!scriptLoaded) {
      alert('Razorpay failed to load!');
      return;
    }

    // 3️⃣ Setup payments
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: amount,
      currency: currency,
      name: "the next store",
      description: "Order Payment",
      order_id: razorpayOrderId,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      theme: {
        color: "#3399cc",
      },
      handler: function (response: any) {
        console.log("Payment success:", response);
        window.location.href = `/success?paymentId=${response.razorpay_payment_id}`;
      },
      modal: {
        ondismiss: function () {
          console.log("Checkout Closed");
        },
      },
    };

    // 4️⃣ Open Razorpay payment window
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, []);

  // Helper to load Razorpay JS
  const loadScript = (src: string) => {
    return new Promise(resolve => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <div className="flex justify-center p-8">
      <button
        onClick={openRazorpayCheckout}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        Pay with Razorpay
      </button>
    </div>
  );
}
