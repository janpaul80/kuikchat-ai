#!/usr/bin/env python3
"""Deploy KuikChat to production server via SSH (password auth)."""

import sys
import os
import io

# Fix Windows encoding - force UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
os.environ['PYTHONIOENCODING'] = 'utf-8'

import paramiko
import time

HOST = "217.154.11.234"
USER = "root"
PASSWORD = sys.argv[1] if len(sys.argv) > 1 else input("SSH password: ")

def run_ssh(client, cmd, timeout=300):
    """Run a command over SSH and stream output."""
    print(f"\n{'='*60}")
    print(f">>> {cmd}")
    print('='*60)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out)
    if err.strip():
        print(f"[STDERR] {err}")
    print(f"[EXIT CODE: {exit_code}]")
    return exit_code, out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    print(f"Connecting to {USER}@{HOST}...")
    client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
    print("Connected!\n")

    # Step 1: Check what is on the server
    print("\n### STEP 1: Server reconnaissance ###")
    run_ssh(client, "hostname && uptime")
    run_ssh(client, "df -h /")
    run_ssh(client, "free -h")
    run_ssh(client, "cat /etc/os-release | head -5")
    
    # Check if Docker is installed
    exit_code, out, _ = run_ssh(client, "docker --version 2>/dev/null && docker compose version 2>/dev/null")
    docker_installed = exit_code == 0
    
    # Check if Git is installed
    exit_code, out, _ = run_ssh(client, "git --version 2>/dev/null")
    git_installed = exit_code == 0
    
    # Check if Node is installed
    exit_code, out, _ = run_ssh(client, "node --version 2>/dev/null && npm --version 2>/dev/null")
    node_installed = exit_code == 0
    
    # Check if nginx is installed
    exit_code, out, _ = run_ssh(client, "nginx -v 2>&1")
    nginx_installed = exit_code == 0
    
    # Check if postgres is installed
    exit_code, out, _ = run_ssh(client, "psql --version 2>/dev/null")
    postgres_installed = exit_code == 0

    # Check if the repo exists
    exit_code, out, _ = run_ssh(client, "test -d /opt/kuikchat && echo 'REPO EXISTS' || echo 'NO REPO'")
    repo_exists = "REPO EXISTS" in out

    print(f"\n### STATUS ###")
    print(f"Docker:   {'YES' if docker_installed else 'NO'}")
    print(f"Git:      {'YES' if git_installed else 'NO'}")
    print(f"Node:     {'YES' if node_installed else 'NO'}")
    print(f"Nginx:    {'YES' if nginx_installed else 'NO'}")
    print(f"Postgres: {'YES' if postgres_installed else 'NO'}")
    print(f"Repo:     {'YES' if repo_exists else 'NO'}")

    # Step 2: Install missing dependencies
    print("\n### STEP 2: Installing dependencies ###")
    
    if not git_installed:
        print("Installing git...")
        run_ssh(client, "apt-get update -qq && apt-get install -y -qq git", timeout=120)
    
    if not node_installed:
        print("Installing Node.js 20 LTS...")
        run_ssh(client, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -", timeout=60)
        run_ssh(client, "apt-get install -y -qq nodejs", timeout=120)
        run_ssh(client, "node --version && npm --version")
    
    if not nginx_installed:
        print("Installing nginx...")
        run_ssh(client, "apt-get install -y -qq nginx", timeout=60)
    
    if not postgres_installed:
        print("Installing PostgreSQL...")
        run_ssh(client, "apt-get install -y -qq postgresql postgresql-contrib", timeout=120)
        run_ssh(client, "systemctl enable postgresql && systemctl start postgresql")

    # Step 3: Clone or pull repo
    print("\n### STEP 3: Repository ###")
    if not repo_exists:
        print("Cloning repository...")
        run_ssh(client, "git clone https://github.com/janpaul80/kuikchat-ai.git /opt/kuikchat", timeout=120)
    else:
        print("Pulling latest changes...")
        run_ssh(client, "cd /opt/kuikchat && git fetch origin && git reset --hard origin/master", timeout=60)

    # Verify commit
    run_ssh(client, "cd /opt/kuikchat && git log -1 --oneline")

    # Step 4: Install npm dependencies and build
    print("\n### STEP 4: Install & Build ###")
    run_ssh(client, "cd /opt/kuikchat && npm ci --production=false", timeout=300)
    
    # Check if .env.local exists
    exit_code, out, _ = run_ssh(client, "test -f /opt/kuikchat/.env.local && echo 'ENV EXISTS' || echo 'NO ENV'")
    if "NO ENV" in out:
        print("\n*** WARNING: .env.local does not exist on the server! ***")
        print("*** You need to create /opt/kuikchat/.env.local with production secrets ***")
        print("*** Skipping build until env is configured ***")
        client.close()
        return
    
    run_ssh(client, "cd /opt/kuikchat && npm run build", timeout=300)

    # Step 5: Set up systemd service for Next.js
    print("\n### STEP 5: Systemd service ###")
    service_unit = """[Unit]
Description=KuikChat Next.js App
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/kuikchat
EnvironmentFile=/opt/kuikchat/.env.local
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3100

[Install]
WantedBy=multi-user.target
"""
    # Write service file
    escaped = service_unit.replace("'", "'\\''")
    run_ssh(client, f"cat > /etc/systemd/system/kuikchat.service << 'SERVICEEOF'\n{service_unit}SERVICEEOF")
    run_ssh(client, "systemctl daemon-reload && systemctl enable kuikchat")
    run_ssh(client, "systemctl restart kuikchat")
    run_ssh(client, "sleep 3 && systemctl status kuikchat --no-pager -l")

    # Step 6: Configure nginx as reverse proxy with existing SSL
    print("\n### STEP 6: Nginx reverse proxy ###")
    
    # Check for SSL certs on the server
    run_ssh(client, "ls -la /opt/kuikchat/ssl/ 2>/dev/null || echo 'No SSL dir on server'")
    
    nginx_conf = """server {
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

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
"""
    run_ssh(client, f"cat > /etc/nginx/sites-available/kuikchat << 'NGINXEOF'\n{nginx_conf}NGINXEOF")
    run_ssh(client, "ln -sf /etc/nginx/sites-available/kuikchat /etc/nginx/sites-enabled/kuikchat")
    run_ssh(client, "rm -f /etc/nginx/sites-enabled/default")
    run_ssh(client, "nginx -t")
    run_ssh(client, "systemctl restart nginx")

    print("\n### DEPLOYMENT COMPLETE ###")
    print("Server should be responding at https://kuikchat.io")
    
    # Quick health check
    run_ssh(client, "curl -sk -o /dev/null -w '%{http_code}' https://localhost/ 2>/dev/null || echo 'curl check pending'")
    
    client.close()
    print("\nDone. Connection closed.")

if __name__ == "__main__":
    main()
