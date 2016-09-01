# -*- coding: utf-8 -*-

from rest_framework import serializers

# StorageNode
class MemorySerializer():
    memory_used = serializers.CharField()
    memory_total = serializers.CharField()
    used = serializers.CharField()
    empty = serializers.CharField()

class NetworkCardSerializer():
    up = serializers.CharField()
    up_rate = serializers.CharField()
    down = serializers.CharField()
    down_rate = serializers.CharField()

class ItemSerializer():
    cpu_used = serializers.ListField(child=serializers.IntegerField())
    cpu_frequence = serializers.ListField(child=serializers.FloatField())
    memory = MemorySerializer()
    network_card = NetworkCardSerializer()

class StorageNodeSerializer(serializers.Serializer):
    name = serializers.CharField()
    item = ItemSerializer()

# Treeview
class DiskSerializer():
    label = serializers.CharField()
    data = serializers.DictField()

class TreeNodeDataSerializer():
    status = serializers.CharField()
    description = serializers.CharField()

class TreeNodeSerializer():
    label = serializers.CharField()
    data = TreeNodeDataSerializer()
    children = ListField(child=DiskSerializer())

