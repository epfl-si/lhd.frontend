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
  REACT_APP_AUTH_SERVER_URL: "http://localhost:8080/realms/LHD",
  REACT_APP_HOMEPAGE_URL: "http://localhost:3000/",
  REACT_APP_GRAPHQL_ENDPOINT_URL: "//localhost:3001",
  REACT_APP_OPENID_SCOPE: "openid",
  REACT_CLIENT_ID: "LHDv3"
};

const _env_production = {
  REACT_APP_AUTH_SERVER_URL: "https://tkgi-satosa.epfl.ch",
  REACT_APP_HOMEPAGE_URL: "https://lhd.epfl.ch/",
  REACT_APP_GRAPHQL_ENDPOINT_URL: "https://lhd.epfl.ch/graphql",
  REACT_APP_OPENID_SCOPE: "openid profile tequila",
  REACT_CLIENT_ID: "LHDv3_PROD"
};

export function env() {
  // window.IS_PRODUCTION is set at build time (see
  // ../../esbuild.mjs):
  let env = window.IS_PRODUCTION ?
    _env_production : _env_development;

  if (window._12factor ) {
    env = {...env, ...window._12factor};
  }
  return env;
}
