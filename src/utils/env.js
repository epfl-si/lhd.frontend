/**
 * window._12factor is filled by shell script at te beginning of the container
 * see docker-entrypoint.sh for more information
 * @returns {*}
 */
export function env() {
  return window._12factor;
}
