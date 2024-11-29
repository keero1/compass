import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; // Ensure this is your configured Firestore instance
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

const ManageBus = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newLicensePlate, setNewLicensePlate] = useState("");
  const [newBusType, setNewBusType] = useState("Aircon");

  // Edit bus state
  const [editingBus, setEditingBus] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Number of rows per page

  const [filters] = useState({
    searchQuery: "",
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Firestore collection reference
  const busesCollection = collection(db, "busInformation");

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const querySnapshot = await getDocs(busesCollection);
        const fetchedBuses = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            bus_number: data.bus_number,
            bus_type: data.bus_type,
            license_number: data.license_number,
          };
        });
        fetchedBuses.sort((a, b) => a.bus_number - b.bus_number);

        setBuses(fetchedBuses);
      } catch (error) {
        console.error("Error fetching bus data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();
  }, [busesCollection]);

  const getNextBusNumber = () => {
    return buses.length > 0
      ? Math.max(...buses.map((bus) => bus.bus_number)) + 1
      : 1;
  };

  const toggleModal = () => {
    setNewLicensePlate("");
    setNewBusType("Aircon");
    setIsModalOpen(!isModalOpen);
  };

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  const handleAddBus = async (e) => {
    e.preventDefault();

    setLoading(true);
    const busNumber = getNextBusNumber();
    const newBus = {
      bus_number: busNumber,
      license_number: newLicensePlate,
      bus_type: newBusType,
    };

    try {
      await addDoc(busesCollection, newBus);
      setBuses([...buses, newBus]);
      setNewLicensePlate("");
      setNewBusType("Aircon");
      toggleModal(); // Close the modal after adding
    } catch (error) {
      console.error("Error adding bus:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setNewLicensePlate(bus.license_number);
    setNewBusType(bus.bus_type);
    toggleEditModal(); // Open edit modal
  };

  const handleUpdateBus = async (e) => {
    e.preventDefault();

    setLoading(true);
    const updatedBus = {
      license_number: newLicensePlate,
      bus_type: newBusType,
    };

    try {
      const busDocRef = doc(busesCollection, editingBus.id);
      await updateDoc(busDocRef, updatedBus);
      setBuses((prevBuses) =>
        prevBuses.map((bus) =>
          bus.id === editingBus.id ? { ...bus, ...updatedBus } : bus
        )
      );
      setEditingBus(null);
      setNewLicensePlate("");
      setNewBusType("Aircon");
      toggleEditModal(); // Close the edit modal after updating
    } catch (error) {
      console.error("Error updating bus:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: async (result) => {
          const csvData = result.data;
          const validData = csvData.filter(
            (row) => row.bus_type && row.license_number
          );

          if (validData.length > 0) {
            const nextBusNumber = getNextBusNumber();
            const newBuses = validData.map((row, index) => ({
              bus_number: nextBusNumber + index,
              license_number: row.license_number,
              bus_type: row.bus_type,
            }));

            let importedCount = 0;
            let skippedCount = 0;

            try {
              setLoading(true);

              for (const bus of newBuses) {
                // Check if a bus with the same license_number exists in the collection
                const busExists = await checkIfBusExists(bus.license_number);

                if (!busExists) {
                  // If bus doesn't exist, add it to the collection
                  await addDoc(busesCollection, bus);
                  importedCount++;
                  setBuses((prevBuses) => [...prevBuses, bus]);
                } else {
                  // If bus exists, skip it
                  skippedCount++;
                }
              }

              console.log(skippedCount);

              alert(
                `${importedCount} buses were successfully imported. ${skippedCount} buses were skipped because they already exist.`
              );
            } catch (error) {
              console.error("Error adding buses from CSV:", error);
              alert("An error occurred while importing buses.");
            } finally {
              setLoading(false);
            }
          } else {
            alert(
              "Invalid CSV format. Please make sure it contains 'bus_type' and 'license_number'."
            );
          }
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  // Function to check if a bus with a specific license number already exists in the collection
  const checkIfBusExists = async (licenseNumber) => {
    try {
      const querySnapshot = await getDocs(busesCollection);
      const busExists = querySnapshot.docs.some(
        (doc) => doc.data().license_number === licenseNumber
      );
      return busExists;
    } catch (error) {
      console.error("Error checking if bus exists:", error);
      return false; // Return false if there was an error querying the database
    }
  };

  // Pagination logic
  const filteredBuses = buses.filter((bus) =>
    bus.bus_number.toString().includes(filters.searchQuery)
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBuses = filteredBuses.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(filteredBuses.length / rowsPerPage))
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // Back button handler
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-base-200">
      <button
        className="absolute top-5 left-5 btn btn-primary"
        onClick={handleBackClick}
      >
        Back
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Buses</h1>
          <div className="flex space-x-2 justify-end">
            <button
              className="btn btn-primary"
              onClick={toggleModal} // Open add bus modal
            >
              Add Bus
            </button>
            <label className="btn btn-secondary">
              Import Bus CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="bg-base-300 overflow-x-auto shadow-lg rounded-lg p-4">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left text-xl">Bus Number</th>
                <th className="text-left text-xl">Bus Type</th>
                <th className="text-left text-xl">License Number</th>
                <th className="text-left text-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : buses.length > 0 ? (
                paginatedBuses.map((bus) => (
                  <tr key={bus.id}>
                    <td className="text-lg">{bus.bus_number}</td>
                    <td className="text-lg">{bus.bus_type}</td>
                    <td className="text-lg">{bus.license_number}</td>
                    <td>
                      <button
                        onClick={() => handleEditBus(bus)} // Open edit modal
                        className="btn btn-ghost btn-xs"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No buses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {!loading && filteredBuses.length > 0 && (
          <div className="flex justify-end items-center mt-4 space-x-8">
            <div className="text-lg">Rows per page: {rowsPerPage}</div>
            <div className="text-lg">
              {startIndex + 1}-
              {Math.min(startIndex + rowsPerPage, filteredBuses.length)} of{" "}
              {filteredBuses.length}
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
                  currentPage === Math.ceil(filteredBuses.length / rowsPerPage)
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

      {/* Add Bus Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-base-300 p-6 rounded-md shadow-md w-full max-w-md">
            <h2 className="text-2xl mb-4">Add New Bus</h2>
            <form onSubmit={handleAddBus}>
              <div className="mb-4">
                <label className="block text-lg">License Plate</label>
                <input
                  type="text"
                  value={newLicensePlate}
                  onChange={(e) => setNewLicensePlate(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg">Bus Type</label>
                <select
                  value={newBusType}
                  onChange={(e) => setNewBusType(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="Aircon">Aircon</option>
                  <option value="Ordinary">Ordinary</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Add Bus"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={toggleModal}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bus Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-base-300 p-6 rounded-md shadow-md w-full max-w-md">
            <h2 className="text-2xl mb-4">Edit Bus</h2>
            <form onSubmit={handleUpdateBus}>
              <div className="mb-4">
                <label className="block text-lg">License Plate</label>
                <input
                  type="text"
                  value={newLicensePlate}
                  onChange={(e) => setNewLicensePlate(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg">Bus Type</label>
                <select
                  value={newBusType}
                  onChange={(e) => setNewBusType(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="Aircon">Aircon</option>
                  <option value="Ordinary">Ordinary</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Bus"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={toggleEditModal}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBus;
