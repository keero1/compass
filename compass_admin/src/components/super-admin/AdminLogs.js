import React, { useState, useEffect } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

const adminLogsCollection = collection(db, "adminLogs");

const AdminLogs = () => {
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [actionTypes, setActionTypes] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: "",
    selectedAction: "",
  });

  const fetchAdminLogs = async () => {
    try {
      const querySnapshot = await getDocs(adminLogsCollection);
      const fetchedLogs = await Promise.all(
        querySnapshot.docs.map(async (document) => {
          const data = document.data();

          const adminDocRef = doc(db, "company", data.adminId);
          const adminDoc = await getDoc(adminDocRef);
          const adminEmail = adminDoc.exists() ? adminDoc.data().email : null;

          const busDocRef = doc(db, "buses", data.busId);
          const busDoc = await getDoc(busDocRef);
          const busDriverName = busDoc.exists()
            ? busDoc.data().bus_driver_name
            : null;

          return {
            id: document.id,
            action: data.action,
            adminId: data.adminId,
            busId: data.busId,
            adminEmail: adminEmail,
            busDriverName: busDriverName,
            details: data.details,
            timestamp: data.timestamp.toDate(), // Store as Date object for sorting
          };
        })
      );

      // Sort the fetched logs by timestamp in descending order
      fetchedLogs.sort((a, b) => b.timestamp - a.timestamp);

      // Convert timestamp to local string format after sorting
      const formattedLogs = fetchedLogs.map((log) => ({
        ...log,
        timestamp: log.timestamp.toLocaleString(), // Convert to readable format
      }));

      setAdminLogs(formattedLogs);

      const uniqueActions = Array.from(
        new Set(formattedLogs.map((log) => log.action))
      );
      setActionTypes(uniqueActions);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminLogs();
  }, []);

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(adminLogs.length / rowsPerPage))
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

  const filteredLogs = adminLogs.filter((log) =>
    filters.selectedAction ? log.action === filters.selectedAction : true
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Logs</h1>
      </div>

      {/* Table */}
      <div className="bg-base-300 overflow-x-auto shadow-lg rounded-lg p-4">
        {/* Search and Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <select
            name="selectedAction"
            className="select select-bordered w-full"
            value={filters.selectedAction}
            onChange={handleFilterChange}
          >
            <option value="">All Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">Action</th>
              <th className="text-left text-xl">Admin Email</th>
              <th className="text-left text-xl">Name</th>
              <th className="text-left text-xl">Details</th>
              <th className="text-left text-xl">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
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
                  <td className="text-lg">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                </tr>
              ))
            ) : paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td className="text-lg">{log.action.toUpperCase()}</td>
                  <td className="text-lg">{log.adminEmail}</td>
                  <td className="text-lg">{log.busDriverName}</td>
                  <td className="text-lg">{log.details}</td>
                  <td className="text-lg">{log.timestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-lg">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredLogs.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">
            {startIndex + 1}-{" "}
            {Math.min(startIndex + rowsPerPage, filteredLogs.length)} of{" "}
            {filteredLogs.length}
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
                currentPage === Math.ceil(filteredLogs.length / rowsPerPage)
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

export default AdminLogs;
