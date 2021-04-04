import request from 'supertest';
import { app } from '../../app';


it('sets a cookie on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '12345'
    })
    .expect(201); 

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '12345'
    })
    .expect(200);   
  expect(response.get('Set-Cookie')).toBeDefined();  
});

it('return a 400 on invalid email & password combination', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '12345'
    })
    .expect(201); 

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '123456'
    })
    .expect(400);     
});


it('return a 400 on not existing user', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: '12345'
    })
    .expect(400);     
});