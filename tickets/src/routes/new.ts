import express, { Request, Response } from "express";
import { body } from "express-validator";
import { natsWrapper } from '../nats-wrapper';
import {
  validateRequest,
  BadRequestError,
  requireAuth,
} from "@mogyorosistefan/common";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';

const router = express.Router();

router.post(
  "/api/tickets",
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

    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
