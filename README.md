# HomeFind

Self-hosted family inventory for one home. Requires Node.js 24 LTS and one app instance on a server with durable local storage.

## Run with Docker

1. Create the bind-mounted data directory and give it to the container's `node` user (UID/GID 1000):

   ```sh
   mkdir -p ./data
   sudo chown -R 1000:1000 ./data
   ```

2. Copy `.env.example` to `.env`.
3. Set `BETTER_AUTH_URL` to the public HTTPS URL, generate a unique 32+ character `BETTER_AUTH_SECRET`, and set a long random `HOMEFIND_SETUP_TOKEN`.
4. Run `docker compose up -d --build`. The app listens on `127.0.0.1:3000`; put it behind an HTTPS reverse proxy.
5. Open `/setup` once and enter the setup token to create the household owner. Then remove `HOMEFIND_SETUP_TOKEN` from `.env` and recreate the app container so it is removed from the running environment:

   ```sh
   docker compose up -d --force-recreate homefind
   ```
6. Owners create single-use family invitations from **Family**. Each link expires after seven days.

For Nginx, allow the maximum 15 MiB image plus multipart form overhead in the HTTPS server block:

```nginx
client_max_body_size 16m;
```

Set the equivalent request-body limit to at least 16 MiB when using another reverse proxy.

The database and private, normalized WebP photos live together under `./data` (mounted as `/data`). Do not mount this directory from a network filesystem or run multiple app instances. Use local persistent disk.

## Backup and restore

For a consistent backup, stop the app and archive the whole `data` directory as one unit. This includes the SQLite database and private uploads from the same point in time. The archive keeps numeric file ownership so it can be restored to the container's `node` user (UID 1000). Keep `.env` backed up separately in a secure place; it contains the authentication secret and public app URL needed after a restore.

```sh
mkdir -p ../homefind-backups
backup="../homefind-backups/homefind-$(date +%F-%H%M%S).tar.gz"
docker compose stop homefind
sudo tar --numeric-owner -czf - data > "$backup"
backup_status=$?
docker compose start homefind
test "$backup_status" -eq 0
```

Restore a backup while the app is stopped. The first command keeps the current data directory beside the restored one in case you need to roll back. Replace the archive path with the backup to restore.

```sh
docker compose stop homefind
mv data "data-before-restore-$(date +%F-%H%M%S)"
sudo tar --numeric-owner --same-owner -xzf ../homefind-backups/homefind-YYYY-MM-DD-HHMMSS.tar.gz -C .
docker compose up -d homefind
```

Run a restore rehearsal before relying on a backup. Do not restore only the database or only the uploads directory.

## Account and photo notes

Password reset by email is not available in v1. If a member forgets their password, the owner must arrange an account recovery outside the app. New accounts can only be created through the one-time setup flow or a valid family invite. Unsupported or damaged images are rejected; supported inputs are JPEG, PNG, WebP, AVIF, and TIFF. HEIC support is not promised. Photos are limited to 15 MiB and normalized on the server.

Inventory and photo responses are private and not cached. The PWA does not provide offline access.
