/**
 * The startup-time environment.
 *
 * Returns a default environment tailor-made for development or
 * production (as per ../../esbuild.mjs) with `window._12factor`
 * merged into it, providing startup-time (rather than build-time)
 * configuration capability. See `../../docker-entrypoint.sh` for
 * details about `window._12factor`.
 */

const _env_development = {
  REACT_APP_AUTH_SERVER_URL: "https://login.microsoftonline.com/f6c2556a-c4fb-4ab1-a2c7-9e220df11c43/v2.0",
  REACT_APP_HOMEPAGE_URL: "http://localhost:3000/",
  REACT_APP_GRAPHQL_ENDPOINT_URL: "//localhost:3010/graphql",
  REACT_APP_ENDPOINT_URL: "//localhost:3010",
  LHDv2_BASE_URL:"https://lhd-127-0-0-1.nip.io/",
  CRISTAL_URL:"cristal-test.epfl.ch",
  OIDC_SCOPE: "openid 2c822adc-1365-4b59-931f-64cde59e7d20/.default",
  OIDC_CLIENT_ID: "2c822adc-1365-4b59-931f-64cde59e7d20"
};

export function env() {
  // window.IS_PRODUCTION is set at build time (see
  // ../../esbuild.mjs):
  return window.IS_PRODUCTION ?
      window._12factor : _env_development;
}

