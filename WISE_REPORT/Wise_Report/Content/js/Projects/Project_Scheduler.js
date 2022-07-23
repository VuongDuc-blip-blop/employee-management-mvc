app.controller('Project_schedulerCtrl', function ($scope, $http, $interval, ajaxService) {
    var username = $('#userid').val();
    var currentuserid = $('#userid').val();
    $scope.userid = $('#userid').val();
    $scope.today = new Date();

    $scope.projectname = "";
    $scope.frequently = "";
    $scope.status = "";
    var datas = {
        currentuserid: currentuserid,
        projectname: $scope.projectname,
        frequently: $scope.frequently,
        status:$scope.status,
        sotrang: 1
    }
    $scope.LoadLisProject_Scheduler = function () {

        $http.post(origin + '/api/Api_Project_Scheduler/List_Project_Scheduler', datas).then(function successCallback(response) {
            $scope.listscheduler = response.data;
            //$scope.sortedFriends = orderByFilter($scope.filtered);
        })

        $http.post(origin + '/api/Api_Project_Scheduler/CountList_Project_Scheduler', datas).then(function (response) {
            $scope.tongso_sch = response.data;
            pagination2_sch.make(parseInt($scope.tongso_sch), 15);
        });
    }
    $scope.LoadLisProject_Scheduler();


    function pageClick2_sch(pageNumber) {
        $scope.tranghientai = pageNumber
        var datas = {
            currentuserid: currentuserid,
            projectname: $scope.projectname,
            frequently: $scope.frequently,
            status: $scope.status,
            sotrang: pageNumber
        }
        $http.post(origin + '/api/Api_Project_Scheduler/List_Project_Scheduler', datas).then(function successCallback(response) {
            $scope.listusers = response.data;
        })
    }

    var pagination2_sch = new Pagination({
        container: $("#phan_trang_sch"),
        pageClickCallback: pageClick2_sch,
        maxVisibleElements: 15,
    });

    $scope.SearchProject_Scheduler = function () {
        datas = {
            currentuserid: currentuserid,
            projectname: $scope.projectname,
            frequently: $scope.frequently,
            status: $scope.status,
            sotrang: 1
        }
        $scope.LoadLisProject_Scheduler();
    }

    // Add Project Scheduler
    $scope.CreateProjectScheduler = function () {
        var data_add = {
            ID_PROJECT: $scope.ID_PROJECT,
            FREQUENTLY: $scope.FREQUENTLY,
            NUMBER: $scope.NUMBER,
            USER_CREATE: $('#userid').val(),
            DATE_START: $scope.DATE_START,
            DATE_CREATE: $scope.Date
        }
        $http.post(origin + '/api/Api_Project_Scheduler/AddProjectScheduler', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadLisProject_Scheduler()
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    //Update Project Scheduler
    $scope.UpdateProjectScheduler = function (item) {
        var data_update = {
            ID_PROJECT: item.ID_PROJECT,
            FREQUENTLY: item.FREQUENTLY,
            NUMBER: item.NUMBER,
            USER_CREATE: $('#userid').val(),
            DATE_START: item.DATE_START,
            STATUS:item.STATUS
        }
        $http.post(origin + '/api/Api_Project_Scheduler/UpdateProject_Scheduler', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadLisProject_Scheduler()
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    $scope.FindProject = function (projectname) {
        data = {
            projectname: projectname
        }
        $http.post(origin + '/api/Api_Project_Scheduler/Find_Project', data).then(function successCallback(response) {
            $scope.listproject= response.data;
            //$scope.sortedFriends = orderByFilter($scope.filtered);
        })
    }
    //chọn nhóm
    $scope.SelectProject = function (project) {
        $scope.ID_PROJECT = project.ID;
        $scope.projectname = project.PROJECT_NAME;
    }

})