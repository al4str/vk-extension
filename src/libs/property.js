import get from 'lodash/get';

export default (source, path, defaultValue) => {
  if (defaultValue === undefined) {
    throw new TypeError('`defaultValue` is undefined');
  }
  if (source === undefined || source === null) {
    return defaultValue;
  }
  const value = get(source, path, defaultValue);
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value;
};
