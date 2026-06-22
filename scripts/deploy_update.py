#!/usr/bin/env python3
import sys, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = "217.154.11.234"
USER = "root"
PASSWORD = os.getenv("DEPLOY_SSH_PASSWORD") or (sys.argv[1] if len(sys.argv) > 1 else "")

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
    
    # Check Next.js status
    stdin, stdout, stderr = client.exec_command('systemctl status kuikchat --no-pager | head -n 15')
    print("=== STATUS ===")
    print(stdout.read().decode('utf-8', errors='replace'))
    
    # Check Next.js logs
    stdin, stdout, stderr = client.exec_command('journalctl -u kuikchat -n 150 --no-pager')
    print("=== LOGS ===")
    print(stdout.read().decode('utf-8', errors='replace'))
    
    client.close()

if __name__ == "__main__":
    main()
