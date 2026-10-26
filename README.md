# Fresh Roots

Fresh Roots is a farm-to-table supply chain platform: a Django + DRF + Channels backend (daphne ASGI, SimpleJWT auth, SQLite by default with optional PostgreSQL) and a Next.js 16 frontend.

## Project layout

```
backend/    Django project (fresh_roots) + REST API apps
frontend/   Next.js 16 app (App Router)
```

## Local development

### Backend

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate   # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env                            # fill in values as needed
python manage.py runserver
```

The API runs at `http://localhost:8000/api`, WebSockets at `http://localhost:8000/ws`. With `DEBUG=True` and no environment configured, SQLite and localhost defaults are used.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

## Deployment environment variables

Copy `backend/.env.example` and `frontend/.env.example` as templates.

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | Yes in production | dev-only fallback when `DEBUG=True` | Django secret key. Startup fails hard if unset in production. |
| `DEBUG` | No | `True` | Set `False` in production. |
| `ALLOWED_HOSTS` | Yes in production | `*` while `DEBUG=True` | Comma-separated hosts, e.g. `api.yourdomain.com`. |
| `CORS_ALLOWED_ORIGINS` | No | localhost defaults | Comma-separated origins appended to the localhost defaults. |
| `CSRF_TRUSTED_ORIGINS` | No | localhost defaults | Comma-separated origins appended to the localhost defaults. |
| `DATABASE_URL` | No | SQLite fallback | `postgres://user:password@host:5432/dbname`. |

### Frontend (build-time, `frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Recommended in prod | `http://<current-hostname>:8000/api` | Explicit REST API base URL. |
| `NEXT_PUBLIC_WS_URL` | Recommended in prod | `ws://<current-hostname>:8000/ws` (uses `wss://` automatically when the page is served over https) | Explicit WebSocket base URL. |

> `NEXT_PUBLIC_*` values are frozen into the client bundle at build time — rebuild the frontend after changing them.
