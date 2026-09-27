import { Payment, PaymentMethod } from '@easyride/shared-types';
import { db } from '../db';
import { ENV } from '../config/env';

export class PaymentService {
  public static async processPayment(
    bookingId: string,
    customerId: string,
    amount: number,
    method: PaymentMethod = 'RAZORPAY'
  ): Promise<Payment> {
    const paymentId = `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Razorpay mock order reference
    const providerReference = `rzp_order_${Date.now()}`;

    const payment: Payment = {
      id: paymentId,
      bookingId,
      customerId,
      amount,
      currency: 'INR',
      method,
      status: 'COMPLETED',
      providerReference,
      createdAt: new Date().toISOString(),
    };

    db.payments.set(payment.id, payment);
    return payment;
  }
}
