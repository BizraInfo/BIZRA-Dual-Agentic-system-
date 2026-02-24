#!/bin/bash
# deploy_monitoring.sh
# Status: OPERATIONAL_OBSERVABILITY_V1
# BIZRA v9.0 Monitoring Stack Deployment

set -e

echo "📊 Deploying Performance Monitoring Dashboard"
echo "============================================"

PROMETHEUS_DIR="/etc/prometheus"
GRAFANA_DIR="/etc/grafana"
BIZRA_MONITOR_PORT=9092

# Create directories
mkdir -p "$PROMETHEUS_DIR"
mkdir -p "$GRAFANA_DIR/provisioning/dashboards"
mkdir -p "$GRAFANA_DIR/provisioning/datasources"
mkdir -p "$GRAFANA_DIR/dashboards"

# Install dependencies if not present
install_monitoring_stack() {
    if ! command -v prometheus &> /dev/null; then
        echo "📥 Installing Prometheus..."
        apt-get update -qq
        apt-get install -y prometheus
    fi
    
    if ! command -v grafana-server &> /dev/null; then
        echo "📥 Installing Grafana..."
        apt-get install -y apt-transport-https software-properties-common
        wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
        echo "deb https://packages.grafana.com/oss/deb stable main" | tee /etc/apt/sources.list.d/grafana.list
        apt-get update -qq
        apt-get install -y grafana
    fi
}

# Create Prometheus configuration
cat > "$PROMETHEUS_DIR/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/bizra_rules.yml

scrape_configs:
  - job_name: 'bizra-node'
    static_configs:
      - targets: ['localhost:9091']
    metrics_path: '/metrics'
    scrape_interval: 10s
    
  - job_name: 'bizra-monitor'
    static_configs:
      - targets: ['localhost:9092']
    metrics_path: '/metrics'
    
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF

