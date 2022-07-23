app.controller('NotificationCtrl', function ($scope, $http, $interval, ajaxService) {
    var d = new Date();
    $scope.Date = moment().format('DD/MM/YYYY');

    var currentuserid = $('#userid').val();
    $scope.nam = d.getFullYear();
    $scope.thang = d.getMonth() + 1;
    $scope.is_read = 2; // Trạng thái mặc định k lọc đã đọc hay chưa
    $scope.groupid = 0;
    $scope.userid = 0;
    $scope.tranghientai = 1;
    var sotrang = 1;

    var datas = {
        currentuserid: currentuserid,
        groupid: $scope.groupid,
        userid: $scope.userid,
        is_read: $scope.is_read,
        sotrang: 1
    }

    //List Notification 
    $scope.LoadListNotification = function () {
        $http.post(origin + '/api/Api_Notification/ListNotification', datas).then(function successCallback(response) {
            $scope.listNotification = response.data;
        })

        $http.post(origin + '/api/Api_Notification/CountListNotification', datas).then(function (response) {
            $scope.tongso = response.data;
            pagination2.make(parseInt($scope.tongso), 15);
        });
    }
    $scope.LoadListNotification();

    function pageClick2(pageNumber) {
        $scope.tranghientai = pageNumber
        datas = {
            currentuserid: currentuserid,
            groupid: $scope.groupid,
            userid: $scope.userid,
            is_read: $scope.is_read,
            sotrang: pageNumber
        }

        $http.post(origin + '/api/Api_Notification/ListNotification', datas).then(function successCallback(response) {
            $scope.listNotification = response.data;
        })
    }

    var pagination2 = new Pagination({
        container: $("#phan_trang"),
        pageClickCallback: pageClick2,
        maxVisibleElements: 15,
    });

    //Update đã đọc
    $scope.ChangeStatusIsRead = function (item) {
        if (item.IS_READ == false) { // just updte when IS_READ fale
            item.IS_READ = !item.IS_READ
            var data_update = {
                ID: item.ID,
                IS_READ: item.IS_READ
            }
            $http.post(origin + '/api/Api_Notification/UpdateIsReadNotification', data_update).then(function (response) {
                if (response.data.indexOf("thành công") >= 0) {
                    SuccessSystem(response.data)
                    ID: null;
                    IS_READ: null;
                    $scope.LoadListNotification();
                    //$scope.LoadListNotification_NotRead();
                }
            })
        }
            
    }
    //Uơdate all notification as readed
    $scope.ChangeAllStatusIsRead = function () {
        var data_update = {
            USER_ID: currentuserid
        }
        $http.post(origin + '/api/Api_Notification/UpdateAllIsReadNotification', data_update).then(function (response) {
            if (response.data.indexOf("susscess") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadListNotification();
            }
        })
    }

    //--------OPEN Link
    $scope.openlink = function (Link) {
        window.open(Link);
    }

    //List Notification not read
    var datas1 = {
        currentuserid: currentuserid,
        groupid: 0,
        userid: 0,
        is_read: 0,
        sotrang: 1
    }
    $scope.LoadListNotification_NotRead = function () {
       
        $http.post(origin + '/api/Api_Notification/ListNotification', datas1).then(function successCallback(response) {            
            $scope.listNotification_NotRead = response.data;
        })

        $http.post(origin + '/api/Api_Notification/CountListNotification', datas1).then(function (response) {
            $scope.tongso_unread = response.data;
        });
    }   
    $scope.LoadListNotification_NotRead();

})