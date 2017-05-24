from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
import json
import pickle
from node import node_from_dict
from link import link_from_dict
from graph import Graph,paths_to_json
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
        startLabel = json.loads(request.body).get("start")
        endLabel = json.loads(request.body).get("end")
        d = {}
        for i in nodes:
            if i.label == startLabel:
                start = i
            elif i.label == endLabel:
                end = i
            d[i.label] = i
        for i in linksLabels:
            links.append(Link(i.length, i.failureRate, i.repairRate, d[i.src], d[i.dest],i.label))
        request.session["nodes"] = nodes
        request.session["links"] = links
        g = Graph(nodes, links)
        t=json.loads(request.body)["t"]
        if 'start' in locals():
            rel=g.calculate_reliability_dijkstra(start,end,t)
        else:
            rel=g.calculate_reliability_dijkstra(None,None,t)

        s="{\"result\":["
        for i in rel:
            p=i[0]
            r=i[1]
            s+="{\"pahts\":"+json.dumps(paths_to_json(p[0],p[1]))
            s+=",\"reliability\":{\"s,t\":"+str(r[0])+",\"av\":"+str(r[1])+"}},"
        s=s[:-1]
        s+="]}"
        response=json.loads(s)
        return JsonResponse(response)
    else:
        nodes = request.session["nodes"]
        links = request.session["links"]
        g = Graph(nodes, links)
        return JsonResponse(g.to_json())
@csrf_exempt
def nodepair(request):
    if request.method == 'POST':
        nodes = []
        links = []
        linksLabels = []
        for i in json.loads(request.body)["nodes"]:
            nodes.append(node_from_dict(i))
        for i in json.loads(request.body)["links"]:
            linksLabels.append(link_from_dict(i))
        startLabel = json.loads(request.body).get("start")
        endLabel = json.loads(request.body).get("end")
        d = {}
        for i in nodes:
            if i.label == startLabel:
                start = i
            elif i.label == endLabel:
                end = i
            d[i.label] = i
        for i in linksLabels:
            links.append(Link(i.length, i.failureRate, i.repairRate, d[i.src], d[i.dest],i.label))
        request.session["nodes"] = nodes
        request.session["links"] = links
        g = Graph(nodes, links)
        t=json.loads(request.body)["t"]
        if 'start' in locals():
            rel=g.calculate_reliability_all_paths(start,end,t)
        else:
            rel=g.calculate_reliability_all_paths(None,None,t)

        s="{\"result\":["
        for i in rel:
            p=i[0]
            r=i[1]
            s+="{\"pahts\":"+json.dumps(paths_to_json(p[0],p[1]))
            s+=",\"reliability\":{\"s,t\":"+str(r[0])+",\"av\":"+str(r[1])+"}},"
        s=s[:-1]
        s+="]}"
        response=json.loads(s)
        return JsonResponse(response)
    else:
        nodes = request.session["nodes"]
        links = request.session["links"]
        g = Graph(nodes, links)
        return JsonResponse(g.to_json())



