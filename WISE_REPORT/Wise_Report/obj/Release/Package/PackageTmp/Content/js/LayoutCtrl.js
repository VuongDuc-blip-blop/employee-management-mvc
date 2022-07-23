app.controller('LayoutCtrl', function ($scope, $http, $interval,$timeout) {
    var promise;

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;
    $scope.ngay = today;
    var d = new Date()

    $scope.mode = "Actual"
    var stop
    var itv
    var column
    var chart
    var timer
    var detailitv

    $scope.LoadTerm = function () {
        $http.post('/api/Api_SmartOKRsInfor/WorkTerm').then(function (response) {
            $scope.ListTerm = response.data
            for (i = 0; i < $scope.ListTerm.length; i++) {
                if ($scope.ListTerm[i].TIME_START < $scope.ListTerm[i].TIME_END) {
                    if (d.getHours() >= $scope.ListTerm[i].TIME_START && $scope.ListTerm[i].TIME_END >= d.getHours()) {
                        $scope.CURRENT_TERM_ID = $scope.ListTerm[i].ID
                        $scope.TIME_START = $scope.ListTerm[i].TIME_START
                        $scope.TIME_END = $scope.ListTerm[i].TIME_END
                    }
                } else {
                    if (d.getHours() >= $scope.ListTerm[i].TIME_START || $scope.ListTerm[i].TIME_END >= d.getHours()) {
                        $scope.CURRENT_TERM_ID = $scope.ListTerm[i].ID
                        $scope.TIME_START = $scope.ListTerm[i].TIME_START
                        $scope.TIME_END = $scope.ListTerm[i].TIME_END
                    }
                }
            }
            thamso = {
                date: $scope.ngay,
                start: $scope.TIME_START,
                end: $scope.TIME_END,
                term: $scope.CURRENT_TERM_ID,
                mode: $scope.mode
            }
            $scope.LoadLucDau()
        });
    }
    $scope.LoadTerm()

    $scope.LoadLucDau = function () {
        thamso = {
            date: $scope.ngay,
            start: $scope.TIME_START,
            end: $scope.TIME_END,
            term: $scope.CURRENT_TERM_ID,
            mode: $scope.mode
        }
        $scope.ListSmartOKRs = []
        stop = $interval(function () {
            $http.post('/api/Api_SmartOKRsInfor/Realtime', thamso).then(function (response) {
                $scope.ListSmartOKRs = response.data;
                //if($scope.detail != null){  
                //    for (i = 0; i < $scope.ListSmartOKRs.length; i++) {
                //        if ($scope.ListSmartOKRs[i].MAC_ADDRESS == $scope.detail.MAC_ADDRESS) {
                //            $scope.ListSmartOKRs[i].SHOW_TIME = true
                //            break
                //        }                       
                //    }
                //}
                for (i = 0; i < $scope.ListSmartOKRs.length; i++) {
                    $scope.ListSmartOKRs[i].TONG_THOI_GIAN_CHAY = secondsToDhms($scope.ListSmartOKRs[i].TONG_THOI_GIAN_CHAY)
                }
            })
        }, 1000)
    };
    $scope.count = 0
    $scope.SmartOKRsDetails = function (item) {
        var data_detail = {}
        if ($scope.count == 0) {
            $scope.count = 1
            $scope.detail = item
            detailitv = $interval(function () {
                for (i = 0; i < $scope.ListSmartOKRs.length; i++) {
                    if ($scope.ListSmartOKRs[i].MAC_ADDRESS == $scope.detail.MAC_ADDRESS) {
                            if ($scope.ListSmartOKRs[i].RED_LIGHT_CURRENT ==1) {
                                $scope.color = "RED"
                            }
                            else if ($scope.ListSmartOKRs[i].AMBER_LIGHT_CURRENT == 1 && $scope.ListSmartOKRs[i].GREEN_LIGHT_CURRENT == 0 && $scope.ListSmartOKRs[i].RED_LIGHT_CURRENT == 0) {
                                $scope.color = "AMBER"
                            }
                            else if ($scope.ListSmartOKRs[i].AMBER_LIGHT_CURRENT == 1 && $scope.ListSmartOKRs[i].GREEN_LIGHT_CURRENT == 1 && $scope.ListSmartOKRs[i].RED_LIGHT_CURRENT == 0 && $scope.ListSmartOKRs[i].GROUP_ID == 1) {
                                $scope.color = "GREEN"
                            }
                            else if ($scope.ListSmartOKRs[i].AMBER_LIGHT_CURRENT == 0 && $scope.ListSmartOKRs[i].GREEN_LIGHT_CURRENT == 1 && $scope.ListSmartOKRs[i].RED_LIGHT_CURRENT == 0 && $scope.ListSmartOKRs[i].GROUP_ID == 2) {
                                $scope.color = "GREEN"
                            }
                            else if ($scope.ListSmartOKRs[i].RED_LIGHT_CURRENT == 0 && $scope.ListSmartOKRs[i].AMBER_LIGHT_CURRENT == 0 && $scope.ListSmartOKRs[i].GREEN_LIGHT_CURRENT == 0) {
                                $scope.color = "OFF"
                            }                              
                         data_detail = {
                            date: $scope.ngay,
                            start: $scope.TIME_START,
                            end: $scope.TIME_END,
                            term: $scope.CURRENT_TERM_ID,
                            mode: $scope.mode,
                            mac_address: $scope.detail.MAC_ADDRESS,
                            color: $scope.color
                        }
                        break
                    }
                }
                $http.post('/api/Api_SmartOKRsInfor/RealtimeDetail', data_detail).then(function (response) {
                    $scope.TONG_THOI_GIAN_CHAY = secondsToDhms(parseInt(response.data))
                })
            },1000)            
        }      
    }

    $scope.SmartOKRsDetailsOut = function () {
        $interval.cancel(detailitv)
        $scope.count = 0
        $scope.detail = []
        for (i = 0; i < $scope.ListSmartOKRs.length; i++) {
            $scope.ListSmartOKRs[i].SHOW_TIME = false
        }        
    }
      
    function secondsToDhms(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 3600 % 60);

        var dDisplay = d < 10 ? "0" + d + ":" : d + ":"
        var hDisplay = h < 10 ? "0" + h + ":" : h + ":"
        var mDisplay = m < 10 ? "0" + m + ":" : m + ":"
        var sDisplay = s < 10 ? "0" + s : s
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
})
