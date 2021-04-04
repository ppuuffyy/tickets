import Link from 'next/link';

const OrderIndex = ({ orders }) => {
  const orderList = orders.map(order => {
    return (
      <tr key={order.id}>
        <td>{order.ticket.title}</td>
        <td>{order.ticket.price}</td>
        <td>{order.expiresAt}</td>
        <td>
          {order.status === 'created' ? (
            <Link href="/orders/[orderId]" as={`/orders/${order.id}`}> 
              <a >Pay now</a>
            </Link>
          ) : (<span> {order.status} </span>)}
        </td>
      </tr>
    )
  })

  return (
    <div>
      <h1> Your orders </h1>
      <table className="table">
        <thead>
        <tr>
          <th>Ticket name</th>
          <th>Price</th>   
          <th>Date</th>
          <th>Status</th>    
        </tr>
        </thead>
        <tbody>
          {orderList}
        </tbody>
      </table>
    </div>);
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/orders");

  return { orders: data };
};

export default OrderIndex;
