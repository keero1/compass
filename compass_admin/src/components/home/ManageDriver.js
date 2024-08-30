import React, { useState, useEffect } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const busesCollection = collection(db, "buses");
const routesCollection = collection(db, "routes");

const ManageDriver = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBus, setSelectedBus] = useState(null); // State to hold the selected bus details
  const rowsPerPage = 5;

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

  // format date
  const formatDate = (timestamp) => {
    const date = timestamp.toDate(); // Convert Firebase Timestamp to JavaScript Date
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-PH", options);
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

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBuses = buses.slice(startIndex, startIndex + rowsPerPage);

  const openModal = (bus) => {
    setSelectedBus(bus);
    document.getElementById("bus-details-modal").showModal();
  };

  const closeModal = () => {
    setSelectedBus(null);
    document.getElementById("bus-details-modal").close();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Buses</h1>
        <Link to="/manage-driver/create-bus" className="btn btn-primary text-lg">Add Bus</Link>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search buses..."
          className="input input-bordered w-full max-w-xs"
          disabled
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg mt-6">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">Name</th>
              <th className="text-left text-xl">License Plate</th>
              <th className="text-left text-xl">Phone Number</th>
              <th>
                <ArrowPathIcon className="size-6 ml-3" />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="hover">
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
                  <tr key={bus.id} className="hover">
                    <td className="text-lg">{bus.name}</td>
                    <td className="text-lg">{bus.license_plate}</td>
                    <td className="text-lg">{"0" + bus.phone_number}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => openModal(bus)}
                      >
                        details
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && buses.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">Rows per page: {rowsPerPage}</div>
          <div className="text-lg">
            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, buses.length)}{" "}
            of {buses.length}
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
                currentPage === Math.ceil(buses.length / rowsPerPage)
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
      <dialog id="bus-details-modal" className="modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Bus Details</h2>
          {selectedBus && (
            <>
              <div className="mb-4">
                <strong>Bus Driver Name:</strong> {selectedBus.bus_driver_name}
              </div>
              <div className="mb-4">
                <strong>Name:</strong> {selectedBus.name}
              </div>
              <div className="mb-4">
                <strong>Phone:</strong> {selectedBus.phone_number}
              </div>
              <div className="mb-4">
                <strong>License:</strong> {selectedBus.license_plate}
              </div>
              <div className="mb-4">
                <strong>Route Name:</strong> {getRouteName(selectedBus.route_id)}
              </div>
              <div className="mb-4">
                <strong>Created At:</strong>{" "}
                {formatDate(selectedBus.created_at)}
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button className="btn btn-primary" onClick={() => {}}>
                  Edit Info
                </button>
                <button className="btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default ManageDriver;
