import { Publisher, Subjects, TicketUpdatedEvent } from '@mogyorosistefan/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}