import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { OrderStatus } from "@mogyorosistefan/common";
import mongoose from "mongoose";
import {stripe} from '../../stripe';
import {Payment} from '../../models/payments';


it("can only be accessed it the user is signed it", async () => {
  await request(app).post("/api/payments").send({}).expect(401);
});

it("returns a 404 if the order not found", async () => {
  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "adsdasdas",
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
  // expect(response.status).not.toEqual(404);
});

it("returns a 401 if the order not belongs to user", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    price: 100,
  });
  await order.save();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "adsdasdas",
      orderId: order.id,
    })
    .expect(401);
  // expect(response.status).not.toEqual(404);
});


it("returns a 400 if the order is cancelled", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    status: OrderStatus.Cancelled,
    version: 0,
    price: 100,
  });
  await order.save();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "adsdasdas",
      orderId: order.id,
    })
    .expect(400);
  // expect(response.status).not.toEqual(404);
});

it("returns a 201 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 10000)
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    status: OrderStatus.Created,
    version: 0,
    price,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);
  
  const recentCharges = await stripe.charges.list({
    limit: 20
  });
  const stripeCharge = recentCharges.data.find(charge => {
    return charge.amount === price * 100;
  });
  
  expect(stripeCharge).toBeDefined();
  
  const payment = await Payment.findOne({ stripeId:  stripeCharge!.id, orderId: order.id});

  expect(payment).not.toBeNull();
  
  // const chargesOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargesOptions.source).toEqual('tok_visa');
  // expect(chargesOptions.amount).toEqual(10000);
  // expect(chargesOptions.currency).toEqual('usd');


});