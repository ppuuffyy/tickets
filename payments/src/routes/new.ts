import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Payment } from "../models/payments";
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import {
  validateRequest,
  BadRequestError,
  requireAuth,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from "@mogyorosistefan/common";
import { Order } from "../models/order";
import {stripe} from '../stripe';

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order already cancelled');
    }

    // send chargement request to Stripe
    const stripeCharge = await stripe.charges.create({
      amount: order.price * 100, //convert from usd to cents what is required by stripe
      currency: 'usd',
      source: token
    });

    const payment = Payment.build({
      orderId,
      stripeId: stripeCharge.id
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({id: payment.id});
  }
);

export {router as createChargeRouter};
