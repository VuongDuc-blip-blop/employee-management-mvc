app.controller('WeeklyChartCtrl', function ($scope, $http, $interval, ajaxService) {
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
    $scope.nam = yyyy

    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

    $scope.ListNam = $scope.range(yyyy - 2, yyyy)
    $scope.ListNamSelect = $scope.range(2017,yyyy)

    $scope.LoadDanhSachMay = function () {
        ajaxService.AjaxGetWithData('/api/Api_Machine/DanhSachMachine').then(function (response) {
            $scope.DanhSachMay = response.data
            $scope.DanhSachMay.forEach(function (item) {
                CreateWeeklyChart(item)
            });
        })
    }
    $scope.LoadDanhSachMay();


    $scope.reloadcolumn = function () {
        $scope.DanhSachMay.forEach(function (item) {
            CreateWeeklyChart(item)
        });
    }

    $scope.ChuyenNam = function (nam) {
        $scope.nam = nam
        $scope.reloadcolumn()
    }

    function CreateWeeklyChart(item) {
        var thamso = {
            nam: $scope.nam,
            mcid: item.MCID
        }
        $http.post('/api/Api_Machine/WeeklyChart', thamso).then(function (data) {
            console.log(data)
            var chart = {
                chart: { renderTo: 'chart' + item.MCID, height: 433, type: 'column', backgroundColor: '#333333', marginTop: 50 },
                title: { text: '', style: { fontFamily: chart_fontFamily, fontSize: title_fonSize_2, color: '#FFF', fontWeight: 'bold' }, y: 20 },
                rangeSelector: { selected: 2 },
                xAxis: {
                    labels: { style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, fontWeight: 'normal', color: '#E0E0E3' }, rotation: 0 },
                    lineColor: '#FFF', crossing: 0, lineWidth: 2, minorGridLineColor: '#505053', tickColor: '#707073', tickWidth: 1, categories: []
                }, yAxis: [
                    //{
                    //    title: { text: '', style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, color: '#FFF', fontWeight: 'normal' } },
                    //    labels: { style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, fontWeight: 'normal', color: '#E0E0E3' }, rotation: 0 },
                    //    opposite: true, tickInterval: 20, tickPositions: [0, 20, 40, 60, 80, 100]
                    //},
                    {
                        title: { text: 'Min.', style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, color: '#FFF', fontWeight: 'normal' } },
                        labels: { style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, fontWeight: 'normal', color: '#E0E0E3' }, rotation: 0 },
                        tickInterval: 20, tickPositions: [0, 2016, 4032, 6048, 8064, 10080]
                    },
                ],
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
                            y: 50
                        };
                    },
                    headerFormat: '<span style="font-size:' + tooltip_title_fontSize_2 + '; font-weight:' + tooltip_title_fontWeight_2 + ';">Week {point.key}</span><br/>' +
                        '<table style="width:100%;">',
                    pointFormat:
                        '<tr>' +
                        '<td style="width:10%; font-weight:' + tooltip_caption_fontWeight + ';">DATE</td>' +
                        '<td style="width:60%;text-align:left;">{point.date_time}</td>' +
                        '</tr>' +
                        //'<tr>' +
                        //'<td style="width:10%;">' +
                        //'<span style="color:' + sACT_backgroundr + '; font-size:' + tooltip_legent_circle_fontSize_2 + '; line-height:' + tooltip_legend_circle_lineHeght_2 + ';">' + tooltip_legent_Symbol_line + '</span>' +
                        //'<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;ACT</span></td>' +
                        //'<td style="width:60%;text-align:right;">{point.uptime_act}&nbsp;min</td>' +
                        //'</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_00 + '; color:' + color_code_current_state_00 + '; margin-top:3px;"></div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_00 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_OFF:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_30 + '; color:' + color_code_current_state_30 + '; margin-top:3px;"></div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_30 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_YELLOW:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_20 + '; color:' + color_code_current_state_20 + '; margin-top:3px;"></div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_20 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_RED:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + color_code_current_state_10 + '; color:' + color_code_current_state_10 + '; margin-top:3px;"></div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;' + name_current_state_10 + '</span></td>' +
                        '<td style="width:60%; text-align:right;">&nbsp;&nbsp;{point.TIME_RUN:.2f}&nbsp;min</td>' +
                        '</div>' +
                        '</tr>',
                    footerFormat: '</table>',
                    useHTML: true,
                    style: { fontFamily: chart_fontFamily, fontSize: tooltip_fontSize_2 }
                },
                plotOptions: {
                    series: {
                        borderWidth: 0, borderColor: '#FFF000',
                        dataLabels: { fontFamily: chart_fontFamily, fontSize: label_fontSize, fontWeight: 'normal', color: '#B0B0B3' },
                        marker: { lineColor: '#333', enabled: false },
                        shadow: true,
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
            chart.xAxis.categories = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53"];
            chart.series = data.data;
            chart = new Highcharts.Chart(chart, function (chart) { });
        })
    }
})