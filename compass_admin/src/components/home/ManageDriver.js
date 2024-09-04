import React, { useState, useEffect } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { Link } from "react-router-dom";

const busesCollection = collection(db, "buses");
const routesCollection = collection(db, "routes");

const ManageDriver = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Buses</h1>
        <Link
          to="/manage-driver/create-bus"
          className="btn btn-primary text-lg"
        >
          Add Bus
        </Link>
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
              <th className="text-left text-xl">Route Name</th>
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
                    <td className="text-lg">{getRouteName(bus.route_id)}</td>
                    <td>
                      <Link
                        to={`/manage-driver/bus-view/${bus.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        Edit
                      </Link>
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
    </div>
  );
};

export default ManageDriver;
