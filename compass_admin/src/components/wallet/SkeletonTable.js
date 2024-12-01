import React from "react";

const SkeletonTable = ({ index }) => {
  return (
    <tr key={index}>
      <td className="border border-white px-4 py-2">
        <div className="skeleton h-4 w-24"></div>
      </td>
      <td className="border border-white px-4 py-2">
        <div className="skeleton h-4 w-24"></div>
      </td>
      <td className="border border-white px-4 py-2">
        <div className="skeleton h-4 w-24"></div>
      </td>
      <td className="border border-white px-4 py-2">
        <div className="skeleton h-4 w-24"></div>
      </td>
      <td className="border border-white px-4 py-2">
        <div className="skeleton h-4 w-24"></div>
      </td>
      <td className="border border-white px-4 py-2">
        <div className="skeleton h-4 w-24"></div>
      </td>
      <td className="border border-white px-4 py-2">
        <div className="skeleton h-4 w-24"></div>
      </td>
    </tr>
  );
};

export default SkeletonTable;
