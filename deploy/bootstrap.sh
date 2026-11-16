#!/usr/bin/env bash
# Create namespace-scoped deployment access.
set -euo pipefail
host="${1:?Usage: deploy/bootstrap.sh SSH_HOST PUBLIC_IP}"
ip="${2:?Usage: deploy/bootstrap.sh SSH_HOST PUBLIC_IP}"
cd "$(dirname "$0")/.."
ssh "$host" kubectl apply -f - < deploy/access.yaml
# Credentials travel only through the encrypted SSH connection and stdin to gh.
ssh "$host" bash -s -- "$ip" <<'REMOTE' | gh secret set YUNYU_KUBECONFIG --repo dayeguilaiye/yunyu
set -euo pipefail
ip="$1"
for _ in $(seq 1 30); do
  token="$(kubectl -n yunyu get secret yunyu-deployer-token -o jsonpath='{.data.token}' | base64 -d)"
  [ -n "$token" ] && break
  sleep 1
done
test -n "$token"
ca="$(kubectl -n yunyu get secret yunyu-deployer-token -o jsonpath='{.data.ca\.crt}')"
test -n "$ca"
cat <<CONFIG
apiVersion: v1
kind: Config
clusters:
  - name: yunyu
    cluster:
      server: https://${ip}:6443
      certificate-authority-data: ${ca}
      tls-server-name: kubernetes
contexts:
  - name: yunyu
    context:
      cluster: yunyu
      namespace: yunyu
      user: yunyu-deployer
current-context: yunyu
users:
  - name: yunyu-deployer
    user:
      token: ${token}
CONFIG
REMOTE
echo 'Yunyu deployment access and GitHub YUNYU_KUBECONFIG are ready.'
