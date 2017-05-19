from node import Node
from link import Link
from collections import defaultdict
from itertools import permutations
import json
from heapq import *


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
    
def dijkstra(graph,src,dest,visited=[],distances={},predecessors={}):
    if src == dest:
        path=[]
        pred=dest
        while pred != None:
            path.append(pred)
            pred=predecessors.get(pred,None)
        return path
    else :     
        if not visited: 
            distances[src]=0
        for neighbor in graph[src] :
            if neighbor not in visited:
                new_distance = distances[src] + graph[src][neighbor]
                if new_distance < distances.get(neighbor,float('inf')):
                    distances[neighbor] = new_distance
                    predecessors[neighbor] = src
        visited.append(src)
        unvisited={}
        for k in graph:
            if k not in visited:
                unvisited[k] = distances.get(k,float('inf'))        
        x=min(unvisited, key=unvisited.get)
        return dijkstra(graph,x,dest,visited,distances,predecessors)

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

    def graph_to_dict(self,distances=False):
        d={}
        for n in self.nodes:
            if distances==False:
                lns=[]
                for l in self.links:
                    if l.src.label==n.label:
                        lns.append(l.dest.label)
                    elif l.dest.label==n.label:
                        lns.append(l.src.label)
                d[n.label]=lns
            else:
                lns={}
                for l in self.links:
                    if l.src.label==n.label:
                        lns[l.dest.label]=l.length
                    elif l.dest.label==n.label:
                        lns[l.src.label]=l.length
                d[n.label]=lns
        return d        

    def get_all_paths(self,n1,n2):
        g=self.graph_to_dict()
        return find_all_paths(g,n1.label,n2.label)

    def ele_path_dijkstra(self,n1,n2):
        g=self.graph_to_dict(True)
        p1=dijkstra(g,n1.label,n2.label)
        p1.reverse()
        for i in range(len(p1)-1):
            g[p1[i]].pop(p1[i+1])
            g[p1[i+1]].pop(p1[i])
        p2=dijkstra(g,n1.label,n2.label, [], {}, {})
        if p2 !=None: p2.reverse()
        return (p1,p2)

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
print g.ele_path_dijkstra(nodes[0],nodes[4])