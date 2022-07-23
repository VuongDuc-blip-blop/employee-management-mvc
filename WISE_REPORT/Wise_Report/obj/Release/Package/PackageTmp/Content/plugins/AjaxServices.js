

    var block_config = {
        message: $('<img src="/Content/Images/default.svg"/>'),
        css: {
            border: 'none', 
            backgroundColor: 'none',
            zIndex: 20000
        }
    };

    function blockUI(ui) {
        if (!ui) {
            $.blockUI({
                message: $('<img src="/Content/images/default.svg"/>'), css: {
                border: 'none', 
                backgroundColor: 'none',
                zIndex: 20000
            }});
        } else {
            ui.block({
                message: $('<img src="/Content/Images/default.svg"/>'), css: {
                border: 'none', 
                backgroundColor: 'none',
                zIndex: 20000
            }});
        }
    }

    function unBlockUI(ui) {
        if (!ui) {
            $.unblockUI();
        } else {
            ui.unblock({
                message: $('<img src="/Content/Images/default.svg"/>'), css: {
                border: 'none', 
                backgroundColor: 'none',
                zIndex: 20000
            }});
        }
    }

    angular
        .module('myApp')
        .service('ajaxService', ['$http', function ($http) {
            
            this.AjaxPost = function (data, route, successFunction, errorFunction, ui) {
                blockUI(ui);
                setTimeout(function () {
                    $http.post(route, data).then(function (response) {
                        unBlockUI(ui);
                        successFunction(response);
                    }, function (response) {
                        unBlockUI(ui);          
                        if (response.IsAuthenicated == false) { window.location = "/index.html"; }
                        errorFunction(response);
                    });
                }, 0);

            }

            this.AjaxPostWithNoAuthenication = function (data, route, successFunction, errorFunction, ui) {
                blockUI(ui);
                setTimeout(function () {
                    $http.post(route, data).then(function (response) {
                        unBlockUI(ui);
                        successFunction(response);
                    }, function (response) {
                        unBlockUI(ui);     
                        errorFunction(response);
                    });
                }, 0);

            }

            this.AjaxGet = function (route, successFunction, errorFunction) {
                blockUI(ui);
                setTimeout(function () {
                    $http({ method: 'GET', url: route }).then(function (response) {
                        unBlockUI(ui);
                        successFunction(response);
                    }, function (response) {
                        unBlockUI(ui);
                        if (response.IsAuthenicated == false) { window.location = "/index.html"; }
                        errorFunction(response);
                    });
                }, 0);

            }

            this.AjaxGetWithData = function (route, data, successFunction, errorFunction, ui) {
                blockUI(ui);
               
                return $http({ method: 'POST', url: route, data: data }).then(function (response) {
                        unBlockUI(ui);
                        return response;
                    }, function (response) {
                        unBlockUI(ui);
                        if (response.IsAuthenicated == false) { window.location = "/index.html"; }
                        return response;
                    });
                

            }

            this.AjaxGetWithParams = function (route, data, successFunction, errorFunction, ui) {
                blockUI(ui);

                return $http({ method: 'POST', url: route, params: data }).then(function (response) {
                    unBlockUI(ui);
                    return response;
                }, function (response) {
                    unBlockUI(ui);
                    if (response.IsAuthenicated == false) { window.location = "/index.html"; }
                    return response;
                });


            }

            this.AjaxGetWithNoBlock = function (data, route, successFunction, errorFunction, ui) {            
                setTimeout(function () {
                    $http({ method: 'GET', url: route, params: data }).then(function (response) {                 
                        successFunction(response);
                    }, function (response) {                  ;
                        if (response.IsAuthenicated == false) { window.location = "/index.html"; }
                        errorFunction(response);
                    });
                }, 0);

            }
    }]);
