import {
  Listener,
  Subjects,
  OrderCreatedEvent,
  NotFoundError,
  BadRequestError,
} from "@mogyorosistefan/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from '../../nats-wrapper';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);
    const ticket = await Ticket.findById(data.ticket.id);
    
    if (!ticket) {
      throw new NotFoundError();
    }
    
    // if (ticket.orderId) {
    //   throw new BadRequestError('Ticket already reserved');
    // }

    ticket.set({ orderId: data.id });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId
    }); 

    
    msg.ack();
  }
}
