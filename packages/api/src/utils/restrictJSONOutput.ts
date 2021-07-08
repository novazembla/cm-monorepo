export const restrictJSONOutput = (obj: any, keys) => {
  if (obj !== Object(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => restrictJSONOutput(item, keys));
  }
  return Object.keys(obj)
    .filter((k) => !keys.includes(k))
    .reduce(
      (acc, x) => Object.assign(acc, { [x]: restrictJSONOutput(obj[x], keys) }),
      {}
    );
};

export default restrictJSONOutput;
