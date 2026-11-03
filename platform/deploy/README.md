# Deploy

Everything runs on one box (chalk1, Ubuntu on Azure) in Docker Compose (`compose.yml`):

| Service | What |
|---|---|
| `postgres` | Postgres 17; its data in the `pgdata` volume, never exposed outside the box |
| `app` | The server (`platform/apps/server`) serving the API and the built PWA, on :8080 inside |
| `caddy` | HTTPS for `ORIGIN` on 80/443: a free Let's Encrypt certificate, renewed by itself; compresses everything |
| `backup` | A `pg_dump` every night into `~/chalk-backups` on the box, kept 30 days |

The image is built on the box (it's x86; Macs are ARM), from the commit you are on (`git archive HEAD`) copied over with rsync: `pnpm ship` refuses a tree with uncommitted changes, so what runs is always one commit, named in `build/index.json`, the app, `/api/health` and every event. Migrations run when the app starts.

## From your Mac

```sh
pnpm ship                         # copy HEAD to chalk1, build, start (only what changed restarts)
pnpm add-school "Sunrise School"  # prints the school's code
```

The first `pnpm ship` also installs Docker on the box (`setup-box.sh`) and makes the box's `.env` from yours: `ORIGIN` set to the box's address, a new random `POSTGRES_PASSWORD`, `DEV_SIGN_IN=off` and your Google client id. After that the box's `.env` is never overwritten: change it there (`ssh chalk1`, `nano chalk/.env`) and `pnpm ship` again.

Needs: `ssh chalk1` working, ports 80 and 443 open in Azure, and `ORIGIN`'s name pointing at the box.

## On the box

```sh
cd ~/chalk
docker compose --env-file .env -f platform/deploy/compose.yml ps        # what's running
docker compose --env-file .env -f platform/deploy/compose.yml logs -f app
docker compose --env-file .env -f platform/deploy/compose.yml exec postgres psql -U chalk
```

Restore a backup: `gunzip -c ~/chalk-backups/chalk-<date>.sql.gz | docker compose --env-file .env -f platform/deploy/compose.yml exec -T postgres psql -U chalk chalk` (into an empty database).

Not yet: copying backups off the box (Azure Blob).
