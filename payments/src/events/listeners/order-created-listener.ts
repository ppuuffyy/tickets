import {
  Listener,
  Subjects,
  OrderCreatedEvent,
} from "@mogyorosistefan/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import { Order } from '../../models/order';


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);

    const order = Order.build({
      id: data.id,
      status: data.status,
      version: data.version,
      price: data.ticket.price,
      userId: data.userId
    });
    await order.save();

    
    msg.ack();
  }
}
