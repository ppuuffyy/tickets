import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: (payment) => Router.push('/orders')
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const timeRemaining = Math.round(
        (new Date(order.expiresAt) - new Date()) / 1000
      );
      setTimeLeft(timeRemaining);
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div>
      <h2>Purchasing {order.ticket.title} ticket</h2>
      <h4>You have to pay: {order.ticket.price} usd</h4>
      {order.status !== "cancelled" && timeLeft > 0 ? (
        <div>
          <h4>{timeLeft} seconds left to pay</h4>
          <StripeCheckout
            token={({ id }) => doRequest( {token: id} )}
            stripeKey="pk_test_51IcBNGGrnhkOBwUxrwYjiTuwsnYkClHpUkalxlwvOSElNTGKgQ0VHsFKMUcEBnAQEULt8LEPHnsVZJMc93fMQ9QD00Gl6kMbYE"
            amount={order.ticket.price * 100}
            email={currentUser.email}
          />
          {errors}
        </div>
      ) : (
        <h4>You order already expired</h4>
      )}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  // console.log(data);
  return { order: data };
};

export default OrderShow;
