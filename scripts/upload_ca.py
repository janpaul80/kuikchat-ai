#!/usr/bin/env python3
"""
Upload Supabase DB root CA to the production server and restart the app.
- Reads DEPLOY_SSH_PASSWORD from .env.local if present.
- Usage:
    python scripts/upload_ca.py <local_ca_path>
Example:
    python scripts/upload_ca.py ssl/supabase-root-ca.crt
"""
import sys, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import paramiko

def load_password():
    pw = os.getenv('DEPLOY_SSH_PASSWORD')
    if pw:
        return pw
    # try reading from .env.local
    try:
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8', errors='replace') as f:
                for raw in f:
                    line = raw.strip()
                    if not line or line.startswith('#'):
                        continue
                    if line.startswith('DEPLOY_SSH_PASSWORD='):
                        return line.split('=', 1)[1].strip().strip('"').strip("'")
    except Exception:
        pass
    if len(sys.argv) > 2 and sys.argv[2].strip():
        return sys.argv[2].strip()
    return input('SSH password: ')

def run_ssh(client, cmd, timeout=120):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out)
    if err.strip():
        print('[STDERR]', err)
    print(f'[EXIT {code}]')
    return code, out, err


def main():
    if len(sys.argv) < 2:
        print('Usage: python scripts/upload_ca.py <local_ca_path>')
        sys.exit(1)
    local_path = sys.argv[1]
    if not os.path.isabs(local_path):
        local_path = os.path.abspath(local_path)
    if not os.path.exists(local_path):
        print(f'Error: local CA file not found: {local_path}')
        sys.exit(1)

    HOST = '217.154.11.234'
    USER = 'root'
    PASSWORD = load_password()

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f'Connecting to {USER}@{HOST}...')
    client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
    print('Connected!')

    # Ensure target dir exists
    run_ssh(client, 'mkdir -p /opt/kuikchat/ssl && chown root:root /opt/kuikchat/ssl && chmod 755 /opt/kuikchat/ssl')

    # Upload via SFTP
    sftp = client.open_sftp()
    remote_path = '/opt/kuikchat/ssl/supabase-root-ca.crt'
    print(f'Uploading {local_path} -> {remote_path}')
    sftp.put(local_path, remote_path)
    sftp.chmod(remote_path, 0o644)
    sftp.close()

    # Quick verification
    run_ssh(client, 'ls -la /opt/kuikchat/ssl && sha256sum /opt/kuikchat/ssl/supabase-root-ca.crt')

    # Restart service to pick up CA file location usage
    run_ssh(client, 'systemctl restart kuikchat && sleep 2 && systemctl status kuikchat --no-pager -l | head -20')

    client.close()
    print('Done.')

if __name__ == '__main__':
    main()
