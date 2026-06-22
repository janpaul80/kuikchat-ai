#!/usr/bin/env python3
"""Deploy KuikChat to production - Phase 2: configure, build, start."""

import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import paramiko

HOST = "217.154.11.234"
USER = "root"
PASSWORD = sys.argv[1] if len(sys.argv) > 1 else input("SSH password: ")

def run_ssh(client, cmd, timeout=300):
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

    # Step 1: Fix branch - GitHub default might be 'main', we pushed to 'master'
    print("\n### STEP 1: Fix branch ###")
    run_ssh(client, "cd /opt/kuikchat && git branch -a")
    run_ssh(client, "cd /opt/kuikchat && git fetch origin master")
    run_ssh(client, "cd /opt/kuikchat && git checkout master 2>/dev/null || git checkout -b master origin/master")
    run_ssh(client, "cd /opt/kuikchat && git reset --hard origin/master")
    exit_code, out, _ = run_ssh(client, "cd /opt/kuikchat && git log -1 --oneline")
    print(f"\n>>> Current commit: {out.strip()}")

    # Step 2: Upload .env.local via SFTP
    print("\n### STEP 2: Upload .env.local ###")
    env_local_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
    
    # Read local .env.local but update the server IP and remove the VPS credentials section
    with open(env_local_path, 'r') as f:
        env_content = f.read()
    
    # Update for production: change the old IP to the production server IP
    # and add PORT=3100 for Next.js
    env_lines = []
    skip_vps = False
    for line in env_content.splitlines():
        # Skip VPS server credentials - they don't belong in the app env
        if line.strip().startswith('# VPS Server'):
            skip_vps = True
            continue
        if skip_vps and line.strip().startswith(('IP_ADDRESS=', 'PORT=', 'USERNAME=', 'PASSWORD=')):
            continue
        if skip_vps and line.strip() == '':
            skip_vps = False
            continue
        env_lines.append(line)
    
    # Add production-specific vars
    env_lines.append('')
    env_lines.append('# Production')
    env_lines.append('PORT=3100')
    env_lines.append('NODE_ENV=production')
    
    prod_env = '\n'.join(env_lines) + '\n'
    
    sftp = client.open_sftp()
    with sftp.file('/opt/kuikchat/.env.local', 'w') as f:
        f.write(prod_env)
    sftp.close()
    print("Uploaded .env.local to server (without VPS credentials)")
    
    # Verify
    run_ssh(client, "wc -l /opt/kuikchat/.env.local && echo '---' && grep -c '=' /opt/kuikchat/.env.local")

    # Step 3: Set up PostgreSQL database
    print("\n### STEP 3: PostgreSQL setup ###")
    # Check if kuikchat DB already exists
    exit_code, out, _ = run_ssh(client, "sudo -u postgres psql -lqt | cut -d \\| -f 1 | grep -qw kuikchat && echo 'DB EXISTS' || echo 'NO DB'")
    
    if "NO DB" in out:
        print("Creating kuikchat database and user...")
        run_ssh(client, """sudo -u postgres psql -c "CREATE USER kuikchat WITH PASSWORD 'kuikchat_prod_2026';" 2>/dev/null || echo 'user may already exist'""")
        run_ssh(client, """sudo -u postgres psql -c "CREATE DATABASE kuikchat OWNER kuikchat;" 2>/dev/null || echo 'db may already exist'""")
        run_ssh(client, """sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kuikchat TO kuikchat;" """)
        print("Database created.")
    else:
        print("Database already exists.")

    # Step 4: Upload SSL certs
    print("\n### STEP 4: SSL certificates ###")
    run_ssh(client, "mkdir -p /etc/ssl/kuikchat")
    
    # Check what SSL files we have locally
    ssl_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ssl')
    if os.path.isdir(ssl_dir):
        sftp = client.open_sftp()
        for fname in os.listdir(ssl_dir):
            local_path = os.path.join(ssl_dir, fname)
            if os.path.isfile(local_path):
                remote_path = f"/etc/ssl/kuikchat/{fname}"
                print(f"  Uploading {fname} -> {remote_path}")
                sftp.put(local_path, remote_path)
        sftp.close()
        run_ssh(client, "ls -la /etc/ssl/kuikchat/")
        run_ssh(client, "chmod 600 /etc/ssl/kuikchat/*.key 2>/dev/null; chmod 644 /etc/ssl/kuikchat/*.pem 2>/dev/null; chmod 644 /etc/ssl/kuikchat/*.crt 2>/dev/null")
    else:
        print(f"WARNING: No local ssl/ directory found at {ssl_dir}")

    # Step 5: Assemble fullchain if needed
    print("\n### STEP 5: Assemble SSL fullchain ###")
    exit_code, out, _ = run_ssh(client, "ls /etc/ssl/kuikchat/")
    print(f"SSL files on server: {out.strip()}")
    
    # Try to build fullchain from available certs
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        if [ -f fullchain.pem ]; then
            echo 'fullchain.pem already exists'
        elif [ -f certificate.crt ] && [ -f ca_bundle.crt ]; then
            cat certificate.crt ca_bundle.crt > fullchain.pem
            echo 'Built fullchain from certificate.crt + ca_bundle.crt'
        elif [ -f kuikchat_io.crt ] && [ -f kuikchat_io.ca-bundle ]; then
            cat kuikchat_io.crt kuikchat_io.ca-bundle > fullchain.pem
            echo 'Built fullchain from kuikchat_io.crt + ca-bundle'
        else
            echo 'WARNING: Could not auto-assemble fullchain.pem - check SSL files manually'
        fi
    """)
    
    # Find the key file
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        if [ -f privkey.pem ]; then
            echo 'privkey.pem exists'
        elif [ -f private.key ]; then
            cp private.key privkey.pem
            echo 'Copied private.key -> privkey.pem'
        elif [ -f kuikchat_io.key ]; then
            cp kuikchat_io.key privkey.pem
            echo 'Copied kuikchat_io.key -> privkey.pem'
        else
            ls *.key 2>/dev/null | head -1 | xargs -I{} cp {} privkey.pem
            echo 'Copied first .key file -> privkey.pem'
        fi
    """)

    # Step 6: Build Next.js
    print("\n### STEP 6: Build ###")
    run_ssh(client, "cd /opt/kuikchat && npm run build", timeout=600)

    # Step 7: Set up systemd service
    print("\n### STEP 7: Systemd service ###")
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
    sftp = client.open_sftp()
    with sftp.file('/etc/systemd/system/kuikchat.service', 'w') as f:
        f.write(service_unit)
    sftp.close()
    
    run_ssh(client, "systemctl daemon-reload && systemctl enable kuikchat")
    run_ssh(client, "systemctl restart kuikchat")
    import time
    time.sleep(5)
    run_ssh(client, "systemctl status kuikchat --no-pager -l")

    # Step 8: Configure nginx
    print("\n### STEP 8: Nginx reverse proxy ###")
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
    sftp = client.open_sftp()
    with sftp.file('/etc/nginx/sites-available/kuikchat', 'w') as f:
        f.write(nginx_conf)
    sftp.close()
    
    run_ssh(client, "ln -sf /etc/nginx/sites-available/kuikchat /etc/nginx/sites-enabled/kuikchat")
    run_ssh(client, "rm -f /etc/nginx/sites-enabled/default")
    run_ssh(client, "nginx -t")
    run_ssh(client, "systemctl restart nginx")

    # Step 9: Health check
    print("\n### STEP 9: Health check ###")
    import time
    time.sleep(3)
    run_ssh(client, "curl -sk -o /dev/null -w 'HTTP %{http_code}' http://127.0.0.1:3100/ 2>/dev/null || echo 'App not responding yet'")
    run_ssh(client, "curl -sk -o /dev/null -w 'HTTPS %{http_code}' https://127.0.0.1/ 2>/dev/null || echo 'Nginx/SSL not responding yet'")
    run_ssh(client, "ss -tlnp | grep -E '(3100|80|443)'")

    print("\n### DEPLOYMENT COMPLETE ###")
    print("Server should be responding at https://kuikchat.io")
    
    client.close()
    print("\nDone.")

if __name__ == "__main__":
    main()
