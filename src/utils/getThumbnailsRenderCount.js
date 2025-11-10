const getThumbnailsRenderCount = () => {
  let thumbnailsRenderCount =
    window.innerWidth >= 1950
      ? 18
      : window.innerWidth >= 1750
      ? 17
      : window.innerWidth >= 1550
      ? 16
      : window.innerWidth >= 1350
      ? 15
      : window.innerWidth >= 1050
      ? 14
      : 13;
  return thumbnailsRenderCount;
};

export default getThumbnailsRenderCount;
