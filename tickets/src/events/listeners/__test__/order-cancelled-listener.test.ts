import { Message } from "node-nats-streaming";
import { OrderCancelledEvent, OrderStatus } from "@mogyorosistefan/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'Concert',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId });
  await ticket.save();


  const data: OrderCancelledEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    ticket,
    orderId,
    data,
    msg,
  };
};

it("creates and saves a ticket, acks the message and publish a ticket update event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const savedTicket = await Ticket.findById(data.ticket.id);
  
  //console.log(savedTicket);

  expect(savedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(ticketUpdatedData.orderId).not.toBeDefined(); 
});