# Create BIZRA alert rules
cat > "$PROMETHEUS_DIR/bizra_rules.yml" << 'EOF'
groups:
  - name: bizra_critical
    rules:
      - alert: ChainIntegrityViolation
        expr: bizra_chain_integrity_violations_total > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Chain integrity violation detected"
          description: "Receipt chain has {{ $value }} integrity violations"
          
      - alert: SignatureVerificationFailure
        expr: rate(bizra_signature_failures_total[5m]) > 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Signature verification failures detected"
          description: "Signature failure rate: {{ $value }}/sec"
          
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis persistence layer is not responding"

  - name: bizra_warnings
    rules:
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes{job="bizra-node"} > 8e9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on BIZRA node"
          description: "Memory usage: {{ humanize $value }}"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(bizra_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High request latency"
          description: "p95 latency: {{ $value }}s"
          
      - alert: PatternCompilationFailure
        expr: rate(bizra_pattern_compilation_failures_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Pattern compilation failures"
          description: "Failure rate: {{ $value }}/sec"

  - name: bizra_performance
    rules:
      - alert: LowOptimizationRate
        expr: bizra_pattern_optimization_ratio < 0.3
        for: 10m
        labels:
          severity: info
        annotations:
          summary: "Low pattern optimization rate"
          description: "Only {{ $value | humanizePercentage }} of patterns optimized"
EOF

# Create Grafana datasource config
cat > "$GRAFANA_DIR/provisioning/datasources/prometheus.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
    editable: false
EOF

# Create Grafana dashboard provisioning
cat > "$GRAFANA_DIR/provisioning/dashboards/bizra.yml" << 'EOF'
apiVersion: 1

providers:
  - name: 'BIZRA Dashboards'
    orgId: 1
    folder: 'BIZRA'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/dashboards
EOF

# Create BIZRA dashboard
cat > "$GRAFANA_DIR/dashboards/bizra-overview.json" << 'EOF'
{
  "annotations": {"list": []},
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "panels": [
    {
      "datasource": {"type": "prometheus", "uid": "prometheus"},
      "fieldConfig": {
        "defaults": {"color": {"mode": "palette-classic"}, "mappings": [], "thresholds": {"mode": "absolute", "steps": [{"color": "green", "value": null}]}, "unit": "short"},
        "overrides": []
      },
      "gridPos": {"h": 4, "w": 6, "x": 0, "y": 0},
      "id": 1,
      "options": {"colorMode": "value", "graphMode": "area", "justifyMode": "auto", "orientation": "auto", "reduceOptions": {"calcs": ["lastNotNull"], "fields": "", "values": false}, "textMode": "auto"},
      "pluginVersion": "10.0.0",
      "targets": [{"expr": "bizra_chain_height", "legendFormat": "Chain Height", "refId": "A"}],
      "title": "Chain Height",
      "type": "stat"
    },
    {
      "datasource": {"type": "prometheus", "uid": "prometheus"},
      "fieldConfig": {
        "defaults": {"color": {"mode": "palette-classic"}, "mappings": [], "thresholds": {"mode": "absolute", "steps": [{"color": "green", "value": null}, {"color": "red", "value": 1}]}, "unit": "short"},
        "overrides": []
      },
      "gridPos": {"h": 4, "w": 6, "x": 6, "y": 0},
      "id": 2,
      "options": {"colorMode": "value", "graphMode": "none", "justifyMode": "auto", "orientation": "auto", "reduceOptions": {"calcs": ["lastNotNull"], "fields": "", "values": false}, "textMode": "auto"},
      "pluginVersion": "10.0.0",
      "targets": [{"expr": "bizra_chain_integrity_violations_total", "legendFormat": "Violations", "refId": "A"}],
      "title": "Chain Violations",
      "type": "stat"
    },
    {
      "datasource": {"type": "prometheus", "uid": "prometheus"},
      "fieldConfig": {
        "defaults": {"color": {"mode": "palette-classic"}, "mappings": [], "thresholds": {"mode": "absolute", "steps": [{"color": "green", "value": null}]}, "unit": "bytes"},
        "overrides": []
      },
      "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
      "id": 3,
      "options": {"colorMode": "value", "graphMode": "area", "justifyMode": "auto", "orientation": "auto", "reduceOptions": {"calcs": ["lastNotNull"], "fields": "", "values": false}, "textMode": "auto"},
      "pluginVersion": "10.0.0",
      "targets": [{"expr": "process_resident_memory_bytes{job=\"bizra-node\"}", "legendFormat": "Memory", "refId": "A"}],
      "title": "Memory Usage",
      "type": "stat"
    },
    {
      "datasource": {"type": "prometheus", "uid": "prometheus"},
      "fieldConfig": {
        "defaults": {"color": {"mode": "palette-classic"}, "custom": {"axisBorderShow": false, "axisCenteredZero": false, "axisColorMode": "text", "axisLabel": "", "axisPlacement": "auto", "barAlignment": 0, "drawStyle": "line", "fillOpacity": 10, "gradientMode": "none", "hideFrom": {"legend": false, "tooltip": false, "viz": false}, "insertNulls": false, "lineInterpolation": "smooth", "lineWidth": 1, "pointSize": 5, "scaleDistribution": {"type": "linear"}, "showPoints": "never", "spanNulls": false, "stacking": {"group": "A", "mode": "none"}, "thresholdsStyle": {"mode": "off"}}, "mappings": [], "thresholds": {"mode": "absolute", "steps": [{"color": "green", "value": null}]}, "unit": "s"},
        "overrides": []
      },
      "gridPos": {"h": 8, "w": 12, "x": 0, "y": 4},
      "id": 4,
      "options": {"legend": {"calcs": [], "displayMode": "list", "placement": "bottom", "showLegend": true}, "tooltip": {"mode": "single", "sort": "none"}},
      "pluginVersion": "10.0.0",
      "targets": [{"expr": "histogram_quantile(0.95, rate(bizra_request_duration_seconds_bucket[5m]))", "legendFormat": "p95 Latency", "refId": "A"}, {"expr": "histogram_quantile(0.50, rate(bizra_request_duration_seconds_bucket[5m]))", "legendFormat": "p50 Latency", "refId": "B"}],
      "title": "Request Latency",
      "type": "timeseries"
    },
    {
      "datasource": {"type": "prometheus", "uid": "prometheus"},
      "fieldConfig": {
        "defaults": {"color": {"mode": "palette-classic"}, "custom": {"axisBorderShow": false, "axisCenteredZero": false, "axisColorMode": "text", "axisLabel": "", "axisPlacement": "auto", "barAlignment": 0, "drawStyle": "line", "fillOpacity": 10, "gradientMode": "none", "hideFrom": {"legend": false, "tooltip": false, "viz": false}, "insertNulls": false, "lineInterpolation": "smooth", "lineWidth": 1, "pointSize": 5, "scaleDistribution": {"type": "linear"}, "showPoints": "never", "spanNulls": false, "stacking": {"group": "A", "mode": "none"}, "thresholdsStyle": {"mode": "off"}}, "mappings": [], "thresholds": {"mode": "absolute", "steps": [{"color": "green", "value": null}]}, "unit": "short"},
        "overrides": []
      },
      "gridPos": {"h": 8, "w": 12, "x": 12, "y": 4},
      "id": 5,
      "options": {"legend": {"calcs": [], "displayMode": "list", "placement": "bottom", "showLegend": true}, "tooltip": {"mode": "single", "sort": "none"}},
      "pluginVersion": "10.0.0",
      "targets": [{"expr": "rate(bizra_patterns_compiled_total[5m])", "legendFormat": "Compilations/sec", "refId": "A"}, {"expr": "rate(bizra_thoughts_executed_total[5m])", "legendFormat": "Thoughts/sec", "refId": "B"}],
      "title": "Pattern Compilation & Thought Execution",
      "type": "timeseries"
    }
  ],
  "refresh": "10s",
  "schemaVersion": 38,
  "tags": ["bizra", "production"],
  "templating": {"list": []},
  "time": {"from": "now-1h", "to": "now"},
  "timepicker": {},
  "timezone": "browser",
  "title": "BIZRA v9.0 - Production Overview",
  "uid": "bizra-overview",
  "version": 1
}
EOF

echo "✅ Monitoring configuration created"

# Try to install (may fail in container environments)
install_monitoring_stack 2>/dev/null || echo "⚠️  Manual installation may be required"

# Enable services if available
if command -v prometheus &> /dev/null; then
    systemctl daemon-reload
    systemctl enable prometheus 2>/dev/null || true
    systemctl start prometheus 2>/dev/null || true
    echo "✅ Prometheus enabled"
fi

if command -v grafana-server &> /dev/null; then
    systemctl enable grafana-server 2>/dev/null || true
    systemctl start grafana-server 2>/dev/null || true
    echo "✅ Grafana enabled"
fi

echo ""
echo "🎯 MONITORING STACK CONFIGURED"
echo "=============================="
echo "Prometheus: http://localhost:9090"
echo "Grafana:    http://localhost:3000 (admin/admin)"
echo "BIZRA Metrics: http://localhost:9091/metrics"
echo ""
echo "Dashboards: BIZRA v9.0 Production Overview"
echo "Alerts: Chain Integrity, Signatures, Performance"
echo ""
echo "If services didn't start, run manually:"
echo "  prometheus --config.file=$PROMETHEUS_DIR/prometheus.yml &"
echo "  grafana-server --config=/etc/grafana/grafana.ini &"
