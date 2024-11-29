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

import { Link } from "react-router-dom";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

import { useAuth } from "../../contexts/authContext";

import Papa from "papaparse";

const busesCollection = collection(db, "buses");
const routesCollection = collection(db, "routes");

const ManageDriver = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [parsedBuses, setParsedBuses] = useState([]);

  const { currentUser } = useAuth();

  const [filters, setFilters] = useState({
    searchQuery: "",
    licensePlateFilter: "",
    routeFilter: "",
  });

  // delete
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [confirmName, setConfirmName] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  //route
  const fetchRouteData = async () => {
    try {
      const querySnapshot = await getDocs(routesCollection);
      const fetchedRoutes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.route_name,
        };
      });
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Error fetching route data:", error);
    }
  };

  const fetchBusData = async () => {
    try {
      const querySnapshot = await getDocs(busesCollection);
      const fetchedBuses = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          bus_driver_name: data.bus_driver_name,
          license_plate: data.license_plate,
          phone_number: data.phone_number,
          route_id: data.route_id,
          created_at: data.created_at,
        };
      });

      // Sort the buses by bus driver name
      fetchedBuses.sort((a, b) =>
        a.bus_driver_name.localeCompare(b.bus_driver_name)
      );

      setBuses(fetchedBuses);
    } catch (error) {
      console.error("Error fetching bus data:", error);
    } finally {
      setLoading(false);
    }
  };

  // get route name

  const getRouteName = (route_id) => {
    const route = routes.find((r) => r.id === route_id);
    return route ? route.name : "Unknown";
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(buses.length / rowsPerPage))
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  useEffect(() => {
    fetchRouteData();
    fetchBusData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filteredBuses = buses.filter((bus) => {
    const searchMatch = bus.bus_driver_name
      .toLowerCase()
      .includes(filters.searchQuery.toLowerCase());

    const licensePlateMatch =
      !filters.licensePlateFilter ||
      bus.license_plate === filters.licensePlateFilter;

    const routeMatch =
      !filters.routeFilter || bus.route_id === filters.routeFilter;

    return searchMatch && licensePlateMatch && routeMatch;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBuses = filteredBuses.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // delete
  const handleDelete = async (busId) => {
    if (!selectedBus) return;

    try {
      const { id, ...deletedData } = selectedBus;

      const dataToDelete = {
        ...deletedData,
        deleted_at: new Date(),
        account_type: "driver",
      };

      // Store deleted bus in the deletedData collection
      await setDoc(doc(db, "deleted_Data", busId), dataToDelete);

      // delete the document
      await deleteDoc(doc(db, "buses", busId));

      // delete busLocation entry
      await deleteDoc(doc(db, "busLocation", busId));

      // Close the modal and reset the input
      setIsModalOpen(false);
      setConfirmName("");
      setSelectedBus(null);

      fetchBusData(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting bus:", error);
    }
  };

  const toggleImportModal = () => {
    setIsImportModalOpen(!isImportModalOpen);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: async (result) => {
          const csvData = result.data;

          // Validate CSV data to ensure required fields are present
          const validData = csvData.filter(
            (row) =>
              row.bus_driver_name &&
              row.phone_number &&
              row.route &&
              row.license_number
          );

          if (validData.length > 0) {
            console.log("Valid bus driver data:", validData);

            // Send the valid data to the backend
            try {
              const response = await fetch(
                "https://compass-backend-coral.vercel.app/api/import-buses", // Adjust the URL if necessary
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ busData: validData }), // Send the valid data
                }
              );

              const responseData = await response.json();

              if (response.ok) {
                // Display success message and list of created and skipped buses
                alert(
                  `${responseData.createdBuses.length} buses were successfully imported.`
                );
                console.log("Created buses:", responseData.createdBuses);
                if (responseData.skippedBuses.length > 0) {
                  console.log("Skipped buses:", responseData.skippedBuses);
                  alert(
                    `${responseData.skippedBuses.length} buses were skipped due to errors.`
                  );
                }
              } else {
                alert("Failed to import buses. Please try again.");
                console.error("Error importing buses:", responseData.error);
              }
            } catch (error) {
              alert("An error occurred while importing buses.");
              console.error("Error importing buses:", error);
            }
          } else {
            alert(
              "Invalid CSV format. Please make sure it contains 'bus_driver_name', 'phone_number', 'route', and 'license_number'."
            );
          }
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bus Drivers</h1>
        <div className="flex space-x-4">
          <Link to="/manage-bus/" className="btn btn-secondary text-lg">
            Manage Bus
          </Link>
          <Link
            to="/manage-driver/create-bus"
            className="btn btn-primary text-lg"
          >
            Add Bus Driver
          </Link>
          <button
            className="btn btn-primary text-lg"
            onClick={toggleImportModal}
          >
            Import Bus Driver CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-base-300 overflow-x-auto  shadow-lg rounded-lg p-4">
        <div className="flex flex-wrap gap-4 my-4 justify-start">
          <input
            type="text"
            name="searchQuery"
            placeholder="Filter by Bus Driver Name"
            className="input input-bordered w-6/12 max-w-xs"
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
          {/* License Plate Dropdown */}
          <select
            name="licensePlateFilter"
            value={filters.licensePlateFilter}
            onChange={handleFilterChange}
            className="select select-bordered w-6/12 max-w-xs"
          >
            <option value="">All License Plate</option>
            {buses
              .slice() // Create a shallow copy to avoid mutating the original array
              .sort((a, b) => a.bus_number - b.bus_number) // Sort by bus number
              .map((bus) => (
                <option key={bus.id} value={bus.license_plate}>
                  {bus.license_plate} : Bus Number {bus.bus_number}
                </option>
              ))}
          </select>
          {/* Route dropdown */}
          <select
            name="routeFilter"
            value={filters.routeFilter}
            onChange={handleFilterChange}
            className="select select-bordered w-6/12 max-w-xs"
          >
            <option value="">All Routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">Bus Driver Name</th>
              <th className="text-left text-xl">License Plate</th>
              <th className="text-left text-xl">Phone Number</th>
              <th className="text-left text-xl">Route Name</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
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
              : paginatedBuses.map((bus) => (
                  <tr key={bus.id}>
                    <td className="text-lg">{bus.bus_driver_name}</td>
                    <td className="text-lg">{bus.license_plate}</td>
                    <td className="text-lg">{"(+63) " + bus.phone_number}</td>
                    <td className="text-lg">{getRouteName(bus.route_id)}</td>
                    <td>
                      <Link
                        to={`/manage-driver/bus-view/${bus.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />{" "}
                        {/* Set height and width for the icon */}
                        Edit
                      </Link>
                    </td>
                    <td>
                      <div
                        className="btn btn-ghost btn-xs text-red-500"
                        onClick={() => {
                          setSelectedBus(bus);
                          setIsModalOpen(true);
                        }}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />{" "}
                        {/* Set height and width for the icon */}
                        Remove
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Import Bus Driver CSV Modal */}
      {isImportModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">Import Bus Driver CSV</h2>
            <p>Please prepare your CSV file with the following format:</p>
            <ul className="list-disc ml-4">
              <li>
                <strong>bus_driver_name</strong>: Full name of the driver
              </li>
              <li>
                <strong>phone_number</strong>: Driver's phone number
              </li>
              <li>
                <strong>route</strong>: "1" for Sta Cruz, "2" for Quezon Ave.
              </li>
              <li>
                <strong>license_number</strong>: Driver's license number
              </li>
            </ul>
            <div className="modal-action">
              <label className="btn btn-secondary">
                Import
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button className="btn" onClick={toggleImportModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">Confirm Deletion</h2>
            <p>
              Please type the Bus Driver's name to confirm deletion. The account
              information will be stored in database for archive purposes
            </p>
            <input
              type="text"
              placeholder={selectedBus.bus_driver_name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="input input-bordered w-full my-2"
            />
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => handleDelete(selectedBus.id)}
                disabled={confirmName !== selectedBus?.bus_driver_name} // Disable if names do not match
              >
                Confirm
              </button>
              <button
                className="btn"
                onClick={() => {
                  setConfirmName("");
                  setIsModalOpen(false);
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

export default ManageDriver;
