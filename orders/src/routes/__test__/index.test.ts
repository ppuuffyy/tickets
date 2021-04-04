import request from "supertest";
import mongoose from 'mongoose';
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

const saveTicket = async ()  => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();
  return ticket;
}


it("fetches orders for a signed in user", async () => {
  const ticket1 = await saveTicket();
  const ticket2 = await saveTicket();
  const ticket3 = await saveTicket();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin('1234'))
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);    
  
    await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin('1234'))
    .send({
      ticketId: ticket3.id,
    })
    .expect(201);

  const orders = await request(app)
    .get("/api/orders")
    .set("Cookie", global.signin('1234'))
    .send()
    .expect(200);

  expect(orders.body.length).toEqual(2);
  expect(orders.body[0].ticket.id).toEqual(ticket1.id);
  expect(orders.body[1].ticket.id).toEqual(ticket3.id);
  
});