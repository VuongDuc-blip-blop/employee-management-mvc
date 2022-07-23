app.controller('Project_detailCtrl', function ($scope, $http, $interval, ajaxService){
    var url = window.location.href;
    //this removes the anchor at the end, if there is one
    url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
    //this removes the query after the file name, if there is one
    url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
    //this removes everything before the last slash in the path
    url = url.substring(url.lastIndexOf("/") + 1, url.length);



    $scope.Load_NameProject = function (url) {
        var data = {
            Id_project: url,
        }
        $http.post(origin + '/api/Api_Projects/NameProject', data).then(function successCallback(response) {
            $scope.Load_NameProject = response.data;
        })
    }
    $scope.Load_NameProject(url);


    $scope.Load_ListTarget_Project = function (url) {
        var data = {
            Id_project: url,
        }
        $http.post(origin + '/api/Api_Projects/ListTarget_Project', data).then(function successCallback(response) {
            $scope.ListTarget_Project = response.data;
        })
    }
    $scope.Load_ListTarget_Project(url);


})