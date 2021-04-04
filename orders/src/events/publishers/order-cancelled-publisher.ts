import { Publisher, Subjects, OrderCancelledEvent } from '@mogyorosistefan/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}