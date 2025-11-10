import { get, capitalize } from "lodash";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import getMonthName from "../../../../utils/getMonthName";

const download = (url, name) => {
  let a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();

  setTimeout(function () {
    window.URL.revokeObjectURL(url);
  }, 100);
};

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export default (data) => {
  // console.log(data, "data");
  import("xlsx").then((XLSX) => {
    // Workbook
    const wscols = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
    ];
    const wsrows = [{ hpt: 20 }];

    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "MusicBank AITrackDetails",
      Author: "AMP MusicBank",
      CreatedDate: new Date(),
    };

    wb.SheetNames.push("AI track report");

    // Prepare Data
    const dataArray = data?.map((item, index) => {
      const srNo = index + 1;
      const year = get(item, "year", "__");
      const getyear = year ? year : "__";
      const month = get(item, "month", "__");
      const getMonthNames = getMonthName(month);
      const getmonth = getMonthNames ? getMonthNames : "__";
      const recordCount = get(item, "record_count", "__");
      const getrecordCount = recordCount ? recordCount : "__";
      const email = get(item, "email", "__");
      const getEmail = email ? email : "__";
      return [
        srNo,
        {
          v: getyear,
          s: {
            alignment: {
              horizontal: "left",
            },
          },
        },

        getmonth,
        {
          v: getrecordCount,
          s: {
            alignment: {
              horizontal: "left",
            },
          },
        },
        getEmail,
      ];
    });

    // WorkSheet
    const ws_data = [
      ["Sr No", "Year", "Month", "Record Count", "Email"],
      ...dataArray,
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply styles to header
    const headerStyle = {
      font: {
        bold: true,
      },
      alignment: {
        horizontal: "center",
      },
    };

    const headerRow = 0; // Corrected index for header row
    for (let i = 0; i < ws_data[headerRow].length; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: i });
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle;
      }
    }

    // Assign worksheet to the workbook
    wb.Sheets["AI track report"] = ws;

    ws["!cols"] = wscols;
    ws["!rows"] = wsrows;

    // Generate Excel file
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    const url = window.URL.createObjectURL(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" })
    );

    const companyName = getSuperBrandName();
    const capitalizedCompanyName = capitalize(companyName);

    download(
      url,
      `${capitalizedCompanyName}_AITrackReport_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  });
};
