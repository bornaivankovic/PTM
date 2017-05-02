from node import Node
from link import Link
class Graph:
    def __init__(self,nodes,links):
        self.nodes=nodes
        self.links=links

    def parse_json(self,file):
        
    
nodes=[Node(1,0.5,0.7),Node(2,0.4,0.7)]
links=[Link(10,0.4,0.6,nodes[0],nodes[1])]
g=Graph(nodes,links)
print g.nodes,g.links