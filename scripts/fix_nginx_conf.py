#!/usr/bin/env python3
"""
Atomically fix nginx site config for kuikchat.io on the production server.
- Backs up /etc/nginx/sites-available/kuikchat with a timestamp suffix
- Writes a clean config that increases proxy buffers for large Set-Cookie headers
- Runs `nginx -t`; only reloads nginx if the test passes

Requires: DEPLOY_SSH_PASSWORD in environment or .env.local
"""
import os
import io
import sys
import time
import paramiko

# UTF-8 stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

HOST = '217.154.11.234'
USER = 'root'
SITE_PATH = '/etc/nginx/sites-available/kuikchat'

CONF_TEXT = """server {
    listen 80;
    server_name kuikchat.io www.kuikchat.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kuikchat.io www.kuikchat.io;

    ssl_certificate /etc/ssl/kuikchat/fullchain.pem;
    ssl_certificate_key /etc/ssl/kuikchat/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    # Increase header buffer sizes for large Set-Cookie headers from upstream (OAuth sessions)
    proxy_buffer_size          128k;
    proxy_buffers              8 256k;
    proxy_busy_buffers_size    256k;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
"""

def load_password():
    pw = os.getenv('DEPLOY_SSH_PASSWORD')
    if pw:
        return pw
    # try reading from .env.local in repo root
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
    try:
        with open(env_path, 'r', encoding='utf-8', errors='replace') as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith('#'):
                    continue
                if line.startswith('DEPLOY_SSH_PASSWORD='):
                    return line.split('=', 1)[1].strip().strip('"').strip("'")
    except Exception:
        pass
    return input('SSH password: ')


def run(client, cmd):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out)
    if err.strip():
        print('[STDERR]', err)
    print(f'[EXIT {code}]')
    return code, out, err


def main():
    password = load_password()
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=password, timeout=15)

    # Backup existing file
    ts = int(time.time())
    backup_path = f"{SITE_PATH}.bak.{ts}"
    run(client, f"cp {SITE_PATH} {backup_path}")

    # Write new file via SFTP atomically
    sftp = client.open_sftp()
    tmp_path = f"{SITE_PATH}.tmp.{ts}"
    with sftp.file(tmp_path, 'w') as f:
        f.write(CONF_TEXT)
    sftp.chmod(tmp_path, 0o644)
    sftp.close()

    # Move tmp into place
    run(client, f"mv {tmp_path} {SITE_PATH}")

    # Validate config; only reload if test passes
    code, _, _ = run(client, 'nginx -t')
    if code != 0:
        print('\nnginx -t failed — NOT reloading. Restoring backup...')
        run(client, f"cp {backup_path} {SITE_PATH}")
        sys.exit(1)

    run(client, 'systemctl reload nginx')
    print('\nNGINX config updated and reloaded successfully.')

    # Show recent error log lines
    run(client, 'tail -n 30 /var/log/nginx/error.log')

    client.close()

if __name__ == '__main__':
    main()
