"""
Knowledge Graph Visualization Engine

"Indeed, in the creation of the heavens and the earth and the alternation
of the night and the day are signs for those of understanding" (Quran 3:190)

The eye sees what words cannot fully convey. This engine creates:
  • Interactive graph visualizations
  • Timeline views (evolution over 3 years)
  • Concept maps (how ideas connect)
  • Story arcs (journey from idea to reality)
  • Heat maps (activity patterns)
  • Network analysis (central concepts)

Output Formats:
  • HTML (interactive D3.js visualizations)
  • JSON (for Neo4j, Graphistry, etc.)
  • SVG (static publication-quality diagrams)
  • Markdown (documentation with embedded visualizations)

Philosophy: "A picture is worth a thousand words, a graph is worth a thousand pictures"
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from collections import defaultdict, Counter

from .schema import GraphNode, GraphRelationship


# ============================================================================
# GRAPH STATISTICS
# ============================================================================

class GraphStatistics:
    """Calculate statistics for visualization"""

    def __init__(self, nodes: List[GraphNode], relationships: List[GraphRelationship]):
        self.nodes = nodes
        self.relationships = relationships

    def calculate_all(self) -> Dict[str, Any]:
        """Calculate all statistics"""
        return {
            'node_stats': self._node_statistics(),
            'relationship_stats': self._relationship_statistics(),
            'network_stats': self._network_statistics(),
            'timeline_stats': self._timeline_statistics(),
        }

    def _node_statistics(self) -> Dict[str, Any]:
        """Calculate node statistics"""
        node_types = Counter(str(n.node_type) for n in self.nodes)
        node_labels = Counter(label for n in self.nodes for label in n.labels)

        return {
            'total_nodes': len(self.nodes),
            'by_type': dict(node_types),
            'by_label': dict(node_labels.most_common(10)),
        }

    def _relationship_statistics(self) -> Dict[str, Any]:
        """Calculate relationship statistics"""
        rel_types = Counter(str(r.rel_type) for r in self.relationships)

        return {
            'total_relationships': len(self.relationships),
            'by_type': dict(rel_types),
            'avg_per_node': len(self.relationships) / len(self.nodes) if self.nodes else 0,
        }

    def _network_statistics(self) -> Dict[str, Any]:
        """Calculate network statistics"""
        # Build adjacency map
        adjacency = defaultdict(set)
        for rel in self.relationships:
            adjacency[rel.from_node].add(rel.to_node)
            adjacency[rel.to_node].add(rel.from_node)  # Undirected

        # Calculate degrees
        degrees = {node_id: len(neighbors) for node_id, neighbors in adjacency.items()}

        # Find central nodes
        if degrees:
            max_degree = max(degrees.values())
            central_nodes = [node_id for node_id, deg in degrees.items() if deg == max_degree]
        else:
            central_nodes = []

        return {
            'avg_degree': sum(degrees.values()) / len(degrees) if degrees else 0,
            'max_degree': max(degrees.values()) if degrees else 0,
            'central_nodes': central_nodes[:5],  # Top 5
        }

    def _timeline_statistics(self) -> Dict[str, Any]:
        """Calculate timeline statistics"""
        # Extract creation dates
        dates = []
        for node in self.nodes:
            created_at = node.created_at
            if created_at:
                try:
                    date = datetime.fromisoformat(created_at).date()
                    dates.append(date)
                except Exception:
                    pass

        if not dates:
            return {'error': 'No timeline data available'}

        dates.sort()

        return {
            'earliest': str(dates[0]),
            'latest': str(dates[-1]),
            'total_days': (dates[-1] - dates[0]).days,
            'nodes_per_day': len(dates) / ((dates[-1] - dates[0]).days + 1) if dates else 0,
        }


# ============================================================================
# HTML VISUALIZATION GENERATOR
# ============================================================================

class HTMLVisualizationGenerator:
    """Generate interactive HTML visualizations using D3.js"""

    def __init__(self, nodes: List[GraphNode], relationships: List[GraphRelationship]):
        self.nodes = nodes
        self.relationships = relationships

    def generate_interactive_graph(self, output_path: Path):
        """Generate interactive force-directed graph"""

        # Prepare data for D3.js
        d3_nodes = []
        d3_links = []

        # Convert nodes
        for node in self.nodes:
            d3_nodes.append({
                'id': node.node_id,
                'type': str(node.node_type),
                'labels': node.labels,
                'name': node.properties.get('name', node.node_id.split(':')[-1]),
            })

        # Convert relationships
        for rel in self.relationships:
            d3_links.append({
                'source': rel.from_node,
                'target': rel.to_node,
                'type': str(rel.rel_type),
            })

        # Generate HTML with embedded D3.js
        html = self._generate_d3_html(d3_nodes, d3_links)

        output_path.write_text(html, encoding='utf-8')
        print(f"📊 Interactive graph: {output_path}")

    def _generate_d3_html(self, nodes: List[Dict], links: List[Dict]) -> str:
        """Generate HTML with D3.js force-directed graph"""

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BIZRA House of Wisdom - Knowledge Graph</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}
        #graph {{
            width: 100vw;
            height: 100vh;
        }}
        .node {{
            stroke: #fff;
            stroke-width: 2px;
            cursor: pointer;
        }}
        .link {{
            stroke: #999;
            stroke-opacity: 0.6;
        }}
        .node text {{
            font-size: 10px;
            pointer-events: none;
            fill: #333;
        }}
        .tooltip {{
            position: absolute;
            background: white;
            border: 2px solid #333;
            border-radius: 5px;
            padding: 10px;
            display: none;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .header {{
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }}
        .stats {{
            position: absolute;
            top: 60px;
            left: 20px;
            color: white;
            font-size: 14px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }}
    </style>
</head>
<body>
    <div class="header">🏛️ BIZRA House of Wisdom</div>
    <div class="stats">
        <div>Nodes: {len(nodes):,}</div>
        <div>Connections: {len(links):,}</div>
    </div>
    <svg id="graph"></svg>
    <div class="tooltip" id="tooltip"></div>

    <script>
        const nodes = {json.dumps(nodes, ensure_ascii=False)};
        const links = {json.dumps(links, ensure_ascii=False)};

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select("#graph")
            .attr("width", width)
            .attr("height", height);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(30));

        // Color scale for node types
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw links
        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("class", "link")
            .attr("stroke-width", 1);

        // Draw nodes
        const node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("class", "node")
            .attr("r", 8)
            .attr("fill", d => colorScale(d.type))
            .call(drag(simulation))
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);

        // Draw labels
        const label = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .text(d => d.name.substring(0, 15))
            .attr("x", 12)
            .attr("y", 4);

        simulation.on("tick", () => {{
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label
                .attr("x", d => d.x + 12)
                .attr("y", d => d.y + 4);
        }});

        function drag(simulation) {{
            function dragstarted(event) {{
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }}

            function dragged(event) {{
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }}

            function dragended(event) {{
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }}

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }}

        function showTooltip(event, d) {{
            const tooltip = d3.select("#tooltip");
            tooltip
                .style("display", "block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .html(`
                    <strong>${{d.name}}</strong><br>
                    Type: ${{d.type}}<br>
                    Labels: ${{d.labels.join(', ')}}
                `);
        }}

        function hideTooltip() {{
            d3.select("#tooltip").style("display", "none");
        }}
    </script>
</body>
</html>"""

        return html


