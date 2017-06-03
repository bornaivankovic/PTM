from django.conf.urls import url
from django.contrib.auth import views as auth_views


from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    # url(r'^login/$',auth_views.login,{'template_name':'login.html'},name='login'),
    # url(r'^logout/$',auth_views.logout,name='logout'),
    url(r'^dijkstra', views.dijkstra, name='dijkstra'),
    url(r'^nodepair',views.nodepair,name="nodepair"),
    url(r'^signup',views.signup,name='singup'),
    url(r'^error',views.error,name='error'),
    url(r'^paths', views.paths, name='paths')
]