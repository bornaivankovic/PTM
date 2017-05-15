class Link:
    def __init__(self,length,la,mi,n1,n2):
        self.length=length
        self.failureRate=la
        self.repairRate=mi
        self.src=n1
        self.dest=n2

    def __repr__(self):
        return '{}-{}'.format(self.src,self.dest)

def link_from_dict(d):
    length=d["length"]
    la=d["failureRate"]
    mi=d["repairRate"]
    n1=d["src"]
    n2=d["dest"]
    return Link(length,la,mi,n1,n2)
