import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const routesCollection = collection(db, "routes");

const ManageRoute = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRoute, setNewRoute] = useState({ route_name: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const fetchBusData = async () => {
    try {
      const querySnapshot = await getDocs(routesCollection);
      const fetchedRoutes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          route_name: data.route_name,
          description: data.description,
        };
      });
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Error fetching route data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async () => {
    setIsSaving(true);
    try {
      await addDoc(routesCollection, {
        route_name: newRoute.route_name,
        description: newRoute.description,
        keypoints: [], // Initialize keypoint with default GeoPoint
      });
      fetchBusData(); // Refresh the route list
      setShowModal(false); // Close the modal
      setNewRoute({ route_name: "", description: "" }); // Reset form fields
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Error adding route:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "routes", routeToDelete));
      fetchBusData(); // Refresh the route list
      setShowDeleteModal(false); // Close the delete confirmation modal
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Error deleting route:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteRoute = (routeId) => {
    setRouteToDelete(routeId);
    setShowDeleteModal(true);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(routes.length / rowsPerPage))
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  useEffect(() => {
    fetchBusData();
  }, []);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRoutes = routes.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Routes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary text-lg"
        >
          Add Route
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search Routes..."
          className="input input-bordered w-full max-w-xs"
          disabled
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg mt-6">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left text-xl">Route Name</th>
              <th className="text-left text-xl">Route Description</th>
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
                  </tr>
                ))
              : paginatedRoutes.map((route) => (
                  <tr key={route.id} className="hover">
                    <td className="text-lg max-w-32 whitespace-nowrap overflow-hidden text-ellipsis">
                      {route.route_name}
                    </td>
                    <td className="text-lg max-w-32 whitespace-nowrap overflow-hidden text-ellipsis">
                      {route.description}
                    </td>
                    <td>
                      <Link
                        to={`/manage-route/route-view/${route.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        View
                      </Link>
                    </td>
                    <td>
                      <TrashIcon
                        className="size-6 text-red-500 cursor-pointer"
                        onClick={() => confirmDeleteRoute(route.id)}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && routes.length > 0 && (
        <div className="flex justify-end items-center mt-4 space-x-8">
          <div className="text-lg">Rows per page: {rowsPerPage}</div>
          <div className="text-lg">
            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, routes.length)}{" "}
            of {routes.length}
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
                currentPage === Math.ceil(routes.length / rowsPerPage)
                  ? "btn-disabled"
                  : ""
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Modal for Adding Route */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="modal modal-open modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h2 className="text-2xl font-bold mb-4">Add New Route</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddRoute();
                }}
              >
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Route Name</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, route_name: e.target.value })
                    }
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, description: e.target.value })
                    }
                    className="textarea textarea-bordered"
                    required
                  ></textarea>
                </div>
                <div className="modal-action">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn w-full ${
                      isSaving ? "btn-disabled" : "btn-primary"
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
                <button
                  type="button" // Prevents this button from submitting the form
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  ✕
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Deleting Route */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="modal modal-open modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete this route?</p>
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRoute}
                  className={`btn btn-error ${
                    isDeleting ? "btn-disabled" : ""
                  }`}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoute;