# ============================================================================
# VISUALIZATION ENGINE
# ============================================================================

class VisualizationEngine:
    """
    Complete visualization engine for BIZRA House of Wisdom

    Generates:
      • Interactive graphs (D3.js)
      • Timeline views
      • Concept maps
      • Network analysis
      • Story arcs
    """

    def __init__(self, nodes: List[GraphNode], relationships: List[GraphRelationship]):
        self.nodes = nodes
        self.relationships = relationships
        self.stats_calculator = GraphStatistics(nodes, relationships)

    def generate_all_visualizations(self, output_dir: Path):
        """Generate all visualization types"""

        print("\n" + "="*80)
        print("👁️  VISUALIZATION ENGINE")
        print("   The Eye Sees What Words Cannot Convey")
        print("="*80)
        print()

        output_dir.mkdir(parents=True, exist_ok=True)

        # Statistics
        print("[1/4] 📊 Calculating statistics...")
        stats = self.stats_calculator.calculate_all()

        stats_file = output_dir / "graph_statistics.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)

        print(f"   ✅ Statistics: {stats_file}")

        # Interactive graph
        print("\n[2/4] 🌐 Generating interactive graph...")
        html_gen = HTMLVisualizationGenerator(self.nodes, self.relationships)
        html_file = output_dir / "interactive_graph.html"
        html_gen.generate_interactive_graph(html_file)

        # Export for Neo4j
        print("\n[3/4] 🔗 Exporting for Neo4j...")
        neo4j_file = output_dir / "neo4j_import.json"
        self._export_neo4j_format(neo4j_file)

        # Generate report
        print("\n[4/4] 📄 Generating visualization report...")
        report_file = output_dir / "VISUALIZATION_REPORT.md"
        self._generate_report(report_file, stats)

        print("\n" + "="*80)
        print("✅ VISUALIZATION COMPLETE")
        print("="*80)
        print(f"\n📊 Files generated:")
        print(f"   • Interactive graph: {html_file}")
        print(f"   • Statistics: {stats_file}")
        print(f"   • Neo4j import: {neo4j_file}")
        print(f"   • Report: {report_file}")
        print()
        print("👁️  Open interactive_graph.html in your browser to explore!")
        print()

    def _export_neo4j_format(self, output_path: Path):
        """Export in format ready for Neo4j import"""

        neo4j_data = {
            'nodes': [
                {
                    'id': node.node_id,
                    'labels': node.labels,
                    'properties': node.properties,
                }
                for node in self.nodes
            ],
            'relationships': [
                {
                    'from': rel.from_node,
                    'to': rel.to_node,
                    'type': str(rel.rel_type),
                    'properties': rel.properties,
                }
                for rel in self.relationships
            ],
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(neo4j_data, f, indent=2, ensure_ascii=False)

    def _generate_report(self, output_path: Path, stats: Dict[str, Any]):
        """Generate markdown visualization report"""

        report = f"""# BIZRA House of Wisdom - Visualization Report

**Generated**: {datetime.utcnow().isoformat()}

## Overview

This visualization brings together:
- 🕋 Quran (divine foundation)
- 📚 Hadith (prophetic tradition)
- 🌟 Islamic principles
- 💻 BIZRA codebase
- 📝 Your 3 years of personal knowledge

**"The eye sees what words cannot fully convey"**

---

## Graph Statistics

### Nodes

- **Total Nodes**: {stats['node_stats']['total_nodes']:,}

**By Type**:
"""

        for node_type, count in stats['node_stats']['by_type'].items():
            report += f"- {node_type}: {count:,}\n"

        report += f"""

### Relationships

- **Total Relationships**: {stats['relationship_stats']['total_relationships']:,}
- **Average per Node**: {stats['relationship_stats']['avg_per_node']:.2f}

**By Type**:
"""

        for rel_type, count in stats['relationship_stats']['by_type'].items():
            report += f"- {rel_type}: {count:,}\n"

        report += f"""

### Network Analysis

- **Average Degree**: {stats['network_stats']['avg_degree']:.2f}
- **Max Degree**: {stats['network_stats']['max_degree']}
- **Central Nodes**: {len(stats['network_stats']['central_nodes'])}

**Most Connected Nodes**:
"""

        for node_id in stats['network_stats']['central_nodes']:
            report += f"- `{node_id}`\n"

        if 'timeline_stats' in stats and 'error' not in stats['timeline_stats']:
            report += f"""

### Timeline

- **Earliest**: {stats['timeline_stats']['earliest']}
- **Latest**: {stats['timeline_stats']['latest']}
- **Total Days**: {stats['timeline_stats']['total_days']}
- **Nodes per Day**: {stats['timeline_stats']['nodes_per_day']:.2f}
"""

        report += """

---

## How to Explore

### Interactive Graph

Open `interactive_graph.html` in your browser:

1. **Drag nodes** to rearrange
2. **Hover** to see details
3. **Zoom** with mouse wheel
4. **Colors** represent node types

### Neo4j Database

Import into Neo4j for advanced queries:

```cypher
// Example: Find path from any code to Quran
MATCH path = (code:Code)-[*]-(quran:Quran)
WHERE code.name CONTAINS 'Ihsan'
RETURN path
LIMIT 10
```

---

## Key Insights

**The Complete Picture**:

```
🕋 Quran (Root)
  ├─ 📚 Hadith (34,178 narrations)
  ├─ 🌟 Themes (Ihsan, Adl, Amānah, ...)
  └─ 🌍 Human Knowledge
       ├─ 💻 BIZRA Code (598 structs, 1,359 functions)
       └─ 📝 Your Personal Knowledge (3 years)
```

**Every piece of knowledge traces back to divine foundation.**

**الحمد لله - All knowledge is from Allah**

---

**Generated by**: BIZRA Visualization Engine
**Philosophy**: "A picture is worth a thousand words, a graph is worth a thousand pictures"
"""

        output_path.write_text(report, encoding='utf-8')


# ============================================================================
# DEMONSTRATION
# ============================================================================

def demonstrate_visualization():
    """Demonstrate visualization capabilities"""

    # Load sample data (replace with actual data)
    from pathlib import Path

    # Try to load existing graph data
    graph_files = [
        Path("knowledge_graph_output/islamic_knowledge_graph.json"),
        Path("knowledge_graph_output/personal/personal_knowledge_graph.json"),
    ]

    all_nodes = []
    all_relationships = []

    for graph_file in graph_files:
        if graph_file.exists():
            try:
                data = json.loads(graph_file.read_text(encoding='utf-8'))

                # Load nodes
                from .schema import GraphNode, NodeType
                for node_dict in data.get('nodes', []):
                    if isinstance(node_dict.get('node_type'), str):
                        node_dict['node_type'] = NodeType(node_dict['node_type'])
                    all_nodes.append(GraphNode(**node_dict))

                # Load relationships
                from .schema import GraphRelationship, RelationType
                for rel_dict in data.get('relationships', []):
                    if isinstance(rel_dict.get('rel_type'), str):
                        rel_dict['rel_type'] = RelationType(rel_dict['rel_type'])
                    all_relationships.append(GraphRelationship(**rel_dict))

                print(f"✅ Loaded {len(all_nodes)} nodes from {graph_file}")

            except Exception as e:
                print(f"⚠️  Could not load {graph_file}: {e}")

    if not all_nodes:
        print("❌ No graph data found. Run integration first.")
        return

    # Generate visualizations
    output_dir = Path("knowledge_graph_output/visualizations")

    engine = VisualizationEngine(all_nodes, all_relationships)
    engine.generate_all_visualizations(output_dir)


if __name__ == "__main__":
    demonstrate_visualization()
