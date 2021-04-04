import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { Subjects } from './subject';
import { TicketUpdatedEvent } from './ticket-updated-event';


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    console.log(`Event nr. ${msg.getSequence()} received!`, data);

    msg.ack();
  }
}