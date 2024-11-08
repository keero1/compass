import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const deletedDataCollection = collection(db, "deletedData");

const Deleted = () => {
  const [deletedData, setDeletedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [isSaving, setIsSaving] = useState(false);

  const [filters, setFilters] = useState({
    searchQuery: "",
    accountType: "All",
  });

  const [selectedData, setSelectedData] = useState(null); // State to store data for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  const fetchDeletedData = async () => {
    try {
      const querySnapshot = await getDocs(deletedDataCollection);
      const fetchedData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          account_type: data.account_type,
          deleted_at: data.deleted_at,
          ...(data.account_type === "admin"
            ? {
                company_name: data.company_name,
                email: data.email,
                phone_number: data.phone_number,
                role: data.role,
              }
            : data.account_type === "driver"
            ? {
                bus_driver_name: data.bus_driver_name,
                email: data.username,
                bus_number: data.bus_number,
                bus_type: data.bus_type,
                license_plate: data.license_plate,
                phone_number: data.phone_number,
              }
            : data.account_type === "conductor"
            ? {
                name: data.name,
                email: "N/A",
                phone_number: data.phone_number,
                user_id: data.user_id,
              }
            : {}),
        };
      });
      const sortedData = fetchedData.sort((a, b) => {
        return b.deleted_at.toDate() - a.deleted_at.toDate();
      });
      setDeletedData(sortedData);
    } catch (error) {
      console.error("Error fetching deleted data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleString("en-PH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(filteredData.length / rowsPerPage))
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

  const filteredData = deletedData.filter((entry) => {
    const nameMatch = entry.name
      ? entry.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      : false;
    const emailMatch = entry.email
      ? entry.email.toLowerCase().includes(filters.searchQuery.toLowerCase())
      : false;
    const accountTypeMatch =
      filters.accountType === "All" ||
      entry.account_type.toLowerCase() === filters.accountType.toLowerCase();

    return (nameMatch || emailMatch) && accountTypeMatch;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleViewClick = (entry) => {
    setSelectedData(entry); // Set the data to display in the modal
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedData(null); // Clear the selected data
  };

  // Recover data to respective collection
  const recoverData = async (data) => {
    setIsSaving(true);
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to recover this account?"
      );

      if (!isConfirmed) {
        return; // If the user cancels, exit the function
      }

      const { account_type, ...restData } = data;

      // Remove account_type and deleted_at before saving
      const dataToSave = { ...restData };
      delete dataToSave.deleted_at; // Remove the deleted_at field
      delete dataToSave.id;

      console.log(dataToSave);

      let collectionRef;

      if (account_type === "admin") {
        collectionRef = collection(db, "company");
      } else if (account_type === "driver") {
        collectionRef = collection(db, "buses");
      } else if (account_type === "conductor") {
        delete dataToSave.email;
        collectionRef = collection(db, "conductors");
      }

      if (collectionRef) {
        // Set the document back to the appropriate collection
        await setDoc(doc(collectionRef, data.id), dataToSave);

        // Remove the document from the deletedData collection
        await deleteDoc(doc(db, "deletedData", data.id));

        // Optionally, you can show a success message or refresh the list
        alert("Data recovered successfully!");
        fetchDeletedData(); // Refresh the list after recovery
        closeModal(); // Close the modal after recovery
      }
    } catch (error) {
      console.error("Error recovering data:", error);
      alert("Failed to recover data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Deleted Data</h1>
      </div>

      <div className="bg-base-300 overflow-x-auto shadow-lg rounded-lg p-4">
        <div className="flex items-center gap-4 flex-grow">
          <input
            type="text"
            name="searchQuery"
            placeholder="Filter by Name or Email/Username"
            className="input input-bordered w-6/12 max-w-xs"
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
          <select
            name="accountType"
            className="select select-bordered w-48"
            value={filters.accountType}
            onChange={handleFilterChange}
          >
            <option value="All">All Account Types</option>
            <option value="admin">Admin</option>
            <option value="driver">Driver</option>
            <option value="conductor">Conductor</option>
          </select>
        </div>

        {loading ? (
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left text-xl">Name</th>
                <th className="text-left text-xl">Email/Username</th>
                <th className="text-left text-xl">Account Type</th>
                <th className="text-left text-xl">Deletion Date</th>
                <th className="text-left text-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowsPerPage }).map((_, index) => (
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
              ))}
            </tbody>
          </table>
        ) : filteredData.length === 0 ? (
          <div className="text-center text-xl">No Data Available</div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left text-xl">Name</th>
                <th className="text-left text-xl">Email/Username</th>
                <th className="text-left text-xl">Account Type</th>
                <th className="text-left text-xl">Deletion Date</th>
                <th className="text-left text-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-lg">{entry.name || entry.email}</td>
                  <td className="text-lg">{entry.email || entry.username}</td>
                  <td className="text-lg">{entry.account_type}</td>
                  <td className="text-lg">{formatDate(entry.deleted_at)}</td>
                  <td className="text-lg">
                    <button
                      onClick={() => handleViewClick(entry)}
                      className="btn btn-ghost btn-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && selectedData && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold">Details</h2>
            <div>
              {selectedData.account_type === "admin" && (
                <>
                  <div>
                    <strong>Company Name:</strong> {selectedData.company_name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedData.email}
                  </div>
                  <div>
                    <strong>Phone Number:</strong> {selectedData.phone_number}
                  </div>
                  <div>
                    <strong>Role:</strong> {selectedData.role}
                  </div>
                </>
              )}

              {selectedData.account_type === "driver" && (
                <>
                  <div>
                    <strong>Bus Driver Name:</strong>{" "}
                    {selectedData.bus_driver_name}
                  </div>
                  <div>
                    <strong>Username:</strong> {selectedData.username}
                  </div>
                  <div>
                    <strong>Bus Number:</strong> {selectedData.bus_number}
                  </div>
                  <div>
                    <strong>Bus Type:</strong> {selectedData.bus_type}
                  </div>
                  <div>
                    <strong>License Plate:</strong> {selectedData.license_plate}
                  </div>
                  <div>
                    <strong>Phone Number:</strong> {selectedData.phone_number}
                  </div>
                </>
              )}

              {selectedData.account_type === "conductor" && (
                <>
                  <div>
                    <strong>Name:</strong> {selectedData.name}
                  </div>
                  <div>
                    <strong>Phone Number:</strong> {selectedData.phone_number}
                  </div>
                  <div>
                    <strong>User ID:</strong> {selectedData.user_id}
                  </div>
                </>
              )}
            </div>
            <div className="modal-action">
              <button
                className={`btn ${isSaving ? "btn-disabled" : "btn-primary"}`}
                onClick={() => recoverData(selectedData)}
              >
                {isSaving ? "Recovering..." : "Recover"}
              </button>
              <button
                className={`btn ${isSaving ? "btn-disabled" : "btn"}`}
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && filteredData.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">Rows per page: {rowsPerPage}</div>
          <div className="text-lg">
            {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredData.length)} of{" "}
            {filteredData.length}
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
                currentPage === Math.ceil(filteredData.length / rowsPerPage)
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

export default Deleted;
