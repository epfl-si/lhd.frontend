/**
 * The startup-time environment.
 *
 * In a development build, returns `process.env`, as described in
 * https://create-react-app.dev/docs/adding-custom-environment-variables/ .
 *
 * In a production build, returns `process.env` with
 * `window._12factor` merged into it, providing startup-time (rather
 * than build-time) configuration capability. See
 * `../../docker-entrypoint.sh` for details about `window._12factor`.
 */
export function env() {
  let env = process.env;
  if ( (env.NODE_ENV === "production") && window._12factor ) {
    env = {...env, ...window._12factor};
  }
  return env;
}
