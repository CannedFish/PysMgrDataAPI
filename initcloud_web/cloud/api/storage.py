# -*- coding: utf-8 -*-

import logging
import requests

from django.conf import settings

LOG = logging.getLogger(__name__)

def __get_request(url):
    try:
        r = requests.get(url)
        ret = r.json()
    except Exception, e:
        ret = {
            'success': False,
            'error': e
        }
    return ret

def __post_request(url, data):
    try:
        r = requests.post(url, data=data)
        ret = r.json()
    except Exception, e:
        ret = {
            'success': False,
            'error': e
        }
    return ret

def __put_request(url, data):
    try:
        r = requests.put(url, data=data)
        ret = r.json()
    except Exception, e:
        ret = {
            'success': False,
            'error': e
        }
    return ret

# cluster
def get_cluster_list():
    url = settings.STORAGE_URL[0] + '/cluster/list'
    return __get_request(url)

def get_cluster_alive():
    url = settings.STORAGE_URL[0] + '/cluster/alive'
    return __get_request(url)

def get_cluster_mailconfig():
    url = settings.STORAGE_URL[0] + '/cluster/mailconfig'
    return __get_request(url)

def post_cluster_mailconfig(data):
    url = settings.STORAGE_URL[0] + '/cluster/mailconfig'
    return __post_request(url, data)

def get_cluster_warnings():
    url = settings.STORAGE_URL[0] + '/cluster/warnings'
    return __get_request(url)

# disk
def get_jbod_list():
    url = settings.STORAGE_URL[0] + '/jbod/list'
    return __get_request(url)

def get_disk_status():
    url = settings.STORAGE_URL[0] + '/disk/status'
    return __get_request(url)

def post_disk_blink(data):
    url = settings.STORAGE_URL[0] + '/disk/blink'
    return __post_request(url, data)

def post_disk_bench(data):
    url = settings.STORAGE_URL[0] + '/disk/bench'
    return __post_request(url, data)

# server
def get_server_status(sid):
    url = settings.STORAGE_URL[0] + '/server/status?id=%s' % sid
    return __get_request(url)

def get_server_log(sid):
    url = settings.STORAGE_URL[0] + '/server/log?id=%s' % sid
    return __get_request(url)

# pool
def get_pool_status():
    url = settings.STORAGE_URL[0] + '/pool/status'
    return __get_request(url)

# HA
def get_ha_server_list():
    url = settings.STORAGE_URL[0] + '/ha/server/list'
    return __get_request(url)

def get_ha_serverconfig_list():
    url = settings.STORAGE_URL[0] + '/ha/serverconfig/list'
    return __get_request(url)

def put_ha_buckup(data):
    url = settings.STORAGE_URL[0] + '/ha/buckup'
    return __put_request(url)

def get_ha_backup():
    url = settings.STORAGE_URL[0] + '/ha/buckup'
    return __get_request(url)

def get_ha_qdisk_list():
    url = settings.STORAGE_URL[0] + '/ha/qdisk/list'
    return __get_request(url)

def get_ha_qdisk_status():
    url = settings.STORAGE_URL[0] + '/ha/qdisk/status'
    return __get_request(url)

def get_ha_poolloc_list():
    url = settings.STORAGE_URL[0] + '/ha/poolloc/list'
    return __get_request(url)

