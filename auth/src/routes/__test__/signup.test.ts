import request from 'supertest';
import { app } from '../../app';

it('return a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '12345'
    })
    .expect(201); 
});

it('return 400 with invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testtest.com',
      password: '12345'
    })
    .expect(400); 
});

it('return 400 with invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '145'
    })
    .expect(400); 
});

it('return 400 with no email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com'
    })
    .expect(400); 

  await request(app)
    .post('/api/users/signup')
    .send({
      password: '12345'
    })
    .expect(400); 
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: '12345'
    })
    .expect(201); 

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: '12345'
    })
    .expect(400); 
});

it('sets a cookie on successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: '12345'
    })
    .expect(201);
    
  expect(response.get('Set-Cookie')).toBeDefined();
})