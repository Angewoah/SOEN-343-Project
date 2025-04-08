import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

// Mock API call for events (you can replace this with an actual API endpoint)
const fetchEventData = async () => {
  // Replace this with a real API call, e.g., fetch('/api/events')
  return [
    {
      id: 1,
      name: 'Sample Event Name',
      amount: 75.00,
      date: '2025-04-10',
      venue: 'Sample Venue Location',
    },
    {
      id: 2,
      name: 'Another Event',
      amount: 75.00,
      date: '2025-04-15',
      venue: 'Another Event Venue',
    },
  ];
};

// Define the route for the payment page
export const Route = createFileRoute('/client/payment')({
  component: PaymentPageComponent,
});

function PaymentPageComponent() {
  const [events, setEvents] = useState<any[]>([]);

  // Fetch event data on component mount
  useEffect(() => {
    const getData = async () => {
      const data = await fetchEventData();
      setEvents(data);
    };

    getData();
  }, []);

  return (
    <div className="payment-page">
      <div className="header mb-8 mt-12">
        <h1 className="text-2xl font-bold mb-2">My Payments</h1>
        <p className="text-gray-600">Manage your orders here</p>
      </div>

      <div className="payment-section">
        <h2 className="text-xl font-semibold mb-6">Upcoming Events</h2>

        {events.length === 0 ? (
          <p>Loading events...</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="payment-card bg-white p-6 rounded-lg shadow-md mb-6">
              <p className="text-gray-700 font-bold mb-2">Event: {event.name}</p>
              <p className="text-gray-500 mb-2"><strong>Amount:</strong> ${event.amount.toFixed(2)}</p>
              <p className="text-gray-500 mb-2"><strong>Date:</strong> {event.date}</p>
              <p className="text-gray-500 mb-2"><strong>Venue:</strong> {event.venue}</p>
              
              {/* Payment Button with Link */}
              <Link to="/client/PaymentConfirmation">
                <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  Pay Now
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PaymentPageComponent;
