import { useEffect, useState } from "react";
import _ from "lodash";

function getDefaultSorting(
  defaultTableData,
  defaultSortingAccesser = "changetimestamp",
  defaultSortingOrder = "desc"
) {
  let sortedData =
    _.orderBy(
      defaultTableData,
      (data) => data?.[defaultSortingAccesser] || "",
      defaultSortingOrder
    ) || [];
  return sortedData;
}

// export const useSortableTable = (
//   data,
//   defaultSortingAccesser,
//   defaultSortingOrder
// ) => {
//   const [tableData, setTableData] = useState(
//     getDefaultSorting(data, defaultSortingAccesser, defaultSortingOrder)
//   );

//   const handleSorting = (sortField, sortOrder) => {
//     if (sortField) {
//       let sortedData = _.orderBy(data, sortField, sortOrder) || [];
//       setTableData(sortedData);
//     }
//   };

//   return [tableData, setTableData, handleSorting];
// };

export const useSortableTable = (
  data,
  defaultSortingAccesser,
  defaultSortingOrder
) => {
  const [tableData, setTableData] = useState(
    getDefaultSorting(data, defaultSortingAccesser, defaultSortingOrder)
  );

  // ✅ Sync with new `data` when it changes (like after brand filter)
  useEffect(() => {
    const sortedData = getDefaultSorting(
      data,
      defaultSortingAccesser,
      defaultSortingOrder
    );
    setTableData(sortedData);
  }, [data, defaultSortingAccesser, defaultSortingOrder]);

  const handleSorting = (sortField, sortOrder) => {
    if (sortField) {
      const sortedData = _.orderBy(tableData, [sortField], [sortOrder]) || [];
      setTableData(sortedData);
    }
  };

  return [tableData, setTableData, handleSorting];
};
