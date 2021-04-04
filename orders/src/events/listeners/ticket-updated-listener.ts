import { Listener, Subjects, TicketUpdatedEvent } from '@mogyorosistefan/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-names';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);
    
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const {title, price} = data;
    ticket.set({title, price});
    await ticket.save();
    
    msg.ack();
  }
}