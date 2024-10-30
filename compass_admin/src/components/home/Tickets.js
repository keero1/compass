import React, { useState, useEffect } from "react";
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
  });

  const [selectedStatus, setSelectedStatus] = useState("all");

  // modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTicketData = async () => {
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
  };

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

  useEffect(() => {
    fetchTicketData();
  }, []);

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

    // For status filter
    if (name === "status") {
      setSelectedStatus(value);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const subjectMatch = ticket.subject
      ? ticket.subject.toLowerCase().includes(filters.searchQuery.toLowerCase())
      : false;
    const emailMatch = ticket.email
      ? ticket.email.toLowerCase().includes(filters.searchQuery.toLowerCase())
      : false;

    const statusMatch =
      selectedStatus === "all" ||
      ticket.status.toLowerCase() === selectedStatus;

    return (subjectMatch || emailMatch) && statusMatch;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTicket(null);
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const ticketRef = doc(db, "tickets", selectedTicket.ticket_id);
      await updateDoc(ticketRef, {
        status: "closed", // Update ticket status
      });
      fetchTicketData(); // Refresh ticket data
      closeEditModal();
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <input
            type="text"
            name="searchQuery"
            placeholder="Filter by Subject or Email"
            className="input input-bordered w-full"
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
          <select
            name="status"
            className="select select-bordered w-1/2"
            value={selectedStatus}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
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
                      onClick={() => openEditModal(ticket)}
                      className="btn btn-ghost btn-xs"
                    >
                      Edit
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

      {isEditModalOpen && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit Ticket</h3>
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
              {/* Conditionally render the Close Ticket button */}
              {selectedTicket.status !== "closed" && (
                <button onClick={handleCloseTicket} className="btn btn-primary">
                  Close Ticket
                </button>
              )}
              <button onClick={closeEditModal} className="btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
