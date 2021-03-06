
from node import Node
from link import Link
from collections import defaultdict
from itertools import permutations
import json
from heapq import *
from abraham import abraham
from math import exp
from itertools import combinations
from abraham import pretty_print

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

def paths_to_json(p1, p2):
    if len(p2) > 1:
        return json.loads("{\"path1\":\"" + ("-").join(p1) + "\",\"path2\":\"" + ("-").join(p2) + "\"}")
    else:
        return json.loads("{\"path1\":\"" + ("-").join(p1) + "\"}")

def path_to_json(p):
    return "\""+"-".join(p)+"\""

class Graph:
    def __init__(self, nodes, links):
        self.nodes = nodes
        self.links = links

    def parse_json(self, file):
        print 'parsed'

    def node_by_name(self, name):
        for node in self.nodes:
            if node.label == name:
                return node
    
    def link_by_nodes(self,n1,n2):
        for i in self.links:
            if (i.src.label==n1.label and i.dest.label==n2.label) or (i.src.label==n2.label and i.dest.label==n1.label):
                return i

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
        p1=dijkstra(g,n1.label,n2.label, [], {}, {})
        p1.reverse()
        for i in range(len(p1)-1):
            g[p1[i]].pop(p1[i+1])
            g[p1[i+1]].pop(p1[i])
        p2=dijkstra(g,n1.label,n2.label, [], {}, {})
        if p2 != None: p2.reverse()
        return (p1, p2)

    def to_json(self):
        ns="{\"nodes\":["
        for i in self.nodes:
            ns+="{\"label\":\""+i.label+"\",\"repairRate\":"+str(i.repairRate)+",\"failureRate\":"+str(i.failureRate)+"},"
        ns=ns[:-1]+"],"
        ls="\n\"links\":["
        for i in self.links:
            ls+="{\"length\":"+str(i.length)+",\"repairRate\":"+str(i.repairRate)+",\"failureRate\":"+str(i.failureRate)+",\"src\":\""+i.src.__repr__()+"\",\"dest\":\""+i.dest.__repr__()+"\",\"label\":\""+i.label+"\"},"
        ls=ls[:-1]+"]}\n"
        return json.loads(ns+ls)

    def ele_paths_to_bool(self,n1,n2):
        paths=self.get_all_paths(n1,n2)
        bool_paths=[]
        bool_paths.append([x.label for x in self.links]+[x.label for x in self.nodes if x!=n1 and x!=n2])
        for i in paths:
            tmp=self.nodes_links_from_path(i,n1,n2)
            bp=[]
            for j in [x for x in self.links]+[x for x in self.nodes if x!=n1 and x!=n2]:
                if j in tmp:
                    bp.append("1")
                else:
                    bp.append("-")
            bool_paths.append(bp)
        return bool_paths

    def find_failure_rate(self,s):
        for i in self.links:
            if i.label==s:
                return i.failureRate
        for i in self.nodes:
            if i.label==s:
                return i.failureRate

    def find_repair_rate(self,s):
        for i in self.links:
            if i.label==s:
                return i.repairRate
        for i in self.nodes:
            if i.label==s:
                return i.repairRate

    def find_element(self,s):
        for i in self.links+self.nodes:
            if i.label==s:
                return i

    def nodes_links_from_path(self,path,n1,n2):
        n,l=[],[]
        for i in path:
            n.append(self.node_by_name(i))
        for i in range(len(n)-1):
            l.append(self.link_by_nodes(n[i],n[i+1]))
        if n1!=None and n2!=None:
            n=[x for x in n if x!=n1 and x!=n2]
        tmp=l+n
        return tmp


    def path_reliability(self,path,t):
        R=1
        for i in self.nodes_links_from_path(path,None,None):
            if isinstance(i,Link):
                R*=exp(-i.failureRate*t)**i.length
            else:
                R*=exp(-i.failureRate*t)
        return R

    def path_availability(self, path):
        A = 1
        for i in self.nodes_links_from_path(path, None, None):
            if isinstance(i,Link):
                A *= (i.repairRate / (i.failureRate*i.length + i.repairRate))
            else:
                A *= i.repairRate / (i.failureRate + i.repairRate)
        return A

    def calculate_reliability_dijkstra(self,n1,n2,t):
        #razina para cvora
        if n1!=None and n2!=None:
            R=[]
            path=self.ele_path_dijkstra(n1,n2)
            for i in path:
                if not not i:
                    R.append((i,self.path_reliability(i,t)))
            tmp=[x[1] for x in R]
            return [(R,sum(tmp)-tmp[0]*tmp[1])]
        #razina mreze
        else:
            pairs=combinations(self.nodes,2)
            R=[]
            for i in pairs:
                path=self.ele_path_dijkstra(i[0],i[1])
                tmp=[]
                for i in path:
                    if not not i:
                        tmp.append((i,self.path_reliability(i,t)))
                tmp2=[x[1] for x in tmp]
                R.append((tmp,sum(tmp2)-tmp2[0]*tmp2[1]))
            return R

    def calculate_availability_dijkstra(self,n1,n2):
        #razina para cvora
        if n1!=None and n2!=None:
            R=[]
            path=self.ele_path_dijkstra(n1,n2)
            for i in path:
                if not not i:
                    R.append((i,self.path_availability(i)))
            tmp=[x[1] for x in R]
            return [(R,sum(tmp)-tmp[0]*tmp[1])]
        #razina mreze
        else:
            pairs=combinations(self.nodes,2)
            R=[]
            for i in pairs:
                path=self.ele_path_dijkstra(i[0],i[1])
                tmp=[]
                for i in path:
                    if not not i:
                        tmp.append((i,self.path_availability(i)))
                tmp2=[x[1] for x in tmp]
                R.append((tmp,sum(tmp2)-tmp2[0]*tmp2[1]))
            return R

    def calculate_reliability_arbitrary(self,paths,t):
        R=1
        for i in paths:
           R-=(1 - self.path_reliability(i,t))
        return R

    def calculate_availability_arbitrary(self,paths):
        R=1
        for i in paths:
           R-=(1 - self.path_availability(i))
        return R

    def calculate_reliability_all_paths(self,n1,n2,t):
        #razina para cvora
        if n1!=None and n2!=None:
            ele_paths=self.ele_paths_to_bool(n1,n2)
            paths=abraham(ele_paths)
            R=0
            pretty_print(self,ele_paths)
            pretty_print(self,[ele_paths[0]]+paths)
            for i in paths:
                tmp=1
                for j in range(len(i)):
                    if j<len(self.links):
                        length=self.find_element(ele_paths[0][j]).length
                    else:
                        length=1
                    if i[j]=="1":
                        tmp*=exp(-self.find_failure_rate(ele_paths[0][j])*t*length)
                    elif i[j]=="0":
                        tmp*=(1-exp(-self.find_failure_rate(ele_paths[0][j])*t*length))
                R+=tmp
            R*=exp(-n1.failureRate*t)*exp(-n2.failureRate*t)
            return ((n1,n2),R)
        #razina mreze
        else:
            pairs=combinations(self.nodes,2)
            rel=[]
            for i in pairs:
                ele_paths=self.ele_paths_to_bool(i[0],i[1])
                paths=abraham(ele_paths)
                R=0
                for j in paths:
                    tmp=1
                    for k in range(len(j)):
                        if k<len(self.links):
                            length=self.find_element(ele_paths[0][k]).length
                        else:
                            length=1
                        if j[k]=="1":
                            tmp*=exp(-self.find_failure_rate(ele_paths[0][k])*t*length)
                        elif j[k]=="0":
                            tmp*=(1-exp(-self.find_failure_rate(ele_paths[0][k])*t*length))
                    R+=tmp
                R*=exp(-i[0].failureRate*t)*exp(-i[1].failureRate*t)
                rel.append((i,R))
            tmp=[x[1] for x in rel]
            tot=(min(tmp),sum(tmp)/float(len(tmp)))
            return(rel,tot)

    def calculate_availability_all_paths(self,n1,n2):
        #razina para cvora
        if n1!=None and n2!=None:
            ele_paths=self.ele_paths_to_bool(n1,n2)
            paths=abraham(ele_paths)
            R=0
            for i in paths:
                tmp=1
                for j in range(len(i)):
                    if j<len(self.links):
                        length=self.find_element(ele_paths[0][j]).length
                    else:
                        length=1
                    if i[j]=="1":
                        tmp *= (self.find_repair_rate(ele_paths[0][j]) / (self.find_failure_rate(ele_paths[0][j])*length + self.find_repair_rate(ele_paths[0][j])))
                    elif i[j]=="0":
                        tmp *= (1 - self.find_repair_rate(ele_paths[0][j]) / (self.find_failure_rate(ele_paths[0][j])*length + self.find_repair_rate(ele_paths[0][j])))
                R+=tmp
            R*=(n1.repairRate / (n1.failureRate + n1.repairRate)) * (n2.repairRate / (n2.failureRate + n2.repairRate))
            return ((n1,n2),R)
        #razina mreze
        else:
            pairs=combinations(self.nodes,2)
            ava=[]
            for i in pairs:
                ele_paths=self.ele_paths_to_bool(i[0],i[1])
                paths=abraham(ele_paths)
                R=0
                for j in paths:
                    tmp=1
                    for k in range(len(j)):
                        if k<len(self.links):
                            length=self.find_element(ele_paths[0][k]).length
                        else:
                            length=1
                        if j[k]=="1":
                            tmp *= (self.find_repair_rate(ele_paths[0][k]) / (self.find_failure_rate(ele_paths[0][k])*length + self.find_repair_rate(ele_paths[0][k])))
                        elif j[k]=="0":
                            tmp *= (1 - self.find_repair_rate(ele_paths[0][k]) / (self.find_failure_rate(ele_paths[0][k])*length + self.find_repair_rate(ele_paths[0][k])))
                    R+=tmp
                R*=(i[1].repairRate / (i[1].failureRate + i[1].repairRate)) * (i[0].repairRate / (i[0].failureRate + i[0].repairRate))
                ava.append((i,R))
            tmp=[x[1] for x in ava]
            tot=(min(tmp),sum(tmp)/float(len(tmp)))
            return(ava,tot)


