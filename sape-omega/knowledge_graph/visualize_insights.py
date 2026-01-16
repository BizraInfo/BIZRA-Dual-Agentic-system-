#!/usr/bin/env python3
"""
Visualize BIZRA Insights Knowledge Graph
Creates interactive D3.js visualization - "the eye sees"
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict, Counter

def load_insights_graph(graph_file: Path) -> Dict[str, Any]:
    """Load the insights graph from JSON"""
    return json.loads(graph_file.read_text())

def calculate_statistics(graph: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate graph statistics"""
    nodes = graph['nodes']
    relationships = graph['relationships']

    # Node statistics
    node_categories = Counter(n['properties'].get('category', 'unknown') for n in nodes)
    node_labels = defaultdict(int)
    for node in nodes:
        for label in node.get('labels', []):
            node_labels[label] += 1

    # Relationship statistics
    rel_types = Counter(r['rel_type'] for r in relationships)

    # Network statistics (degree centrality)
    degree = defaultdict(int)
    for rel in relationships:
        degree[rel['from_node']] += 1
        degree[rel['to_node']] += 1

    top_nodes = sorted(degree.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        'total_nodes': len(nodes),
        'total_relationships': len(relationships),
        'categories': dict(node_categories),
        'labels': dict(node_labels),
        'relationship_types': dict(rel_types),
        'top_nodes': [{'id': nid, 'degree': deg} for nid, deg in top_nodes],
        'network_density': len(relationships) / (len(nodes) * (len(nodes) - 1)) if len(nodes) > 1 else 0
    }

