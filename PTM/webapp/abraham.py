# from graph import Graph
def compare(Pi,Sj):
    X=[]
    for i in range(len(Sj)):
        if Sj[i]=="1" and Pi[i]=="0":
            return True
        elif Sj[i]=="1" and Pi[i]=="-":
            X.append(i)
    return X

def abraham(S):
    DS=[S[1]]
    for i in range(2,len(S)):
        PD=[S[i]]
        for j in range(1,i):
            tmp=[]
            for k in range(len(PD)):
                X=compare(PD[k],S[j])
                if X is True:
                    tmp.append(PD[k])
                elif len(X)==0:
                    continue
                elif 0<len(X)<len(S[0]):
                    pos=[]
                    for l in X:
                        t=list(PD[k])
                        t[l]="0"
                        for m in pos:
                            t[m]="1"
                        pos.append(l)
                        tmp.append(t)
            PD=list(tmp)
        DS+=PD
    return DS

def pretty_print(g,arr):
    s=""
    for i in range(len(arr)):
        if i==0:
            for j in range(len(arr[i])):
                if j==len(g.links):
                    s+="|"
                s+=arr[i][j]+" "
            s+="\n"
            s+="-"*len(s)+"\n"
        else:
            for j in range(len(arr[i])):
                if j==len(g.links):
                    s+="|"
                s+=arr[i][j]+" "*len(arr[0][j])
            s+="\n"
    print s

