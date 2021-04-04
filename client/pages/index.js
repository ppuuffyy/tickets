// import buildClient from "../api/build-client";
import Link from 'next/link';

const LandingPage = ({ currentUser, tickets}) => {
  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}> 
            <a >Details</a>
          </Link>
        </td>
        <td>
          {ticket.orderId ? (<span> Sold </span>) : (<span> Available </span>) }
        </td>
      </tr>
    );
  })

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>   
          <th>Details</th>    
          <th>Availability</th> 
        </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  // const client = buildClient(context); //creating custom axios cu make the request to proper url
  const { data } = await client.get("/api/tickets");
  return { tickets: data };
};

export default LandingPage;
