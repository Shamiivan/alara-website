'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const PaymentStatus: React.FC = () => {
  const paymentStatus = useQuery(api.payments.getUserPaymentStatus);
  const userPayments = useQuery(api.payments.getUserPayments);

  if (!paymentStatus) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-md"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="font-medium">Payment Status:</span>
        <span className={`font-semibold ${paymentStatus.hasPaid ? 'text-green-600' : 'text-gray-600'
          }`}>
          {paymentStatus.hasPaid ? 'Paid' : 'Not Paid'}
        </span>
      </div>

      {userPayments && userPayments.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Payment History</h3>
          <div className="space-y-2">
            {userPayments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
              >
                <div>
                  <div className="font-medium">
                    ${(payment.amount / 100).toFixed(2)} CAD
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${payment.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : payment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : payment.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
