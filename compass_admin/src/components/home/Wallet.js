import React, { useEffect, useRef, useState } from "react";
// Firebase imports
import { db, auth } from "../../firebase/firebase";
import { collection, getDocs, onSnapshot, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import dayjs from "dayjs";

import ExportTransactions from "../../components/wallet/ExportTransactions";

import { formatNumber } from "../../components/wallet/WalletUtils";
import SkeletonTable from "../wallet/SkeletonTable";
import PaginatedTable from "../wallet/PaginatedTable";

// chart
import {
  Chart as ChartJS,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

const Wallet = () => {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalBuses, setTotalBuses] = useState(0);

  const [transactionHistory, setTransactionHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  // chart
  const [monthlyEarnings, setMonthlyEarnings] = useState(Array(12).fill(0));
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  // paginated
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const rowsOptions = [5, 10, 15, 20];

  // dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // filter
  const [filters, setFilters] = useState({
    searchQuery: "",
    paymentType: "",
    dateRange: "",
  });

  // loading
  const [loading, setLoading] = useState(true);

  // Fetch earnings based on filters
  const calculateTotalsFromFilteredTransactions = () => {
    const totalFare = filteredTransactions.reduce(
      (acc, transaction) => acc + parseFloat(transaction.fare_amount || 0),
      0
    );

    setTotalEarnings(totalFare.toFixed(2)); // Update total earnings
    setTotalTransactions(filteredTransactions.length); // Update total transactions
  };

  useEffect(() => {
    calculateTotalsFromFilteredTransactions(); // Recalculate totals whenever filters or transactions change
    // eslint-disable-next-line 
  }, [filters, transactionHistory]);

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
      unsubscribeTransactions();
      unsubscribeAuth();
    };
  }, []);

  // calculate

  const calculateMonthlyEarnings = (transactions) => {
    const earningsByMonth = Array(12).fill(0); // Array to hold earnings for each month

    transactions.forEach((transaction) => {
      const date = dayjs(transaction.timestamp.toDate());
      const month = date.month(); // Month index (0-11)
      const amount = parseFloat(transaction.fare_amount) || 0;

      earningsByMonth[month] += amount; // Sum up the earnings for each month
    });

    // Set the monthly earnings only if there are transactions
    if (transactions.length > 0) {
      setMonthlyEarnings(earningsByMonth);
    } else {
      setMonthlyEarnings(Array(12).fill(0)); // Reset to zeros if no transactions
    }
  };

  const filteredTransactionsByYear = transactionHistory.filter(
    (transaction) => {
      const transactionYear = dayjs(transaction.timestamp.toDate()).year();
      return transactionYear === selectedYear; // Filter by selected year
    }
  );

  useEffect(() => {
    calculateMonthlyEarnings(filteredTransactionsByYear);
    // eslint-disable-next-line
  }, [transactionHistory, selectedYear]);

  const barChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Earnings",
        data: monthlyEarnings,
        fill: false,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };
  // filter
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
        // "custom" is not handled since it's disabled and shouldn't be selectable yet
        default:
          dateMatch = true;
      }
    }

    return paymentMatch && searchMatch && dateMatch; // All conditions must be true
  });

  // total
  const totalFare = filteredTransactions.reduce(
    (acc, transaction) => acc + parseFloat(transaction.fare_amount || 0),
    0
  );

  //paginated
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // handle
  const handlePointClick = (event, elements) => {
    if (elements.length > 0) {
      const firstPoint = elements[0];
      const clickedMonthIndex = firstPoint.index; // Get the month index (0 for January, 1 for February, etc.)

      // Create a filter for the selected month and year
      const filteredByMonth = transactionHistory.filter((transaction) => {
        const transactionDate = dayjs(transaction.timestamp.toDate());
        return (
          transactionDate.year() === selectedYear &&
          transactionDate.month() === clickedMonthIndex
        );
      });

      // Apply the filtered transactions
      setTransactionHistory(filteredByMonth);

      // Update the dateRange filter to "custom"
      setFilters((prevFilters) => ({
        ...prevFilters,
        dateRange: "custom",
      }));
    }
  };

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
    <div className="p-6">
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

      {/* Line Chart for Monthly Earnings */}
      <div className="bg-base-300 shadow-lg rounded-lg p-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Monthly Earnings</div>
          <div className="flex items-center">
            <label
              htmlFor="year-selector"
              className="text-lg font-semibold mr-2"
            >
              Select Year:
            </label>
            <select
              id="year-selector"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="select select-bordered"
            >
              {/* Year options from current year down to 2022 dynamically */}
              {Array.from(
                { length: dayjs().year() - 2022 },
                (_, i) => dayjs().year() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="relative h-72 w-full overflow-hidden">
          {" "}
          {/* Use DaisyUI utility classes */}
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  min: 0,
                  ticks: {
                    stepSize: 200, // Customize the step size to 200
                  },
                },
                x: {
                  ticks: {
                    autoSkip: true, // Automatically skip some ticks if there are too many
                    maxTicksLimit: 12, // Limit the number of ticks on the x-axis
                  },
                },
              },
              plugins: {
                legend: {
                  display: false, // This will hide the legend
                },
              },
              onClick: handlePointClick,
            }}
            height={300}
          />
        </div>
      </div>

      {/* Transaction History Box */}
      <div className="bg-base-300 shadow-lg rounded-lg p-4 mt-4">
        <div className="text-lg font-semibold">Transaction History</div>

        {/* Filter Inputs */}
        <div className="flex items-center justify-between my-4">
          <div className="flex items-center gap-4 flex-grow">
            {" "}
            {/* Inner flex for input alignment */}
            <input
              type="text"
              name="searchQuery"
              placeholder="Filter by Bus Driver Name, Bus Number, or Reference Number"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              className="input input-bordered w-4/12" // Smaller width for the search input
            />
            <select
              name="paymentType"
              value={filters.paymentType}
              onChange={handleFilterChange}
              className="select select-bordered w-48" // Fixed width for transaction type dropdown
            >
              <option value="">All Payment Types</option>
              <option value="Cash">Cash</option>
              <option value="Cashless">Cashless</option>
            </select>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={(e) => {
                handleFilterChange(e);
                if (e.target.value === "") {
                  // Reset to show all transactions when "All Transactions" is selected
                  fetchTransactionHistory();
                }
              }}
              className="select select-bordered w-48"
            >
              <option value="">All Transactions</option>
              <option value="today" disabled={filters.dateRange === "custom"}>
                Today
              </option>
              <option
                value="thisWeek"
                disabled={filters.dateRange === "custom"}
              >
                This Week
              </option>
              <option
                value="lastWeek"
                disabled={filters.dateRange === "custom"}
              >
                Last Week
              </option>
              <option value="custom" disabled>
                Custom
              </option>
            </select>
          </div>

          <ExportTransactions transactionHistory={transactionHistory} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bor">
            <thead>
              <tr>
                <th className="border border-white px-4 py-2">Date</th>
                <th className="border border-white px-4 py-2">
                  Bus Driver Name
                </th>
                <th className="border border-white px-4 py-2">Bus Number</th>
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
                  <SkeletonTable key={index} /> // Skeleton
                ))
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <PaginatedTable
                    key={transaction.id}
                    transaction={transaction}
                  /> // Data
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="border px-4 py-2 text-center">
                    No transactions found.
                  </td>
                </tr>
              )}
              {paginatedTransactions.length > 0 &&
              (filters.searchQuery ||
                filters.paymentType ||
                filters.dateRange) ? (
                <tr>
                  <td
                    colSpan="6"
                    className="border border-white text-end px-4 py-2 font-bold"
                  ></td>
                  <td className="border border-white text-end px-4 py-2">
                    <span className="font-bold">Total:</span>{" "}
                    {formatNumber(totalFare)}
                  </td>
                </tr>
              ) : null}
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
