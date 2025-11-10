import { get, capitalize, orderBy } from "lodash";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import formatDate from "../../../../utils/formatDate";

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
    // WorkBook
    // SET WIDTH OF FIRST COLUMN TO
    var wscols = [
      { wch: 20 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
    ];
    var wsrows = [{ hpt: 20 }];

    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "MusicBank AITrackDetails",
      Author: "AMP MusicBank",
      CreatedDate: new Date(),
    };

    wb.SheetNames.push("AI track details report");

    // Prepare Data
    const dataArray = data?.map((item, index) => {
      const srNo = index + 1;
      const cue_id = get(item, "cue_id", "__");
      const getcue_id = cue_id ? cue_id : "__";
      const trackName = get(item, "name", "__");
      const gettrackName = trackName ? trackName : "__";
      const description = get(item, "description", "__");
      const getdescription = description ? description : "__";
      const mood = get(item, "mood", "__");
      const getmood = mood ? mood : "__";
      const genre = get(item, "genre", "__");
      const getgenre = genre ? genre : "__";
      const tempo = get(item, "tempo", "__");
      const gettempo = tempo ? tempo : "__";
      const email = get(item, "email", "__");
      const getemail = email ? email : "__";
      const date = get(item, "newtimestamp", "__");
      const formateDate = formatDate(date);
      const getformateDate = formateDate ? formateDate : "__";

      return [
        srNo,
        getcue_id,
        gettrackName,
        getdescription,
        getmood,
        getgenre,
        gettempo,
        getformateDate,
      ];
    });

    // WorkSheet
    //const ws = XLSX.utils.json_to_sheet(data, { wch: 25 });
    var ws_data = [
      [
        "Sr No",
        "Cue ID",
        "Track name",
        "Description",
        "Mood",
        "Genre",
        "Tempo",
        "Date",
      ],
      ...dataArray,
    ];
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    const headerStyle = {
      font: {
        bold: true,
      },
      alignment: {
        horizontal: "center",
      },
    };
    const headerRow = 4;
    for (let i = 0; i < 5; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: i });
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle;
      } else {
        ws[cellAddress] = { v: ws_data[headerRow][i], s: headerStyle };
      }
    }

    wb.Sheets["AI track details report"] = ws;

    ws["!cols"] = wscols;
    ws["!rows"] = wsrows;

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "binary",
    });

    let url = window.URL.createObjectURL(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" })
    );

    const companyName = getSuperBrandName();
    const capitalized_CompanyName = capitalize(companyName);

    download(
      url,
      `${capitalized_CompanyName}_AITracksDetailsReport_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  });
};
