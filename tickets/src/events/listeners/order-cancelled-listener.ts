import {
  Listener,
  Subjects,
  OrderCancelledEvent,
  NotFoundError,
  BadRequestError,
} from "@mogyorosistefan/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from '../../nats-wrapper';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);
    const ticket = await Ticket.findById(data.ticket.id);
    
    if (!ticket) {
      throw new NotFoundError();
    }
    
    // if (ticket.orderId) {
    //   throw new BadRequestError('Ticket already reserved');
    // }

    ticket.set({ orderId: undefined });

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
