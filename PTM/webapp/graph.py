from node import Node
from link import Link
from collections import defaultdict


class Graph:
    def __init__(self, nodes, links):
        self.nodes = nodes
        self.links = links

    def parse_json(self, file):
        print 'parsed'

    def node_by_name(self, name):
        for node in self.nodes:
            if node.name == name:
                return node

    def dijkstra(self, source, terminal):
        nodes = set()
        edges = defaultdict(list)
        distance = {}

        for node in self.nodes:
            nodes.add(node.name)

        for edge in self.links:
            edges[edge.n1].append(edge.n2)
            edges[edge.n2].append(edge.n1)
            distance[(edge.n1, edge.n2)] = edge.length
            distance[(edge.n2, edge.n1)] = edge.length

        visited = {source.name: 0}
        path = {}

        print 'Nodes: ', nodes
        print 'Edges: ', edges
        print 'Distances: ', distance
        print 'a: ', edges['b']

        nodes = set(nodes)

        while nodes:
            min_node = None
            for node in nodes:
                if node in visited:
                    if min_node is None:
                        min_node = node
                    elif visited[node] < visited[min_node]:
                        min_node = node
            print 'Minimal node: ', min_node

            if min_node is None:
                break

            nodes.remove(min_node)
            current_weight = visited[min_node]

            print 'Minimal node edges: ', edges[min_node]

            for edge in edges[min_node]:
                weight = current_weight + distance[(min_node, edge)]
                if edge not in visited or weight < visited[edge]:
                    visited[edge] = weight
                    path[edge] = min_node

        print visited, path


nodes = [Node('a', 0.5, 0.7),
         Node('b', 0.4, 0.7),
         Node('c', 0.6, 0.7),
         Node('d', 0.4, 0.8),
         Node('e', 0.3, 0.8)]
links = [Link(4, 0.4, 0.6, nodes[0], nodes[1]),
         Link(1, 0.4, 0.6, nodes[0], nodes[2]),
         Link(2, 0.4, 0.6, nodes[1], nodes[3]),
         Link(2, 0.4, 0.6, nodes[2], nodes[3]),
         Link(1, 0.4, 0.6, nodes[1], nodes[4]),
         Link(1, 0.4, 0.6, nodes[3], nodes[4])]
g = Graph(nodes, links)
print g.nodes, g.links
g.dijkstra(nodes[0], nodes[4])