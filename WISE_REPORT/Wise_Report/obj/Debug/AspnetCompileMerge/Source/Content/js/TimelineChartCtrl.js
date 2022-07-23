app.controller('TimelineChartCtrl', function ($scope, $http, $interval, ajaxService) {
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

    $scope.ListDays = []

    for (i = 5; i >= 1; i--) {
        var day = new Date()
        var daypast = new Date(day.setDate(day.getDate() - i));
        $scope.ListDays.push({
            day: GetDay(daypast),
            dayname: daypast.getDate()
        })
    }

    $scope.ListDays.push({
        day: today,
        dayname: "Today"
    })

    $scope.reloadcolumn = function () {
        Create_TimeLineChart()
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

    Create_TimeLineChart()

    function Create_TimeLineChart() {
        $('#chart1').html('');
        var tooltip_title_fontSize = 12;
        var tooltip_caption_fontWeight = 'bold'
        var tooltip_title_fontWeight = 'bold'
        //var jsonData = JSON.parse($('#body-content').attr('jsondata'));
        var content_height = 900
        var content_width = 1900

        var thamso = {
            date: $scope.ngay,
            start: 6,
            end : 6
        }

        ajaxService.AjaxGetWithData('/api/Api_Machine/Timeline', thamso).then(function (data) {
            console.log(data.data)
            var chart = {
                chart: { renderTo: 'chart1', height: content_height, width: content_width, type: 'columnrange', inverted: true, zoomType: 'y', backgroundColor: '#333333', spacingBottom: 5 },
                title: { text: '' },
                rangeSelector: { selected: 20 },
                exporting: {
                    enabled: true,
                    sourceWidth: 1920
                },
                credits: { enabled: false },
                xAxis: {
                    title: { text: '' },
                    labels: { style: { fontFamily: 'Arial', fontSize: 12, color: '#E0E0E3' }, rotation: 0, },
                    lineColor: '#FFF', crossing: 0, lineWidth: 2, minorGridLineColor: '#505053', tickColor: '#707073', gridLineColor: '#707073', tickWidth: 1, categories: []
                },
                yAxis: {
                    title: { text: '' },
                    labels: {
                        style: { fontFamily: 'Arial', fontSize: 12, color: '#E0E0E3' }, rotation: 0,
                        formatter: function () {
                            var hourstr = Highcharts.dateFormat('%H', this.value).substring(0, 2);
                            return hourstr;
                        }
                    },
                    lineColor: '#FFF', crossing: 0, lineWidth: 2, minorGridLineColor: '#505053', tickColor: '#707073', gridLineColor: '#707073', tickWidth: 1, tickInterval: 3600000, minPadding: 0, maxPadding: 0, type: 'datetime'
                },
                legend: {
                    align: 'center', verticalAlign: 'bottom', layout: 'horizontal',
                    itemStyle: { fontFamily: 'Arial', fontSize: 16, fontWeight: 'normal', color: '#FFF' },
                    itemHoverStyle: { color: '#FF0000' }, itemHiddenStyle: { color: '#FFF' }
                },
                tooltip: {
                    //crosshairs: true,
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
                            y: tooltipY
                        };
                    },
                    headerFormat: '<span style="font-size:' + tooltip_title_fontSize + '; font-weight:' + tooltip_title_fontWeight + ';">{series.name}</span><br/>',
                    pointFormat: '<table style="width:100%;">' +
                        '<tr>' +
                        '<td style="width:10%; font-weight:' + tooltip_caption_fontWeight + ';">Machine Name</td>' +
                        '<td style="width:60%; text-align:right;">{point.MACHINE_NAME}</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%; font-weight:' + tooltip_caption_fontWeight + ';">Start</td>' +
                        '<td style="width:60%; text-align:right;">{point.BEGIN_TIME}</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%; font-weight:' + tooltip_caption_fontWeight + ';">End</td>' +
                        '<td style="width:60%; text-align:right;">{point.END_TIME}</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:10%; font-weight:' + tooltip_caption_fontWeight + ';">Duration</td>' +
                        '<td style="width:60%; text-align:right;">{point.DURATION}</td>' +
                        '</tr>'+
                        '<tr>' +
                        '<td style="width:20%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + 'lawngreen' + '; color:' + 'lawngreen' + '; margin-top:3px;">' + '' + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;RUN</span>' +
                        '</div>' +
                        '</td>' +
                        '<td style="width:60%; text-align:right;">{point.TIME_GREEN}</td>' +
                        '</tr>'+
                        '<tr>' +
                        '<td style="width:20%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + 'red' + '; color:' + 'red' + '; margin-top:3px;">' + '' + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;ERROR</span>' +
                        '</div>' +
                        '</td>' +
                        '<td style="width:60%; text-align:right;">{point.TIME_RED}</td>' +
                        '</tr>'+
                        '<tr>' +
                        '<td style="width:20%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + 'yellow' + '; color:' + 'yellow' + '; margin-top:3px;">' + '' + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;WAIT</span>' +
                        '</div>' +
                        '</td>' +
                        '<td style="width:60%; text-align:right;">{point.TIME_YELLOW}</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:20%;">' +
                        '<div style="display:flex;">' +
                        '<div style="width:0.65rem; height:0.65rem; border:0.05rem solid #8e8e8e; border-radius:50%; white-space:nowrap; overflow:hidden; background-color:' + 'grey' + '; color:' + 'grey' + '; margin-top:3px;">' + '' + '</div>' +
                        '<span style="font-weight:' + tooltip_caption_fontWeight + ';">&nbsp;OFF</span>' +
                        '</div>' +
                        '</td>' +
                        '<td style="width:60%; text-align:right;">{point.TIME_OFF}</td>' +
                        '</tr>'
                    ,
                    footerFormat: '</table>',
                    useHTML: true,
                    style: { fontFamily: 'Arial', fontSize: 12 }
                },
                plotOptions: {
                    columnrange: { grouping: false, turboThreshold: 1000000 },
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function () {
                                    //---------- chk state click event-----------//
                                    if (this.current_state != 10 && this.current_state != 1) {

                                        var params = {
                                            mcid: this.mcid,
                                            mc_name: this.MACHINE_NAME,
                                            tid: this.tid,
                                            state: this.current_state,
                                            state_name: ((this.current_state == 20) ? 'ERROR' : (this.current_state == 30) ? 'WAIT' : (this.current_state == 0) ? 'OFF' : 'OFF'),
                                            start_date: this.startdate,
                                            end_date: this.enddate,
                                            gpid: 1
                                        };
                                        $('.btn_login').attr('jsondata', JSON.stringify(params));
                                        $('.Next_event').attr('jsondata', 'LoadReason');
                                        this_series = this;
                                        load_InputReason(params);
                                    }
                                }
                            }
                        },
                        borderWidth: 0,
                        states: {
                            inactive: {
                                opacity: 1
                            }
                        }
                    }
                },
                series: []
            };
            var finalArray = data.data.ListMachine.map(function (obj) {
                return obj.MACHINE_NAME;
            });
            console.log(finalArray)
            chart.xAxis.categories = finalArray;
            chart.series = data.data.data
            chart = new Highcharts.Chart(chart);
        });
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