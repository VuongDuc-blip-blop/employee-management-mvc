app.controller('SetupWise_ReportCtrl', function ($scope, $http, $interval) {

    var d = new Date();
    $scope.nam = d.getFullYear();
    $scope.thang = d.getMonth() + 1;
    $scope.tukhoa1 = "";
    $scope.tukhoa2 = "";
    $scope.tukhoa3 = "";
    $scope.tranghientai = 1;
    var sotrang = 1;

    var thamso = {
        sotrang: sotrang,
        tukhoa1: $scope.tukhoa1,
        tukhoa2: $scope.tukhoa2,
        tukhoa3: $scope.tukhoa3,
    }

    $scope.LoadListSmartOKRs = function () {
        $scope.tranghientai = 1
        $http.post('/api/Api_Setup/DanhSachSmartOKRs', thamso).then(function (response) {
            $scope.ListSmartOKRs = response.data;
        });

        $http.post('/api/Api_Setup/DemDanhSachSmartOKRs', thamso).then(function (response) {
            $scope.tongso = response.data;
            pagination2.make(parseInt($scope.tongso), 15);
        });
    }
    $scope.LoadListSmartOKRs()

    function pageClick2(pageNumber) {
        $scope.tranghientai = pageNumber
        thamso = {
            sotrang: pageNumber,
            tukhoa1: $scope.tukhoa1,
            tukhoa2: $scope.tukhoa2,
            tukhoa3: $scope.tukhoa3,
        }
        $http.post('/api/Api_Setup/DanhSachSmartOKRs', thamso).then(function (response) {
            $scope.ListSmartOKRs = response.data;
        });
    }

    var pagination2 = new Pagination({
        container: $("#phan_trang"),
        pageClickCallback: pageClick2,
        maxVisibleElements: 15,
    });

    $scope.TimKiem = function () {
        $scope.tranghientai = 1
        thamso = {
            sotrang: sotrang,
            tukhoa1: $scope.tukhoa1,
            tukhoa2: $scope.tukhoa2,
            tukhoa3: $scope.tukhoa3,
        }
        $scope.LoadListSmartOKRs()
    }

    $scope.ListMode = ['Actual','Test']


    $scope.EditSmartOKRs = function (item) {
        var data_edit = {
            ID : item.ID,
            WDT_MAC_ADDRESS: item.WDT_MAC_ADDRESS,
            WDT_USERNAME: item.WDT_USERNAME,
            DESCRIPTION: item.DESCRIPTION,
            PERCENT_TARGET: item.PERCENT_TARGET,
        }
        var x = confirm("Bạn có chắc là muốn sửa lại thông tin không?")
        if (x) {
            $http.post('/api/Api_Setup/EditSmartOKRs', data_edit).then(function () {
                alert("Sửa thành công")
                thamso = {
                    sotrang: tranghientai,
                    tukhoa1: $scope.tukhoa1,
                    tukhoa2: $scope.tukhoa2,
                    tukhoa3: $scope.tukhoa3,
                }
                $scope.LoadListSmartOKRs()
            }, function () {
                alert("Sửa thất bại")
            });
        }
    }
})