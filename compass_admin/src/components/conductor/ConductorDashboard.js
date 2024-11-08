import React, { useEffect, useState } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";
import PaginatedTable from "../wallet/PaginatedTable";
import SkeletonTable from "../wallet/SkeletonTable";
import { useParams } from "react-router-dom";

const ConductorDashboard = () => {
  const { conductorId } = useParams();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: "",
    paymentType: "",
    dateRange: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const rowsOptions = [5, 10, 15, 20];

  // Fetch transactions for a specific conductor
  const fetchTransactionHistory = () => {
    const transactionsCollection = collection(db, "transactions");

    const unsubscribe = onSnapshot(transactionsCollection, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter transactions for the specific conductor
      const filteredTransactions = transactionsData.filter(
        (transaction) => transaction.conductor_id === conductorId
      );

      setTransactionHistory(filteredTransactions);
      setLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (conductorId) {
      const unsubscribe = fetchTransactionHistory();
      return () => unsubscribe();
    }
  }, [conductorId]);

  // Filtered transactions based on filters
  const filteredTransactions = transactionHistory.filter((transaction) => {
    const searchQuery = filters.searchQuery.toLowerCase();
    const paymentMatch =
      !filters.paymentType || transaction.payment_type === filters.paymentType;
    const searchMatch =
      !searchQuery ||
      transaction.bus_driver_name.toLowerCase().includes(searchQuery) ||
      transaction.reference_number.toString().includes(searchQuery); // Check for reference number

    let dateMatch = true;
    if (filters.dateRange) {
      const transactionDate = dayjs(transaction.timestamp.toDate());
      const today = dayjs();

      switch (filters.dateRange) {
        case "today":
          dateMatch = transactionDate.isSame(today, "day");
          break;
        case "thisWeek":
          dateMatch =
            transactionDate.isAfter(today.startOf("week")) &&
            transactionDate.isBefore(today.endOf("week"));
          break;
        case "lastWeek":
          dateMatch =
            transactionDate.isAfter(
              today.subtract(1, "week").startOf("week")
            ) &&
            transactionDate.isBefore(today.subtract(1, "week").endOf("week"));
          break;
        case "thisMonth":
          dateMatch =
            transactionDate.isAfter(today.startOf("month")) &&
            transactionDate.isBefore(today.endOf("month"));
          break;
        case "past90Days":
          dateMatch = transactionDate.isAfter(today.subtract(90, "day"));
          break;
        default:
          dateMatch = true;
      }
    }

    return paymentMatch && searchMatch && dateMatch; // All conditions must be true
  });

  // Pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));

    setCurrentPage(1);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(
        prevPage + 1,
        Math.ceil(filteredTransactions.length / rowsPerPage)
      )
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value)); // Update rowsPerPage based on user selection
  };

  return (
    <div className="p-6">
      <div className="bg-base-300 shadow-lg rounded-lg p-4 mt-4">
        <div className="text-lg font-semibold">Transaction History</div>

        {/* Filter Inputs */}
        <div className="flex items-center justify-between my-4">
          <div className="flex items-center gap-4 flex-grow">
            <input
              type="text"
              name="searchQuery"
              placeholder="Filter by Bus Driver Name, Bus Number, or Reference Number"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              className="input input-bordered w-4/12"
            />
            <select
              name="paymentType"
              value={filters.paymentType}
              onChange={handleFilterChange}
              className="select select-bordered w-48"
            >
              <option value="">All Payment Types</option>
              <option value="Cash">Cash</option>
              <option value="Cashless">Cashless</option>
            </select>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="select select-bordered w-48"
            >
              <option value="">All Transactions</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="past90Days">Past 90 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bor">
            <thead>
              <tr>
                <th className="border border-white px-4 py-2">Date</th>
                <th className="border border-white px-4 py-2">
                  Bus Driver Name
                </th>
                <th className="border border-white px-4 py-2">
                  Conductor Name
                </th>
                <th className="border border-white px-4 py-2">Trip</th>
                <th className="border border-white px-4 py-2">
                  Reference Number
                </th>
                <th className="border border-white px-4 py-2">Payment Type</th>
                <th className="border border-white px-4 py-2">Fare Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <SkeletonTable key={index} />
                ))
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <PaginatedTable
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="border px-4 py-2 text-center">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">
            Rows per page:
            <div className="dropdown inline-block ml-2">
              <div tabIndex={0} role="button" className="btn m-1">
                {rowsPerPage} <span className="ml-2">▼</span>
              </div>
              <ul className="dropdown-content menu bg-base-300 rounded-box z-[1] shadow">
                {rowsOptions.map((option) => (
                  <li key={option}>
                    <button
                      onClick={() =>
                        handleRowsPerPageChange({ target: { value: option } })
                      }
                      className="block px-4 py-2 hover:bg-base-200"
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-lg">
            {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredTransactions.length)} of{" "}
            {filteredTransactions.length}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handlePrevPage}
              className="btn btn-sm"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              onClick={handleNextPage}
              className="btn btn-sm"
              disabled={
                currentPage ===
                Math.ceil(filteredTransactions.length / rowsPerPage)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConductorDashboard;
