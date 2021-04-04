import { response } from "express";
import mongoose from 'mongoose';
import request from "supertest";
import { app } from "../../app";


it('returns 404 if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket if is found', async () => {
  const title = 'asfafafasf1';
  const price = 20;
  const create = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: title,
      price: price, 
    })
    .expect(201);

  const id = create.body.id;

  const response = await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(200);
  
  expect(response.body.title).toEqual(title);
  expect(response.body.price).toEqual(price);
});

