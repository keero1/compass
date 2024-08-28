import React, { useState, useEffect } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { ArrowPathIcon } from "@heroicons/react/24/solid";

// Define your Firestore collection and document structure
const busesCollection = collection(db, "buses");

const ManageDriver = () => {
  const [buses, setBuses] = useState([]);

  // Fetch bus data from Firestore
  const fetchBusData = async () => {
    try {
      const querySnapshot = await getDocs(busesCollection);
      const fetchedBuses = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          license_plate: data.license_plate,
          phone_number: data.phone_number,
        };
      });
      setBuses(fetchedBuses);
    } catch (error) {
      console.error("Error fetching bus data:", error);
    }
  };

  useEffect(() => {
    fetchBusData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Buses</h1>
        <button className="btn btn-primary text-lg">Add Bus</button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search customers..."
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
              <th><ArrowPathIcon className="size-6 ml-3" /></th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id} className="hover">
                <td className="text-lg">{bus.name}</td>
                <td className="text-lg">{bus.license_plate}</td>
                <td className="text-lg">{"0" + bus.phone_number}</td>
                <th>
                  <button className="btn btn-ghost btn-xs">details</button>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (Hardcoded) */}
      <div className="flex justify-end items-center mt-4 space-x-8">
        <div className="text-lg">Rows per page: {5}</div>
        <div className="text-lg">1-5 of {buses.length}</div>
        <div className="text-lg">
          <span className="cursor-pointer">&lt;</span>{" "}
          <span className="cursor-pointer mx-5">&gt;</span>
        </div>
      </div>
    </div>
  );
};

export default ManageDriver;
