# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Durable Coding Agent**: a cloud-first AWS serverless product with
three pieces — a TypeScript Lambda **orchestrator** (`orchestrator/`), a Python FastAPI
**agent** runtime (`agent/`), and a static **demo UI** (`demo.html`). See `README.md`
for architecture and the full AWS deployment flow (`deploy.sh`, `infra/template.yaml`).

### What runs locally vs. what needs AWS

- **Full end-to-end (code generation, PR creation, S3 output) requires AWS credentials
  + Bedrock model access + a GitHub PAT.** These are not available by default, so the
  real pipeline (`test_local.py`, agent `POST /invocations` with a real task, orchestrator
  Lambda) cannot complete offline. `test_local.py` hits real Bedrock + a hardcoded S3
  bucket and needs credentials.
- Locally runnable without AWS: the agent server's health/status endpoints, the
  orchestrator type-check/build, and the demo UI in **Simulation mode** (fully client-side).

### Python agent (`agent/`)

- Dependencies live in a repo-local virtualenv at `.venv/` (created by the update script).
- **The server must be started from `agent/src/`** — `server.py` uses flat imports
  (`from pipeline import ...`), so running from elsewhere breaks imports.
- Run: `cd agent/src && /workspace/.venv/bin/uvicorn server:app --host 0.0.0.0 --port 8080`
- `GET /ping` → `{"status":"healthy"}` (or `HealthyBusy` while a task runs). Swagger at `/docs`.
- Submitting a real task via `POST /invocations` spawns a background thread that calls
  Bedrock/S3/GitHub and needs AWS creds; the `{"input":{"action":"status"}}` poll works
  without AWS.

### Orchestrator (`orchestrator/`)

- No dev server exists — it's a Lambda Durable Function that only runs inside AWS Lambda's
  durable-execution runtime. Locally you only build/type-check it.
- Build / type-check: `npm run build --prefix orchestrator` (strict `tsc`; also acts as lint).

### Demo UI (`demo.html`)

- Serve statically, e.g. `python3 -m http.server 8000` from repo root, then open
  `http://localhost:8000/demo.html`.
- **Simulation toggle is ON by default** and runs the whole submit → generate → view-files
  flow client-side with no backend. Turning Simulation OFF prompts for an API Gateway URL
  from a deployed SAM stack.

### Lint / test notes

- There is no configured linter and no automated test suite. `tsc` (strict) is the only
  static check; `test_local.py` is an AWS integration script, not a unit test.
