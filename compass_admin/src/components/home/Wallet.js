import React, { useEffect, useState } from "react";
// Firebase imports
import { db } from "../../firebase/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

const Wallet = () => {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalBuses, setTotalBuses] = useState(0);

  // Fetch earnings from transactions collection
  const fetchEarnings = () => {
    const transactionsCollection = collection(db, "transactions");

    const unsubscribe = onSnapshot(transactionsCollection, (snapshot) => {
      let earnings = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        earnings += Number(data.fare_amount || 0);
      });

      setTotalEarnings(earnings.toFixed(2));
      setTotalTransactions(snapshot.size);
    });

    return unsubscribe;
  };

  // Fetch total buses count
  const fetchBuses = async () => {
    const busesCollection = collection(db, "buses");
    const busesSnapshot = await getDocs(busesCollection);
    setTotalBuses(busesSnapshot.size); // Set total buses count
  };

  // Helper function to format numbers with commas and decimals
  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(number);
  };

  useEffect(() => {
    const unsubscribeEarnings = fetchEarnings();
    fetchBuses();

    return () => {
      unsubscribeEarnings(); // Cleanup the listener on unmount
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      {/* Top Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Earnings Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Earnings</div>
          <div className="text-2xl truncate">{formatNumber(totalEarnings)}</div>
          {/* <div className="text-sm text-green-500">↑ 12% Since last month</div> */}
        </div>

        {/* Transactions Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Transactions</div>
          <div className="text-2xl truncate">{totalTransactions}</div>
          {/* <div className="text-sm text-red-500">↓ 16% Since last month</div> */}
        </div>

        {/* Wallet Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Wallet</div>
          <div className="text-2xl truncate">₱0.00</div>
        </div>

        {/* Buses Card */}
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Buses</div>
          <div className="text-2xl truncate">{totalBuses}</div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
