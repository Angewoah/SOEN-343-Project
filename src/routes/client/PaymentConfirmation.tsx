import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/client/PaymentConfirmation')({
  component: PaymentConfirmationComponent,
});

function PaymentConfirmationComponent() {
  return (
    <div className="payment-confirmation-page bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Payment Confirmation</h2>
          <p className="mt-2 text-sm text-gray-600">Please confirm your payment details below to complete the transaction.</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select id="payment-method" name="payment-method" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
              </select>
            </div>

            {/* Card Number Input */}
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
              <input type="text" id="card-number" name="card-number" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="1234 5678 9101 1121" />
            </div>

            {/* Expiry Date Input */}
            <div>
              <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input type="text" id="expiry-date" name="expiry-date" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="MM/YY" />
            </div>

            {/* CVV Input */}
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
              <input type="text" id="cvv" name="cvv" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="123" />
            </div>
          </div>

          {/* Confirm Payment Button */}
          <div>
            <button type="submit" className="w-full py-3 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Confirm Payment
            </button>
          </div>
        </form>

        {/* Back to Payment Page */}
        <div className="mt-4 text-center">
          <a href="/client/payment" className="text-sm text-blue-500 hover:text-blue-700">
            Back to Payments
          </a>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmationComponent;
