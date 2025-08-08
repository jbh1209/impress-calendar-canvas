import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');

  useEffect(() => {
    document.title = "Payment Successful | Impress";
  }, []);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Thank you! Your payment was successful.</h1>
      <p className="mb-6">Order reference: <span className="font-mono">{orderId}</span></p>
      <Link to="/orders" className="underline">View your orders</Link>
    </main>
  );
};

export default PaymentSuccess;
