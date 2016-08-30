import logging
import requests

from django.conf import settings

LOG = logging.getLogger(__name__)

def __read_requests(url):
    """
    The GET method is used to request a representation of a specified resource.
    The representation can be either a single resource or a collection.
    """
    try:
        r = requests.get(url)
    except Exception, e:
        LOG.info(e)

def __update(url, data):
    """
    The PATCH method is used to apply partial modifications to a resource.
    """
    pass

def __replace(url, data):
    """
    The PUT method is used to completely replace a resource. 
    Any properties omitted from the body of the
    request are reset to their default value.
    """
    pass

def __create(url, data):
    """
    The POST method is used to create a new resource.
    This request is submitted to the resource collection
    in which the new resource is meant to belong.
    """
    pass

def __actions(url, data):
    """
    The POST method may also be used to initiate operations on the object (Actions). 
    The POST operation may not be idempotent.
    """
    pass

def __delete(url):
    """
    The DELETE method is used to remove a resource.
    """
    pass

