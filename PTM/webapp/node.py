class Node:
    def __init__(self,name,la,mi):
        self.label=str(name)
        self.failureRate=la
        self.repairRate=mi
    
    def __repr__(self):
        return self.label

    
def node_from_dict(d):
    name=str(d["label"])
    la=d["failureRate"]
    mi=d["repairRate"]
    return Node(name,la,mi)

    