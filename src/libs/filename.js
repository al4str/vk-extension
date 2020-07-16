import slugify from 'slugify';
import sanitize from 'sanitize-filename';

/**
 * Returns file system safe name
 * @param {string} rawFileName
 * @return {string}
 * */
export function getSanitizedFileName(rawFileName) {
  return sanitize(slugify(rawFileName, {
    replacement: ' ',
  }));
}
