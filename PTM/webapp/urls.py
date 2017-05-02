from django.conf.urls import url
from django.contrib.auth import views as auth_views


from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^topo',views.topo,name='topo'),
    url(r'^login/$',auth_views.login,{'template_name':'login.html'},name='login'),
    url(r'^logout/$',auth_views.logout,name='logout')
]