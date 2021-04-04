import { Publisher, Subjects, OrderCreatedEvent } from '@mogyorosistefan/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}