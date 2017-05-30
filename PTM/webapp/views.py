from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.template import loader
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate,logout
from django.db import IntegrityError
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

def error(request):
    return HttpResponse(status=401)


@csrf_exempt
def signup(request):
    if request.method == 'POST':
        username = json.loads(request.body).get('username')
        raw_password = json.loads(request.body).get('password')
        user = authenticate(username=username, password=raw_password)
        if user is None:
            try:
                user=User.objects.create_user(username=username,password=raw_password)
                response = "{\"user\":\"created\"}"
            except IntegrityError:
                response = "{\"user\":\"wrong_password\"}"
        else:
            response = "{\"user\":\"valid\"}"
        return JsonResponse(json.loads(response))

# @login_required(login_url='error')
@csrf_exempt
def dijkstra(request):
    username = json.loads(request.body)["username"]
    password = json.loads(request.body)["password"]
    if authenticate(username=username, password=password) is not None:
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
                ava = g.calculate_availability_dijkstra(start, end)
            else:
                rel=g.calculate_reliability_dijkstra(None,None,t)
                ava = g.calculate_availability_dijkstra(None, None)

            s="{\"result\":["
            for i in rel:
                p=i[0]
                r=i[1]
                s+="{\"paths\":"+json.dumps(paths_to_json(p[0],p[1]))
                s+=",\"reliability\":{\"s,t\":"+str(r[0])+",\"av\":"+str(r[1])+"},"
                s += "\"availability\":{\"s,t\":" + str(ava[0][1][0]) + ",\"av\":" + str(ava[0][1][1]) + "}},"
                print s
            s=s[:-1]
            s+="]}"
            response=json.loads(s)
            return JsonResponse(response)
        else:
            nodes = request.session["nodes"]
            links = request.session["links"]
            g = Graph(nodes, links)
            return JsonResponse(g.to_json())
    else:
        return HttpResponse(status = 401)

#@login_required(login_url='error')
@csrf_exempt
def nodepair(request):
    username = json.loads(request.body)["username"]
    password = json.loads(request.body)["password"]
    if authenticate(username=username, password=password) is not None:
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
                ava = g.calculate_availability_all_paths(start, end)
            else:
                rel=g.calculate_reliability_all_paths(None,None,t)
                ava = g.calculate_availability_all_paths(None, None)

            s="{\"reliability\":" + str(rel) + ",\"availability\":" + str(ava) + "}"
            response=json.loads(s)
            return JsonResponse(response)
        else:
            nodes = request.session["nodes"]
            links = request.session["links"]
            g = Graph(nodes, links)
            return JsonResponse(g.to_json())
    else:
        return HttpResponse(status = 401)