app.controller('SetupQuantityTargetCtrl', function ($scope, $http, $interval) {

    var d = new Date();
    $scope.nam = d.getFullYear();
    $scope.thang = d.getMonth() + 1;
    $scope.tukhoa1 = "";
    $scope.tukhoa2 = "";
    $scope.tranghientai = 1;
    var sotrang = 1;

    var thamso = {
        tungay: "",
        denngay: "",
        thang: $scope.thang,
        nam: $scope.nam,
        sotrang: sotrang,
        tukhoa1: $scope.tukhoa1,
        tukhoa2 : $scope.tukhoa2
    }

    $scope.LoadListTarget = function () {
        $scope.tranghientai = 1
        $http.post('/api/Api_Setup/DanhSachTarget', thamso).then(function (response) {
            $scope.ListTarget = response.data;
        });

        $http.post('/api/Api_Setup/DemDanhSachTarget', thamso).then(function (response) {
            $scope.tongso = response.data;
            pagination2.make(parseInt($scope.tongso), 15);
        });
    }
    $scope.LoadListTarget()

    function pageClick2(pageNumber) {
        $scope.tranghientai = pageNumber
        var tungay = $('#tungay').val()
        var denngay = $('#denngay').val()
        thamso = {
            tungay: tungay,
            denngay: denngay,
            thang: $scope.thang,
            nam: $scope.nam,
            sotrang: pageNumber,
            tukhoa1: $scope.tukhoa1,
            tukhoa2: $scope.tukhoa2
        }
        $http.post('/api/Api_Setup/DanhSachTarget', thamso).then(function (response) {
            $scope.ListTarget = response.data;
        });
    }

    var pagination2 = new Pagination({
        container: $("#phan_trang"),
        pageClickCallback: pageClick2,
        maxVisibleElements: 15,
    });

    $scope.TimKiem = function () {
        $scope.tranghientai = 1
        var tungay = $('#tungay').val()
        var denngay = $('#denngay').val()
        thamso = {
            tungay: tungay,
            denngay: denngay,
            thang: $scope.thang,
            nam: $scope.nam,
            sotrang: sotrang,
            tukhoa1: $scope.tukhoa1,
            tukhoa2: $scope.tukhoa2
        }
        $scope.LoadListTarget()
    }

    $scope.DoiThang = function (thang) {
        $scope.tranghientai = 1
        $scope.thang = thang
        var tungay = $('#tungay').val()
        var denngay = $('#denngay').val()
        thamso = {
            tungay: tungay,
            denngay: denngay,
            thang: $scope.thang,
            nam: $scope.nam,
            sotrang: sotrang,
            tukhoa1: $scope.tukhoa1,
            tukhoa2: $scope.tukhoa2
        }
        $scope.LoadListTarget()
    }

    $scope.DoiNam = function (nam) {
        $scope.tranghientai = 1
        $scope.nam = nam
        var tungay = $('#tungay').val()
        var denngay = $('#denngay').val()
        thamso = {
            tungay: tungay,
            denngay: denngay,
            thang: $scope.thang,
            nam: $scope.nam,
            sotrang: sotrang,
            tukhoa1: $scope.tukhoa1,
            tukhoa2: $scope.tukhoa2
        }
        $scope.LoadListTarget()
    }

    $scope.LoadLucDau = function () {
        $http.post("/api/Api_SmartOKRsInfor/WorkTerm").then(function (response) {
            $scope.ListTerm = response.data
        })
        $http.post("/api/Api_Setup/DanhSachDenSmartOKRs").then(function (response) {
            $scope.ListDen = response.data
        })
    }
    $scope.LoadLucDau();

    $scope.ListNewTarget = []

    $scope.AddNewTargetRow = function () {
        $scope.ListNewTarget.push({
            MAC_ADDRESS: "",
            TERM_ID: "",
            TARGET_QUANTITY : 0
        })
    }

    $scope.DeleteNewTargetRow = function (index) {
        $scope.ListNewTarget.splice(index,1)
    }

    $scope.KiemTraTrung = function (item, index) {
        for (i = 0; i < $scope.ListNewTarget.length; i++) {
            if (item.MAC_ADDRESS == $scope.ListNewTarget[i].MAC_ADDRESS && item.TERM_ID == $scope.ListNewTarget[i].TERM_ID && index != i) {
                $scope.ListNewTarget.splice(index, 1)
                alert("Không thể chọn trùng Tên máy và ca làm việc")
            }
        }
    }

    $scope.NewTarget = function (form) {
        $scope.submitted = true;
        var ngay = $('#NewTarget_Day').val();
        if (form.$invalid) {
            console.log('invalid');
            return;
        } else {
            var data_NewTarget = {
                TARGET_DATE: ngay,
                ChiTiet: $scope.ListNewTarget
            }
            $http.post('/api/Api_Setup/AddNewTarget', data_NewTarget).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    $scope.ListNewTarget = []
                    $('#NewTarget').modal('hide');
                    var tungay = $('#tungay').val()
                    var denngay = $('#denngay').val()
                    thamso = {
                        tungay: tungay,
                        denngay: denngay,
                        thang: $scope.thang,
                        nam: $scope.nam,
                        sotrang: $scope.tranghientai,
                        tukhoa1: $scope.tukhoa1,
                        tukhoa2: $scope.tukhoa2
                    }
                    $scope.LoadListTarget()
                    alert(response.data)
                } else {
                    alert(response.data)
                }
            })
        }
    }

    $scope.EditTarget = function (item) {
        var data_edit = {
            ID: item.TARGET_ID,
            TARGET_QUANTITY : item.TARGET_QUANTITY
        }
        var x = confirm("Bạn có chắc là muốn sửa lại số lượng mục tiêu không?")
        if (x) {
            $http.post('/api/Api_Setup/EditTarget', data_edit).then(function () {
                alert("Sửa thành công")
                var tungay = $('#tungay').val()
                var denngay = $('#denngay').val()
                thamso = {
                    tungay: tungay,
                    denngay: denngay,
                    thang: $scope.thang,
                    nam: $scope.nam,
                    sotrang: $scope.tranghientai,
                    tukhoa1: $scope.tukhoa1,
                    tukhoa2: $scope.tukhoa2
                }
                $scope.LoadListTarget()
            }, function () {
                alert("Sửa thất bại")
            });
        }
    }
})