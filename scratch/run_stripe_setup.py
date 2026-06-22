import os
import paramiko

HOST = "217.154.11.234"
USER = "root"
SSH_KEY_PATH = r"C:\Users\hartm\.ssh\kuikchat_deploy"

def run_ssh(client, cmd, timeout=60):
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
        return

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    key = paramiko.Ed25519Key.from_private_key_file(SSH_KEY_PATH)
    client.connect(HOST, username=USER, pkey=key, timeout=15)
    print("Connected to server successfully.")

    # 1. Pull latest code so script is up to date
    print("\n### PULLING LATEST CODE ###")
    run_ssh(client, "cd /opt/kuikchat && git fetch origin && git reset --hard origin/master")

    # 2. Run create_stripe_prices.mjs
    print("\n### RUNNING create_stripe_prices.mjs ###")
    run_ssh(client, "cd /opt/kuikchat && node scripts/create_stripe_prices.mjs")

    # 3. Print env var names (redacted) to confirm everything is set
    print("\n### VERIFYING ENV VARS ON SERVER ###")
    run_ssh(client, r"grep -E '^(STRIPE_|DATABASE_)' /opt/kuikchat/.env.local | sed 's/=.*/=******/'")

    client.close()

if __name__ == "__main__":
    main()
