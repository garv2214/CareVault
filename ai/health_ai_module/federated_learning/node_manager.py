"""
Node Manager - Federated learning node clustering and orchestration
"""

from typing import Dict, List, Optional
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class FederatedNode:
    def __init__(self, node_id: str, cluster_id: str = "default"):
        self.node_id = node_id
        self.cluster_id = cluster_id
        self.sample_count = 0
        self.last_round = 0
        self.active = True


class NodeManager:
    """Manages federated learning nodes with clustering support."""

    def __init__(self):
        self.nodes: Dict[str, FederatedNode] = {}
        self.clusters: Dict[str, List[str]] = defaultdict(list)

    def register_node(self, node_id: str, cluster_id: str = "default") -> FederatedNode:
        node = FederatedNode(node_id, cluster_id)
        self.nodes[node_id] = node
        if node_id not in self.clusters[cluster_id]:
            self.clusters[cluster_id].append(node_id)
        logger.info(f"Registered node {node_id} in cluster {cluster_id}")
        return node

    def get_cluster_nodes(self, cluster_id: str) -> List[FederatedNode]:
        return [self.nodes[nid] for nid in self.clusters.get(cluster_id, []) if nid in self.nodes]

    def get_active_nodes(self) -> List[FederatedNode]:
        return [n for n in self.nodes.values() if n.active]

    def update_node_stats(self, node_id: str, sample_count: int, round_num: int):
        if node_id in self.nodes:
            self.nodes[node_id].sample_count = sample_count
            self.nodes[node_id].last_round = round_num

    def get_cluster_summary(self) -> Dict:
        summary = {}
        for cluster_id, node_ids in self.clusters.items():
            summary[cluster_id] = {
                "node_count": len(node_ids),
                "total_samples": sum(self.nodes[n].sample_count for n in node_ids if n in self.nodes),
                "nodes": node_ids,
            }
        return summary

    def select_nodes_for_round(self, cluster_id: Optional[str] = None, max_nodes: int = 5) -> List[str]:
        if cluster_id:
            candidates = self.clusters.get(cluster_id, [])
        else:
            candidates = list(self.nodes.keys())
        active = [n for n in candidates if n in self.nodes and self.nodes[n].active]
        return active[:max_nodes]
