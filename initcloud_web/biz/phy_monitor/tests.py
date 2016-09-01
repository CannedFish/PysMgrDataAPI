from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory

import biz.phy_monitor.views as pm_views

class PhyMonitorTest(APITestCase):
    def test_phy_monitor(self):
        r = APIRequestFactory('/api/phy_monitor/')
        # r = self.client.get('/api/phy_monitor/')
        view = pm_views.PhyMonitorList.as_view()
        res = view(r)
        res.render()
        self.assertEqual(res.status_code, 200)
