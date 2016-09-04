/**
 * User: arthur 
 * Date: 16-4-17
 **/
CloudApp.controller('Storage__BarController',
    function($rootScope, $scope, $filter, $modal, $i18next, $ngBootbox,
             CommonHttpService, ToastrService, ngTableParams, ngTableHelper,
             Storage__Bar,CheckboxGroup, DataCenter){

        $scope.$on('$viewContentLoaded', function(){
                Metronic.initAjax();
        });

        $scope.storage__bars = [];
        var checkboxGroup = $scope.checkboxGroup = CheckboxGroup.init($scope.storage__bars);
        var storage_data ={'disk':[9999,4556],'SSD':[3000,5600],'NVMe':[4000,6000],'SAS':[6000,6000]}
        
        $scope.storage__bars = storage_data;
        checkboxGroup.syncObjects($scope.storage__bars);
        // $scope.storage__bar_table = new ngTableParams({
        //         page: 1,
        //         count: 10
        //     },{
        //         counts: [],
        //         getData: function($defer, params){
        //             alert(1);
        //             console.log(params);
        //             Storage__Bar.query(function(data){
        //                 var data = 1;
        //                 console.log(data);
        //                 $scope.storage__bars = ngTableHelper.paginate(data, $defer, params);
        //                 checkboxGroup.syncObjects($scope.storage__bars);
        //             });
        //         }
        //     });



        var deleteStorage__Bars = function(ids){

            $ngBootbox.confirm($i18next("storage__bar.confirm_delete")).then(function(){

                if(typeof ids == 'function'){
                    ids = ids();
                }

                CommonHttpService.post("/api/storage__bar/batch-delete/", {ids: ids}).then(function(data){
                    if (data.success) {
                        ToastrService.success(data.msg, $i18next("success"));
                        $scope.storage__bar_table.reload();
                        checkboxGroup.uncheck()
                    } else {
                        ToastrService.error(data.msg, $i18next("op_failed"));
                    }
                });
            });
        };

        $scope.batchDelete = function(){

            deleteStorage__Bars(function(){
                var ids = [];

                checkboxGroup.forEachChecked(function(Storage__Bar){
                    if(storage__bar.checked){
                        ids.push(storage__bar.id);
                    }
                });

                return ids;
            });
        };

        $scope.delete = function(storage__bar){
            deleteStorage__Bars([storage__bar.id]);
        };


        $scope.edit = function(storage__bar){

            $modal.open({
                templateUrl: 'update.html',
                controller: 'Storage__BarUpdateController',
                backdrop: "static",
                size: 'lg',
                resolve: {
                    storage__bar_table: function () {
                        return $scope.storage__bar_table;
                    },
                    storage__bar: function(){return storage__bar}
                }
            });
        };

        $scope.openNewStorage__BarModal = function(){
            $modal.open({
                templateUrl: 'new-storage__bar.html',
                backdrop: "static",
                controller: 'NewStorage__BarController',
                size: 'lg',
                resolve: {
                    dataCenters: function(){
                        return DataCenter.query().$promise;
                    }
                }
            }).result.then(function(){
                $scope.storage__bar_table.reload();
            });
        };
    })


    .controller('NewStorage__BarController',
        function($scope, $modalInstance, $i18next,
                 CommonHttpService, ToastrService, Storage__BarForm, dataCenters){

            var form = null;
            $modalInstance.rendered.then(function(){
                form = Storage__BarForm.init($scope.site_config.WORKFLOW_ENABLED);
            });

            $scope.dataCenters = dataCenters;
            $scope.storage__bar = {is_resource_user: false, is_approver: false};
            $scope.is_submitting = false;
            $scope.cancel = $modalInstance.dismiss;
            $scope.create = function(){

                if(form.valid() == false){
                    return;
                }

                $scope.is_submitting = true;
                CommonHttpService.post('/api/storage__bar/create/', $scope.storage__bar).then(function(result){
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

   ).factory('Storage__BarForm', ['ValidationTool', '$i18next',
        function(ValidationTool, $i18next){
            return {
                init: function(){

                    var config = {

                        rules: {
                            storage__barname: {
                                required: true,
                                remote: {
                                    url: "/api/storage__bar/is-name-unique/",
                                    data: {
                                        storage__barname: $("#storage__barname").val()
                                    },
                                    async: false
                                }
                            },
                            user_type: 'required'
                        },
                        messages: {
                            storage__barname: {
                                remote: $i18next('storage__bar.name_is_used')
                            },
                        },
                        errorPlacement: function (error, element) {

                            var name = angular.element(element).attr('name');
                            if(name != 'user_type'){
                                error.insertAfter(element);
                            }
                        }
                    };

                    return ValidationTool.init('#storage__barForm', config);
                }
            }
        }]).controller('Storage__BarUpdateController',
        function($rootScope, $scope, $modalInstance, $i18next,
                 storage__bar, storage__bar_table,
                 Storage__Bar, UserDataCenter, storage__barForm,
                 CommonHttpService, ToastrService, ResourceTool){

            $scope.storage__bar = storage__bar = angular.copy(storage__bar);

            $modalInstance.rendered.then(storage__barForm.init);

            $scope.cancel = function () {
                $modalInstance.dismiss();
            };


            var form = null;
            $modalInstance.rendered.then(function(){
                form = storage__barForm.init($scope.site_config.WORKFLOW_ENABLED);
            });
            $scope.submit = function(storage__bar){

                if(!$("#Storage__BarForm").validate().form()){
                    return;
                }

                storage__bar = ResourceTool.copy_only_data(storage__bar);


                CommonHttpService.post("/api/storage__bar/update/", storage__bar).then(function(data){
                    if (data.success) {
                        ToastrService.success(data.msg, $i18next("success"));
                        storage__bar_table.reload();
                        $modalInstance.dismiss();
                    } else {
                        ToastrService.error(data.msg, $i18next("op_failed"));
                    }
                });
            };
        }
   ).factory('storage__barForm', ['ValidationTool', '$i18next',
        function(ValidationTool, $i18next){
            return {
                init: function(){

                    var config = {

                        rules: {
                            storage__barname: {
                                required: true,
                                remote: {
                                    url: "/api/storage__bar/is-name-unique/",
                                    data: {
                                        storage__barname: $("#storage__barname").val()
                                    },
                                    async: false
                                }
                            },
                            user_type: 'required'
                        },
                        messages: {
                            storage__barname: {
                                remote: $i18next('storage__bar.name_is_used')
                            },
                        },
                        errorPlacement: function (error, element) {

                            var name = angular.element(element).attr('name');
                            if(name != 'user_type'){
                                error.insertAfter(element);
                            }
                        }
                    };

                    return ValidationTool.init('#Storage__BarForm', config);
                }
            }
        }]);
