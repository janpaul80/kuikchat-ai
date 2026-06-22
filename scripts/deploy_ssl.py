#!/usr/bin/env python3
"""Upload new SSL key and enable HTTPS."""

import sys, os, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = "217.154.11.234"
USER = "root"
PASSWORD = sys.argv[1] if len(sys.argv) > 1 else input("SSH password: ")

def run_ssh(client, cmd, timeout=60):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.recv_exit_status()
    if out.strip(): print(out)
    if err.strip(): print(f"[STDERR] {err}")
    print(f"[EXIT: {exit_code}]")
    return exit_code, out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
    print("Connected!\n")

    # Upload updated key
    ssl_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ssl')
    pem_path = os.path.join(ssl_dir, 'kuikchat.pem')
    
    sftp = client.open_sftp()
    sftp.put(pem_path, '/etc/ssl/kuikchat/kuikchat.pem')
    sftp.close()
    print("Uploaded updated kuikchat.pem")

    # Copy to privkey.pem
    run_ssh(client, "cp /etc/ssl/kuikchat/kuikchat.pem /etc/ssl/kuikchat/privkey.pem && chmod 600 /etc/ssl/kuikchat/privkey.pem")

    # Verify match
    print("\n### VERIFY CERT-KEY MATCH ###")
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        CERT_MOD=$(openssl x509 -noout -modulus -in cert_kuikchat.io.crt 2>/dev/null | md5sum) && \
        KEY_MOD=$(openssl pkey -noout -modulus -in privkey.pem 2>/dev/null | md5sum) && \
        echo "Cert: $CERT_MOD" && \
        echo "Key:  $KEY_MOD" && \
        if [ "$CERT_MOD" = "$KEY_MOD" ]; then
            echo "MATCH"
        else
            echo "MISMATCH"
        fi""")

    # Rebuild fullchain
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        cat cert_kuikchat.io.crt intermediate_kuikchat.io.crt > fullchain.pem && \
        chmod 644 fullchain.pem && \
        echo "Rebuilt fullchain.pem"
    """)

    # Restore HTTPS nginx config
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

    # Test and restart nginx
    print("\n### NGINX ###")
    exit_code, _, _ = run_ssh(client, "nginx -t")
    if exit_code == 0:
        run_ssh(client, "systemctl restart nginx")
        print("Nginx restarted with HTTPS!")
    else:
        print("nginx -t FAILED - keeping HTTP-only")
        client.close()
        return

    time.sleep(3)

    # Health checks
    print("\n### HEALTH CHECKS ###")
    run_ssh(client, "curl -sk -o /dev/null -w 'HTTP:  %{http_code}\\n' http://127.0.0.1/")
    run_ssh(client, "curl -sk -o /dev/null -w 'HTTPS: %{http_code}\\n' https://127.0.0.1/")
    run_ssh(client, "curl -sk -o /dev/null -w 'External: %{http_code}\\n' https://kuikchat.io/")
    run_ssh(client, "ss -tlnp | grep -E '(3100|80|443)'")

    print("\n### DONE ###")
    client.close()

if __name__ == "__main__":
    main()
