import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from "@mogyorosistefan/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    const savedTicket = await ticket.save();
    
    msg.ack();
  }
}
