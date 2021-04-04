import { Publisher, Subjects, TicketCreatedEvent } from '@mogyorosistefan/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}