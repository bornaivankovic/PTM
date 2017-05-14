from node import Node
from link import Link
from collections import defaultdict
import json


def find_all_paths(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        return [path]
    if not graph.has_key(start):
        return []
    paths = []
    for node in graph[start]:
        if node not in path:
            newpaths = find_all_paths(graph, node, end, path)
            for newpath in newpaths:
                paths.append(newpath)
    return paths

class Graph:
    def __init__(self, nodes, links):
        self.nodes = nodes
        self.links = links

    def parse_json(self, file):
        print 'parsed'

    def node_by_name(self, name):
        for node in self.nodes:
            if node.label == name:
                return name

    def graph_to_dict(self):
        d={}
        for n in self.nodes:
            lns=[]
            for l in self.links:
                if l.src.label==n.label:
                    lns.append(l.dest.label)
                elif l.dest.label==n.label:
                    lns.append(l.src.label)
            d[n.label]=lns
        return d

    def dijkstra(self, source, terminal):
        nodes = set()
        edges = defaultdict(list)
        distance = {}

        for node in self.nodes:
            nodes.add(node.label)

        for edge in self.links:
            edges[edge.src.label].append(edge.dest.label)
            edges[edge.dest.label].append(edge.src.label)
            distance[(edge.src.label, edge.dest.label)] = edge.length
            distance[(edge.dest.label, edge.src.label)] = edge.length

        visited = {source.label: 0}
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
            

            print 'Minimal node edges: ', edges.get(min_node)

            for edge in edges[min_node]:
                weight = current_weight + distance[(min_node, edge)]
                if edge not in visited or weight < visited[edge]:
                    visited[edge] = weight
                    path[edge] = min_node

        print visited, path
        

    def get_all_paths(self,n1,n2):
        g=self.graph_to_dict()
        return find_all_paths(g,n1.label,n2.label)

    def to_json(self):
        ns="{\"nodes\":["
        for i in self.nodes:
            ns+="{\"label\":\""+i.label+"\",\"repairRate\":"+str(i.repairRate)+",\"failureRate\":"+str(i.failureRate)+"},"
        ns=ns[:-1]+"],"
        ls="\n\"links\":["
        for i in self.links:
            ls+="{\"length\":"+str(i.length)+",\"repairRate\":"+str(i.repairRate)+",\"failureRate\":"+str(i.failureRate)+",\"src\":\""+i.src.__repr__()+"\",\"dest\":\""+i.dest.__repr__()+"\"},"
        ls=ls[:-1]+"]}\n"
        return json.loads(ns+ls)
        

        


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
#print g.get_all_paths(nodes[0],nodes[4])