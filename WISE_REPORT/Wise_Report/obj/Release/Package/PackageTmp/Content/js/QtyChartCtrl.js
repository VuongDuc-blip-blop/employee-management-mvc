app.controller('QtyChartCtrl', function ($scope, $http, $interval) {
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
    var thamso = {}

    $scope.ListInterVal = []
    $scope.StackedColumnChart = []

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
                term : $scope.CURRENT_TERM_ID,
                mode: $scope.mode
            }
            $scope.LoadQuantitiesChart()
        });
    }
    $scope.LoadTerm()

    $scope.LoadQuantitiesChart = function () {
        $http.post('/api/Api_SmartOKRsInfor/QuantitiesChartNew', thamso).then(function (response) {
            $scope.QuantitiesChart = response.data
            for (i = 0; i < $scope.QuantitiesChart.length; i++) {
                $scope.QuantitiesChart[i].CHI_TIET = string_to_array($scope.QuantitiesChart[i].CHI_TIET)
            }
        })
       
    }
    

    $scope.ChuyenCa = function (calamviec) {
        var ngay = $('#ngay').val();
        $scope.CURRENT_TERM_ID = calamviec.ID
        $scope.TIME_START = calamviec.TIME_START
        $scope.TIME_END = calamviec.TIME_END
        thamso = {
            date: ngay,
            start: $scope.TIME_START,
            end: $scope.TIME_END,
            term: $scope.CURRENT_TERM_ID,
            mode: $scope.mode
        }
        $interval.cancel(stop)
        $interval.cancel(itv)
        $scope.reload()
    }


    $scope.ChangeNgay = function () {
        var ngay = $('#ngay').val();
        $scope.CURRENT_TERM_ID = calamviec.ID
        $scope.TIME_START = calamviec.TIME_START
        $scope.TIME_END = calamviec.TIME_END
        thamso = {
            date: ngay,
            start: $scope.TIME_START,
            end: $scope.TIME_END,
            term: $scope.CURRENT_TERM_ID,
            mode: $scope.mode
        }
        $interval.cancel(stop)
        $interval.cancel(itv)
        $scope.reload()
    }

    $scope.reload = function () {
        $http.post('/api/Api_SmartOKRsInfor/QuantitiesChartNew', thamso).then(function (response) {
            for (i = 0; i < response.data.length; i++) {
                response.data[i].CHI_TIET = string_to_array(response.data[i].CHI_TIET)
            }
            for (i = 0; i < response.data.length; i++) {
                var chart = new CanvasJS.Chart(response.data[i].MAC_ADDRESS, {
                    animationEnabled: true,
                    theme: "light2",
                    title: {
                        text: response.data[i].DESCRIPTION + " : " + response.data[i].WDT_USERNAME
                    },
                    subtitles:[
                    {
                        text: "Tổng số lượng sản phẩm : " + response.data[i].TONG_SAN_PHAM,
                        fontColor: "deepskyblue",
                    },
                    {
                        text: "Số lượng mục tiêu : " + response.data[i].SAN_PHAM_MUC_TIEU,
                        fontColor: "blue",
                    },
                    {
                        text: "Số lượng sản phẩm lỗi : " + response.data[i].SAN_PHAM_LOI,
                        fontColor: "red",
                    },
                     {
                         text: "Số lượng thực tế : " + (response.data[i].TONG_SAN_PHAM - response.data[i].SAN_PHAM_LOI),
                         fontColor: "red",
                     },
                    ],
                    axisY: {
                        includeZero: false
                    },
                    data: [{
                        type: "line",
                        dataPoints: [
                            //{ x: response.data[i].T0, y: response.data[i].TONG_SO_H0 },
                            //{ x: response.data[i].T1, y: response.data[i].TONG_SO_H1 },
                            //{ x: response.data[i].T2, y: response.data[i].TONG_SO_H2 },
                            //{ x: response.data[i].T3, y: response.data[i].TONG_SO_H3 },
                            //{ x: response.data[i].T4, y: response.data[i].TONG_SO_H4 },
                            //{ x: response.data[i].T5, y: response.data[i].TONG_SO_H5 },
                            //{ x: response.data[i].T6, y: response.data[i].TONG_SO_H6 },
                            //{ x: response.data[i].T7, y: response.data[i].TONG_SO_H7 },
                            //{ x: response.data[i].T8, y: response.data[i].TONG_SO_H8 },
                            //{ x: response.data[i].T9, y: response.data[i].TONG_SO_H9 },
                            //{ x: response.data[i].T10, y: response.data[i].TONG_SO_H10 },
                            //{ x: response.data[i].T11, y: response.data[i].TONG_SO_H11 },
                        ]
                    }]
                });
                for (k = 0; k < response.data[i].CHI_TIET.length; k++) {
                    if (response.data[i].CHI_TIET[k] != "") {
                        var a = response.data[i].CHI_TIET[k].split(":")
                        var first = parseInt(a.shift());
                        var last = parseInt(a.pop())
                        chart.options.data[0].dataPoints.push({
                            x: first,
                            y: last
                        })
                    }
                }
                chart.render();
            }
        })
    }


    window.onload = function () {
        chart = $interval(function () {
            if ($scope.QuantitiesChart.length > 0) {
                $scope.LoadChart()
                $interval.cancel(chart)
            }
        }, 2000)       
    }

    $scope.LoadChart = function () {
        for (i = 0; i < $scope.QuantitiesChart.length; i++) {
            var chart = new CanvasJS.Chart($scope.QuantitiesChart[i].MAC_ADDRESS, {
                animationEnabled: true,
                theme: "light2",
                title: {
                    text: $scope.QuantitiesChart[i].DESCRIPTION + " : " + $scope.QuantitiesChart[i].WDT_USERNAME
                },
                subtitles:[
                {
                    text: "Tổng số lượng sản phẩm : " + $scope.QuantitiesChart[i].TONG_SAN_PHAM,
                    fontColor: "deepskyblue",
                },
                {
                    text: "Số lượng mục tiêu : " + $scope.QuantitiesChart[i].SAN_PHAM_MUC_TIEU,
                    fontColor: "blue",
                },
                {
                    text: "Số lượng sản phẩm lỗi : " + $scope.QuantitiesChart[i].SAN_PHAM_LOI,
                    fontColor: "red",
                },
                 {
                     text: "Số lượng thực tế : " + ($scope.QuantitiesChart[i].TONG_SAN_PHAM - $scope.QuantitiesChart[i].SAN_PHAM_LOI),
                     fontColor: "red",
                 },
                ],
                axisY2: {
                    title: "Median List Price",
                    prefix: "$",
                    suffix: "K"
                },
                data: [{
                    type: "line",
                    dataPoints: [
                        //{ x: $scope.QuantitiesChart[i].T0, y: $scope.QuantitiesChart[i].TONG_SO_H0 },
                        //{ x: $scope.QuantitiesChart[i].T1, y: $scope.QuantitiesChart[i].TONG_SO_H1 },
                        //{ x: $scope.QuantitiesChart[i].T2, y: $scope.QuantitiesChart[i].TONG_SO_H2 },
                        //{ x: $scope.QuantitiesChart[i].T3, y: $scope.QuantitiesChart[i].TONG_SO_H3 },
                        //{ x: $scope.QuantitiesChart[i].T4, y: $scope.QuantitiesChart[i].TONG_SO_H4 },
                        //{ x: $scope.QuantitiesChart[i].T5, y: $scope.QuantitiesChart[i].TONG_SO_H5 },
                        //{ x: $scope.QuantitiesChart[i].T6, y: $scope.QuantitiesChart[i].TONG_SO_H6 },
                        //{ x: $scope.QuantitiesChart[i].T7, y: $scope.QuantitiesChart[i].TONG_SO_H7 },
                        //{ x: $scope.QuantitiesChart[i].T8, y: $scope.QuantitiesChart[i].TONG_SO_H8 },
                        //{ x: $scope.QuantitiesChart[i].T9, y: $scope.QuantitiesChart[i].TONG_SO_H9 },
                        //{ x: $scope.QuantitiesChart[i].T10, y: $scope.QuantitiesChart[i].TONG_SO_H10 },
                        //{ x: $scope.QuantitiesChart[i].T11, y: $scope.QuantitiesChart[i].TONG_SO_H11 },
                    ]
                }]
            });
            for (k = 0; k < $scope.QuantitiesChart[i].CHI_TIET.length; k++) {
                if ($scope.QuantitiesChart[i].CHI_TIET[k] != "") {
                    var a = $scope.QuantitiesChart[i].CHI_TIET[k].split(":")
                    var first = parseInt(a.shift());
                    var last = parseInt(a.pop())
                    chart.options.data[0].dataPoints.push({
                        x: first,
                        y:last
                    })
                }
            }
            
            chart.render();
        }
    }

    string_to_array = function (str) {
        return str.trim().split(",");
    };

    $scope.LoadNewChart = function () {
        $http.post('/api/Api_SmartOKRsInfor/QuantitiesChartNew').then(function (response) {
            $scope.NewChart = response.data
            for (i = 0; i < $scope.NewChart.length; i++) {
                $scope.NewChart[i].CHI_TIET = string_to_array($scope.NewChart[i].CHI_TIET)
            }
            for (i = 0; i < $scope.NewChart.length; i++) {
                for (k = 0; k < $scope.NewChart[i].CHI_TIET.length; k++) {
                    if ($scope.NewChart[i].CHI_TIET[k] != "") {
                        var a = $scope.NewChart[i].CHI_TIET[k].split(":")
                        var first = a.shift();
                        var last = a.pop()
                    }                   
                }
            }
        })
    }
})