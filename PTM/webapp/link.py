class Link:
    def __init__(self,length,la,mi,n1,n2):
        self.length=length
        self.la=la
        self.mi=mi
        self.n1=n1
        self.n2=n2

    def __repr__(self):
        return '{}-{}'.format(self.n1,self.n2)

def link_from_dict(d):
    length=d["length"]
    la=d["lambda"]
    mi=d["mi"]
    n1=d["n1"]
    n2=d["n2"]
    return Link(length,la,mi,n1,n2)
