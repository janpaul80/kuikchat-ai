#!/usr/bin/env python3
"""Deploy KuikChat - Phase 6: Just build (Next.js 14, no flags needed)."""

import sys, os, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = "217.154.11.234"
USER = "root"
PASSWORD = sys.argv[1] if len(sys.argv) > 1 else input("SSH password: ")

def run_ssh(client, cmd, timeout=600):
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

    # Stop app
    run_ssh(client, "systemctl stop kuikchat 2>/dev/null")

    # Verify state
    run_ssh(client, "cd /opt/kuikchat && git log -1 --oneline")
    run_ssh(client, "cd /opt/kuikchat && node --version && node_modules/.bin/next --version")

    # Build - Next.js 14 uses webpack by default, no flags needed
    print("\n### BUILD ###")
    exit_code, out, err = run_ssh(client, "cd /opt/kuikchat && NODE_OPTIONS='--max-old-space-size=4096' node_modules/.bin/next build 2>&1", timeout=600)
    
    if exit_code != 0:
        print(f"\nBuild FAILED with exit code {exit_code}")
        print("Checking for missing env vars or other issues...")
        run_ssh(client, "cd /opt/kuikchat && cat .env.local | grep -c '='")
        client.close()
        return

    # Verify build output
    run_ssh(client, "ls -la /opt/kuikchat/.next/BUILD_ID && cat /opt/kuikchat/.next/BUILD_ID")

    # Start app
    print("\n### START ###")
    run_ssh(client, "systemctl start kuikchat")
    print("Waiting 10s...")
    time.sleep(10)

    # Health checks
    print("\n### HEALTH CHECKS ###")
    run_ssh(client, "systemctl status kuikchat --no-pager | head -15")
    run_ssh(client, "curl -sk -o /dev/null -w 'App direct: %{http_code}\\n' http://127.0.0.1:3100/")
    run_ssh(client, "curl -sk -o /dev/null -w 'Via nginx:  %{http_code}\\n' http://127.0.0.1/")
    run_ssh(client, "curl -sk http://127.0.0.1:3100/ 2>/dev/null | head -5")
    run_ssh(client, "ss -tlnp | grep -E '(3100|80)'")
    run_ssh(client, "journalctl -u kuikchat --no-pager -n 5")

    print("\n### DONE ###")
    client.close()

if __name__ == "__main__":
    main()
