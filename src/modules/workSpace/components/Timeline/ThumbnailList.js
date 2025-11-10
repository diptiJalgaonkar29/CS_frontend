import { useEffect, useRef, useState } from "react";

const ThumbnailList = ({ thumbnails = [], setIsTimelineReady }) => {
  const [erroredImages, setErroredImages] = useState({});
  const generatedBlobURLsRef = useRef([]);

  useEffect(() => {
    // Revoke old blob URLs
    generatedBlobURLsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn("Failed to revoke blob URL", url, e);
      }
    });
    generatedBlobURLsRef.current = [];

    // Collect current blob URLs
    thumbnails.forEach((item) => {
      if (typeof item === "string" && item.startsWith("blob:")) {
        generatedBlobURLsRef.current.push(item);
      }
    });

    return () => {
      // Cleanup on unmount
      generatedBlobURLsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn("Failed to revoke blob URL", url, e);
        }
      });
      generatedBlobURLsRef.current = [];
    };
  }, [thumbnails]);

  return (
    <>
      {thumbnails.map((item, i) => {
        const key = `thumb-${i}-${item}`;
        const isLastImage = i === thumbnails.length - 1;

        return (
          <img
            key={key}
            className="thumbnail_img"
            src={item}
            alt={`thumbnail-${i}`}
            style={{
              width: "calc(100% - 20px/16)",
              display: erroredImages[key] ? "none" : "block",
            }}
            onError={() =>
              setErroredImages((prev) => ({ ...prev, [key]: true }))
            }
            onLoad={() => {
              setErroredImages((prev) => ({ ...prev, [key]: false }));
              if (isLastImage) {
                setTimeout(() => {
                  setIsTimelineReady((prev) => ({
                    ...prev,
                    video: true,
                  }));
                }, 1000);
              }
            }}
          />
        );
      })}
    </>
  );
};

export default ThumbnailList;
