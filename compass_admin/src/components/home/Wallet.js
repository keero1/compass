import React, { useEffect, useRef, useState } from "react";
// Firebase imports
import { db, auth } from "../../firebase/firebase";
import { collection, getDocs, onSnapshot, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// date
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import Divider from "@mui/material/Divider";

import dayjs from "dayjs";

// export
import { CSVLink } from "react-csv";

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
    dateRange: "",
  });

  const [loading, setLoading] = useState(true);

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CSV
  const [csvData, setCsvData] = useState([]);

  const csvLinkRef = useRef(null);

  //date
  const [selectedDates, setSelectedDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [displayedMonth, setDisplayedMonth] = useState(null);

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

    setCurrentPage(1);
  };

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

  const handleExportClick = () => {
    setDisplayedMonth(dayjs());
    setIsModalOpen(true); // Open modal on export click
  };

  const handleCancel = () => {
    setSelectedDates([]);
    setStartDate(null);
    setEndDate(null);
    setIsModalOpen(false); // Close modal on cancel
  };

  const handleExport = () => {
    let actualStartDate;
    let actualEndDate;

    if (startDate) {
      actualStartDate = dayjs(startDate);
    } else {
      actualStartDate = dayjs();
    }

    if (endDate) {
      actualEndDate = dayjs(endDate);
    } else {
      actualEndDate = actualStartDate;
    }

    // Ensure actualStartDate is before actualEndDate
    if (actualStartDate.isAfter(actualEndDate)) {
      [actualStartDate, actualEndDate] = [actualEndDate, actualStartDate];
    }

    const filteredTransactions = transactionHistory.filter((transaction) => {
      const transactionDate = dayjs(transaction.timestamp.toDate());
      return (
        transactionDate.isSame(actualStartDate, "day") ||
        (transactionDate.isAfter(actualStartDate, "day") &&
          transactionDate.isBefore(actualEndDate, "day")) ||
        transactionDate.isSame(actualEndDate, "day")
      );
    });

    if (filteredTransactions.length === 0) {
      alert("No transactions found in the selected date range.");
      return;
    }

    const csvHeaders = [
      { label: "Bus Driver Name", key: "bus_driver_name" },
      { label: "Bus Number", key: "bus_number" },
      { label: "Origin", key: "origin" },
      { label: "Destination", key: "destination" },
      { label: "Reference Number", key: "reference_number" },
      { label: "Payment Type", key: "payment_type" },
      { label: "Passenger Type", key: "passenger_type" },
      { label: "Fare Amount", key: "fare_amount" },
      { label: "Date", key: "date" },
    ];

    const csvData = filteredTransactions.map((transaction) => ({
      bus_driver_name: transaction.bus_driver_name,
      bus_number: transaction.bus_number,
      origin: transaction.origin,
      destination: transaction.destination,
      reference_number: transaction.reference_number,
      payment_type: transaction.payment_type,
      passenger_type: transaction.passenger_type,
      fare_amount: transaction.fare_amount,
      date: formatDate(transaction.timestamp),
    }));

    setCsvData({ data: csvData, headers: csvHeaders });

    setTimeout(() => {
      if (csvLinkRef.current) {
        csvLinkRef.current.link.click();
      }

      setSelectedDates([]);
      setStartDate(null);
      setEndDate(null);
      setIsModalOpen(false);
    }, 100);
  };

  const handleDateClick = (date) => {
    if (!startDate) {
      setStartDate(date);
      setSelectedDates([date]);
    } else if (!endDate) {
      const newEndDate = date;

      if (newEndDate.isBefore(startDate)) {
        setEndDate(newEndDate);

        const range = getDatesInRange(newEndDate, startDate);
        setSelectedDates(range);
      } else {
        setEndDate(newEndDate);

        const range = getDatesInRange(startDate, newEndDate);
        setSelectedDates(range);
      }
    } else {
      setStartDate(date);
      setEndDate(null);
      setSelectedDates([date]);
    }
  };

  // Function to get all dates between two dates
  const getDatesInRange = (start, end) => {
    const dates = [];
    let currentDate = dayjs(start).startOf("day");

    while (
      currentDate.isBefore(dayjs(end).startOf("day")) ||
      currentDate.isSame(dayjs(end).startOf("day"))
    ) {
      dates.push(currentDate.toDate());
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const handleMonthChange = (newMonth) => {
    // Update the displayed month when navigating
    setDisplayedMonth(newMonth);
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
              onChange={handleFilterChange}
              className="select select-bordered w-48"
            >
              <option value="">All Transactions</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="past90Days">Past 90 Days</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleExportClick}>
            Export Transactions
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bor">
            <thead>
              <tr>
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
                    <td className="border border-white text-center px-4 py-2">
                      {transaction.bus_number}
                    </td>
                    <td className="border border-white text-center px-4 py-2">
                      {transaction.origin} - {transaction.destination}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {transaction.reference_number}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {transaction.payment_type}
                    </td>
                    <td className="border border-white text-end px-4 py-2">
                      {formatNumber(transaction.fare_amount)}
                    </td>
                    <td className="border border-white px-4 py-2">
                      {formatDate(transaction.timestamp)}
                    </td>
                  </tr>
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
                    colSpan="5"
                    className="border border-white text-end px-4 py-2 font-bold"
                  ></td>
                  <td className="border border-white text-end px-4 py-2">
                    <span className="font-bold">Total:</span>{" "}
                    {formatNumber(totalFare)}
                  </td>
                  <td className="border border-white px-4 py-2"></td>
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
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md w-3/4">
            <h2 className="font-bold text-lg">Export Transaction Data</h2>
            <Divider
              sx={{ marginY: 2 }}
              className="bg-neutral-content opacity-50"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={startDate || null}
                onChange={handleDateClick}
                onMonthChange={handleMonthChange}
                slots={{
                  day: ({ day, selectedDay, hoveredDay, ...other }) => {
                    const isSelected = selectedDates.some((selectedDate) =>
                      dayjs(selectedDate).isSame(day, "day")
                    );

                    const isToday = day.isSame(dayjs(), "day");
                    const isDisabled = day.isAfter(dayjs().endOf("day"));

                    const isInCurrentMonth = day.isSame(
                      displayedMonth,
                      "month"
                    );

                    const {
                      onDaySelect,
                      today,
                      showDaysOutsideCurrentMonth,
                      isAnimating,
                      disableHighlightToday,
                      outsideCurrentMonth,
                      isFirstVisibleCell,
                      isLastVisibleCell,
                      ...dayProps
                    } = other;

                    return (
                      <div
                        onClick={() => !isDisabled && handleDateClick(day)}
                        className={`
                          ${
                            isSelected
                              ? "bg-primary text-base-300"
                              : isToday && !startDate
                              ? "bg-primary text-base-300"
                              : ""
                          }`}
                        style={{
                          borderRadius: "50%",
                          height: "42px",
                          width: "42px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled || !isInCurrentMonth ? 0.5 : 1,
                        }}
                        {...dayProps}
                      >
                        {day.date()}
                      </div>
                    );
                  },
                }}
                slotProps={{
                  day: () => ({
                    selectedDay: selectedDates,
                  }),
                }}
                sx={{
                  width: "100%", // Full width
                  maxWidth: "600px", // Set the maximum width for the calendar
                  maxHeight: "350px",
                  minHeight: "336px",
                  height: "350px",
                  "& .css-1n1xn3x-MuiPickersSlideTransition-root-MuiDayCalendar-slideTransition":
                    {
                      overflow: "visible",
                    },
                  "& .MuiTypography-root": {
                    fontSize: ".75rem",
                    marginRight: "8px",
                    marginLeft: "8px",
                    color: "gray",
                  },
                  "& .MuiIconButton-root": {
                    color: "gray", // Change arrow icon color to gray
                  },
                  "& .MuiDayCalendar-weekContainer": {
                    gap: "10px",
                  },
                }}
              />
            </LocalizationProvider>
            <Divider
              sx={{ marginY: 2 }}
              className="bg-neutral-content opacity-50"
            />
            <div className="modal-action">
              <button className="btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Export Link */}
      {csvData.data && (
        <CSVLink
          headers={csvData.headers}
          data={csvData.data}
          filename={
            startDate && endDate
              ? startDate > endDate
                ? `compass_transactions_${endDate?.format(
                    "YYYY-MM-DD"
                  )}-${startDate?.format("YYYY-MM-DD")}.csv`
                : `compass_transactions_${startDate?.format(
                    "YYYY-MM-DD"
                  )}-${endDate?.format("YYYY-MM-DD")}.csv`
              : `compass_transactions_${dayjs().format("YYYY-MM-DD")}.csv`
          }
          className="hidden"
          ref={csvLinkRef} // Reference to the CSVLink for programmatic click
          target="_blank"
        />
      )}
    </div>
  );
};

export default Wallet;
