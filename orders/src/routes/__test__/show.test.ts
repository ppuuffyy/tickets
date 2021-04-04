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

it("return error for invalid orderId", async () => {
  const ticket = await saveTicket();

  const order = await request(app)
    .get("/api/orders/6065cbc203ed95b84")
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("return error if no order found", async () => {
  const ticket = await saveTicket();

  const order = await request(app)
    .get("/api/orders/6065cb4088fe2c203ed95b84")
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("return error if the order not belongs to user", async () => {
  const ticket = await saveTicket();
  const newOrder = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin('1234'))
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const order = await request(app)
    .get(`/api/orders/${newOrder.body.id}`)
    .set("Cookie", global.signin('124'))
    .send()
    .expect(401);
});


it("return the order if exists and belongs to user", async () => {
  const ticket = await saveTicket();
  const newOrder = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin('1234'))
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const order = await request(app)
    .get(`/api/orders/${newOrder.body.id}`)
    .set("Cookie", global.signin('1234'))
    .send()
    .expect(200);

  expect(order.body.ticket.id).toEqual(ticket.id);
  expect(order.body.id).toEqual(newOrder.body.id);
});