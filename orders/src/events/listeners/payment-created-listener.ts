import {
  Listener,
  Subjects,
  OrderStatus,
  PaymentCreatedEvent,
  NotFoundError,
} from "@mogyorosistefan/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-names";
import { Order } from '../../models/order';



export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    // console.log(`Event nr. ${msg.getSequence()} received!`, data);
    const { id, orderId, stripeId } = data;

    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new NotFoundError();
    }

    order.set({
      status: OrderStatus.Complete
    });
    await order.save();
    
    
    msg.ack();
  }
}
