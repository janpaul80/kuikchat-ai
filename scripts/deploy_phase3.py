#!/usr/bin/env python3
"""Deploy KuikChat - Phase 3: Fix build, SSL, and start."""

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

    # Verify commit
    print("### Verify commit ###")
    run_ssh(client, "cd /opt/kuikchat && git log -1 --oneline")

    # Fix 1: SSL - assemble fullchain from actual filenames
    print("\n### FIX 1: Assemble SSL fullchain ###")
    
    # Check what kuikchat.pem actually is (key or cert?)
    run_ssh(client, "head -1 /etc/ssl/kuikchat/kuikchat.pem")
    
    # Build fullchain: cert + intermediate + root
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        cat cert_kuikchat.io.crt intermediate_kuikchat.io.crt root_kuikchat.io.crt > fullchain.pem && \
        echo "Built fullchain.pem from cert + intermediate + root" && \
        wc -l fullchain.pem""")
    
    # Set privkey - kuikchat.pem is likely the private key
    run_ssh(client, """cd /etc/ssl/kuikchat && \
        if head -1 kuikchat.pem | grep -q 'PRIVATE KEY'; then
            cp kuikchat.pem privkey.pem
            echo "kuikchat.pem is the private key - copied to privkey.pem"
        else
            echo "kuikchat.pem is NOT a private key - contents:"
            head -1 kuikchat.pem
        fi""")
    
    run_ssh(client, "chmod 600 /etc/ssl/kuikchat/privkey.pem && chmod 644 /etc/ssl/kuikchat/fullchain.pem")
    run_ssh(client, "ls -la /etc/ssl/kuikchat/")
    
    # Verify SSL files are valid
    run_ssh(client, "openssl x509 -in /etc/ssl/kuikchat/fullchain.pem -noout -subject -issuer -dates 2>&1 | head -6")
    run_ssh(client, "openssl rsa -in /etc/ssl/kuikchat/privkey.pem -check -noout 2>&1")

    # Fix 2: Build with npx
    print("\n### FIX 2: Build Next.js (using npx) ###")
    run_ssh(client, "cd /opt/kuikchat && npx next build", timeout=600)

    # Fix 3: Restart services
    print("\n### FIX 3: Restart services ###")
    
    # Stop kuikchat first
    run_ssh(client, "systemctl stop kuikchat 2>/dev/null; sleep 1")
    
    # Test nginx config
    run_ssh(client, "nginx -t")
    
    # Start nginx
    run_ssh(client, "systemctl start nginx")
    run_ssh(client, "systemctl status nginx --no-pager -l | head -15")
    
    # Start kuikchat app
    run_ssh(client, "systemctl start kuikchat")
    time.sleep(8)
    run_ssh(client, "systemctl status kuikchat --no-pager -l")

    # Health checks
    print("\n### HEALTH CHECKS ###")
    time.sleep(5)
    
    # Check app directly
    run_ssh(client, "curl -sk -o /dev/null -w 'App direct: HTTP %{http_code}\\n' http://127.0.0.1:3100/ 2>/dev/null || echo 'App not responding'")
    
    # Check nginx HTTP -> HTTPS redirect
    run_ssh(client, "curl -sk -o /dev/null -w 'HTTP redirect: %{http_code}\\n' http://127.0.0.1/ 2>/dev/null || echo 'HTTP redirect not working'")
    
    # Check nginx HTTPS
    run_ssh(client, "curl -sk -o /dev/null -w 'HTTPS: %{http_code}\\n' https://127.0.0.1/ 2>/dev/null || echo 'HTTPS not working'")
    
    # Check external
    run_ssh(client, "curl -sk -o /dev/null -w 'External HTTPS: %{http_code}\\n' https://kuikchat.io/ 2>/dev/null || echo 'External not responding'")
    
    # Show listening ports
    run_ssh(client, "ss -tlnp | grep -E '(3100|80|443)'")
    
    # Show journal for any errors
    run_ssh(client, "journalctl -u kuikchat --no-pager -n 20")

    print("\n### DEPLOYMENT COMPLETE ###")
    client.close()
    print("Done.")

if __name__ == "__main__":
    main()
