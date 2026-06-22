#!/usr/bin/env python3
import sys
import os
import paramiko

HOST = "217.154.11.234"
USER = "root"
SSH_KEY_PATH = r"C:\Users\hartm\.ssh\kuikchat_deploy"

def main():
    if len(sys.argv) < 2:
        print("Usage: python run_remote.py <command>")
        sys.exit(1)
        
    cmd = " ".join(sys.argv[1:])
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        key = paramiko.Ed25519Key.from_private_key_file(SSH_KEY_PATH)
        client.connect(HOST, username=USER, pkey=key, timeout=15)
    except Exception as e:
        print(f"SSH connection failed: {e}")
        sys.exit(1)
        
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    
    if out.strip():
        print(out)
    if err.strip():
        print(f"[STDERR]\n{err}", file=sys.stderr)
        
    client.close()
    sys.exit(stdout.channel.recv_exit_status())

if __name__ == "__main__":
    main()
