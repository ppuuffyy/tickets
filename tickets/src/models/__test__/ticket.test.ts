import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 10,
    userId: '1234'
  });
  await ticket.save();

  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  ticket1!.set({ title: 'Szinhaz'});
  ticket2!.set({ title: 'BArmi mas'});

  await ticket1!.save();

  try {
    await ticket2!.save();
  } catch (error) {
    return done();
  }
  throw new Error('Should not reach this point');

});

it('increments version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 10,
    userId: '1234'
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);
})