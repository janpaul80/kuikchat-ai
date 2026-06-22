#!/usr/bin/env python3
import sys, io, os, dotenv
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(SCRIPTS_DIR, "../.env.local"))

HOST = "217.154.11.234"
USER = "root"
SSH_KEY_PATH = os.getenv("DEPLOY_SSH_KEY_PATH", r"C:\Users\hartm\.ssh\kuikchat_deploy")

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    key = paramiko.Ed25519Key.from_private_key_file(SSH_KEY_PATH)
    client.connect(HOST, username=USER, pkey=key, timeout=15)
    
    print("Patching Nginx...")
    nginx_patch = """
    sed -i '/proxy_pass http:\\/\\/127.0.0.1:3100;/a \\
        proxy_buffer_size   128k;\\
        proxy_buffers   4 256k;\\
        proxy_busy_buffers_size   256k;' /etc/nginx/sites-available/kuikchat
    """
    
    stdin, stdout, stderr = client.exec_command('grep proxy_buffer_size /etc/nginx/sites-available/kuikchat')
    out = stdout.read().decode().strip()
    
    if "proxy_buffer_size" not in out:
        client.exec_command(nginx_patch)
        print("Patched.")
    else:
        print("Already patched.")
        
    client.exec_command('systemctl restart nginx')
    print("Nginx restarted.")
    client.close()

if __name__ == "__main__":
    main()
