import logging
import requests
from requests.auth import HTTPBasicAuth

from django.conf import settings

LOG = logging.getLogger(__name__)
__AUTH = HTTPBasicAuth(settings.REDFISH_USR, settings.REDFISH_PSD)

def __read_requests(url):
    """
    The GET method is used to request a representation of a specified resource.
    The representation can be either a single resource or a collection.
    """
    rsp = {}
    try:
        r = requests.get(url, auth=__AUTH)
        rsp['body'] = r.json()
    except Exception, e:
        LOG.info(e)
    rsp['code'] = r.status_code
    return rsp

def __update(url, data):
    """
    The PATCH method is used to apply partial modifications to a resource.
    """
    rsp = {}
    try:
        r = requests.patch(url, data=data, auth=__AUTH)
        rsp['body'] = r.json()
    except Exception, e:
        LOG.info(e)
    rsp['code'] = r.status_code
    return rsp

def __replace(url, data):
    """
    The PUT method is used to completely replace a resource. 
    Any properties omitted from the body of the
    request are reset to their default value.
    """
    rsp = {}
    try:
        r = requests.put(url, data=data, auth=__AUTH)
        rsp['body'] = r.json()
    except Exception, e:
        LOG.info(e)
    rsp['code'] = r.status_code
    return rsp


def __create(url, data):
    """
    The POST method is used to create a new resource.
    This request is submitted to the resource collection
    in which the new resource is meant to belong.
    """
    rsp = {}
    try:
        r = requests.post(url, data=data, auth=__AUTH)
        rsp['body'] = r.json()
    except Exception, e:
        LOG.info(e)
    rsp['code'] = r.status_code
    return rsp

def __actions(url, data):
    """
    The POST method may also be used to initiate operations on the object (Actions). 
    The POST operation may not be idempotent.
    """
    rsp = {}
    try:
        r = requests.post(url, data=data, auth=__AUTH)
        rsp['body'] = r.json()
    except Exception, e:
        LOG.info(e)
    rsp['code'] = r.status_code
    return rsp

def __delete(url):
    """
    The DELETE method is used to remove a resource.
    """
    rsp = {}
    try:
        r = requests.delete(url, auth=__AUTH)
    except Exception, e:
        LOG.info(e)
    rsp['code'] = r.status_code
    return rsp

