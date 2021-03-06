import { Publisher, Subjects, PaymentCreatedEvent } from '@mogyorosistefan/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}