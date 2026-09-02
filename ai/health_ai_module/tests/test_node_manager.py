"""Unit tests for Federated Learning NodeManager."""

import pytest
from health_ai_module.federated_learning.node_manager import NodeManager


def test_register_and_retrieve_nodes():
    nm = NodeManager()
    node1 = nm.register_node("hospital-alpha", "mumbai-cluster")
    node2 = nm.register_node("hospital-beta", "mumbai-cluster")
    node3 = nm.register_node("clinic-gamma", "delhi-cluster")

    assert len(nm.nodes) == 3
    assert len(nm.get_cluster_nodes("mumbai-cluster")) == 2
    assert len(nm.get_cluster_nodes("delhi-cluster")) == 1


def test_cluster_summary_and_selection():
    nm = NodeManager()
    nm.register_node("node-1", "cluster-a")
    nm.register_node("node-2", "cluster-a")
    nm.update_node_stats("node-1", 150, 1)
    nm.update_node_stats("node-2", 200, 1)

    summary = nm.get_cluster_summary()
    assert "cluster-a" in summary
    assert summary["cluster-a"]["node_count"] == 2
    assert summary["cluster-a"]["total_samples"] == 350

    selected = nm.select_nodes_for_round("cluster-a", max_nodes=1)
    assert len(selected) == 1
