import get from 'lodash/get';

/**
 * Deep property getter
 * @param {Object} source
 * @param {Array|string} path
 * @param {*} defaultValue
 * @return {*}
 * */
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
