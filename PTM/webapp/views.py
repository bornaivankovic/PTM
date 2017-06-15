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
from graph import Graph,paths_to_json,path_to_json
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
            for i in range(rel.__len__()):
                s+="{\"primary\":{\"path\":"+path_to_json(rel[i][0][0][0])+",\"reliability\":"+str(rel[i][0][0][1])+",\"availability\":"+str(ava[i][0][0][1])+"},"
                s+="\"secondary\":{\"path\":"+path_to_json(rel[i][0][1][0])+",\"reliability\":"+str(rel[i][0][1][1])+",\"availability\":"+str(ava[i][0][1][1])+"},"
                s+="\"total\":{\"reliability\":"+str(rel[i][1])+",\"availability\":"+str(ava[i][1])+"}},"
            s=s[:-1]
            rel_tot=[x[1] for x in rel]
            ava_tot=[x[1] for x in ava]
            rel_st=min(rel_tot)
            rel_av=sum(rel_tot)/float(len(rel_tot))
            ava_st=min(ava_tot)
            ava_av=sum(ava_tot)/float(len(ava_tot))
            s+="],\"reliability\":{\"s,t\":"+str(rel_st)+",\"av\":"+str(rel_av)+"},"
            s+="\"availability\":{\"s,t\":"+str(ava_st)+",\"av\":"+str(ava_av)+"}}"
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
                s = "{\"result\":{\"reliability\":" + str(rel) + ",\"availability\":" + str(ava) + "}}"
            else:
                rel=g.calculate_reliability_all_paths(None,None,t)
                ava = g.calculate_availability_all_paths(None, None)
                s = "{\"result\":{\"reliability\":{\"s,t\":" + str(rel[0]) + ",\"av\":" + str(rel[1]) + "},\"availability\":{\"s,t\":" + str(ava[0]) + ",\"av\":" + str(ava[1]) + "}}}"

            response=json.loads(s)
            return JsonResponse(response)
        else:
            nodes = request.session["nodes"]
            links = request.session["links"]
            g = Graph(nodes, links)
            return JsonResponse(g.to_json())
    else:
        return HttpResponse(status = 401)

@csrf_exempt
def paths(request):
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
            d = {}
            for i in nodes:
                d[i.label] = i
            for i in linksLabels:
                links.append(Link(i.length, i.failureRate, i.repairRate, d[i.src], d[i.dest], i.label))
            pathsString = json.loads(request.body)["paths"]
            t = json.loads(request.body)["t"]
            paths = []
            for i in pathsString:
                paths.append(i.split("-"))
            g = Graph(nodes, links)
            rel = g.calculate_reliability_arbitrary(paths, t)
            ava = g.calculate_availability_arbitrary(paths)

            s = "{\"reliability\":" + str(rel) + ",\"availability\":" + str(ava) + "}"
            return JsonResponse(json.loads(s))

        else:
            nodes = request.session["nodes"]
            links = request.session["links"]
            g = Graph(nodes, links)
            return JsonResponse(g.to_json())
    else:
        return HttpResponse(status=401)