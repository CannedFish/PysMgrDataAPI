/**
 * Created by yangdongdong 
 * Author: ydd322@gmail.com
 * Date: 2015-05-04
 * Description: Main Cloud App
 */

'use strict';

function template(name){
    return "../static/management/views/" + name + ".html";
}
/* Cloud App */
var CloudApp = angular.module("CloudApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "ngTable",
    "ngResource",
    "ngCookies",
    "ngBootbox",
    "jm.i18next",
    "ngLodash",
    "ui.load",
    "ui.jq",
    "pageutil.jq",
    'abn.tree',
    "cloud.services",
    "cloud.resources",
    "cloud.directives"
]);

CloudApp.config(function ($i18nextProvider) {
    $i18nextProvider.options = {
        lng: 'cn',
        fallbackLng: 'en',
        useCookie: false,
        useLocalStorage: false,
        resGetPath: '../static/locales/__lng__/__ns__.json'
    };
});

CloudApp.config(['$resourceProvider', function ($resourceProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
}]);

CloudApp.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol("{[{");
    $interpolateProvider.endSymbol("}]}");
}]);

CloudApp.config(['$httpProvider', function($httpProvider){
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Request-Width'];
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.interceptors.push('AuthInterceptor');
}]);

CloudApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({});
}]);

/* Setup App Main Controller */
CloudApp.controller('AppController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function () {
        Metronic.initComponents(); // init core components
    });
}]);

/***
 Layout Partials.
 By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
 initialization can be disabled and Layout.init() should be called on page load complete as explained above.
 ***/

/* Setup Layout Part - Header */
CloudApp.controller('HeaderController', ['$rootScope', '$scope', '$http', 'UserProfileService',
    function ($rootScope, $scope, $http, UserProfileService) {

        $scope.$on('$includeContentLoaded', function () {
            Layout.initHeader(); // init header
        });

        $scope.UserProfileService = UserProfileService;
}]);

/* Setup Layout Part - Sidebar */
CloudApp.controller('SidebarController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Footer */
CloudApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);


