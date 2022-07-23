app.controller('SetupQuantityBrokenCtrl', function ($scope, $http, $interval) {

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
        tukhoa2: $scope.tukhoa2
    }

    $scope.LoadListBroken = function () {
        $scope.tranghientai = 1
        $http.post('/api/Api_Setup/DanhSachBroken', thamso).then(function (response) {
            $scope.ListBroken = response.data;
        });

        $http.post('/api/Api_Setup/DemDanhSachBroken', thamso).then(function (response) {
            $scope.tongso = response.data;
            pagination2.make(parseInt($scope.tongso), 15);
        });
    }
    $scope.LoadListBroken()

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
        $http.post('/api/Api_Setup/DanhSachBroken', thamso).then(function (response) {
            $scope.ListBroken = response.data;
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
        $scope.LoadListBroken()
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
        $scope.LoadListBroken()
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
        $scope.LoadListBroken()
    }

    $scope.LoadReason = function (item) {
        var data_reason = {
            BROKEN_ID : item.BROKEN_ID
        }
        $http.post("/api/Api_Setup/DanhSachBrokenReason",data_reason).then(function (response) {
            $scope.ListBrokenReason = response.data
        })
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

    $scope.ListNewBroken = []

    $scope.AddNewBrokenRow = function () {
        $scope.ListNewBroken.push({
            REASON: null,
            GHI_CHU : ""
        })
    }

    $scope.DeleteNewBrokenRow = function (index) {
        $scope.ListNewBroken.splice(index, 1)
    }

    $scope.KiemTraTrung = function (item, index) {
        for (i = 0; i < $scope.ListNewTarget.length; i++) {
            if (item.MAC_ADDRESS == $scope.ListNewTarget[i].MAC_ADDRESS && item.TERM_ID == $scope.ListNewTarget[i].TERM_ID && index != i) {
                $scope.ListNewTarget.splice(index, 1)
                alert("Không thể chọn trùng Tên máy và ca làm việc")
            }
        }
    }

    $scope.NewBroken = function (form) {
        $scope.submitted = true;
        var ngay = $('#NewBroken_Day').val();
        if (form.$invalid) {
            console.log('invalid');
            return;
        } else {
            var data_NewBroken = {
                BROKEN_DATE: ngay,
                BROKEN_QUANTITY: $scope.BROKEN_QUANTITY,
                MAC_ADDRESS: $scope.MAC_ADDRESS,
                TERM_ID : $scope.TERM_ID,
                ChiTiet: $scope.ListNewBroken
            }
            $http.post('/api/Api_Setup/AddNewBroken', data_NewBroken).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    $scope.ListNewBroken = []
                    $('#NewBroken').modal('hide');
                    alert(response.data)
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
                    $scope.LoadListBroken()
                } else {
                    alert(response.data)
                }

            })
        }
    }

    $scope.EditBroken = function (item) {
        var data_edit = {
            ID: item.BROKEN_ID,
            BROKEN_QUANTITY: item.BROKEN_QUANTITY
        }
        var x = confirm("Bạn có chắc là muốn sửa lại số lượng mục tiêu không?")
        if (x) {
            $http.post('/api/Api_Setup/EditBroken', data_edit).then(function () {
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
                $scope.LoadListBroken()
            }, function () {
                alert("Sửa thất bại")
            });
        }
    }

    $scope.DeleteBroken = function (item) {
        var data_delete = {
            ID: item.BROKEN_ID,
            BROKEN_QUANTITY: item.BROKEN_QUANTITY
        }
        var x = confirm("Bạn có chắc là muốn xóa dữ liệu này không?")
        if (x) {
            $http.post('/api/Api_Setup/DeleteBroken', data_delete).then(function (response) {
                if(response.data.indexOf("thành công") >0 ) {
                    alert(response.data)
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
                    $scope.LoadListBroken()
                }else{
                    alert(response.data)
                }
                
            })
        }
    }


})