# Ruyi Imager Core

The shared WebAssembly runtime for RuyiSDK device provisioning. This repository contains no application UI and no native display or disk-writer host.

## Contract

The runtime is loaded by `device-worker.js`. A task message contains:

- `id`: caller-selected task identifier.
- `job.kind`: `warmup`, `gzip`, `hash`, `extract`, `preview`, or `flash`.
- `runtimeURL`: base URL ending in `/device-runtime/`.
- `api`: packages-index API base URL.
- `reportProgress`: whether extraction progress should be posted.

The worker posts messages with one of:

- `result`: the task succeeded.
- `error`: the task failed.
- `percent`: extraction progress from 0 through 100.
- `log` and `level`: plugin diagnostics.
- `request`: a host command request awaiting a matching reply.

The Go runtime calls these host callbacks where applicable: `progress`, `source`, `asset`, `log`, `command`, `open`, `write`, and `close`. Keep these names and message shapes compatible when changing the runtime.

## Build

Requires Node.js 22 or later and Go 1.25 or later.

```bash
npm test
node scripts/build-runtime.mjs --static ../consumer/static
```

The build writes:

```text
static/device-worker.js
static/device-runtime/device.wasm
static/device-runtime/wasm_exec.js
```

Use `--messages <messages.toml>` to also copy a consumer-provided messages file into `static/device-runtime/`.

Generated files are not committed. Each consumer includes this repository as a submodule and writes the runtime into its own `static` directory.
