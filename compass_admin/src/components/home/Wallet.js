import React, { useEffect, useRef, useState } from "react";
// Firebase imports
import { db, auth } from "../../firebase/firebase";
import { collection, getDocs, onSnapshot, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Wallet = () => {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalBuses, setTotalBuses] = useState(0);

  const [transactionHistory, setTransactionHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  // rows
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const rowsOptions = [5, 10, 15, 20];

  // dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [filters, setFilters] = useState({
    searchQuery: "",
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

  const fetchAdminWallet = () => {
    const walletDoc = doc(db, "wallet", "wallet");

    const unsubscribe = onSnapshot(walletDoc, (snapshot) => {
      if (snapshot.exists()) {
        const walletData = snapshot.data();
        setWalletBalance(walletData.balance);
      } else {
        console.log("No such wallet document!");
      }
    });

    return unsubscribe;
  };

  const fetchBuses = async () => {
    const busesCollection = collection(db, "buses");
    const busesSnapshot = await getDocs(busesCollection);
    setTotalBuses(busesSnapshot.size);
  };

  useEffect(() => {
    const unsubscribeEarnings = fetchEarnings();
    const unsubscribeTransactions = fetchTransactionHistory();
    fetchBuses();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const companyId = user.uid; // Use the current user's ID as the companyId
        const unsubscribeWallet = fetchAdminWallet(companyId); // Fetch wallet balance using companyId

        // Unsubscribe from wallet updates when component unmounts
        return () => unsubscribeWallet();
      } else {
        console.log("No user is signed in");
      }
    });

    return () => {
      unsubscribeEarnings();
      unsubscribeTransactions();
      unsubscribeAuth();
    };
  }, []);

  // other methods

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(number);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-PH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filteredTransactions = transactionHistory.filter((transaction) => {
    const searchQuery = filters.searchQuery.toLowerCase();
    const paymentMatch =
      !filters.paymentType || transaction.payment_type === filters.paymentType;
    const searchMatch =
      !searchQuery ||
      transaction.bus_driver_name.toLowerCase().includes(searchQuery) ||
      transaction.bus_number.toLowerCase().includes(searchQuery);

    return paymentMatch && searchMatch; // Both conditions must be true
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
    setIsDropdownOpen(false);
  };

  const dropdownRef = useRef(null);
  const [dropdownState, setDropdownState] = useState("dropdown-bottom");

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    if (dropdownRef.current) {
      const pos = dropdownRef.current.getBoundingClientRect();
      const offsetBottom = window.innerHeight - pos.bottom;

      if (offsetBottom < 200) {
        setDropdownState("dropdown-top");
      } else {
        setDropdownState("dropdown-bottom");
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Top Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Earnings Card */}
        <div className="bg-base-300 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Earnings</div>
          <div className="text-2xl truncate">{formatNumber(totalEarnings)}</div>
          {/* <div className="text-sm text-green-500">↑ 12% Since last month</div> */}
        </div>

        {/* Transactions Card */}
        <div className="bg-base-300 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Transactions</div>
          <div className="text-2xl truncate">{totalTransactions}</div>
          {/* <div className="text-sm text-red-500">↓ 16% Since last month</div> */}
        </div>

        {/* Wallet Card */}
        <div className="bg-base-300 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Wallet</div>
          <div className="text-2xl truncate">{formatNumber(walletBalance)}</div>
        </div>

        {/* Buses Card */}
        <div className="bg-base-300 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Buses</div>
          <div className="text-2xl truncate">{totalBuses}</div>
        </div>
      </div>

      {/* Transaction History Box */}
      <div className="bg-base-300 shadow-lg rounded-lg p-4">
        <div className="text-lg font-semibold">Transaction History</div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <input
            type="text"
            name="searchQuery"
            placeholder="Filter by Bus Driver Name or Bus Number"
            value={filters.searchQuery}
            onChange={handleFilterChange}
            className="input input-bordered w-full"
          />

          <select
            name="paymentType"
            value={filters.paymentType}
            onChange={handleFilterChange}
            className="select select-bordered w-6/12 max-w-xs"
          >
            <option value="">All Payment Types</option>{" "}
            <option value="Cash">Cash</option>
            <option value="Cashless">Cashless</option>
          </select>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bor">
            <thead>
              <tr>
                <th className="border border-white px-4 py-2">
                  Bus Driver Name
                </th>
                <th className="border border-white px-4 py-2">Bus Number</th>
                <th className="border border-white px-4 py-2">
                  Reference Number
                </th>
                <th className="border border-white px-4 py-2">Payment Type</th>
                <th className="border border-white px-4 py-2">Fare Amount</th>
                <th className="border border-white px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <tr key={index}>
                    <td className="border border-white px-4 py-2">
                      <div className="skeleton h-4 w-24"></div>
                    </td>
                    <td className="border border-white px-4 py-2">
                      <div className="skeleton h-4 w-24"></div>
                    </td>
                    <td className="border border-white px-4 py-2">
                      <div className="skeleton h-4 w-24"></div>
                    </td>
                    <td className="border border-white px-4 py-2">
                      <div className="skeleton h-4 w-24"></div>
                    </td>
                    <td className="border border-white px-4 py-2">
                      <div className="skeleton h-4 w-24"></div>
                    </td>
                    <td className="border border-white px-4 py-2">
                      <div className="skeleton h-4 w-24"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="border border-white px-4 py-2">
                      {transaction.bus_driver_name}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {transaction.bus_number}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {transaction.reference_number}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {transaction.payment_type}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {formatNumber(transaction.fare_amount)}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {formatDate(transaction.timestamp)}
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
      </div>
      {/* Pagination */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">
            Rows per page:
            <div
              ref={dropdownRef}
              className={`dropdown inline-block ml-2 ${dropdownState}`}
            >
              <div
                tabIndex={0}
                role="button"
                className="btn m-1"
                onClick={toggleDropdown}
              >
                {rowsPerPage} <span className="ml-2">▼</span>{" "}
                {/* Indicate dropdown */}
              </div>
              {isDropdownOpen && ( // Step 2: Conditional rendering of dropdown
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-300 rounded-box z-[1] shadow"
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
              )}
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
