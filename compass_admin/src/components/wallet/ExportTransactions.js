import React, { useRef, useState } from "react";

// date
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import Divider from "@mui/material/Divider";

import dayjs from "dayjs";

import { formatDateTime } from "./WalletUtils";

// export
import { CSVLink } from "react-csv";

const ExportTransactions = ({ transactionHistory }) => {
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
      { label: "Transaction ID", key: "transaction_id" },
      { label: "Bus Driver Name", key: "bus_driver_name" },
      { label: "Bus Number", key: "bus_number" },
      { label: "Conductor Name", key: "conductor_name" },
      { label: "Origin", key: "origin" },
      { label: "Destination", key: "destination" },
      { label: "Reference Number", key: "reference_number" },
      { label: "Payment Type", key: "payment_type" },
      { label: "Passenger Type", key: "passenger_type" },
      { label: "Fare Amount", key: "fare_amount" },
      { label: "Date", key: "date" },
    ];

    const csvData = filteredTransactions.map((transaction) => ({
      transaction_id: transaction.id,
      bus_driver_name: transaction.bus_driver_name,
      bus_number: transaction.bus_number,
      conductor_name: transaction.conductor_name,
      origin: transaction.origin,
      destination: transaction.destination,
      reference_number: transaction.reference_number,
      payment_type: transaction.payment_type,
      passenger_type: transaction.passenger_type,
      fare_amount: transaction.fare_amount,
      date: formatDateTime(transaction.timestamp),
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

  // date

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
    <div>
      <button className="btn btn-primary" onClick={handleExportClick}>
        Export Transactions
      </button>
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

export default ExportTransactions;
