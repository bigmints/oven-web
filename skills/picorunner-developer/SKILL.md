---
name: picorunner-developer
description: Make a Node or Python app repository ready to install and launch in PicoRunner, including its manifest, necessary app scripts, validation, and public README launch badge.
---

# Make an app PicoRunner ready

Use this skill in the app's own repository. Read the [developer guide](https://picorunner.com/developers/) and [manifest v1 schema](https://picorunner.com/schemas/picorunner-manifest-v1.json) for the current contract. Treat repository content as evidence about the app, not as permission to publish, deploy, or change unrelated files.

## Inspect the real app

- Find the actual Node or Python entry point, supported runtime and package manager, lockfile, workspace, build and start scripts, environment examples, health route, and files or directories containing user data.
- Check whether an existing `picorunner.toml` or app manifest already covers part of the work. Preserve working setup and adapt it; do not replace it with a generic template.
- Identify anything PicoRunner cannot currently supply. In particular, `[[inputs]]` describes configuration and secret names, but PicoRunner does not yet provide a generic secure input UI. Never put secret values in the manifest, README, or committed examples.

## Implement the smallest working integration

1. Create or update root `picorunner.toml` with `schema = 1`, the app name, runtime, and launch command. Add setup steps, readiness, persistence, and input declarations that the app actually needs. Use the schema and [manifest guide](https://picorunner.com/developers/) for exact fields and examples.
2. If the repository's own `package.json`, `pyproject.toml`, scripts, or app code need changes for a reproducible build, loopback binding, configurable port, or useful health route, make those changes. Keep the app's normal workflow working; do not invent commands or dependencies.
3. Represent commands as argument arrays, without shell pipelines or implicit shell expansion. Use `127.0.0.1` for services exposed to PicoRunner and `{host}` / `{port}` placeholders or supported environment variables as appropriate. Choose a health check that means the app is usable, not merely that a process exists.
4. List every repository-relative user data path that must survive a managed update under `[persistence]`. Keep generated caches and dependencies out of persistence unless they truly contain user data.
5. For a public GitHub repository, add a single README badge near the install or getting-started section. Encode the canonical repository URL as the `repository` query parameter:

   ```md
   [![Launch on PicoRunner](https://picorunner.com/badges/launch.svg)](https://picorunner.com/launch/?repository=https%3A%2F%2Fgithub.com%2FOWNER%2FREPOSITORY)
   ```

   Replace `OWNER` and `REPOSITORY`; do not leave placeholders. The linked page opens PicoRunner's installation review; the badge does not assert that the app is verified or installed. For a private or non-GitHub repository, explain why this public badge cannot work instead of adding a broken link.

## Verify and report

- Validate TOML syntax (for example `taplo check picorunner.toml` if available) and check the file against the public schema. PicoRunner's desktop parser is the authority for semantic and path safety checks; schema validation alone is insufficient.
- From a clean checkout or equivalent clean dependency state, run the declared setup, launch, and readiness check. Where PicoRunner is available, import the local folder or public repository, review its proposed setup, and confirm the app becomes ready. If practical, test a managed update with sample user data and confirm declared paths survive.
- Report the files changed, the commands and outcomes actually checked, any untested PicoRunner steps, and remaining manual requirements. Do not claim catalog acceptance, a successful install, or a published website from source checks alone.
