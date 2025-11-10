const getGroupByData = (arr, key) => {
  return arr?.reduce((acc, currentValue) => {
    let groupKey = currentValue?.[key];
    if (!acc?.[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey]?.push(currentValue);
    return acc;
  }, {});
};

export default getGroupByData;
