import TableBody from "./TableBody";
import TableHead from "./TableHead";
import "./Table.css";
import { useSortableTable } from "../../../customHooks/useSortableTable";

const Table = ({
  caption,
  data,
  setData,
  columns,
  defaultSortingAccesser,
  defaultSortingOrder,
  dataUpdatedAt,
  handleClickOpen,
  isReadMore,
  toggleReadMore,
}) => {
  const [tableData, setTableData, handleSorting] = useSortableTable(
    data,
    columns,
    defaultSortingAccesser,
    defaultSortingOrder
  );

  const updateTableData = (newData) => {
    setTableData(newData);
    setData(newData);
  };

  return (
    <div className="custom_table_container">
      <table className="table">
        <caption>{caption}</caption>
        <TableHead
          {...{
            columns,
            handleSorting,
            defaultSortingAccesser,
            defaultSortingOrder,
            dataUpdatedAt,
          }}
        />

        <TableBody
          {...{ columns, tableData, updateTableData }}
          handleClickOpen={handleClickOpen}
          toggleReadMore={toggleReadMore}
          isReadMore={isReadMore}
        />
      </table>
    </div>
  );
};

export default Table;
