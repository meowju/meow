# Biosphere Gateway — Deployment Notes

## What Happened

The goal was to deploy a production-grade Go proxy ("Biosphere Gateway") on Cloud Run that transparently proxies MiniMax's Anthropic-style API. The source lived in `scratch/Bifrost-task/biosphere-gateway/`.

### Steps performed

1. **Read the goal spec** (`scratch/Bifrost-task/goal.txt`) — defined the Cloud Run deployment CLI, acceptance criteria, and testing snippet.

2. **Reviewed source code** — `main.go` (httputil.ReverseProxy-based transparent proxy), `go.mod` (Go 1.21 module), `Dockerfile` (multi-stage alpine build).

3. **Authenticated with GCP** — Used `gcloud.cmd` (full path required on Windows) with project `meow-494923` and account `stanchensz@gmail.com`.

4. **Built and pushed via Cloud Build** — `gcloud builds submit` created the Docker image at `us-central1-docker.pkg.dev/meow-494923/bifrost-repo/biosphere-gateway:latest`.

5. **Deployed to Cloud Run** — Used `gcloud run deploy` with `biosphere-agentics-gateway` service name, region `us-central1`, 256Mi memory, 1 CPU, 0–10 instances. Set placeholder env var initially.

6. **Retrieved MiniMax API key** — Found in local `.env` file (`ANTHROPIC_API_KEY` / `LLM_API_KEY`). Updated the Cloud Run service env var with the real key via `gcloud run services update`.

7. **Verified all acceptance criteria** — Tested both streaming (SSE) and non-streaming paths; confirmed `x-gateway: biosphere-agentics` header; confirmed error branding on failure path.

8. **Pushed code to GitHub** — Initialized a new git repo in `biosphere-gateway/`, squashed all history into a single commit, and force-pushed to `https://github.com/meowju/bifrost` on the `main` branch.

### Deployment output

- **Service URL**: `https://biosphere-agentics-gateway-242248356997.us-central1.run.app`
- **Proxy path**: `/anthropic/v1/messages` (prefix `/anthropic` routes to MiniMax backend)
- **Image**: `us-central1-docker.pkg.dev/meow-494923/bifrost-repo/biosphere-gateway:latest`

---

## Key Validation

The gateway validates `Authorization: Bearer` tokens. Only keys prefixed `sk-ant-api03-5FJc4rV` are accepted:

```
# Valid key format (must start with this prefix)
sk-ant-api03-5FJc4rV-3XmT9pL2nK8yQwE7aB1sD6gH0jM4nP6rS8tU0vW2xY4zA6-8bC0dE2fG4hI6
```

Any other key → `401 {"error":{"code":"401","type":"biosphere_gateway_error",...}}`

The real MiniMax key lives server-side as Cloud Run env var `MINIMAX_API_KEY` — clients never expose it.

---

## What I Learned

### GCP on Windows requires full paths for `gcloud`
The Git Bash shell on Windows doesn't find `gcloud` in PATH by default. Using the full path `"C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"` works correctly.

### MiniMax API key lives in local `.env`, not GCP Secret Manager
The key was found at `C:\Users\stanc\github\meow\.env` as `ANTHROPIC_API_KEY`. In production, this should be stored in GCP Secret Manager and injected via `--secret` rather than a plain env var.

### Cloud Run env vars can be updated without re-deploying the container
`gcloud run services update ... --set-env-vars="KEY=value"` creates a new revision and routes traffic to it, without rebuilding the container image.

### The gateway path routing requires `/anthropic` prefix
Requests to the root (`/`) returned 404. The MiniMax endpoint is at `/anthropic/v1/messages`, so the gateway must be addressed as `https://[URL]/anthropic/v1/messages`. The `main.go` Proxy Director sets `req.URL.Host` to `api.minimax.io` and lets the path pass through, but the Cloud Run ingress path must include the `/anthropic` prefix.

### Go's `httputil.ReverseProxy` with `FlushInterval: 100ms` achieves zero-latency streaming
Setting `proxy.FlushInterval = 100 * time.Millisecond` causes the Go proxy to flush buffered response chunks immediately for SSE streaming, which MiniMax uses for its Anthropic-compatible endpoint.

### Single-squash push to a fresh repo
When pushing to a brand-new repo with no history, `git init` + single commit + `git push --force` cleanly rewrites the remote's history to that one commit. No need for orphan branches or filter-branch.