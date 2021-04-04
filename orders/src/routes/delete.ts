import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { natsWrapper } from "../nats-wrapper";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import {
  NotFoundError,
  BadRequestError,
  requireAuth,
  NotAuthorizedError
} from "@mogyorosistefan/common";
// import { Ticket } from '../models/ticket';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    throw new BadRequestError('Invalid orderId');
  }

  const order = await Order.findById(req.params.orderId).populate('ticket');
  
  if (!order) {
    throw new NotFoundError();
  }
  
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();

  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    }
  });  

  res.status(201).send(order)
})

export { router as deleteOrderRouter };