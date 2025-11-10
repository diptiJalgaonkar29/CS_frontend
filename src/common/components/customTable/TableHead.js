import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SET_TABLE_META } from "../../../modules/workSpace/redux/tableSlice";

const TableHead = ({
  columns,
  handleSorting,
  defaultSortingAccesser,
  defaultSortingOrder,
  dataUpdatedAt,
}) => {
  const [sortField, setSortField] = useState(
    defaultSortingAccesser || "changetimestamp"
  );
  const [order, setOrder] = useState(defaultSortingOrder || "desc");

  const dispatch = useDispatch();

  const handleSortingChange = (accessor) => {
    const sortOrder =
      accessor === sortField && order === "asc" ? "desc" : "asc";
    setSortField(accessor);
    setOrder(sortOrder);
    handleSorting(accessor, sortOrder);
  };

  useEffect(() => {
    handleSorting(sortField, order);
    dispatch(
      SET_TABLE_META({
        taskDetailTableSort: { field: sortField, order: order },
      })
    );
  }, [sortField, order, dataUpdatedAt]);

  return (
    <thead>
      <tr>
        {columns.map(
          ({ label, accessor, sortable, isStickyAtStart, isStickyAtEnd }) => {
            const cl = sortable
              ? sortField === accessor && order === "asc"
                ? "up"
                : sortField === accessor && order === "desc"
                ? "down"
                : "default"
              : "";
            return (
              <th
                key={accessor}
                onClick={sortable ? () => handleSortingChange(accessor) : null}
                className={`${cl} ${isStickyAtEnd ? "stickyAtEnd" : ""} ${
                  isStickyAtStart ? "stickyAtStart" : ""
                }`}
              >
                {label}
              </th>
            );
          }
        )}
      </tr>
    </thead>
  );
};

export default TableHead;
