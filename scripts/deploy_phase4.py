#!/usr/bin/env python3
"""Deploy KuikChat - Phase 4: Fix build (no turbopack), SSL key match, systemd PATH."""

import sys
import os
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import paramiko

HOST = "217.154.11.234"
USER = "root"
PASSWORD = sys.argv[1] if len(sys.argv) > 1 else input("SSH password: ")

def run_ssh(client, cmd, timeout=600):
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

    # Stop services first to free resources for build
    print("### Stopping services ###")
    run_ssh(client, "systemctl stop kuikchat 2>/dev/null; systemctl stop nginx 2>/dev/null")

    # FIX 1: SSL - verify key/cert match on the server
    print("\n### FIX 1: SSL key-cert verification ###")
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        CERT_MOD=$(openssl x509 -noout -modulus -in cert_kuikchat.io.crt 2>/dev/null | md5sum) && \
        KEY_MOD=$(openssl rsa -noout -modulus -in kuikchat.pem 2>/dev/null | md5sum) && \
        echo "Cert modulus hash: $CERT_MOD" && \
        echo "Key  modulus hash: $KEY_MOD" && \
        if [ "$CERT_MOD" = "$KEY_MOD" ]; then
            echo "MATCH - cert and key correspond"
        else
            echo "MISMATCH - cert and key do NOT correspond"
        fi""")
    
    # Check cert details
    run_ssh(client, "openssl x509 -in /etc/ssl/kuikchat/cert_kuikchat.io.crt -noout -subject -issuer -dates")
    
    # Rebuild fullchain properly: cert + intermediate (no root needed for most clients)
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        cat cert_kuikchat.io.crt intermediate_kuikchat.io.crt > fullchain.pem && \
        cp kuikchat.pem privkey.pem && \
        chmod 644 fullchain.pem && chmod 600 privkey.pem && \
        echo "Rebuilt fullchain (cert + intermediate) and privkey"
    """)
    
    # Test SSL pair
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        CERT_MOD=$(openssl x509 -noout -modulus -in fullchain.pem 2>/dev/null | md5sum) && \
        KEY_MOD=$(openssl rsa -noout -modulus -in privkey.pem 2>/dev/null | md5sum) && \
        echo "Fullchain modulus: $CERT_MOD" && \
        echo "Privkey modulus:   $KEY_MOD" && \
        if [ "$CERT_MOD" = "$KEY_MOD" ]; then
            echo "MATCH"
        else
            echo "MISMATCH"
        fi""")

    # FIX 2: Build - use --no-turbopack flag to avoid workspace root issue
    print("\n### FIX 2: Build Next.js (without Turbopack) ###")
    
    # First, make sure npm ci was done properly
    run_ssh(client, "cd /opt/kuikchat && ls node_modules/.bin/next && echo 'next binary exists'")
    
    # Build without turbopack (webpack)
    exit_code, out, err = run_ssh(client, "cd /opt/kuikchat && node_modules/.bin/next build --no-turbopack 2>&1", timeout=600)
    
    if exit_code != 0:
        print("Build failed! Checking for common issues...")
        # Try with NODE_OPTIONS to increase memory
        run_ssh(client, "cd /opt/kuikchat && NODE_OPTIONS='--max-old-space-size=4096' node_modules/.bin/next build --no-turbopack 2>&1", timeout=600)

    # FIX 3: Systemd service with correct PATH
    print("\n### FIX 3: Systemd service with correct PATH ###")
    service_unit = """[Unit]
Description=KuikChat Next.js App
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/kuikchat
EnvironmentFile=/opt/kuikchat/.env.local
ExecStart=/opt/kuikchat/node_modules/.bin/next start -p 3100
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3100
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/kuikchat/node_modules/.bin

[Install]
WantedBy=multi-user.target
"""
    sftp = client.open_sftp()
    with sftp.file('/etc/systemd/system/kuikchat.service', 'w') as f:
        f.write(service_unit)
    sftp.close()
    
    run_ssh(client, "systemctl daemon-reload")

    # Start services
    print("\n### Starting services ###")
    
    # Test nginx config
    exit_code, _, _ = run_ssh(client, "nginx -t")
    if exit_code == 0:
        run_ssh(client, "systemctl start nginx")
        print("Nginx started.")
    else:
        print("WARNING: nginx config test failed - starting without SSL")
        # Start nginx with just HTTP for now
        nginx_http_only = """server {
    listen 80;
    server_name kuikchat.io www.kuikchat.io _;

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
        sftp = client.open_sftp()
        with sftp.file('/etc/nginx/sites-available/kuikchat', 'w') as f:
            f.write(nginx_http_only)
        sftp.close()
        run_ssh(client, "nginx -t && systemctl start nginx")
    
    # Start app
    run_ssh(client, "systemctl start kuikchat")
    print("Waiting 10s for app to start...")
    time.sleep(10)
    
    # Health checks
    print("\n### HEALTH CHECKS ###")
    run_ssh(client, "systemctl status kuikchat --no-pager -l | head -20")
    run_ssh(client, "systemctl status nginx --no-pager -l | head -15")
    run_ssh(client, "curl -sk -o /dev/null -w 'App: HTTP %{http_code}\\n' http://127.0.0.1:3100/")
    run_ssh(client, "curl -sk -o /dev/null -w 'Nginx HTTP: %{http_code}\\n' http://127.0.0.1/")
    run_ssh(client, "curl -sk -o /dev/null -w 'Nginx HTTPS: %{http_code}\\n' https://127.0.0.1/ 2>/dev/null || echo 'HTTPS not available'")
    run_ssh(client, "ss -tlnp | grep -E '(3100|80|443)'")
    
    print("\n### DONE ###")
    client.close()

if __name__ == "__main__":
    main()