nodes = [Node('a', 2000*1e-9, 0.04),
         Node('b', 2000*1e-9, 0.04),
         Node('c', 2000*1e-9, 0.04),
         Node('d', 2000*1e-9, 0.04),
         Node('e', 2000*1e-9, 0.04)]
links = [Link(4, 2000*1e-9, 0.04, nodes[0], nodes[1],'e1'),
         Link(1, 2000*1e-9, 0.04, nodes[0], nodes[2],'e2'),
         Link(2, 2000*1e-9, 0.04, nodes[1], nodes[3],'e3'),
         Link(2, 2000*1e-9, 0.04, nodes[2], nodes[3],'e4'),
         Link(1, 2000*1e-9, 0.04, nodes[1], nodes[4],'e5'),
         Link(1, 2000*1e-9, 0.04, nodes[3], nodes[4],'e6')]
g = Graph(nodes, links)
# print json.dumps(g.to_json()).replace("u'","'")
# a = g.calculate_reliability_dijkstra(nodes[0], nodes[4], 1000)
# b = g.calculate_reliability_arbitrary([['a', 'c', 'd', 'e'], ['a', 'b', 'e']], 1000)
# print b

nodes = [Node('1', 0, 1),
         Node('2', 0, 1),
         Node('3', 0, 1),
         Node('4', 0, 1),
         Node('5', 0, 1)]
