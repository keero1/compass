import React, { useEffect, useState } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

const Wallet = () => {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalBuses, setTotalBuses] = useState(0);

  const [transactionHistory, setTransactionHistory] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  // rows
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const rowsOptions = [5, 10, 15, 20];

  const [filters, setFilters] = useState({
    busDriverName: "",
    busNumber: "",
    paymentType: "",
  });

  const [loading, setLoading] = useState(true);

  const fetchEarnings = () => {
    const transactionsCollection = collection(db, "transactions");

    const unsubscribe = onSnapshot(transactionsCollection, (snapshot) => {
      let earnings = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        earnings += Number(data.fare_amount || 0);
      });

      setTotalEarnings(earnings.toFixed(2));
      setTotalTransactions(snapshot.size);
    });

    return unsubscribe;
  };

  const fetchTransactionHistory = () => {
    const transactionsCollection = collection(db, "transactions");

    const unsubscribe = onSnapshot(transactionsCollection, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedTransactions = transactionsData.sort((a, b) => {
        return b.timestamp - a.timestamp; // Descending order
      });

      setTransactionHistory(sortedTransactions);
      setLoading(false);
    });

    return unsubscribe;
  };

  const fetchBuses = async () => {
    const busesCollection = collection(db, "buses");
    const busesSnapshot = await getDocs(busesCollection);
    setTotalBuses(busesSnapshot.size);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(number);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  useEffect(() => {
    const unsubscribeEarnings = fetchEarnings();
    const unsubscribeTransactions = fetchTransactionHistory();
    fetchBuses();

    return () => {
      unsubscribeEarnings();
      unsubscribeTransactions();
    };
  }, []);

  const filteredTransactions = transactionHistory.filter((transaction) => {
    return (
      !filters.busDriverName ||
      transaction.bus_driver_name
        .toLowerCase()
        .includes(filters.busDriverName.toLowerCase())
    );
  });

  //paginated
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

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
    <div className="p-6 space-y-4">
      {/* Top Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Earnings Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Earnings</div>
          <div className="text-2xl truncate">{formatNumber(totalEarnings)}</div>
          {/* <div className="text-sm text-green-500">↑ 12% Since last month</div> */}
        </div>

        {/* Transactions Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Transactions</div>
          <div className="text-2xl truncate">{totalTransactions}</div>
          {/* <div className="text-sm text-red-500">↓ 16% Since last month</div> */}
        </div>

        {/* Wallet Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Wallet</div>
          <div className="text-2xl truncate">₱0.00</div>
        </div>

        {/* Buses Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Buses</div>
          <div className="text-2xl truncate">{totalBuses}</div>
        </div>
      </div>

      {/* Transaction History Box */}
      <div className="bg-base-100 shadow-lg rounded-lg p-4">
        <div className="text-lg font-semibold">Transaction History</div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <input
            type="text"
            name="busDriverName"
            placeholder="Filter by Bus Driver Name"
            value={filters.busDriverName}
            onChange={handleFilterChange}
            className="input input-bordered w-full"
          />
        </div>

        {/* Transaction Table */}
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Bus Driver Name</th>
              <th className="border px-4 py-2">Bus Number</th>
              <th className="border px-4 py-2">Reference Number</th>
              <th className="border px-4 py-2">Payment Type</th>
              <th className="border px-4 py-2">Fare Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                </tr>
              ))
            ) : paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="border px-4 py-2">
                    {transaction.bus_driver_name}
                  </td>
                  <td className="border px-4 py-2">{transaction.bus_number}</td>
                  <td className="border px-4 py-2">
                    {transaction.reference_number}
                  </td>
                  <td className="border px-4 py-2">
                    {transaction.payment_type}
                  </td>
                  <td className="border px-4 py-2">
                    {formatNumber(transaction.fare_amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="border px-4 py-2 text-center">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">
            Rows per page:
            <div className="dropdown dropdown-bottom inline-block ml-2">
              <div tabIndex={0} role="button" className="btn m-1">
                {rowsPerPage} <span className="ml-2">▼</span>{" "}
                {/* Indicate dropdown */}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu rounded-box z-[1] shadow"
              >
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
          <div className="flex space-x-2">
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
                currentPage ===
                Math.ceil(filteredTransactions.length / rowsPerPage)
                  ? "btn-disabled"
                  : ""
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
