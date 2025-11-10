import React, { useEffect, useRef } from "react";
import sortByKey from "../../../../utils/sortByKey";
import { ReactComponent as SortingAsc } from "../../../../static/common/sortAsc.svg";
import { ReactComponent as SortingDesc } from "../../../../static/common/sortDesc.svg";
import "./ProjectTableHeader.css";

const ProjectTableHeader = ({
  selectedProjectType,
  filteredProjectDataArr,
  setFilteredProjectDataArr,
  sortingMeta,
}) => {
  useEffect(() => {
    let sortedByLastUpdate = sortData("changetimestamp", "DESC");
    setFilteredProjectDataArr([...sortedByLastUpdate]);
  }, [selectedProjectType]);

  let projectHeaders = [
    {
      title: "Project Name",
      key: "project_name",
      width: "calc(30% - 100px)",
      padding: "0 15px",
      isSortable: true,
    },
    {
      title: "Assets",
      key: "assets",
      width: "15%",
      padding: "0 20px",
      isSortable: true,
    },
    selectedProjectType === "My Projects" && {
      title: "Date Created",
      key: "newtimestamp",
      width: "15%",
      padding: "0 20px",
      isSortable: true,
    },
    {
      title: "Last Edit",
      key: "changetimestamp",
      width: "15%",
      padding: "0 20px",
      isSortable: true,
    },
    selectedProjectType !== "My Projects" && {
      title: "Date deleted",
      key: "deletetimestamp",
      width: "15%",
      padding: "0 20px",
      isSortable: true,
    },
    {
      title: "Description",
      key: "description",
      width: "25%",
      padding: "0 10px",
      isSortable: true,
    },
    {
      title: "",
      key: "action",
      width: "80px",
      padding: "0 10px",
      isSortable: false,
    },
  ].filter((item) => Boolean(item));

  const sortData = (key, sortType) => {
    sortingMeta.current = {
      sortedBy: key,
      isAscendingOrder: sortType === "ASC" ? true : false,
    };

    return sortByKey(filteredProjectDataArr, key, sortType);
  };

  const getSortedDataBy = (key) => {
    let sortedData;
    let order;
    if (sortingMeta.current.sortedBy === key) {
      if (sortingMeta.current.isAscendingOrder) {
        order = "DESC";
        sortedData = sortData(key, order);
      } else {
        order = "ASC";
        sortedData = sortData(key, "ASC");
      }
    } else {
      order = "ASC";
      sortedData = sortData(key, "ASC");
    }
    return sortedData;
  };

  const handleSort = (sortBy) => {
    let sortedData = getSortedDataBy(sortBy);
    setFilteredProjectDataArr([...sortedData]);
  };
  return (
    <div className="project_table_header">
      {projectHeaders?.map((item, i) => (
        <div
          key={`item.title-${i}`}
          style={{ width: item.width }}
          className="project_table_header_item_container"
        >
          <p
            className="project_table_header_item_title boldFamily"
            style={{ padding: item.padding }}
          >
            {item.title}
          </p>
          {item.isSortable && (
            <div
              className="arrow_container sort_icon"
              onClick={() => {
                handleSort(item.key);
              }}
            >
              <SortingAsc
                width="24"
                height="20"
                className={`${
                  item.key === sortingMeta.current.sortedBy &&
                  sortingMeta.current.isAscendingOrder
                    ? "activeSort"
                    : "disableSort"
                }`}
              />
              <SortingDesc
                width="24"
                height="20"
                className={`${
                  item.key === sortingMeta.current.sortedBy &&
                  !sortingMeta.current.isAscendingOrder
                    ? "activeSort"
                    : "disableSort"
                }`}
                style={{
                  marginLeft: "-8px",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectTableHeader;
