#!/usr/bin/env python3
"""Deploy KuikChat - Phase 5: Fix git branch and rebuild."""

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

    # Stop the app
    run_ssh(client, "systemctl stop kuikchat 2>/dev/null")

    # Diagnose current state
    print("\n### DIAGNOSE GIT STATE ###")
    run_ssh(client, "cd /opt/kuikchat && git branch -a")
    run_ssh(client, "cd /opt/kuikchat && git log -1 --oneline")
    run_ssh(client, "cd /opt/kuikchat && cat package.json | head -5")

    # Fix: fetch all branches and checkout master
    print("\n### FIX: Checkout master branch ###")
    run_ssh(client, "cd /opt/kuikchat && git fetch origin")
    run_ssh(client, "cd /opt/kuikchat && git checkout -B master origin/master")
    run_ssh(client, "cd /opt/kuikchat && git log -1 --oneline")
    
    # Verify we have the right commit
    run_ssh(client, "cd /opt/kuikchat && head -10 package.json")
    run_ssh(client, "cd /opt/kuikchat && cat package.json | grep -E '\"next\"'")

    # Clean install
    print("\n### CLEAN NPM INSTALL ###")
    run_ssh(client, "cd /opt/kuikchat && rm -rf node_modules .next")
    run_ssh(client, "cd /opt/kuikchat && npm ci 2>&1", timeout=300)
    
    # Verify next exists
    run_ssh(client, "cd /opt/kuikchat && ls -la node_modules/.bin/next && echo 'next binary OK'")

    # Build
    print("\n### BUILD ###")
    exit_code, out, err = run_ssh(client, "cd /opt/kuikchat && node_modules/.bin/next build --no-turbopack 2>&1", timeout=600)
    
    if exit_code != 0:
        print("Standard build failed, trying with more memory...")
        run_ssh(client, "cd /opt/kuikchat && NODE_OPTIONS='--max-old-space-size=4096' node_modules/.bin/next build --no-turbopack 2>&1", timeout=600)

    # Re-upload .env.local (make sure it's still there)
    run_ssh(client, "test -f /opt/kuikchat/.env.local && echo 'ENV exists' || echo 'ENV missing!'")

    # Start the app
    print("\n### START APP ###")
    run_ssh(client, "systemctl start kuikchat")
    print("Waiting 10s for app to start...")
    time.sleep(10)
    
    # Health checks
    print("\n### HEALTH CHECKS ###")
    run_ssh(client, "systemctl status kuikchat --no-pager -l | head -20")
    run_ssh(client, "curl -sk -o /dev/null -w 'App: HTTP %{http_code}\\n' http://127.0.0.1:3100/")
    run_ssh(client, "curl -sk -o /dev/null -w 'Nginx: HTTP %{http_code}\\n' http://127.0.0.1/")
    run_ssh(client, "ss -tlnp | grep -E '(3100|80|443)'")
    run_ssh(client, "journalctl -u kuikchat --no-pager -n 10")

    print("\n### DONE ###")
    client.close()

if __name__ == "__main__":
    main()
