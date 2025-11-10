import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";

export const initVideoBreifAIAnalysisStability = ({
  data,
  onSuccess,
  onError,
  onFinally,
  projectID,
  pollingDataFiles = () => { },
}) => {
  axiosCSPrivateInstance
    .post(`stability/videoResponse`, data)
    .then(() => {
      const poll = async () => {
        let pollingData

        try {
          const { data: rows } = await axiosCSPrivateInstance.get(
            `/stability/getByType/${data?.type}/${projectID}`
          );

          pollingDataFiles(rows)

          // if (
          //   [3, "3"]?.includes(data?.type) || window.location.pathname === `/workspace/${projectID}/`
          // ) {
          //   // Allowed paths → keep polling
          // } else {
          //   // Stop polling if user has navigated away
          //   console.log("User navigated away, stopping polling.", projectID);
          //   console.log("window.location.pathname", window.location.pathname);
          //   console.log(`/workspace/${projectID}`, window.location.pathname);
          //   return;
          // }

          if (!window.location.pathname.startsWith(`/work-space/${projectID}`)) return
          // Check for completion
          if (rows.length && rows.every((r) => r.status === "completed" && r.fileName !== null && r.type)) {
            pollingData = rows.every((r) => r.status === "completed" && r.fileName !== null && r.type) || []
            // ✅ Grab all file names from the response
            const fileNames = rows.map((r) => r.fileName);

            console.log("Fetched all Stability MP3 files:", fileNames);
            onSuccess?.(fileNames);
            pollingDataFiles(rows)
            onFinally?.();
            return; // stop polling
          }

          // Retry after 10 seconds if not completed
          setTimeout(poll, 10000);
        } catch (err) {
          console.error("Polling error:", err);
          showNotification("ERROR", "Error while polling Stability data");
          onError?.();
          onFinally?.();
        }
      };

      poll();
    })
    .catch((error) => {
      console.error("Error starting Stability process:", error);
      showNotification("ERROR", "Something went wrong!");
      onError?.();
      onFinally?.();
    });
};


