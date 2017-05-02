from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pickle
from node import node_from_dict
from link import link_from_dict

def index(request):
    return HttpResponse("asdf")

@csrf_exempt
def topo(request):
    if request.method == 'POST':
        nodes=[]
        links=[]
        for i in json.loads(request.body)["nodes"]:
            nodes.append(node_from_dict(i))
        for i in json.loads(request.body)["links"]:
            links.append(link_from_dict(i))
        request.session["nodes"]=nodes
        request.session["links"]=links
    else:
        nodes=request.session["nodes"]
        links=request.session["links"]
        ns="{\"nodes\":["
        for i in nodes:
            ns+="{\"name\":\""+i.name+"\",\"mi\":"+str(i.mi)+",\"lambda\":"+str(i.la)+"},"
        ns=ns[:-1]+"],"
        ls="\n\"links\":["
        for i in links:
            ls+="{\"length\":"+str(i.length)+",\"mi\":"+str(i.mi)+",\"lambda\":"+str(i.la)+",\"n1\":\""+i.n1+"\",\"n2\":\""+i.n2+"\"},"
        ls=ls[:-1]+"]}\n"
        print ns+ls
        return JsonResponse(json.loads(ns+ls))
    return HttpResponse("OK")


