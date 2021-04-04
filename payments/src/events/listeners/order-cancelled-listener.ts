import {
  Listener,
  Subjects,
  OrderCancelledEvent,
  NotFoundError,
  OrderStatus,
} from "@mogyorosistefan/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import { Order } from '../../models/order';


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);

    const order = await Order.findByEvent({ id: data.id, version: data.version });

    if (!order) {
      throw new NotFoundError();
    }
    order.set({ status: OrderStatus.Cancelled});
    await order.save();
    
    msg.ack();
  }
}
