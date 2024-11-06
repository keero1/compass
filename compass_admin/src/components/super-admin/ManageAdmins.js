import React, { useState, useEffect } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { TrashIcon } from "@heroicons/react/24/solid";

const companyCollection = collection(db, "company");

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [filters, setFilters] = useState({
    searchQuery: "",
  });

  // add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    phone_number: "",
  });

  const [phoneNumber, setPhoneNumber] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [confirmName, setConfirmName] = useState("");

  const fetchAdminData = async () => {
    try {
      const querySnapshot = await getDocs(companyCollection);
      const fetchedAdmins = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            company_name: data.company_name,
            email: data.email,
            phone_number: data.phone_number,
            role: data.role,
          };
        })
        .filter((admin) => admin.role === "admin"); // Filter out "superadmin" role

      fetchedAdmins.sort((a, b) =>
        a.company_name.localeCompare(b.company_name)
      );

      setAdmins(fetchedAdmins);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };
  // use effect

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line
  }, []);

  // handle

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(admins.length / rowsPerPage))
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

  const filteredAdmins = admins.filter((admin) => {
    const searchMatch = admin.company_name
      .toLowerCase()
      .includes(filters.searchQuery.toLowerCase());

    return searchMatch;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // add

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        "https://compass-backend-coral.vercel.app/api/create-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: newAdmin.fullName,
            email: newAdmin.email,
            phoneNumber: phoneNumber,
          }),
        }
      );

      if (response.ok) {
        alert("Admin Account successfully created.");

        setIsModalOpen(false);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding admin:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAdmin({ fullName: "", email: "" });
    setPhoneNumber("");
  };

  // delete
  const handleDelete = async (adminId) => {
    if (!selectedAdmin) return;

    try {
      const deletedData = {
        ...selectedAdmin,
        deleted_at: new Date().toISOString(),
      };

      await setDoc(doc(db, "deletedData", adminId), deletedData);

      await deleteDoc(doc(db, "company", adminId));

      setIsDeleteModalOpen(false);
      setConfirmName("");
      setSelectedAdmin(null);
      fetchAdminData();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admins</h1>
        <div className="flex space-x-4">
          <div onClick={handleOpenModal} className="btn btn-primary text-lg">
            Add Admin
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-base-300 overflow-x-auto  shadow-lg rounded-lg p-4">
        <div className="flex flex-wrap gap-4 my-4 justify-start">
          <input
            type="text"
            name="searchQuery"
            placeholder="Filter by Admin Name"
            className="input input-bordered w-6/12 max-w-xs"
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
        </div>
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">Full Name</th>
              <th className="text-left text-xl">Email</th>
              <th className="text-left text-xl">Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
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
                  </tr>
                ))
              : paginatedAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="text-lg">{admin.company_name}</td>
                    <td className="text-lg">{admin.email}</td>
                    <td className="text-lg">{"(+63) " + admin.phone_number}</td>
                    <td>
                      <div
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />{" "}
                        {/* Set height and width for the icon */}
                        Delete
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredAdmins.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">Rows per page: {rowsPerPage}</div>
          <div className="text-lg">
            {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredAdmins.length)} of{" "}
            {filteredAdmins.length}
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
                currentPage === Math.ceil(filteredAdmins.length / rowsPerPage)
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
            <h3 className="font-bold text-lg mb-4">Add Admin</h3>
            <form onSubmit={handleAddAdmin}>
              <div className="form-control mb-4">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Juan Dela Cruz"
                  className="input input-bordered"
                  value={newAdmin.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="juandelacruz@gmail.com"
                  className="input input-bordered"
                  value={newAdmin.email}
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
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">Confirm Deletion</h2>
            <p>
              Please type the Admin's name to confirm deletion. The account
              information will be stored in the database for archive purposes.
            </p>
            <input
              type="text"
              placeholder={selectedAdmin.company_name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="input input-bordered w-full my-2"
            />
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => handleDelete(selectedAdmin.id)}
                disabled={confirmName !== selectedAdmin?.company_name} // Disable if names do not match
              >
                Confirm
              </button>
              <button
                className="btn"
                onClick={() => {
                  setConfirmName("");
                  setIsDeleteModalOpen(false);
                }} // Close modal on cancel
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

export default ManageAdmin;
