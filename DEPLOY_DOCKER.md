How to build and run the Steem Burn Pool app with Docker (no docker-compose)

This repo includes a Dockerfile and an in-container nginx config so you can build a single image and run it as a container.

1) Build image

Run from the project root (set REACT_APP_API_URL if your app needs to call an API):

```powershell
# Build image
docker build -t steem-burn-pool:latest --build-arg REACT_APP_API_URL="https://api.example.com" .
```

2) Run container (bind to localhost:8080)

```powershell
# Stop and remove previous container if exists
docker rm -f steem-burn-pool || true

# Run the container
docker run -d --name steem-burn-pool -p 127.0.0.1:8080:80 --restart unless-stopped steem-burn-pool:latest
```

3) Configure host Nginx to reverse-proxy

Use the example file `deploy/nginx.conf` on the host (adjust cert paths). Place in `/etc/nginx/sites-available/` and symlink to `sites-enabled`:

```bash
sudo ln -s /etc/nginx/sites-available/burn.steemblocks.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4) Optional: Let's Encrypt

Use certbot to request certs and point the challenge to `/var/www/letsencrypt` or use the webroot plugin. Example:

```bash
sudo mkdir -p /var/www/letsencrypt
sudo chown www-data:www-data /var/www/letsencrypt
sudo certbot certonly --webroot -w /var/www/letsencrypt -d burn.steemblocks.com
```

5) Troubleshooting
- Check container logs: `docker logs -f steem-burn-pool`
- Confirm container serving files: `curl -I http://127.0.0.1:8080`
- Check Nginx error logs on host: `/var/log/nginx/error.log`

Notes
- This approach terminates TLS at the host Nginx and keeps the container simple.
- If you need run-time environment variables without rebuilding the image, consider adding a small entrypoint script that writes runtime config into a served JS file.

If you want, I can:
- Add an entrypoint script for runtime env injection
- Create a systemd service to manage the Docker container
- Run a local docker build/test (if your environment supports it)