def generate_interactive_html(graph: Dict[str, Any], stats: Dict[str, Any], output_file: Path):
    """Generate interactive D3.js visualization"""

    nodes = graph['nodes']
    relationships = graph['relationships']

    # Prepare data for D3
    d3_nodes = []
    for node in nodes:
        title = node['properties'].get('title') or node['properties'].get('header', 'Unknown')
        category = node['properties'].get('category', 'unknown')
        d3_nodes.append({
            'id': node['node_id'],
            'title': title,
            'category': category,
            'labels': node.get('labels', []),
            'confidence': node.get('confidence', 1.0)
        })

    d3_links = []
    for rel in relationships:
        d3_links.append({
            'source': rel['from_node'],
            'target': rel['to_node'],
            'type': rel['rel_type']
        })

    # Generate HTML with embedded D3.js
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BIZRA Insights Knowledge Graph - بيت الحكمة</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
        }}
        #header {{
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 20px;
            border-bottom: 2px solid #0f3460;
        }}
        h1 {{
            margin: 0;
            color: #00d4ff;
            font-size: 28px;
        }}
        .subtitle {{
            color: #888;
            font-size: 14px;
            margin-top: 5px;
        }}
        #stats {{
            background: #1a1a2e;
            padding: 15px 20px;
            display: flex;
            gap: 30px;
            border-bottom: 1px solid #333;
            flex-wrap: wrap;
        }}
        .stat {{
            display: flex;
            flex-direction: column;
        }}
        .stat-label {{
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
        }}
        .stat-value {{
            font-size: 24px;
            color: #00d4ff;
            font-weight: bold;
        }}
        #visualization {{
            width: 100vw;
            height: calc(100vh - 150px);
        }}
        .node {{
            cursor: pointer;
            stroke: #fff;
            stroke-width: 1.5px;
        }}
        .node.vision {{ fill: #ff6b6b; }}
        .node.philosophy {{ fill: #4ecdc4; }}
        .node.technical {{ fill: #95e1d3; }}
        .node.learning {{ fill: #f38181; }}
        .node.insight {{ fill: #aa96da; }}
        .node.documentation {{ fill: #5eaaa8; }}
        .node.vision_document {{ fill: #fcbf49; }}
        .node.unknown {{ fill: #666; }}

        .link {{
            stroke: #999;
            stroke-opacity: 0.3;
            stroke-width: 1px;
        }}
        .tooltip {{
            position: absolute;
            background: rgba(0,0,0,0.95);
            color: #fff;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #00d4ff;
            pointer-events: none;
            font-size: 12px;
            max-width: 300px;
            display: none;
            z-index: 1000;
        }}
        .tooltip-title {{
            font-weight: bold;
            color: #00d4ff;
            margin-bottom: 5px;
        }}
        .tooltip-category {{
            font-size: 10px;
            color: #888;
            text-transform: uppercase;
        }}
        #legend {{
            position: absolute;
            top: 160px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #333;
        }}
        .legend-item {{
            display: flex;
            align-items: center;
            margin: 5px 0;
            font-size: 12px;
        }}
        .legend-color {{
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
            border: 1px solid #fff;
        }}
    </style>
</head>
<body>
    <div id="header">
        <h1>🌳 BIZRA Insights Knowledge Graph</h1>
        <div class="subtitle">بيت الحكمة - House of Wisdom | 3 Years of Vision & Evolution</div>
    </div>

    <div id="stats">
        <div class="stat">
            <span class="stat-label">Total Insights</span>
            <span class="stat-value">{stats['total_nodes']}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Connections</span>
            <span class="stat-value">{stats['total_relationships']}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Vision Nodes</span>
            <span class="stat-value">{stats['categories'].get('vision', 0)}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Philosophy</span>
            <span class="stat-value">{stats['categories'].get('philosophy', 0)}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Technical</span>
            <span class="stat-value">{stats['categories'].get('technical', 0)}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Network Density</span>
            <span class="stat-value">{stats['network_density']:.3f}</span>
        </div>
    </div>

    <div id="legend">
        <div class="legend-item">
            <div class="legend-color" style="background: #ff6b6b;"></div>
            Vision
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #4ecdc4;"></div>
            Philosophy
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #95e1d3;"></div>
            Technical
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #f38181;"></div>
            Learning
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #aa96da;"></div>
            Insight
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #fcbf49;"></div>
            Documents
        </div>
    </div>

    <svg id="visualization"></svg>
    <div class="tooltip" id="tooltip"></div>

    <script>
        const nodes = {json.dumps(d3_nodes, ensure_ascii=False)};
        const links = {json.dumps(d3_links, ensure_ascii=False)};

        const width = window.innerWidth;
        const height = window.innerHeight - 150;

        const svg = d3.select("#visualization")
            .attr("width", width)
            .attr("height", height);

        const tooltip = d3.select("#tooltip");

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(20));

        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("class", "link");

        const node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("class", d => `node ${{d.category}}`)
            .attr("r", d => 5 + (d.confidence * 5))
            .call(drag(simulation))
            .on("mouseover", function(event, d) {{
                tooltip.style("display", "block")
                    .html(`
                        <div class="tooltip-title">${{d.title}}</div>
                        <div class="tooltip-category">${{d.category}}</div>
                        <div>${{d.labels.join(", ")}}</div>
                        <div style="margin-top:5px;font-size:10px">Confidence: ${{(d.confidence * 100).toFixed(0)}}%</div>
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
                d3.select(this).attr("r", d => 8 + (d.confidence * 7));
            }})
            .on("mouseout", function(event, d) {{
                tooltip.style("display", "none");
                d3.select(this).attr("r", d => 5 + (d.confidence * 5));
            }});

        simulation.on("tick", () => {{
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }});

        function drag(simulation) {{
            function dragstarted(event) {{
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }}

            function dragged(event) {{
                event.subject.fx = event.x;
                event.subject.fy = event.y;
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
    </script>
</body>
</html>"""

    output_file.write_text(html)

def generate_markdown_report(graph: Dict[str, Any], stats: Dict[str, Any], output_file: Path):
    """Generate markdown report with insights"""

    report = f"""# BIZRA Insights Knowledge Graph

**Generated**: {graph['metadata']['created_at']}
**Philosophy**: {graph['metadata']['philosophy']}

## Overview

{graph['metadata']['description']}

## Statistics

- **Total Insights**: {stats['total_nodes']}
- **Total Connections**: {stats['total_relationships']}
- **Files Processed**: {graph['metadata']['files_processed']}
- **Network Density**: {stats['network_density']:.4f}

## Category Distribution

| Category | Count |
|----------|-------|
"""

    for cat, count in sorted(stats['categories'].items(), key=lambda x: x[1], reverse=True):
        report += f"| {cat} | {count} |\n"

    report += f"""

## Top Connected Nodes

These are the most central concepts in the knowledge graph:

| Node ID | Connections |
|---------|-------------|
"""

    for node_info in stats['top_nodes']:
        report += f"| `{node_info['id'][:30]}...` | {node_info['degree']} |\n"

    report += f"""

## Label Distribution

"""

    for label, count in sorted(stats['labels'].items(), key=lambda x: x[1], reverse=True):
        report += f"- **{label}**: {count}\n"

    report += """

## Vision Insights

"""

    vision_nodes = [n for n in graph['nodes'] if n['properties'].get('category') == 'vision']
    for node in vision_nodes[:10]:
        title = node['properties'].get('header') or node['properties'].get('title', 'Unknown')
        content = node['properties'].get('content', node['properties'].get('summary', ''))[:200]
        source = node['properties'].get('source_file', 'Unknown')
        report += f"### {title}\n\n"
        report += f"**Source**: `{source}`  \n"
        report += f"**Confidence**: {node.get('confidence', 1.0):.2f}\n\n"
        report += f"{content}...\n\n"

    report += """
---

**الحمد لله** - All praise belongs to Allah

From roots to tree, from vision to reality.
"""

    output_file.write_text(report)


def main():
    """Generate all visualizations"""
    print("=" * 80)
    print("📊 VISUALIZING BIZRA INSIGHTS KNOWLEDGE GRAPH")
    print("   The Eye Sees - بيت الحكمة")
    print("=" * 80)
    print()

    root_dir = Path("/root/bizra-genesis")
    graph_file = root_dir / "knowledge_graph_output/insights/bizra_insights_graph.json"
    output_dir = root_dir / "knowledge_graph_output/visualizations"
    output_dir.mkdir(parents=True, exist_ok=True)

    if not graph_file.exists():
        print(f"❌ Graph file not found: {graph_file}")
        return

    print("[Phase 1/3] 📖 Loading graph...")
    graph = load_insights_graph(graph_file)
    print(f"   ✅ Loaded {len(graph['nodes'])} nodes, {len(graph['relationships'])} relationships")
    print()

    print("[Phase 2/3] 📊 Calculating statistics...")
    stats = calculate_statistics(graph)
    print(f"   ✅ Network density: {stats['network_density']:.4f}")
    print(f"   ✅ Categories: {len(stats['categories'])}")
    print()

    print("[Phase 3/3] 🎨 Generating visualizations...")
    print()

    # 1. Interactive HTML
    html_file = output_dir / "bizra_insights_interactive.html"
    generate_interactive_html(graph, stats, html_file)
    print(f"   ✅ Interactive graph: {html_file.relative_to(root_dir)}")

    # 2. Statistics JSON
    stats_file = output_dir / "bizra_insights_stats.json"
    stats_file.write_text(json.dumps(stats, indent=2))
    print(f"   ✅ Statistics: {stats_file.relative_to(root_dir)}")

    # 3. Markdown report
    report_file = output_dir / "bizra_insights_report.md"
    generate_markdown_report(graph, stats, report_file)
    print(f"   ✅ Report: {report_file.relative_to(root_dir)}")

    print()
    print("=" * 80)
    print("✅ VISUALIZATION COMPLETE")
    print("=" * 80)
    print()
    print("🌐 Open the interactive visualization:")
    print(f"   file://{html_file}")
    print()
    print("📊 Category breakdown:")
    for cat, count in sorted(stats['categories'].items(), key=lambda x: x[1], reverse=True):
        print(f"   {cat:20} {count:4} insights")
    print()

if __name__ == '__main__':
    main()