/* Setup Rounting For All Pages */
CloudApp.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider,$stateParams) {
        $urlRouterProvider.otherwise("/overview/");

        $stateProvider
            // Overview
            .state('overview', {
                url: "/overview/",
                templateUrl: template('overview'),
                data: {pageTitle: 'Overview'},
                // controller: "OverviewController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/assets/admin/pages/css/timeline.css',
                                '../static/assets/global/plugins/jquery-easypiechart/style.css',
                                '../static/management/controllers/network_bar_ctrl.js',
                                '../static/management/controllers/service__bar_ctrl.js',
                                '../static/management/controllers/storage__bar_ctrl.js',
                                '../static/management/controllers/virtualmechine_bar_ctrl.js',
                                '../static/management/controllers/phy_nodes_ctrl.js',
                                '../static/management/controllers/cabinet_ctrl.js'
                            ]
                        });
                    }],
                    summary: function(CommonHttpService){
                        return CommonHttpService.get("/api/management-summary/");
                    }
                }
            })

             // 物理监控
            .state("phy_monitor", {
                url: "/phy_monitor/",
                templateUrl: template('phy_monitor'),
                controller: "Phy_MonitorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/phy_monitor_ctrl.js',
                                '../static/management/controllers/cabinet_ctrl.js',
                                '../static/management/controllers/phy_monitor_storage_ctrl.js'
                            ]
                        });
                    }]
                }
            })
            // // 存储监控
            .state("storage_monitor", {
                url: "/storage_monitor/",
                templateUrl: template('storage_monitor'),
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/storage_monitor_ctrl.js',
                                '../static/assets/global/plugins/tree/abn_tree.css',//引入树形插件
                                '../static/management/controllers/treeview_ctrl.js'
                            ]
                        });
                    }]
                }
            })
            // // 云主机监控
            .state("cloud_monitor", {
                url: "/cloud_monitor/",
                templateUrl: template('cloud_monitor'),
                controller:"Cloud_MonitorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/cloud_monitor_ctrl.js',
                            ]
                        });
                    }]
                }
            })
            // // 云主机监控-二级
            .state("cloud_monitor_detail", {
                url: "/cloud_monitor_detail/",
                templateUrl: template('cloud_monitor_detail'),
                controller:"Cloud_Monitor_DetailController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/cloud_monitor_detail_ctrl.js',
                                '../static/assets/global/plugins/footable/footable.all.min.js',//引入插件footable
                                '../static/assets/global/plugins/footable/footable.core.css',
                            ]
                        });
                    }]
                }
            })
            //网络监控
            .state("network_monitor", {
                url: "/network_monitor/",
                templateUrl: template('network_monitor'),
                controller: "Network_MonitorController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/network_monitor_ctrl.js',
                                '../static/assets/global/plugins/tree/abn_tree.css',//引入树形插件
                                '../static/management/controllers/network_bar_net_ctrl.js',//网络监控- 网络树
                                '../static/management/controllers/network_bar_router_ctrl.js',//网络监控-路由器
                                '../static/management/controllers/network_bar_sdn_ctrl.js',//网络监控-sdn
                                '../static/management/controllers/network_bar_loadbanlance_ctrl.js',//网络监控-负载均衡
                            ]
                        });
                    }]
                }
            })
            // 报警信息
            .state("warning-info", {
                url: "/warning-info/",
                templateUrl: template('warning-info'),
                controller: "WarningController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/warning_ctrl.js',
                                '../static/assets/global/plugins/footable/footable.all.min.js',//引入插件footable
                                '../static/assets/global/plugins/footable/footable.core.css',
                                '../static/assets/global/plugins/footable/footable.filter.js',

                               
                            ]
                        });
                    }]
                }
            })
            // 云盘监控
            .state("volume_monitor", {
                url: "/volume_monitor/",
                templateUrl: template('volume_monitor'),
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/roles_ctrl.js'
                            ]
                        });
                    }]
                }
            })
            // // roles 
            // .state("roles", {
            //     url: "/roles/",
            //     templateUrl: "../static/management/views/roles.html",
            //     data: {pageTitle: 'Role'},
            //     controller: "RoleController",
            //     // resolve: {
            //     //     deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //     //         return $ocLazyLoad.load({
            //     //             name: 'CloudApp',
            //     //             insertBefore: '#ng_load_plugins_before',
            //     //             files: [
            //     //                 '..../static/management/controllers/roles_ctrl.js'
            //     //             ]
            //     //         });
            //     //     }]
            //     // }
            // })

            // // forum
            // .state("forum", {
            //     url: "/support/",
            //     templateUrl: "../static/management/views/forum.html",
            //     data: {pageTitle: 'Forum'},
            //     controller: "ForumController",
            //     resolve: {
            //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load({
            //                 name: 'CloudApp',
            //                 insertBefore: '#ng_load_plugins_before',
            //                 files: [
            //                     '../static/management/controllers/forum_ctrl.js'
            //                 ]
            //             });
            //         }]
            //     }
            // })
            // // operation
            // .state("operation", {
            //     url: "/operation/",
            //     templateUrl: "../static/management/views/operation.html",
            //     data: {pageTitle: 'Operation'},
            //     controller: "OperationController",
            //     resolve: {
            //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load({
            //                 name: 'CloudApp',
            //                 insertBefore: '#ng_load_plugins_before',
            //                 files: [
            //                     '../static/assets/global/plugins/bootstrap-datepicker/css/datepicker3.css',
            //                     '../static/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
            //                     '../static/management/controllers/operation_ctl.js'
            //                 ]
            //             });
            //         }]
            //     }
            // })

            // // user
            // .state("user", {
            //     url: "/users/",
            //     templateUrl: "../static/management/views/user.html",
            //     data: {pageTitle: 'User'},
            //     controller: "UserController",
            //     resolve: {
            //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load({
            //                 name: 'CloudApp',
            //                 insertBefore: '#ng_load_plugins_before',
            //                 files: [
            //                     '../static/management/controllers/user_ctrl.js'
            //                 ]
            //             });
            //         }]
            //     }
            // })


            // .state("UserGrouper", {
            //     url: "/UserGrouper/",
            //     templateUrl: "../static/management/views/UserGrouper.html",
            //     data: {pageTitle: 'Usergrouper'},
            //     controller: "UsergrouperController",
            //     resolve: {
            //         deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load({
            //                 name: 'CloudApp',
            //                 insertBefore: '#ng_load_plugins_before',
            //                 files: [
            //                     '../static/management/controllers/UserGrouper_ctrl.js'
            //                 ]
            //             });
            //         }]
            //     }
            // })

            //update start
            
            // roles 
            .state("roles", {
                url: "/roles/",
                templateUrl: template('roles'),
                data: {pageTitle: 'Role'},
                controller: "RoleController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [

                                '../static/management/controllers/roles_ctrl.js'
                            ]
                        });
                    }]
                }
            })

          //policy_cinder
          .state("policy_cinder", {
                url: "/policy_cinder/",
                templateUrl: "../static/management/views/policy_cinder.html",
                data: {pageTitle: 'Policy_Cinder'},
                controller: "Policy_CinderController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/policy_cinder_ctrl.js'
                            ]
                        });
                    }]
                }
            })

          //policy_neutron
          .state("policy_neutron", {
                url: "/policy_neutron/",
                templateUrl: "../static/management/views/policy_neutron.html",
                data: {pageTitle: 'Policy_Neutron'},
                controller: "Policy_NeutronController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/policy_neutron_ctrl.js'
                            ]
                        });
                    }]
                }
            })



          //policy_nova
          .state("policy_nova", {
                url: "/policy_nova/",
                templateUrl: "../static/management/views/policy_nova.html",
                data: {pageTitle: 'Policy_Nova'},
                controller: "Policy_NovaController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/policy_nova_ctrl.js'
                            ]
                        });
                    }]
                }
            })

          //group
          .state("group", {
                url: "/group/",
                templateUrl: "../static/management/views/group.html",
                data: {pageTitle: 'Group'},
                controller: "GroupController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/group_ctrl.js'
                            ]
                        });
                    }]
                }
            })

            //update end
            
            // user
            .state("notifications", {
                url: "/notifications/",
                templateUrl: "../static/management/views/notification.html",
                data: {pageTitle: 'Notification'},
                controller: "NotificationController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/notification_ctrl.js'
                            ]
                        });
                    }]
                }
            })

            // workflow
            .state("workflow", {
                url: "/workflow/",
                templateUrl: "../static/management/views/workflow.html",
                data: {pageTitle: 'Workflow Definition'},
                controller: "WorkflowManagementController",
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/workflow_ctrl.js'
                            ]
                        });
                    }]
                }
            })

            .state("price_rule", {
                url: "/price_rule/",
                templateUrl: "../static/management/views/price_rule.html",
                data: {pageTitle: 'Price Rule'},
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'CloudApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                '../static/management/controllers/price_rule_ctrl.js'
                            ]
                        });
                    }]
                }
            });
    }]);

/* Init global settings and run the app */
CloudApp.run(["$rootScope", "settings", "$state", "$http", "$cookies", "$interval",
    function ($rootScope, settings, $state, $http, $cookies, $interval) {
        $http.defaults.headers.common['X-CSRFToken'] = $cookies['csrftoken'];
        $rootScope.$state = $state;
        var callbacks = [];

        $rootScope.executeWhenLeave = function(callback){
            callbacks.push(callback);
        };

        $rootScope.setInterval = function(func, interval){
            var timer = $interval(func, interval);

            $rootScope.executeWhenLeave(function(){
                $interval.cancel(timer);
            });
        };

        $rootScope.$on("$stateChangeStart", function (e, toState, toParams, fromState, fromParams) {

            angular.forEach(callbacks, function(callback){
                callback();
            });

            callbacks = [];
        });

    }]);
