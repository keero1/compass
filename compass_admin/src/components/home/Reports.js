import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../firebase/firebase";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";

const reportsCollection = collection(db, "reportEmergency");

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [filters, setFilters] = useState({
    searchQuery: "",
    status: "all",
    subject: "all",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReportData = useCallback(() => {
    const unsubscribe = onSnapshot(
      reportsCollection,
      (querySnapshot) => {
        const fetchedReports = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            report_id: doc.id,
            createdAt: data.timestamp.toDate(), // Save raw timestamp
            date: formatDate(data.timestamp), // Use formatted date
            busDriverName: data.bus_driver_name,
            busNumber: data.bus_number,
            busType: data.bus_type,
            conductorName: data.conductor_name,
            phoneNumber: data.phone_number,
            subject: data.subject,
            status: data.status,
          };
        });

        // Sort reports based on timestamp in descending order
        fetchedReports.sort((a, b) => b.createdAt - a.createdAt);

        setReports(fetchedReports);
        setLoading(false); // Once data is received, stop loading
      },
      (error) => {
        console.error("Error fetching report data:", error);
        setLoading(false); // Stop loading in case of an error
      }
    );

    return unsubscribe; // Return the unsubscribe function to stop listening when component unmounts
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

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
      Math.min(prevPage + 1, Math.ceil(reports.length / rowsPerPage))
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

  const filteredReports = reports.filter((report) => {
    const statusMatch =
      filters.status === "all" ||
      report.status.toLowerCase() === filters.status;
    const subjectMatch =
      filters.subject === "all" ||
      report.subject.toLowerCase() === filters.subject.toLowerCase();

    return subjectMatch && statusMatch;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null); // Clear the selected report when closing the modal
  };

  const handleChangeStatus = async () => {
    if (!selectedReport) return;

    setIsSaving(true);
    try {
      const reportRef = doc(db, "reportEmergency", selectedReport.report_id);

      if (selectedReport.status === "Active") {
        await updateDoc(reportRef, {
          status: "Pending",
        });

        setSelectedReport((prev) => ({
          ...prev,
          status: "Pending",
        }));

        alert(`Successfully updated the report status to Pending.`);
      }

      if (selectedReport.status === "Pending") {
        await updateDoc(reportRef, {
          status: "Closed", // Change this to your desired closed status
        });

        setSelectedReport((prev) => ({
          ...prev,
          status: "Closed", // Update locally to match the new status
        }));

        alert(`Successfully closed the report.`);
      }

      fetchReportData();
      closeModal();
    } catch (error) {
      alert("Failed to update report status.");
      console.error("Error updating report status:", error);
    } finally {
      setIsSaving(false);
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
        <h1 className="text-3xl font-bold">Reports</h1>
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
            <option value="Accident">Accident</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Emergency Report">Emergency</option>
          </select>
          <select
            name="status"
            className="select select-bordered w-48"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">Subject</th>
              <th className="text-left text-xl">Bus Driver</th>
              <th className="text-left text-xl">Conductor</th>
              <th className="text-left text-xl">Phone Number</th>
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
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-lg">
                  No Reports Available
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => (
                <tr key={report.report_id}>
                  <td className="text-lg">{report.subject}</td>
                  <td className="text-lg">{report.busDriverName}</td>
                  <td className="text-lg">{report.conductorName}</td>
                  <td className="text-lg">(+63){report.phoneNumber}</td>
                  <td className="text-lg uppercase">{report.status}</td>
                  <td className="text-lg">{report.date}</td>
                  <td>
                    <button
                      onClick={() => openModal(report)}
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
      {!loading && filteredReports.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">Rows per page: {rowsPerPage}</div>
          <div className="text-lg">
            {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredReports.length)} of{" "}
            {filteredReports.length}
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
                currentPage === Math.ceil(filteredReports.length / rowsPerPage)
                  ? "btn-disabled"
                  : ""
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedReport && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold">View Report</h2>

            <div className="my-4">
              <div className="my-2">
                <strong>Bus Driver:</strong> {selectedReport.busDriverName}
              </div>
              <div className="my-2">
                <strong>Subject:</strong> {selectedReport.subject}
              </div>
              <div className="my-2">
                <strong>Conductor:</strong> {selectedReport.conductorName}
              </div>
              <div className="my-2">
                <strong>Phone Number:</strong>(+63){selectedReport.phoneNumber}
              </div>
              <div className="my-2">
                <strong>Status:</strong> {selectedReport.status}
              </div>
              <div className="my-2">
                <strong>Date:</strong> {selectedReport.date}
              </div>
            </div>

            <div className="modal-action">
              {selectedReport.status === "Active" && (
                <button
                  onClick={handleChangeStatus}
                  className={`btn ${isSaving ? "btn-disabled" : "btn-primary"}`}
                >
                  {isSaving ? "Processing..." : "Mark as Pending"}
                </button>
              )}
              {selectedReport.status === "Pending" && (
                <button
                  onClick={handleChangeStatus}
                  className={`btn ${isSaving ? "btn-disabled" : "btn-primary"}`}
                >
                  {isSaving ? "Processing..." : "Close"}
                </button>
              )}
              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