links = [Link(100, 1000*1e-9, 0.05, nodes[0], nodes[1],'e1'),
         Link(100, 1000*1e-9, 0.05, nodes[0], nodes[2],'e2'),
         Link(100, 1000*1e-9, 0.05, nodes[1], nodes[4],'e3'),
         Link(100, 1000*1e-9, 0.05, nodes[2], nodes[3],'e4'),
         Link(100, 1000*1e-9, 0.05, nodes[1], nodes[3],'e5'),
         Link(100, 1000*1e-9, 0.05, nodes[3], nodes[4],'e6')]

g=Graph(nodes,links)

# nodes=[Node('gdansk',1,1),  #0
# Node('bydgoszcz',1,1),      #1
# Node('bialystok',1,1),      #2
# Node('poznan',1,1),         #3
# Node('warsaw',1,1),         #4
# Node('wroclaw',1,1),        #5
# Node('lodz',1,1),           #6
# Node('katowice',1,1),       #7
# Node('krakow',1,1),         #8
# Node('rzeszow',1,1)]        #9

# links=[Link(284,1,1,nodes[0],nodes[4],'gdansk-warsaw'),
# Link(328,1,1,nodes[0],nodes[2],'gdansk-bialystok'),
# Link(143,1,1,nodes[0],nodes[1],'gdansk-bydgoszcz'),
# Link(108,1,1,nodes[3],nodes[1],'poznan-bydgoszcz'),
# Link(225,1,1,nodes[1],nodes[4],'bydgoszcz-warsaw'),
# Link(145,1,1,nodes[3],nodes[5],'poznan-wroclaw'),
# Link(182,1,1,nodes[5],nodes[6],'wroclaw-lodz'),
# Link(119,1,1,nodes[6],nodes[4],'lodz-warsaw'),
# Link(176,1,1,nodes[4],nodes[2],'warsaw-bialystok'),
# Link(168,1,1,nodes[5],nodes[7],'wroclaw-katowice'),
# Link(169,1,1,nodes[6],nodes[7],'lodz-katowice'),
# Link(253,1,1,nodes[4],nodes[8],'warsaw-krakow'),
# Link(353,1,1,nodes[2],nodes[9],'bialystok-rzeszow'),
# Link(70,1,1,nodes[7],nodes[8],'katowice-krakow'),
# Link(147,1,1,nodes[8],nodes[9],'krakow-rzeszow')]

# g=Graph(nodes,links)
# print nodes[5],"-",nodes[2],":",g.ele_path_dijkstra(nodes[5],nodes[2])
# print nodes[0],"-",nodes[5],":",g.ele_path_dijkstra(nodes[0],nodes[5])
# print nodes[0],"-",nodes[9],":",g.ele_path_dijkstra(nodes[0],nodes[9])
# #wroclaw - bialystok : (['wroclaw', 'lodz', 'warsaw', 'bialystok'], ['wroclaw', 'poznan','bydgoszcz', 'gdansk', 'bialystok'])
# #gdansk - wroclaw : (['gdansk', 'bydgoszcz', 'poznan', 'wroclaw'], ['gdansk', 'warsaw', 'lodz', 'wroclaw'])
# #gdansk - rzeszow : (['gdansk', 'bialystok', 'rzeszow'], ['gdansk', 'warsaw', 'krakow', 'rzeszow'])
