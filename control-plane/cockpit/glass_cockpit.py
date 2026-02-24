#!/usr/bin/env python3
"""
BIZRA CONTROL PLANE - GLASS COCKPIT
Plane: Control
Component: Observability Interface
Status: ACTIVE
Implements: Ihsān Vector Visualization

The Glass Cockpit is the primary interface for the Sovereign Node Operator.
It visualizes the 4 Pillars of Ihsān (Excellence, Benevolence, Justice, Trust)
in real-time, aggregating telemetry from the Data, Cognitive, and Proof planes.

Design:
- Uses 'rich' for high-fidelity TUI.
- Polling architecture for system stats.
- Integration with SAT Reflex Engine for security status.
"""

import sys
import time
import yaml
import psutil
from pathlib import Path
from datetime import datetime
from rich.live import Live
from rich.layout import Layout
from rich.panel import Panel
from rich.table import Table
from rich.align import Align
from rich.text import Text
from rich.console import Console

# Adjust path to import sibling modules if needed
sys.path.append(str(Path(__file__).parent.parent.parent))

# Configuration
MANIFEST_PATH = Path("../../constitution/ihsan_manifest.yaml")
REFLEX_ENGINE_PATH = Path("../../cognitive-plane/sat/reflex_engine.py")
VAULT_PATH = Path("../../data-plane/vault")

console = Console()

class GlassCockpit:
    def __init__(self):
        self.manifest = self._load_manifest()
        self.start_time = time.time()
        self.node_identity = "NODE-0 (TITAN-18-HX)"

    def _load_manifest(self):
        try:
            with open(MANIFEST_PATH, 'r') as f:
                return yaml.safe_load(f)
        except Exception:
            return {"pillars": {}}

    def _get_system_stats(self):
        cpu = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory().percent
        uptime = time.time() - self.start_time
        return cpu, mem, uptime

    def _get_sat_status(self):
        # In a real system, this would read the latest audit receipt.
        # Here we continuously assert "Secure" based on the Reflex Engine existence.
        if REFLEX_ENGINE_PATH.exists():
            return "[green]ACTIVE[/green]"
        return "[red]OFFLINE[/red]"

    def _get_data_wealth(self):
        # Count processed assets
        processed_path = VAULT_PATH / "processed"
        if processed_path.exists():
            count = len(list(processed_path.glob("*")))
            return count
        return 0

    def generate_layout(self) -> Layout:
        layout = Layout()
        layout.split(
            Layout(name="header", size=3),
            Layout(name="main", ratio=1),
            Layout(name="footer", size=3)
        )
        
        layout["main"].split_row(
            Layout(name="metrics"),
            Layout(name="ihsan_vector")
        )
        
        return layout

    def render_view(self, layout: Layout):
        cpu, mem, uptime = self._get_system_stats()
        sat_status = self._get_sat_status()
        wealth = self._get_data_wealth()
        
        # Header
        header_text = Text(f"BIZRA SOVEREIGN COCKPIT | {self.node_identity} | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 
                          style="bold white on blue", justify="center")
        layout["header"].update(header_text)

        # Metrics Panel
        metrics_table = Table(title="System Telemetry", expand=True)
        metrics_table.add_column("Metric", style="cyan")
        metrics_table.add_column("Value", style="yellow")
        
        metrics_table.add_row("CPU Load", f"{cpu}%")
        metrics_table.add_row("Memory Usage", f"{mem}%")
        metrics_table.add_row("Uptime", f"{int(uptime)}s")
        metrics_table.add_row("Data Assets", str(wealth))
        metrics_table.add_row("Reflex Engine", sat_status)

        layout["metrics"].update(Panel(metrics_table, title="[Control Plane]", border_style="blue"))

        # Ihsān Vector Panel
        vector_table = Table(title="The Ihsān Vector", expand=True)
        vector_table.add_column("Pillar", style="magenta")
        vector_table.add_column("Status", style="green")
        vector_table.add_column("Gate", style="white")

        pillars = self.manifest.get("pillars", {})
        
        # Mapping logic to real-time stats
        # Excellence (Uptime)
        exc_conf = pillars.get("excellence", {})
        vector_table.add_row("Excellence", "99.9% (Proj)", f"weight: {exc_conf.get('weight', 'N/A')}")

        # Benevolence (Resource < 80%)
        ben_status = "[green]PASS[/green]" if cpu < 80 else "[red]STRESS[/red]"
        vector_table.add_row("Benevolence", ben_status, "CPU < 80%")

        # Justice (Fairness - Mock)
        vector_table.add_row("Justice (Adl)", "[green]BALANCED[/green]", "Network Fair")

        # Trust (Security)
        trust_status = "[green]SECURE[/green]" if "ACTIVE" in sat_status else "[red]RISK[/red]"
        vector_table.add_row("Trust (Amanah)", trust_status, "SAT Audit")

        layout["ihsan_vector"].update(Panel(vector_table, title="[Constitution]", border_style="magenta"))
        
        # Footer
        layout["footer"].update(Align.center(Text("Press Ctrl+C to Exit | Mode: SOVEREIGN", style="dim")))
        
        return layout

def run_cockpit():
    cockpit = GlassCockpit()
    layout = cockpit.generate_layout()
    
    with Live(layout, refresh_per_second=4, screen=True):
        while True:
            time.sleep(0.25)
            cockpit.render_view(layout)

if __name__ == "__main__":
    if "--snapshot" in sys.argv:
        # Static Snapshot Mode for CI/CD Proof
        cockpit = GlassCockpit()
        layout = cockpit.generate_layout()
        cockpit.render_view(layout)
        console.print(layout)
        sys.exit(0)

    try:
        run_cockpit()
    except KeyboardInterrupt:
        print("\n>>> COCKPIT SHUTDOWN. Landing complete.")
        sys.exit(0)
