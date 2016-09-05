# -*- coding: utf-8 -*-

from rest_framework import serializers

# StorageNode
class MemorySerializer(serializers.Serializer):
    memory_used = serializers.FloatField()
    memory_total = serializers.IntegerField()
    used = serializers.IntegerField()
    empty = serializers.IntegerField()

class NetworkCardSerializer(serializers.Serializer):
    up = serializers.CharField()
    up_rate = serializers.CharField()
    down = serializers.CharField()
    down_rate = serializers.CharField()

class ItemSerializer(serializers.Serializer):
    cpu_used = serializers.ListField(child=serializers.FloatField())
    cpu_frequence = serializers.ListField(child=serializers.FloatField())
    memory = MemorySerializer()
    network_card = NetworkCardSerializer()

class StorageNodeSerializer(serializers.Serializer):
    name = serializers.CharField()
    item = ItemSerializer()

# Treeview
class DiskSerializer(serializers.Serializer):
    label = serializers.CharField()
    data = serializers.DictField()

class TreeNodeDataSerializer(serializers.Serializer):
    status = serializers.CharField()
    description = serializers.CharField()

class NodeListSerializer(serializers.Serializer):
    label = serializers.CharField()
    data = TreeNodeDataSerializer()
    children = DiskSerializer(many=True)

class TreeNodeSerializer(serializers.Serializer):
    label = serializers.CharField()
    nodelist = NodeListSerializer(many=True)

# StorageBar
class StorageBarSerializer(serializers.Serializer):
    disk = serializers.ListField(child=serializers.IntegerField())
    SSD = serializers.ListField(child=serializers.IntegerField())
    NVMe = serializers.ListField(child=serializers.IntegerField())
    SAS = serializers.ListField(child=serializers.IntegerField())

# PhyNodes
class PhyNodesSerializer(serializers.Serializer):
    cpuUsed = serializers.FloatField()
    memUsed = serializers.FloatField()
    rx = serializers.FloatField()
    tx = serializers.FloatField()

