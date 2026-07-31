# Local Environment

Copy `.env.example` to `.env` for local configuration. Keep real credentials
out of Git and use local PostgreSQL and Redis values when those services are
introduced.

The current scaffold does not start infrastructure services automatically.
Those services will be added under `infrastructure/` in a later milestone.
