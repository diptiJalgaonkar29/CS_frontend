import { get, capitalize } from "lodash";
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
      Title: "MusicBank VoiceTrackDetails",
      Author: "AMP MusicBank",
      CreatedDate: new Date(),
    };

    wb.SheetNames.push("Voice Track Report");

    // Prepare Data
    const dataArray = data?.map((item, index) => {
      const srNo = index + 1;
      const voiceText = get(item, "voice_text", "__");
      const getvoiceText = voiceText ? voiceText : "__";

      const artistName = get(item, "display_name", "__");
      const getartistName = artistName ? artistName : "__";
      const speakingstyle = get(item, "speaking_style", "__");
      const getspeakingstyle = speakingstyle ? speakingstyle : "__";
      const voiceProvider = get(item, "voice_provider", "__");
      const getvoiceProvider = voiceProvider ? voiceProvider : "__";
      const voiceTextcount = get(item, "voice_text_count", "__");
      const getvoiceTextcount = voiceTextcount ? voiceTextcount : "__";
      const duration = get(item, "duration", "__");
      const getduration = duration ? duration : "__";

      const email = get(item, "email", "__");
      const getemail = email ? email : "__";
      const date = get(item, "time_stamp", "__");
      const formateDate = formatDate(date);
      const getformateDate = formateDate ? formateDate : "__";

      return [
        srNo,
        // getvoiceText,
        getartistName,
        // getspeakingstyle,
        getvoiceProvider,
        getvoiceTextcount,
        {
          v: getduration,
          s: {
            alignment: {
              horizontal: "left",
            },
          },
        },
        getemail,
        getformateDate,
      ];
    });

    // WorkSheet
    //const ws = XLSX.utils.json_to_sheet(data, { wch: 25 });
    var ws_data = [
      [
        "Sr No",
        // "Voice text",
        "Artist name",
        // "Speaking style",
        "Provider",
        "Character count",
        "Duration (second)",
        "Email",
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

    wb.Sheets["Voice Track Report"] = ws;

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
      `${capitalized_CompanyName}_VoiceTracksDetailsReport_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  });
};
