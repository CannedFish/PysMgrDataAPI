import logging

from rest_framework.response import Response
from rest_framework import generics
# from rest_framework import status

from biz.common.pagination import PagePagination
from biz.storage_monitor.serializer import StorageNodeSerializer, TreeNodeSerializer

import cloud.api.storage as storage

LOG = logging.getLogger(__name__)

class StorageNodeList(generics.ListAPIView):
    serializer_class = StorageNodeSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        clusterlist = storage.get_cluster_list()
        if clusterlist['success']:
            queryset = []
            for server in clusterlist['data']:
                serverstatus = storage.get_server_status(server['id'])
                if serverstatus['success']:
                    status = serverstatus['data']
                    if status['status'] != 'offline':
                        query = {
                            'name': server['hostname'],
                            'item': {
                                'cpu_used': [float(status['cpu'])*100],
                                'cpu_frequence': [float(status['cpuClock'][0:-3])],
                                'memory': {
                                    'memory_used': (status['memUsed']/float(status['memTotal'])) \
                                            if status['memTotal']!=0 else 0,
                                    'memory_total': status['memTotal'],
                                    'used': status['memUsed'],
                                    'empty': status['memTotal']-status['memUsed']
                                },
                                'network_card': {
                                    'up': 0,
                                    'up_rate': status['netIntfStatus'][0]['txRate'],
                                    'down': 0,
                                    'down_rate': status['netIntfStatus'][0]['rxRate']
                                }
                            }
                        }
                    else:
                        query = {
                            'name': server['hostname'],
                            'item': {
                                'cpu_used': [0],
                                'cpu_frequence': [0],
                                'memory': {
                                    'memory_used': 0,
                                    'memory_total': 0,
                                    'used': 0,
                                    'empty': 0 
                                },
                                'network_card': {
                                    'up': 0,
                                    'up_rate': 0,
                                    'down': 0,
                                    'down_rate': 0
                                }
                            }
                        }
                    queryset.append(query)
                else:
                    LOG.info("Get %s status error: %s" % \
                            (server['hostname'], serverstatus['error']))
            return queryset
        else:
            LOG.info("Get cluster list error: %s" % clusterlist['error'])
            return []

class TreeNodeList(generics.ListAPIView):
    serializer_class = TreeNodeSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        poolstatus = storage.get_pool_status()
        if poolstatus['success']:
            serverlist = storage.get_cluster_alive()
            if serverlist['success']:
                queryset = [{\
                    'label': server['id'],\
                    'nodelist': [{\
                        'label': pool['id'],\
                        'data': {\
                            'status': pool['status'],\
                            'description': pool['description'],\
                        },\
                        'children': [{\
                            'label': disk['name'],\
                            'data': {'status': disk['state']}\
                        } for disk in pool['diskList']]\
                    } for pool in filter(lambda x: x['serverId']==server['id'], poolstatus['data'])]\
                } for server in serverlist['data']]
            else:
                LOG.info("Get cluster alive error: %s" % serverlist['error'])
            return queryset
        else:
            LOG.info("Get pool status error: %s" % poolstatus['error'])
            return []

