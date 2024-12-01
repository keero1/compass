import React from "react";

import { formatNumber, formatDate } from "./WalletUtils";

const PaginatedTable = ({ id, transaction, onRowClick }) => {
  return (
    <tr
      key={id}
      onClick={() => onRowClick(transaction)}
      className="cursor-pointer"
    >
      <td className="border border-white px-4 py-2">
        {formatDate(transaction.timestamp)}
      </td>
      <td className="border border-white px-4 py-2">
        {transaction.bus_driver_name}
      </td>
      <td className="border border-white text-center px-4 py-2">
        {transaction.conductor_name || "N/A"}
      </td>
      <td className="border border-white text-center px-4 py-2">
        {transaction.origin} - {transaction.destination}
      </td>
      <td className="border border-white px-4 py-2">
        {transaction.reference_number}
      </td>
      <td className="border border-white px-4 py-2">
        {transaction.payment_type}
      </td>
      <td className="border border-white text-end px-4 py-2">
        {formatNumber(transaction.fare_amount)}
      </td>
    </tr>
  );
};

export default PaginatedTable;
