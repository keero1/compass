import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const conductorsCollection = collection(db, "conductors");

const ManageConductor = () => {
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [phoneNumber, setPhoneNumber] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [filters, setFilters] = useState({
    searchQuery: "",
  });

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConductor, setNewConductor] = useState({
    name: "",
    phone_number: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedConductor, setSelectedConductor] = useState(null);

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const fetchConductorData = async () => {
    try {
      const querySnapshot = await getDocs(conductorsCollection);
      const fetchedConductors = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          conductor_id: doc.id,
          user_id: data.user_id,
          name: data.name,
          phone_number: data.phone_number,
        };
      });
      setConductors(fetchedConductors);
    } catch (error) {
      console.error("Error fetching conductor data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConductorData();
  }, []);

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(conductors.length / rowsPerPage))
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

  const filteredConductors = conductors.filter((conductor) => {
    const nameMatch = conductor.name
      ? conductor.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      : false;
    const userNumberMatch = conductor.user_id
      ? conductor.user_id.toString().includes(filters.searchQuery)
      : false;

    return nameMatch || userNumberMatch;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedConductors = filteredConductors.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // modal

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewConductor({ name: "" });
    setPhoneNumber("");
  };

  const openEditModal = (conductor) => {
    setSelectedConductor(conductor);
    setNewConductor({
      name: conductor.name,
      phone_number: conductor.phone_number,
    });
    setPhoneNumber(conductor.phone_number);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedConductor(null);
    setNewConductor({ name: "", phone_number: "" });
    setPhoneNumber("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConductor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneNumberChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (numericValue.length <= 10) {
      setPhoneNumber(numericValue);
    }
  };

  const handleAddConductor = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const randomNum = Math.floor(Math.random() * 10) + 1;
    const user_id = `${newConductor.name
      .replace(/\s+/g, "")
      .toLowerCase()}_${randomNum}`;

    try {
      await addDoc(conductorsCollection, {
        ...newConductor,
        phone_number: phoneNumber, // Include phone number
        user_id,
      });

      fetchConductorData(); // Refresh table data
      closeModal();
    } catch (error) {
      console.error("Error adding conductor:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditConductor = async (e) => {
    e.preventDefault();
    if (!selectedConductor) return;
    setIsSaving(true);

    try {
      const conductorRef = doc(
        db,
        "conductors",
        selectedConductor.conductor_id
      );
      await updateDoc(conductorRef, {
        phone_number: phoneNumber,
      });
      fetchConductorData();
      closeEditModal();
    } catch (error) {
      console.error("Error updating conductor:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConductor = async () => {
    if (!selectedConductor) return;

    try {
      // Transfer to deleted_conductors
      const deletedConductorsCollection = collection(db, "deleted_conductors");
      await addDoc(deletedConductorsCollection, {
        ...selectedConductor, // Transfer all fields or select specific ones
        deletedAt: new Date().toISOString(), // Optional: timestamp of deletion
      });

      // Delete from conductors collection
      const conductorRef = doc(
        db,
        "conductors",
        selectedConductor.conductor_id
      );
      await deleteDoc(conductorRef);
      setIsDeleteConfirmationOpen(false);

      fetchConductorData(); // Refresh table data
      closeEditModal(); // Close the edit modal
    } catch (error) {
      console.error("Error deleting conductor:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Conductors</h1>
        <div
          onClick={openModal}
          to="/manage-conductor/create-conductor"
          className="btn btn-primary text-lg"
        >
          Add Conductor
        </div>
      </div>

      {/* Table */}
      <div className="bg-base-300 overflow-x-auto shadow-lg rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <input
            type="text"
            name="searchQuery"
            placeholder="Filter by Conductor Name or User Number"
            className="input input-bordered w-full"
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
        </div>
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">User ID</th>
              <th className="text-left text-xl">Name</th>
              <th className="text-left text-xl">Phone Number</th>
              <th className="text-left text-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: rowsPerPage }).map((_, index) => (
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
                    <td>
                      <div className="skeleton h-4 w-16"></div>
                    </td>
                  </tr>
                ))
              : paginatedConductors.map((conductor) => (
                  <tr key={conductor.id}>
                    <td className="text-lg">{conductor.user_id}</td>
                    <td className="text-lg">{conductor.name}</td>
                    <td className="text-lg">
                      {"(+63) " + conductor.phone_number}
                    </td>
                    <td>
                      <button
                        onClick={() => openEditModal(conductor)}
                        className="btn btn-ghost btn-xs"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredConductors.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">Rows per page: {rowsPerPage}</div>
          <div className="text-lg">
            {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredConductors.length)} of{" "}
            {filteredConductors.length}
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
                currentPage ===
                Math.ceil(filteredConductors.length / rowsPerPage)
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Conductor</h3>
            <form onSubmit={handleAddConductor}>
              <div className="form-control mb-4">
                <label className="label">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Juan Dela Cruz"
                  className="input input-bordered"
                  value={newConductor.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content">
                    (+63)
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Enter phone number"
                    className="input input-bordered pl-16 w-full"
                    required
                  />
                </div>
              </div>
              <div className="modal-action">
                <button
                  type="submit"
                  className={`btn ${isSaving ? "btn-disabled" : "btn-primary"}`}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={closeModal} className="btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit Conductor</h3>
            <form onSubmit={handleEditConductor}>
              <div className="form-control mb-4">
                <label className="label">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Juan Dela Cruz"
                  className="input input-bordered"
                  value={newConductor.name}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    (+63)
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Enter phone number"
                    className="input input-bordered pl-16 w-full"
                    required
                  />
                </div>
              </div>
              <div className="modal-action flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmationOpen(true)}
                  className="btn btn-error" // Change to btn-error for red color
                >
                  Delete
                </button>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className={`btn ${
                      isSaving ? "btn-disabled" : "btn-primary"
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmationOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
            <p>
              Are you sure you want to delete {selectedConductor?.name}? This
              action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={handleDeleteConductor}
                className="btn btn-danger"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setIsDeleteConfirmationOpen(false)}
                className="btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageConductor;
