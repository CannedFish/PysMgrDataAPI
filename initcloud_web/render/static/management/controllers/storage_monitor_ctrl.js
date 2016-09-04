/**
 * User: arthur 
 * Date: 16-4-17
 **/
CloudApp.controller('Storage_MonitorController',
    function($rootScope, $scope, $filter, $modal, $i18next, $ngBootbox,
             CommonHttpService, ToastrService, ngTableParams, ngTableHelper,
             Storage_Monitor, CheckboxGroup, DataCenter){

        $scope.$on('$viewContentLoaded', function(){
                Metronic.initAjax();
        });

        $scope.storage_monitors = [];
        var checkboxGroup = $scope.checkboxGroup = CheckboxGroup.init($scope.storage_monitors);

        $scope.storage_monitor_table = new ngTableParams({
                page: 1,
                count: 10
            },{
                counts: [],
                getData: function($defer, params){
                    Storage_Monitor.query(function(data){
                        $scope.storage_monitors = ngTableHelper.paginate(data, $defer, params);
                        checkboxGroup.syncObjects($scope.storage_monitors);
                    });
                }
            });

        /* var data = [ */
            // {
                // 'name':'节点一',
                // 'item':{
                    // 'cpu_used':[80,60], // 每个CPU的占用率
                    // 'cpu_frequence':[3.5,4], // 每个CPU的主频
                    // 'memory':{'memory_used':'80','memory_total':'300','used':'243','empty':'57'},
                    // 'network_card':{'up':'80','up_rate':'223456','down':'90','down_rate':'225779'} 
                    // // 上行流量，上行带宽占用率，下行流量，下行带宽占用率
                // }
            // },
            // {
                // 'name':'节点二',
                // 'item':{
                    // 'cpu_used':[90,70],
                    // 'cpu_frequence':[3.2,4],
                    // 'memory':{'memory_used':'90','memory_total':'300','used':'260','empty':'60'},
                    // 'network_card':{'up':'80','up_rate':'223456','down':'60','down_rate':'225779'}
                // }
            // }
        // ];
       // $scope.storage_monitors = data;
       

        var deleteStorage_Monitors = function(ids){

            $ngBootbox.confirm($i18next("storage_monitor.confirm_delete")).then(function(){

                if(typeof ids == 'function'){
                    ids = ids();
                }

                CommonHttpService.post("/api/storage_monitor/batch-delete/", {ids: ids}).then(function(data){
                    if (data.success) {
                        ToastrService.success(data.msg, $i18next("success"));
                        $scope.storage_monitor_table.reload();
                        checkboxGroup.uncheck()
                    } else {
                        ToastrService.error(data.msg, $i18next("op_failed"));
                    }
                });
            });
        };

        $scope.batchDelete = function(){

            deleteStorage_Monitors(function(){
                var ids = [];

                checkboxGroup.forEachChecked(function(Storage_Monitor){
                    if(storage_monitor.checked){
                        ids.push(storage_monitor.id);
                    }
                });

                return ids;
            });
        };

        $scope.delete = function(storage_monitor){
            deleteStorage_Monitors([storage_monitor.id]);
        };


        $scope.edit = function(storage_monitor){

            $modal.open({
                templateUrl: 'update.html',
                controller: 'Storage_MonitorUpdateController',
                backdrop: "static",
                size: 'lg',
                resolve: {
                    storage_monitor_table: function () {
                        return $scope.storage_monitor_table;
                    },
                    storage_monitor: function(){return storage_monitor}
                }
            });
        };

        $scope.openNewStorage_MonitorModal = function(){
            $modal.open({
                templateUrl: 'new-storage_monitor.html',
                backdrop: "static",
                controller: 'NewStorage_MonitorController',
                size: 'lg',
                resolve: {
                    dataCenters: function(){
                        return DataCenter.query().$promise;
                    }
                }
            }).result.then(function(){
                $scope.storage_monitor_table.reload();
            });
        };
    })


    .controller('NewStorage_MonitorController',
        function($scope, $modalInstance, $i18next,
                 CommonHttpService, ToastrService, Storage_MonitorForm, dataCenters){

            var form = null;
            $modalInstance.rendered.then(function(){
                form = Storage_MonitorForm.init($scope.site_config.WORKFLOW_ENABLED);
            });

            $scope.dataCenters = dataCenters;
            $scope.storage_monitor = {is_resource_user: false, is_approver: false};
            $scope.is_submitting = false;
            $scope.cancel = $modalInstance.dismiss;
            $scope.create = function(){

                if(form.valid() == false){
                    return;
                }

                $scope.is_submitting = true;
                CommonHttpService.post('/api/storage_monitor/create/', $scope.storage_monitor).then(function(result){
                    if(result.success){
                        ToastrService.success(result.msg, $i18next("success"));
                        $modalInstance.close();
                    } else {
                        ToastrService.error(result.msg, $i18next("op_failed"));
                    }
                    $scope.is_submitting = true;
                }).finally(function(){
                    $scope.is_submitting = false;
                });
            };
        }

   ).factory('Storage_MonitorForm', ['ValidationTool', '$i18next',
        function(ValidationTool, $i18next){
            return {
                init: function(){

                    var config = {

                        rules: {
                            storage_monitorname: {
                                required: true,
                                remote: {
                                    url: "/api/storage_monitor/is-name-unique/",
                                    data: {
                                        storage_monitorname: $("#storage_monitorname").val()
                                    },
                                    async: false
                                }
                            },
                            user_type: 'required'
                        },
                        messages: {
                            storage_monitorname: {
                                remote: $i18next('storage_monitor.name_is_used')
                            },
                        },
                        errorPlacement: function (error, element) {

                            var name = angular.element(element).attr('name');
                            if(name != 'user_type'){
                                error.insertAfter(element);
                            }
                        }
                    };

                    return ValidationTool.init('#storage_monitorForm', config);
                }
            }
        }]).controller('Storage_MonitorUpdateController',
        function($rootScope, $scope, $modalInstance, $i18next,
                 storage_monitor, storage_monitor_table,
                 Storage_Monitor, UserDataCenter, storage_monitorForm,
                 CommonHttpService, ToastrService, ResourceTool){

            $scope.storage_monitor = storage_monitor = angular.copy(storage_monitor);

            $modalInstance.rendered.then(storage_monitorForm.init);

            $scope.cancel = function () {
                $modalInstance.dismiss();
            };


            var form = null;
            $modalInstance.rendered.then(function(){
                form = storage_monitorForm.init($scope.site_config.WORKFLOW_ENABLED);
            });
            $scope.submit = function(storage_monitor){

                if(!$("#Storage_MonitorForm").validate().form()){
                    return;
                }

                storage_monitor = ResourceTool.copy_only_data(storage_monitor);


                CommonHttpService.post("/api/storage_monitor/update/", storage_monitor).then(function(data){
                    if (data.success) {
                        ToastrService.success(data.msg, $i18next("success"));
                        storage_monitor_table.reload();
                        $modalInstance.dismiss();
                    } else {
                        ToastrService.error(data.msg, $i18next("op_failed"));
                    }
                });
            };
        }
   ).factory('storage_monitorForm', ['ValidationTool', '$i18next',
        function(ValidationTool, $i18next){
            return {
                init: function(){

                    var config = {

                        rules: {
                            storage_monitorname: {
                                required: true,
                                remote: {
                                    url: "/api/storage_monitor/is-name-unique/",
                                    data: {
                                        storage_monitorname: $("#storage_monitorname").val()
                                    },
                                    async: false
                                }
                            },
                            user_type: 'required'
                        },
                        messages: {
                            storage_monitorname: {
                                remote: $i18next('storage_monitor.name_is_used')
                            },
                        },
                        errorPlacement: function (error, element) {

                            var name = angular.element(element).attr('name');
                            if(name != 'user_type'){
                                error.insertAfter(element);
                            }
                        }
                    };

                    return ValidationTool.init('#Storage_MonitorForm', config);
                }
            }
        }]);
