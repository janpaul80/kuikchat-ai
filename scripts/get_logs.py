import paramiko
import os
import dotenv

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(SCRIPTS_DIR, "../.env.local"))

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())

key_path = os.getenv("DEPLOY_SSH_KEY_PATH", r"C:\Users\hartm\.ssh\kuikchat_deploy")
key = paramiko.Ed25519Key.from_private_key_file(key_path)

c.connect('217.154.11.234', username='root', pkey=key)
_, stdout, _ = c.exec_command('journalctl -u kuikchat -n 100 --no-pager')
print(stdout.read().decode())
c.close()
