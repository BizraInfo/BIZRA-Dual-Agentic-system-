#!/bin/bash
# HSM Cluster Setup (Production)
set -euo pipefail

echo "🏦 HSM CLUSTER SETUP (PRODUCTION)"
echo "================================="

if [ ! -w "/etc" ] || [ ! -w "/var/lib" ]; then
  echo "ERROR: root access required for /etc and /var/lib"
  exit 1
fi

if [ -z "${BIZRA_HSM_CLUSTER_CONFIG_PATH:-}" ]; then
  echo "ERROR: BIZRA_HSM_CLUSTER_CONFIG_PATH must point to provisioned HSM configs"
  exit 1
fi

if [ ! -d "$BIZRA_HSM_CLUSTER_CONFIG_PATH" ]; then
  echo "ERROR: BIZRA_HSM_CLUSTER_CONFIG_PATH is not a directory"
  exit 1
fi

HSM_DIR="/etc/bizra/hsm"
VAR_DIR="/var/lib/bizra/hsm"

mkdir -p "$HSM_DIR"
mkdir -p "$VAR_DIR/keystores"

if ! compgen -G "${BIZRA_HSM_CLUSTER_CONFIG_PATH}/*.yaml" > /dev/null; then
  echo "ERROR: no HSM YAML configs found in ${BIZRA_HSM_CLUSTER_CONFIG_PATH}"
  exit 1
fi

cp "${BIZRA_HSM_CLUSTER_CONFIG_PATH}"/*.yaml "$HSM_DIR/"

if [ ! -f "${BIZRA_HSM_CLUSTER_CONFIG_PATH}/threshold_keys.json" ]; then
  echo "ERROR: threshold_keys.json missing in ${BIZRA_HSM_CLUSTER_CONFIG_PATH}"
  exit 1
fi

cp "${BIZRA_HSM_CLUSTER_CONFIG_PATH}/threshold_keys.json" "$VAR_DIR/"

echo "✅ HSM cluster configuration installed"
