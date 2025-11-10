const isAllParamsNotNull = (params) => {
  if (!Array.isArray(params))
    return `params is not an Array, it is ${typeof params}`;
  let isAllParamsNotNull = params?.every((param) => param != null);
  if (!isAllParamsNotNull) {
    return `few params are null`;
  }
  return isAllParamsNotNull;
};

export default isAllParamsNotNull;
