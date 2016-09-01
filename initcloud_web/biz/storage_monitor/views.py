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
                    query = {
                        'name': server['hostname'],
                        'item': {
                            'cpu_used': None,
                            'cpu_frequence': None,
                            'memory': {
                                'memory_used': status['memUsed'],
                                'memory_total': status['memTotal'],
                                'used': status['memUsed'],
                                'empty': status['memTotal']-status['memUsed']
                            },
                            'network_card': {
                                'up': None,
                                'up_rate': None,
                                'down': None,
                                'down_rate': None
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
        pass

