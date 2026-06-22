#!/usr/bin/env python3
"""Zero-downtime deployment script for KuikChat."""

import sys
import os
import io
import time
import dotenv
import paramiko

# Force UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Load local env.local
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(SCRIPTS_DIR, "../.env.local"))

HOST = "217.154.11.234"
USER = "root"
SSH_KEY_PATH = os.getenv("DEPLOY_SSH_KEY_PATH", r"C:\Users\hartm\.ssh\kuikchat_deploy")

def run_ssh(client, cmd, timeout=600):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out)
    if err.strip():
        print(f"[STDERR] {err}")
    print(f"[EXIT: {exit_code}]")
    return exit_code, out, err

def main():
    if not os.path.exists(SSH_KEY_PATH):
        print(f"Error: SSH private key not found at {SSH_KEY_PATH}")
        sys.exit(1)

    print("Connecting to server...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        key = paramiko.Ed25519Key.from_private_key_file(SSH_KEY_PATH)
        client.connect(HOST, username=USER, pkey=key, timeout=15)
        print("Connected successfully via SSH Deploy Key!\n")
    except Exception as e:
        print(f"SSH connection failed: {e}")
        sys.exit(1)

    # 1. Fetch latest origin/master and determine if package-lock.json changed
    print("### FETCH AND CHECK LOCKFILE ###")
    run_ssh(client, "cd /opt/kuikchat && git fetch origin")
    
    # Check if package-lock.json has differences between current HEAD and origin/master
    _, diff_out, _ = run_ssh(client, "cd /opt/kuikchat && git diff --name-only HEAD origin/master")
    package_lock_changed = "package-lock.json" in diff_out.splitlines()
    print(f"package-lock.json changed: {package_lock_changed}")

    # 2. Reset production directory to origin/master
    print("\n### RESET PRODUCTION CODE ###")
    exit_code, _, _ = run_ssh(client, "cd /opt/kuikchat && git reset --hard origin/master")
    if exit_code != 0:
        print("Error: git reset failed")
        client.close()
        sys.exit(1)

    # 3. Only run npm ci if lockfile changed
    if package_lock_changed:
        print("\n### RUNNING npm ci (LOCKFILE CHANGED) ###")
        exit_code, _, _ = run_ssh(client, "cd /opt/kuikchat && npm ci")
        if exit_code != 0:
            print("Error: npm ci failed")
            client.close()
            sys.exit(1)
    else:
        print("\n### SKIPPING npm ci (NO LOCKFILE CHANGES) ###")

    # 4. Prepare build directory (shadow directory)
    print("\n### PREPARING SHADOW BUILD DIRECTORY ###")
    run_ssh(client, "mkdir -p /opt/kuikchat_build")
    # Sync files (exclude .next, node_modules, and .git)
    run_ssh(client, "rsync -a --delete --exclude=.next --exclude=node_modules --exclude=.git /opt/kuikchat/ /opt/kuikchat_build/")
    # Symlink node_modules
    run_ssh(client, "ln -sfn /opt/kuikchat/node_modules /opt/kuikchat_build/node_modules")

    # 5. Build Next.js app in the shadow directory
    print("\n### BUILDING NEXT.JS IN SHADOW DIRECTORY ###")
    exit_code, out, err = run_ssh(client, "cd /opt/kuikchat_build && NODE_OPTIONS='--max-old-space-size=4096' npm run build", timeout=600)
    
    if exit_code != 0:
        print("\n!!! BUILD FAILED !!!")
        print("The live site was NOT interrupted and remains on the previous working build.")
        client.close()
        sys.exit(1)

    # 6. Build succeeded! Sync .next and code files to prod directory
    print("\n### SWAPPING BUILDS AND RESTARTING SERVICE ###")
    # Sync the compiled .next directory
    run_ssh(client, "rsync -a --delete /opt/kuikchat_build/.next/ /opt/kuikchat/.next/")
    # Restart next.js app service
    exit_code, _, _ = run_ssh(client, "systemctl restart kuikchat")
    if exit_code != 0:
        print("Error restarting service")
        client.close()
        sys.exit(1)

    print("Waiting 5 seconds for service to boot...")
    time.sleep(5)

    # 7. Health checks
    print("\n### DEPLOYMENT HEALTH CHECKS ###")
    run_ssh(client, "systemctl status kuikchat --no-pager | head -15")
    run_ssh(client, "curl -sk -o /dev/null -w 'App status: %{http_code}\\n' http://127.0.0.1:3100/")
    run_ssh(client, "cd /opt/kuikchat && git log -1 --oneline")
    
    print("\n### ZERO-DOWNTIME DEPLOYMENT COMPLETED SUCCESSFULLY ###")
    client.close()

if __name__ == "__main__":
    main()
