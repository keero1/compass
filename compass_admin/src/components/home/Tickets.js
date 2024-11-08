import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const ticketsCollection = collection(db, "tickets");

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [filters, setFilters] = useState({
    searchQuery: "",
    status: "all",
    subject: "all",
  });

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [modalType, setModalType] = useState("view");
  const [replyContent, setReplyContent] = useState("");

  const fetchTicketData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(ticketsCollection);
      const fetchedTickets = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          ticket_id: doc.id,
          createdAt: data.createdAt.toDate(), // Save raw timestamp
          date: formatDate(data.createdAt), // Use the formatted date
          description: data.description,
          subject: data.subject,
          email: data.email,
          status: data.status,
        };
      });

      // Sort tickets based on createdAt timestamp in descending order
      fetchedTickets.sort((a, b) => b.createdAt - a.createdAt);

      setTickets(fetchedTickets);
    } catch (error) {
      console.error("Error fetching ticket data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Set to false for 24-hour format
    };
    return date.toDate().toLocaleString("en-US", options);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(tickets.length / rowsPerPage))
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch =
      filters.status === "all" ||
      ticket.status.toLowerCase() === filters.status;
    const subjectMatch =
      filters.subject === "all" ||
      ticket.subject.toLowerCase() === filters.subject.toLowerCase();

    return subjectMatch && statusMatch;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const openModal = (ticket, type = "view") => {
    setSelectedTicket(ticket);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setReplyContent(""); // Clear the reply content
  };

  // handle

  const handleSendReply = async () => {
    if (!selectedTicket) return;

    console.log("Sending reply..");

    try {
      const response = await fetch(
        "https://compass-backend-coral.vercel.app/api/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: selectedTicket.subject,
            content: replyContent,
            toEmail: selectedTicket.email, // Send email to the customer
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      // Update the ticket status to "pending" after sending the email
      const ticketRef = doc(db, "tickets", selectedTicket.ticket_id);
      await updateDoc(ticketRef, {
        status: "pending", // Update status to pending
      });

      fetchTicketData(); // Refresh ticket data
      closeModal(); // Close the modal after the action
    } catch (error) {
      console.error("Error replying to the ticket:", error);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const ticketRef = doc(db, "tickets", selectedTicket.ticket_id);
      await updateDoc(ticketRef, {
        status: "closed", // Update ticket status
      });
      fetchTicketData(); // Refresh ticket data
      closeModal();
    } catch (error) {
      console.error("Error closing ticket:", error);
    }
  };

  const truncateDescription = (description, length = 85) => {
    if (!description) return "";
    return description.length > length
      ? description.slice(0, length) + "..."
      : description;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
      </div>

      {/* Table */}
      <div className="bg-base-300 overflow-x-auto shadow-lg rounded-lg p-4">
        <div className="flex items-center gap-4 flex-grow">
          <select
            name="subject"
            className="select select-bordered w-48"
            value={filters.subject}
            onChange={handleFilterChange}
          >
            <option value="all">All Subjects</option>
            <option value="Payment Issues">Payment Issues</option>
            <option value="App Performance">App Performance</option>
            <option value="Bus Tracking">Bus Tracking</option>
            <option value="Account Management">Account Management</option>
            <option value="Feature Request">Feature Request</option>
          </select>
          <select
            name="status"
            className="select select-bordered w-48"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">Subject</th>
              <th className="text-left text-xl">Description</th>
              <th className="text-left text-xl">Email</th>
              <th className="text-left text-xl">Status</th>
              <th className="text-left text-xl">Date</th>
              <th className="text-left text-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <tr key={index}>
                  <td className="text-lg">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="text-lg">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="text-lg">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="text-lg">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td>
                    <div className="skeleton h-4 w-16"></div>
                  </td>
                </tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-lg">
                  No Tickets Available
                </td>
              </tr>
            ) : (
              paginatedTickets.map((ticket) => (
                <tr key={ticket.ticket_id}>
                  <td className="text-lg">{ticket.subject}</td>
                  <td className="text-lg max-w-xs overflow-hidden overflow-ellipsis whitespace-normal">
                    {truncateDescription(ticket.description)}
                  </td>

                  <td className="text-lg">{ticket.email}</td>
                  <td className="text-lg uppercase">{ticket.status}</td>
                  <td className="text-lg">{ticket.date}</td>
                  <td>
                    <button
                      onClick={() => openModal(ticket)}
                      className="btn btn-ghost btn-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredTickets.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">Rows per page: {rowsPerPage}</div>
          <div className="text-lg">
            {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredTickets.length)} of{" "}
            {filteredTickets.length}
          </div>
          <div className="text-lg flex space-x-2">
            <button
              onClick={handlePrevPage}
              className={`btn btn-sm ${
                currentPage === 1 ? "btn-disabled" : ""
              }`}
            >
              &lt;
            </button>
            <button
              onClick={handleNextPage}
              className={`btn btn-sm ${
                currentPage === Math.ceil(filteredTickets.length / rowsPerPage)
                  ? "btn-disabled"
                  : ""
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box">
            {modalType === "view" ? (
              <>
                <h3 className="font-bold text-lg mb-4">View Ticket</h3>
                <div className="mb-4">
                  <p>
                    <strong>Subject:</strong> {selectedTicket.subject}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedTicket.description}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedTicket.email}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedTicket.status}
                  </p>
                </div>
                <div className="modal-action">
                  {selectedTicket.status === "Open" && (
                    <button
                      onClick={() => openModal(selectedTicket, "reply")}
                      className="btn btn-primary"
                    >
                      Reply
                    </button>
                  )}
                  {selectedTicket.status === "pending" && (
                    <button
                      onClick={handleCloseTicket}
                      className="btn btn-primary"
                    >
                      Close Ticket
                    </button>
                  )}
                  <button className="btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            ) : modalType === "reply" ? (
              <>
                <h2 className="text-2xl font-bold mb-5">Reply to Ticket</h2>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  placeholder="Write your reply here"
                />
                <div className="modal-action">
                  <button className="btn btn-primary" onClick={handleSendReply}>
                    Send Reply
                  </button>
                  {selectedTicket.status === "pending" && (
                    <button
                      onClick={handleCloseTicket}
                      className="btn btn-primary"
                    >
                      Close Ticket
                    </button>
                  )}
                  <button className="btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
