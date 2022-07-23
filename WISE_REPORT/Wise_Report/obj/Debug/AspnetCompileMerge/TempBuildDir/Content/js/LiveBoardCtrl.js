app.controller('LiveBoardCtrl', function ($scope, $http, $interval, ajaxService) {
    var chart
    var interval
    var sumpageinterval
    var pageinterval
    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

    $scope.sotrang = 1

    $scope.LoadMachine = function () {
        var thamso = {
            sotrang: $scope.sotrang
        }
        $http.post('/api/Api_Machine/LiveBoardMachine', thamso).then(function (response) {
            $scope.DanhSachMay = response.data
            for (i = 0; i < $scope.DanhSachMay.length; i++) {
                $scope.DanhSachMay[i].ListData = []
                $scope.DanhSachMay[i].ListPastData = []
            }
            $scope.LoadData()
            $scope.LoadListPastData()
        })
    }
    $scope.LoadMachine()

    $scope.LoadPage = function () {
        $http.post('/api/Api_Machine/CountLiveBoardMachine').then(function (response) {
            if (response.data % 5 == 0) {
                $scope.tongsotrang = parseInt(response.data) / 5
            } else {
                $scope.tongsotrang = parseInt(response.data / 5) + 1
            }
            $scope.ListTrang = $scope.range(1,$scope.tongsotrang)
        })
    }
    $scope.LoadPage()


    window.onload = function () {
        sumpageinterval = $interval(function () {
            if ($scope.tongsotrang > 0) {
                $scope.RandomPage()
                $interval.cancel(sumpageinterval)
            }
        }, 1000)
    }

    $scope.LoadData = function () {
        interval = $interval(function () {
            $scope.DanhSachMay.forEach(function (item) {
                var data = {
                    mcid : item.MCID
                }
                $http.post('/api/Api_Machine/LiveBoardTime', data).then(function (response) {
                    item.ListData = response.data
                })
            })
        }, 1000)
    }

    $scope.LoadListPastData = function () {
        $scope.DanhSachMay.forEach(function (item) {
            var data = {
                mcid: item.MCID
            }
            $http.post('/api/Api_Machine/Last5DaysLiveBoardTime', data).then(function (response) {
                item.ListPastData = response.data
            })
        })
    }

    $scope.RandomPage = function () {
        pageinterval = $interval(function () {
            if ($scope.tongsotrang == $scope.sotrang) {
                $scope.sotrang = 1
            } else {
                $scope.sotrang += 1
            }
            $interval.cancel(interval)
            $scope.LoadMachine()
        },30000)
    }

    $scope.ChuyenTrang = function (item) {
        $scope.sotrang = item
        $interval.cancel(interval)
        $interval.cancel(pageinterval)
        $scope.LoadMachine()
        $scope.RandomPage()
    }

    $scope.ChangeAuto = function () {
        $scope.pause = !$scope.pause
        if ($scope.pause == true) {
            $interval.cancel(pageinterval)
        } else {
            $scope.RandomPage()
        }
    }
})

.filter('secondtotime', function () {
    return function (seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 3600 % 60);

        var dDisplay = d < 10 ? "0" + d + ":" : d + ":"
        var hDisplay = h < 10 ? "0" + h + ":" : h + ":"
        var mDisplay = m < 10 ? "0" + m + ":" : m + ":"
        var sDisplay = s < 10 ? "0" + s : s
        //return dDisplay + hDisplay + mDisplay + sDisplay;
        return hDisplay + mDisplay + sDisplay;
    }
})