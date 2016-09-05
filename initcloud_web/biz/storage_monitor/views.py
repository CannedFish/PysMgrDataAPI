import logging

from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status

from biz.common.pagination import PagePagination
from biz.storage_monitor.serializer import StorageNodeSerializer, TreeNodeSerializer,\
        StorageBarSerializer, PhyNodesSerializer

import cloud.api.storage as storage

LOG = logging.getLogger(__name__)

class StorageNodeList(generics.ListAPIView):
    serializer_class = StorageNodeSerializer
    pagination_class = PagePagination
    EmptyData = {
        'name': None,
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

    def get_queryset(self):
        clusterlist = storage.get_cluster_list()
        EmptyData = self.__class__.EmptyData
        if clusterlist['success']:
            queryset = []
            for server in clusterlist['data']:
                EmptyData['name'] = server['hostname']
                serverstatus = storage.get_server_status(server['id'])
                if serverstatus['success']:
                    status = serverstatus['data']
                    if status['status'] != 'offline':
                        query = {
                            'name': server['hostname'],
                            'item': {
                                'cpu_used': [round(status['cpu'], 3)*100],
                                'cpu_frequence': [0.0] if status['cpuClock']=='' \
                                        else [float(status['cpuClock'][0:-3])],
                                'memory': {
                                    'memory_used': round(status['memUsed']\
                                            /float(status['memTotal'])*100, 1) \
                                            if status['memTotal']!=0 else 0,
                                    'memory_total': status['memTotal'],
                                    'used': status['memUsed'],
                                    'empty': status['memTotal']-status['memUsed']
                                },
                                'network_card': {
                                    'up': status['netIntfStatus'][0]['rxPer'],
                                    'up_rate': status['netIntfStatus'][0]['txRate'],
                                    'down': status['netIntfStatus'][0]['rxPer'],
                                    'down_rate': status['netIntfStatus'][0]['rxRate']
                                }
                            }
                        }
                    else:
                        query = EmptyData
                else:
                    LOG.info("Get %s status error: %s" % \
                            (server['hostname'], serverstatus['error']))
                    query = EmptyData
                queryset.append(query)
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

class StorageBarDetail(APIView):
    def get(self, request):
        disklist = storage.get_disk_list()
        if disklist['success']:
            dl = disklist['data']
            # used
            storage_bar = {'disk':[0,0], 'SSD':[0,0], 'NVMe':[0,0], 'SAS': [0,0]}
            poollist = storage.get_pool_list()
            if poollist['success']:
                disks_used = []
                for pool in poollist['data']:
                    for disk in pool['disks']:
                        disks_used.append(disk['name'])
                # total
                disk_used, disk_total = 0, len(dl)
                ssd, nvme, sas = ssd_total, nvme_total, sas_total = 0, 0, 0
                for disk in dl:
                    if disk['id'] in disks_used:
                        used = True
                        disk_used += 1
                    else:
                        used = False
                    for flag in disk['flags']:
                        if flag == 'ssd':
                            ssd_total += 1
                            if used:
                                ssd += 1
                        elif flag == 'sas':
                            sas_total += 1
                            if used:
                                sas += 1
                        else:
                            nvme_total += 1
                            if used:
                                nvme += 1
                storage_bar = {
                    'disk': [disk_used, disk_total-disk_used],
                    'SSD': [ssd, ssd_total-ssd],
                    'NVMe': [nvme, nvme_total-nvme],
                    'SAS': [sas, sas_total-sas]
                }
            else:
                LOG.info("Get pool list error: %s" % poollist['error'])
            serializer = StorageBarSerializer(storage_bar)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            LOG.info("Get disk list error: %s" % disklist['error'])
            return Response(disklist['error'], status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PhyNodesList(APIView):
    def get(self, request):
        """
        nodes = [
            {
                'cpuUsed': 70,
                'memUsed': 10,
                'rx': 85,
                'tx': 100
            },
            {
                'cpuUsed': 75,
                'memUsed': 30,
                'rx': 95,
                'tx': 60
            }  
        ]
        """
        clusterlist = storage.get_cluster_alive()
        if clusterlist['success']:
            nodes = []
            for server in clusterlist['data']:
                serverstatus = storage.get_server_status(server['id'])
                if serverstatus['success']:
                    ss = serverstatus['data']
                    nodes.append({
                        'cpuUsed': round(ss['cpu'], 3)*100,
                        'memUsed': round(ss['memUsed']/float(ss['memTotal'])*100, 1),
                        'rx': ss['netIntfStatus'][0]['rxPer'],
                        'tx': ss['netIntfStatus'][0]['txPer']
                    })
                else:
                    LOG.info("Get %s status error: %s" % \
                            (server['id'], serverstatus['error']))
            serializer = PhyNodesSerializer(nodes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            LOG.info("Get cluster alive error: %s" % clusterlist['error'])
            return Response(clusterlist['error'], status=status.HTTP_500_INTERNAL_SERVER_ERROR)

