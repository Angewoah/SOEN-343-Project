import { createFileRoute, Link } from '@tanstack/react-router'; // Ensure this is correctly imported

export const Route = createFileRoute('/client/payment')({
  component: PaymentPageComponent,
});

function PaymentPageComponent() {
  return (
    <div className="payment-page">
      <div className="header mb-8 mt-12">
        <h1 className="text-2xl font-bold mb-2">My Payments</h1>
        <p className="text-gray-600">Manage your payments here</p>
      </div>

      <div className="payment-section">
        <h2 className="text-xl font-semibold mb-6">Upcoming Payments</h2>

        <div className="payment-card bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-gray-700 font-bold mb-2">Event: Sample Event Name</p>
          <p className="text-gray-500 mb-2"><strong>Amount:</strong> $75.00</p>
          <p className="text-gray-500 mb-2"><strong>Date:</strong> April 10, 2025</p>
          <p className="text-gray-500 mb-2"><strong>Venue:</strong> Sample Venue Location</p>
          <Link to="/client/PaymentConfirmation">
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
              Pay Now
            </button>
          </Link>
        </div>

        <div className="payment-card bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-gray-700 font-bold mb-2">Event: Another Event</p>
          <p className="text-gray-500 mb-2"><strong>Amount:</strong> $75.00</p>
          <p className="text-gray-500 mb-2"><strong>Date:</strong> April 15, 2025</p>
          <p className="text-gray-500 mb-2"><strong>Venue:</strong> Another Event Venue</p>
          <Link to="/client/PaymentConfirmation">
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
              Pay Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentPageComponent;
