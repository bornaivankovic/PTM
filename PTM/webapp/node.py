class Node:
    def __init__(self,name,la,mi):
        self.name=str(name)
        self.la=la
        self.mi=mi
    
    def __repr__(self):
        return self.name

    
def node_from_dict(d):
    name=str(d["name"])
    la=d["lambda"]
    mi=d["mi"]
    return Node(name,la,mi)

    