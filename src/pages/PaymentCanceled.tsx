import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

const PaymentCanceled = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');

  useEffect(() => {
    document.title = "Payment Canceled | Impress";
  }, []);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Payment canceled</h1>
      <p className="mb-6">{orderId ? <>Order reference: <span className="font-mono">{orderId}</span></> : null}</p>
      <Link to="/cart" className="underline">Return to cart</Link>
    </main>
  );
};

export default PaymentCanceled;
