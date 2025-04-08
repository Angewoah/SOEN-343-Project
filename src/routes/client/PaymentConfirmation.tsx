import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/client/PaymentConfirmation')({
  component: PaymentConfirmationComponent,
});

function PaymentConfirmationComponent() {
  return (
    <div className="payment-confirmation-page">
      <div className="header mb-8 mt-12">
        <h1 className="text-2xl font-bold mb-2">Payment Confirmation</h1>
        <p className="text-gray-600">Please confirm your payment details</p>
      </div>

      <div className="payment-form bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select id="payment-method" name="payment-method" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
          <input type="text" id="card-number" name="card-number" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="1234 5678 9101 1121" />
        </div>

        <div className="mb-4">
          <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input type="text" id="expiry-date" name="expiry-date" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="MM/YY" />
        </div>

        <div className="mb-4">
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
          <input type="text" id="cvv" name="cvv" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="123" />
        </div>

        <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
          Confirm Payment
        </button>
      </div>
    </div>
  );
}
