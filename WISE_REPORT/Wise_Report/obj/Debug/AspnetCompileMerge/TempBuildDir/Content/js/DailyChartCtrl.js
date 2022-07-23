app.controller('DailyChartCtrl', function ($scope, $http, $interval, ajaxService) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;
    $scope.ngay = today;

    $scope.ListDays = []

    for (i = 5; i >= 1; i--) {
        var day = new Date()
        var daypast = new Date(day.setDate(day.getDate() - i));
        $scope.ListDays.push({
            day: GetDay(daypast),
            dayname : daypast.getDate()
        })
    }

    $scope.ListDays.push({
        day: today,
        dayname: "Today"
    })

    $scope.LoadDanhSachMay = function () {
        ajaxService.AjaxGetWithData('/api/Api_Machine/DanhSachMachine').then(function (response) {
            $scope.DanhSachMay = response.data
            $scope.DanhSachMay.forEach(function (item) {
                CreateDailyChart(item)
            });
        })
    }
    $scope.LoadDanhSachMay();


    $scope.reloadcolumn = function () {
        $scope.DanhSachMay.forEach(function (item) {
            CreateDailyChart(item)
        });
    }

    $scope.ChangeNgay = function () {
        var ngay = $('#ngay').val();
        $scope.ngay = ngay
        $scope.reloadcolumn()
        $('#SelectDay').modal('hide')
    }


    $(".date")
    .datepicker({
        onSelect: function (dateText) {
            console.log("Selected date: " + dateText + "; input's current value: " + this.value);
            $(this).change();
        }
    })

    .on("change", function () {
        $scope.ChangeNgay()
    });

    $scope.SelectNgay = function (item) {
        $scope.ngay = item.day
        $scope.reloadcolumn()
    }
    

    function CreateDailyChart(item) {
        var thamso = {
            date: $scope.ngay,
            mcid: item.MCID
        }
        $http.post('/api/Api_Machine/DailyChart', thamso).then(function (data) {
            console.log(data)
            var chart = {
                chart: { renderTo: 'chart' + item.MCID, height: 433, type: 'column', backgroundColor: '#333333', marginTop: 50 },
                rangeSelector: { selected: 2 },
                title: { text: '', style: { fontFamlily: chart_fontFamily, fontSize: title_fonSize_2, color: '#FFF', fontWeight: 'bold' }, y: 20 },
                xAxis: {
                    labels: { style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, fontWeight: 'normal', color: '#E0E0E3' }, rotation: 0 },
                    lineColor: '#FFF', crossing: 0, lineWidth: 2, minorGridLineColor: '#505053', tickColor: '#707073', tickWidth: 1, categories: []
                },
                yAxis: {
                    title: { text: 'Min.', style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, color: '#FFF', fontWeight: 'normal' } },
                    labels: { style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, fontWeight: 'normal', color: '#E0E0E3' }, rotation: 0 },
                    lineColor: '#FFF', crossing: 1, lineWidth: 0, minorGridLineColor: '#505053', tickColor: '#707073', tickWidth: 0,
                    minPadding: 0, maxPadding: 0, tickInterval: 20, tickPositions: [0, 20, 40, 60]
                },
                legend: {
                    align: 'center', verticalAlign: 'bottom', layout: 'horizontal',
                    itemStyle: { fontFamily: 'Arial', fontSize: 16, fontWeight: 'normal', color: '#FFF' },
                    itemHoverStyle: { color: '#FF0000' }, itemHiddenStyle: { color: '#FFF' }
                },
                exporting: { enabled: false },
                credits: { enabled: false },
                tooltip: {
                    crosshairs: true,
                    positioner: function (labelWidth, labelHeight, point) {
                        var tooltipX, tooltipY;
                        if (point.plotX + labelWidth > chart.plotWidth) {
                            tooltipX = point.plotX + chart.plotLeft - labelWidth - 25;
                        } else {
                            tooltipX = point.plotX + chart.plotLeft + 25;
                        }
                        if (point.plotY + labelHeight > chart.plotHeight) {
                            tooltipY = point.plotY + chart.plotTop - labelHeight - 25;
                        } else {
                            tooltipY = point.plotY + chart.plotTop + 25;
                        }
                        return {
                            x: tooltipX,
                            y: 50 //fixed top position
                            //y: tooltipY
                        };
                    },
                    headerFormat: '<span style="font-size:' + tooltip_title_fontSize_2 + '; font-weight:' + tooltip_title_fontWeight_2 + ';">This hour {point.key}</span><br/>' +
                        '<table style="width:100%;">',
                    pointFormat:
                        //'<tr>' +
                        //'<td style="width:10%;">' +
                        //'<span style="color:' + sACT_backgroundr + '; font-size:' + tooltip_legent_circle_fontSize_2 + '; line-height:' + tooltip_legend_circle_lineHeght_2 + ';">' + tooltip_legent_Symbol_line + '</span>' +
                        //'<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;ACT</span></td>' +
                        //'<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.uptime_act}&nbsp;min</td>' +
                        //'</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<span style="color:' + "#2d42ff" + '; font-size:' + "1.2rem" + '; line-height:' + "1rem" + ';">' + "▬" + '</span>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;STD</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.UPTIME_STD_MIN}&nbsp;min</td>' +
                        '<td style="width:30%; text-align:right;">&nbsp;&nbsp;&nbsp;{point.UPTIME_STD:.2f}%</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_00 + '; color:' + color_code_current_state_00 + '; margin-top:3px;">' + "●" + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_00 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_OFF:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_30 + '; color:' + color_code_current_state_30 + '; margin-top:3px;">' + "●" + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_30 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_YELLOW:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_20 + '; color:' + color_code_current_state_20 + '; margin-top:3px;">' + "●" + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_20 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_RED:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_10 + '; color:' + color_code_current_state_10 + '; margin-top:3px;">' + "●" + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_10 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_GREEN:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>',
                    footerFormat: '</table>',
                    //valueDecimals: 2,
                    //shared: true,
                    useHTML: true,
                    style: { fontFamily: chart_fontFamily, fontSize: tooltip_fontSize_2 }
                },
                plotOptions: {
                    series: {
                        borderWidth: 0, borderColor: '#FFF000',
                        dataLabels: { fontFamily: chart_fontFamily, fontSize: label_fontSize, fontWeight: 'normal', color: '#B0B0B3' },
                        shadow: true, marker: { lineColor: '#333', enabled: false },
                        states: {
                            inactive: {
                                opacity: 1
                            }
                        }
                    }, column: { stacking: 'normal' }
                },
                series: []
            };

            chart.title.text = item.WDT_USERNAME;
            chart.xAxis.categories = ["06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","00","01","02","03","04","05",];
            chart.series = data.data;
            chart = new Highcharts.Chart(chart, function (chart) {});
        })             
    }

    function GetDay(date) {
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

        if (date.getHours() < 10) {
            hour = "0" + date.getHours()
        } else {
            hour = date.getHours()
        }

        if (date.getMinutes() < 10) {
            min = "0" + date.getMinutes()
        } else {
            min = date.getMinutes()
        }


        if (date.getSeconds() < 10) {
            seconds = "0" + date.getSeconds()
        } else {
            seconds = date.getSeconds()
        }

        return day + '/' + month + '/' + date.getFullYear()
    }
})