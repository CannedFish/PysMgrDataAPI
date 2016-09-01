# -*- coding: utf-8 -*-

from rest_framework import serializers

class PhyNodeSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=64)
    cpu1 = serializers.ListField(child=serializers.IntegerField())
    cpu2 = serializers.ListField(child=serializers.IntegerField())
    memory_voltage = serializers.ListField(child=serializers.IntegerField())

class PhyMonitorSerializer(serializers.Serializer):
    nodes = PhyNodeSerializer()
    disk = serializers.ListField(child=serializers.IntegerField())
    disk_status = serializers.DictField(child=serializers.CharField())
    electric_rota = serializers.ListField(child=serializers.IntegerField())
    systemUI = serializers.ListField(serializers.FloatField())
    PDU = serializers.ListField(child=serializers.ListField(\
            child=serializers.FloatField()))
