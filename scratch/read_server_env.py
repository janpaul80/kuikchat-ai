import os
import paramiko

HOST = "217.154.11.234"
USER = "root"
SSH_KEY_PATH = r"C:\Users\hartm\.ssh\kuikchat_deploy"

def main():
    if not os.path.exists(SSH_KEY_PATH):
        print(f"Error: SSH private key not found at {SSH_KEY_PATH}")
        return

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    key = paramiko.Ed25519Key.from_private_key_file(SSH_KEY_PATH)
    client.connect(HOST, username=USER, pkey=key, timeout=15)
    print("Connected to server successfully.")

    # Read the env file
    stdin, stdout, stderr = client.exec_command('cat /opt/kuikchat/.env.local')
    content = stdout.read().decode('utf-8', errors='replace')
    
    print("\n--- Env Var Names on Server (Values Redacted) ---")
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            name, _ = line.split('=', 1)
            print(f"{name}=******")
        else:
            print(line)
            
    client.close()

if __name__ == "__main__":
    main()
