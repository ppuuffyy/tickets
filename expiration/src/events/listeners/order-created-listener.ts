import {
  Listener,
  Subjects,
  OrderCreatedEvent,
  NotFoundError,
  BadRequestError,
} from "@mogyorosistefan/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add({
      orderId: data.id
    }, {
      delay: delay,
      // delay: 10
    });
    
    msg.ack();
  }
}
