import React from "react";

const Wallet = () => {
  return (
    <div className="p-6 space-y-4">
      {/* Top Row Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Earnings</div>
          <div className="text-2xl">$24k</div>
          <div className="text-sm text-green-500">↑ 12% Since last month</div>
        </div>
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Transactions</div>
          <div className="text-2xl">1.6k</div>
          <div className="text-sm text-red-500">↓ 16% Since last month</div>
        </div>
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Wallet</div>
          <div className="text-2xl">$15k</div>
        </div>
        <div className="bg-base-100 shadow-lg rounded-lg p-4">
          <div className="text-lg font-semibold">Total Buses</div>
          <div className="text-2xl">2</div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
