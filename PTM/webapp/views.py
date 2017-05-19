from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
import json
import pickle
from node import node_from_dict
from link import link_from_dict
from graph import Graph
from link import Link

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
    else:
        nodes=request.session["nodes"]
        links=request.session["links"]
        graph=Graph(nodes,links)
        return JsonResponse(graph.to_json())
    return HttpResponse("OK")

@csrf_exempt
def dijkstra(request):
    if request.method == 'POST':
        nodes = []
        links = []
        linksLabels = []
        for i in json.loads(request.body)["nodes"]:
            nodes.append(node_from_dict(i))
        for i in json.loads(request.body)["links"]:
            linksLabels.append(link_from_dict(i))
        startLabel = json.loads(request.body)["start"]
        endLabel = json.loads(request.body)["end"]
        d = {}
        for i in nodes:
            if i.label == startLabel:
                start = i
            elif i.label == endLabel:
                end = i
            d[i.label] = i
        for i in linksLabels:
            links.append(Link(i.length, i.failureRate, i.repairRate, d[i.src], d[i.dest]))
        request.session["nodes"] = nodes
        request.session["links"] = links
        g = Graph(nodes, links)
        path = g.ele_path_dijkstra(start, end)
        return JsonResponse(path)
    else:
        nodes = request.session["nodes"]
        links = request.session["links"]
        g = Graph(nodes, links)
        return JsonResponse(g.to_json())