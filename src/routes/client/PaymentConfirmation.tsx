import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/client/PaymentConfirmation')({
  component: PaymentConfirmationComponent,
});

function PaymentConfirmationComponent() {
  const [paymentType, setPaymentType] = useState<'card' | 'paypal'>('card');
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Payment Confirmation</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please confirm your payment method to complete the transaction.
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setPaymentType('card')}
            className={`w-1/2 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
              paymentType === 'card'
                ? 'bg-indigo-600 text-white border-transparent shadow'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentType('paypal')}
            className={`w-1/2 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
              paymentType === 'paypal'
                ? 'bg-blue-500 text-white border-transparent shadow'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            PayPal
          </button>
        </div>

        {/* Strategy: Card Payment */}
        {paymentType === 'card' && (
          <div className="space-y-4 mt-6">
            {/* Card Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as 'credit' | 'debit')}
                className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
              </select>
            </div>

            {/* Name on Card */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input
                type="text"
                placeholder="Jane Doe"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Code</label>
                <input
                  type="text"
                  placeholder="CVV"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Strategy: PayPal Payment */}
        {paymentType === 'paypal' && (
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">
              You’ll be redirected to PayPal to securely complete your purchase.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}
export default PaymentConfirmationComponent;
