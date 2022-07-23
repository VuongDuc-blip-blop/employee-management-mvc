app.controller('Wise_ReportCtrl', function ($http, $scope, $interval, $timeout) {
    $scope.group = 1
    $scope.sotrang = 1
    var sumpageinterval
    var pageinterval
    var stop
    var checkstate
    var checknotification

    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };
    //$http.post('/api/Api_SUMIRUBBER/DanhSachGroup').then(function (response) {
    //    $scope.ListGroup = response.data
    //})
    
    $scope.ChangeGroup = function () {
        thamso = {
            group_id: $scope.group,
            sotrang : $scope.sotrang
        }
    }

    $scope.LoadMachine = function () {
        var thamso = {
            group_id: $scope.group,
            sotrang: $scope.sotrang
        }
        stop = $interval(function () {
            $http.post('/api/Api_Machine/GETDATA', thamso).then(function (response) {
                $scope.data = response.data
            })
        }, 1000)
    }
    $scope.LoadMachine()
    
    //$http.post('/api/Api_Machine/GETDATA', thamso).then(function (response) {
    //    $scope.data = response.data
    //})

    $scope.LoadPage = function () {
        $http.post('/api/Api_Machine/CountLiveBoardMachine').then(function (response) {
            if (response.data % 10 == 0) {
                $scope.tongsotrang = parseInt(response.data) / 10
            } else {
                $scope.tongsotrang = parseInt(response.data / 10) + 1
            }
            $scope.ListTrang = $scope.range(1, $scope.tongsotrang)
        })
    }
    $scope.LoadPage()

    $scope.RandomPage = function () {
        pageinterval = $interval(function () {
            if ($scope.tongsotrang == $scope.sotrang) {
                $scope.sotrang = 1
            } else {
                $scope.sotrang += 1
            }
            $interval.cancel(stop)
            $scope.LoadMachine()
        }, 30000)
    }
    $scope.RandomPage()

    $scope.ChuyenTrang = function (item) {
        $scope.sotrang = item
        $interval.cancel(stop)
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

    $scope.ChiTietMay = function (item) {
        $scope.chitiet = item
        var data_chitiet = {
            mcid: item.MCID
        }
        $http.post('/api/Api_Machine/ChiTietMay', data_chitiet).then(function (response) {
            $scope.chitietmay = response.data
        })
    }

    $scope.StartMachine = function () {
        $interval.cancel(checkstate)
        var data_update = {
            STID: $scope.chitietmay.STID,
            IS_CONNECTED : true
        }
        var i = 0
        $http.post('/api/Api_Machine/StartMachine', data_update).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                checkstate = $interval(function () {
                    var data_chitiet = {
                        mcid: $scope.chitietmay.MCID
                    }
                    $http.post('/api/Api_Machine/ChiTietMay', data_chitiet).then(function (zresponse) {
                        if (zresponse.data.CURRENT_STATE == 10) {
                            SuccessSystem("Start thành công")
                            $interval.cancel(checkstate)
                            $('#MachineError').modal('hide')
                        }
                        i++
                    })
                    if (i >= 6) {
                        $interval.cancel(checkstate)
                        ErrorSystem("Start thất bại")
                        $('#MachineError').modal('hide')
                    }
                }, 1000)
                
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    $scope.StopCheckState = function () {
        $interval.cancel(checkstate)
        $('#MachineError').modal('hide')
    }

    $scope.GetProducts = function () {
        $http.post('/api/Api_Machine/DanhSachProducts').then(function (response) {
            $scope.ListProduct = response.data
        })
    }

    $scope.SelectPart = function (part) {
        $scope.ITEM_NAME = part.ITEM_NAME
        $scope.ID = part.ID
        $scope.IDEAL_RUN_RATE = part.CYCLE_TIME
    }

    $scope.ChangeNewPart = function () {
        var data_update = {
            STID: $scope.chitietmay.STID,
            MCID : $scope.chitietmay.MCID,
            ITEM_ID: $scope.ID,
            ITEM_NAME: $scope.ITEM_NAME,
            IDEAL_RUN_RATE : $scope.IDEAL_RUN_RATE
        }
        $http.post('/api/Api_Setup/ChangePart', data_update).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                $scope.ITEM_NAME = ""
                $('#ChangePart').modal('hide')
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    $scope.UpdateNG = function () {
        var ngay = $('#ngay').val()
        var data_update = {
            STID: $scope.chitietmay.STID,
            date: ngay,
            NG_QTY : $scope.NG_QTY
        }
        $http.post('/api/Api_Setup/UpdateNG').then(function () {
            $('#InputNG').modal('hide')
        })
    }

    toastr.options.positionClass = 'toast-top-half-width';
    toastr.options.extendedTimeOut = 0; //1000;
    toastr.options.timeOut = 5000;
    toastr.options.fadeOut = 250;
    toastr.options.fadeIn = 250;

    function Toast(type, css, msg) {
        this.type = type;
        this.css = css;
        this.msg = msg;
    }
    var notifications = $.connection.notificationHub;
    // Create a function that the hub can call to broadcast messages. 
    notifications.client.recieveNotification = function (data) {
        // Add the message to the page. 
        console.log(data)
        //SuccessSystem(data.WDT_USERNAME)
        if (data.CURRENT_STATE == 30) {
            var t = new Toast('warning', 'toast-top-half-width', '<h3>' + ServerTime(data.DATE_TIME) + '-' + data.WDT_USERNAME + '</h3>' + '<br/>' + '<h3> WAIT ' + SecondToTime(data.STATE_TIME) + '</h3>')
            toastr.options.positionClass = t.css;
            toastr[t.type](t.msg);
        } else if (data.CURRENT_STATE == 20) {
            var t = new Toast('error', 'toast-top-half-width', '<h3>' + ServerTime(data.DATE_TIME) + '-' + data.WDT_USERNAME + '</h3>' + '<br/>' + '<h3> ERROR ' + SecondToTime(data.STATE_TIME) + '</h3>')
            toastr.options.positionClass = t.css;
            toastr[t.type](t.msg);
        } else if (data.CURRENT_STATE == 0) {
            var t = new Toast('info', 'toast-top-half-width', '<h3>' + ServerTime(data.DATE_TIME) + '-' + data.WDT_USERNAME + '</h3>' + '<br/>' + '<h3> OFF ' + SecondToTime(data.STATE_TIME) + '</h3>')
            toastr.options.positionClass = t.css;
            toastr[t.type](t.msg);
        }
    };
    // Start the connection. 
    $.connection.hub.start().done(function () {
        $http.post('/api/Api_Setup/UpdateNotifi').then(function () {
            checknotification = $interval(function () {
                notifications.server.sendNotifications();
            }, 2000)
        })
        
    }).fail(function (e) {
        alert(e);
    });

    function SecondToTime(seconds) {
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

    function ServerTime(time) {
        var date = new Date(time);
        if (date.getDate() < 10) {
            day = "0" + (date.getDate())
        } else {
            day = date.getDate()
        }

        if (date.getMonth() + 1 < 10) {
            month = "0" + (date.getMonth() + 1)
        } else {
            month = date.getMonth() + 1
        }

        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();

        return (day + '/' + month + '/' + date.getFullYear() + ' ' + hour + ':' + minutes + ':' + seconds)
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