import express, { Request, Response } from "express";
import { body } from "express-validator";
import { natsWrapper } from '../nats-wrapper';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  BadRequestError,
  NotAuthorizedError
} from "@mogyorosistefan/common";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 5, max: 120 })
      .withMessage("Title must have betvween 5 and 120 characters "),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Provide a price that is greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Ticket is reserved');
    }

    ticket.set({title, price});
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });    

    res.send(ticket);
  }
);

export { router as updateTicketRouter };