import mongoose from "mongoose";
import { OrderStatus } from '@mogyorosistefan/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An interface to describe the properties that are required to create a new Ticket
interface OrderAttrs {
  id: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

//An interface that describes the properties that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>;
}

//An interface that describes the properties that a Use Document has
interface OrderDoc extends mongoose.Document {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
  // Add this in case you setup the MongoDB cu create automatically these to columns on each table
  // createdAt: string;
  // updatedAt: string;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },    
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    price: {
      type: Number,
      required: true,
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

//Add a custom function to a Mongoose Model using orderSchema.statics
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    status: attrs.status,
    userId: attrs.userId,
    price: attrs.price
  });
};

orderSchema.statics.findByEvent = (event: {id: string, version: number}) => {
  return Order.findOne({
    _id: event.id,
    version: event.version - 1
  });
}

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order, OrderStatus };
