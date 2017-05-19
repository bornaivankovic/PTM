from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
import json
import pickle
from node import node_from_dict
from link import link_from_dict
from graph import Graph

def index(request):
    template = loader.get_template('base.html')
    context = {}
    return HttpResponse(template.render(context, request))

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
        nodes=request.session["nodes"]
        links=request.session["links"]
        graph=Graph(nodes,links)
        return JsonResponse(graph.to_json())       
    return HttpResponse("OK")


