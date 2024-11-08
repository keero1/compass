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

const busesCollection = collection(db, "buses");
const routesCollection = collection(db, "routes");

const ManageDriver = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [filters, setFilters] = useState({
    searchQuery: "",
    licensePlateFilter: "",
    routeFilter: "",
  });

  // delete
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [confirmName, setConfirmName] = useState("");

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
          bus_number: data.bus_number,
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
      // Prepare data to store in deletedData
      const deletedData = {
        ...selectedBus,
        deleted_at: new Date().toISOString(), // Timestamp for deletion
      };

      // Store deleted bus in the deletedData collection
      await setDoc(doc(db, "deleted_drivers", busId), deletedData);

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
