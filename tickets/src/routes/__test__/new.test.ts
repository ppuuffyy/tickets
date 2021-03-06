import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

import { natsWrapper } from '../../nats-wrapper';

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed it the user is signed it", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("it returns other than 401 if user is signed in", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("it returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "akl",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 20,
    })
    .expect(400);
});

it("it returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "akl ef wefwef ew ",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "akl ef wefwef ew ",
    })
    .expect(400);
});

it("create a ticket with valid inputs", async () => {
  const title = 'asfafafasf';

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: title,
      price: 110,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);  
  expect(tickets[0].title).toEqual(title);
});


it("publish an event after creating a ticket", async () => {
  const title = 'asfafafasf';

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: title,
      price: 110,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  

});
