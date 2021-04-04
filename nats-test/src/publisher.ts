import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import { Subjects } from "./events/subject";



const sc = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

sc.on("connect", async () => {
  console.log("Publisher connected to nats");

  sc.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  const data = { 
    title: randomBytes(4).toString("hex"), 
    price: 20, 
    id: randomBytes(2).toString("hex") 
  };

  const publisher = new TicketCreatedPublisher(sc);
  try {
    const guid = await publisher.publish(data);
    console.log(`Event ${guid} published to ${Subjects.TicketCreated}`);
    
  } catch (error) {
    console.log(error);
  }

});

process.on('SIGINT', () => sc.close());
process.on('SIGTERM', () => sc.close());
