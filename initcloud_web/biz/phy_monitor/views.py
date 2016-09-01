import requests, logging

from rest_framework.response import Response
from rest_framework import generics

from biz.common.decorators import require_GET, require_POST
from biz.common.pagination import PagePagination
from biz.phy_monitor.serializer import PhyMonitorSerializer

import cloud.api.redfish as redfish

LOG = logging.getLogger(__name__)

class PhyMonitorList(generics.ListAPIView):
    serializer_class = PhyMonitorSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return []

