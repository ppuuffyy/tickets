import mongoose from "mongoose";

//An interface to describe the properties that are required to create a new Ticket
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

//An interface that describes the properties that a Payment Model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

//An interface that describes the properties that a Use Document has
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  // Add this in case you setup the MongoDB cu create automatically these to columns on each table
  // createdAt: string;
  // updatedAt: string;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },    
    stripeId: {
      type: String,
      required: true,
    },  
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


//Add a custom function to a Mongoose Model using paymentSchema.statics
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>("Payment", paymentSchema);

export { Payment };
