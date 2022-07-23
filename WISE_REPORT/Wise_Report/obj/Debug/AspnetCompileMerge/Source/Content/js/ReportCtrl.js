app.controller('ReportCtrl', function ($scope, $http, $interval, ajaxService) {
    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

    $scope.Date = new Date();
    $scope.nam = $scope.Date.getFullYear();
    $scope.ListNam = $scope.range($scope.nam-100,$scope.nam + 100)
    $scope.thang = $scope.Date.getMonth() + 1;
    $scope.ListMonth = [
        { month: 1, check: 1 == $scope.thang ? true : false },
        { month: 2, check: 2 == $scope.thang ? true : false },
        { month: 3, check: 3 == $scope.thang ? true : false },
        { month: 4, check: 4 == $scope.thang ? true : false },
        { month: 5, check: 5 == $scope.thang ? true : false },
        { month: 6, check: 6 == $scope.thang ? true : false },
        { month: 7, check: 7 == $scope.thang ? true : false },
        { month: 8, check: 8 == $scope.thang ? true : false },
        { month: 9, check: 9 == $scope.thang ? true : false },
        { month: 10, check: 10 == $scope.thang ? true : false },
        { month: 11, check: 11 == $scope.thang ? true : false },
        { month: 12, check: 12 == $scope.thang ? true : false },
    ]

    $scope.OpenHour = function () {
        $("#ReportHourModal").modal()
        $("#QueryHourModal").modal()
        $scope.ListReportHour = []
    }

    $scope.QueryHour = function () {
        var date = $('#ngay').val();
        var data_query = {
            date : date
        }
        ajaxService.AjaxGetWithData('/api/Api_Machine/ReportHour',data_query).then(function (response) {
            $scope.ListReportHour = response.data
            $("#QueryHourModal").modal('hide')
        })
    }

    $scope.OpenShift = function () {
        $("#ReportShiftModal").modal()
        $("#QueryShiftModal").modal()
        $scope.ListReportShift = []
    }

    $scope.QueryShift = function () {
        var tungay = $('#tungay_shift').val();
        var denngay = $('#denngay_shift').val();
        var data_query = {
            tungay: tungay,
            denngay: denngay
        }
        ajaxService.AjaxGetWithData('/api/Api_Machine/ReportShift', data_query).then(function (response) {
            $scope.ListReportShift = response.data
            $("#QueryShiftModal").modal('hide')
        })
    }

    $scope.OpenDay = function () {
        $("#ReportDailyModal").modal()
        $("#QueryDailyModal").modal()
        $scope.ListReportDaily = []
    }

    $scope.QueryDaily = function () {
        var tungay = $('#tungay_daily').val();
        var denngay = $('#denngay_daily').val();
        var data_query = {
            tungay: tungay,
            denngay: denngay
        }
        ajaxService.AjaxGetWithData('/api/Api_Machine/ReportDaily', data_query).then(function (response) {
            $scope.ListReportDaily = response.data
            $("#QueryDailyModal").modal('hide')
        })
    }

    $scope.OpenWeek = function () {
        $("#ReportWeeklyModal").modal()
        $("#QueryWeeklyModal").modal()
        $scope.ListReportWeekly = []
    }

    $scope.QueryWeekly = function () {
        var tungay = $('#tungay_Weekly').val();
        var denngay = $('#denngay_Weekly').val();
        var data_query = {
            tungay: tungay,
            denngay: denngay
        }
        ajaxService.AjaxGetWithData('/api/Api_Machine/ReportWeekly', data_query).then(function (response) {
            $scope.ListReportWeekly = response.data
            $("#QueryWeeklyModal").modal('hide')
        })
    }

    $scope.OpenMonth = function () {
        $("#ReportMonthlyModal").modal()
        $("#QueryMonthlyModal").modal()
        $scope.ListReportMonthly = []
    }

    $scope.QueryMonthly = function () {
        $scope.ListMonthSelect = []
        for (i = 0; i < $scope.ListMonth.length; i++) {
            if ($scope.ListMonth[i].check == true) {
                $scope.ListMonthSelect.push({
                    thang : $scope.ListMonth[i].month
                })
            }
        }
        var data_query = {
            nam: $scope.nam,
            ListThang: $scope.ListMonthSelect
        }
        ajaxService.AjaxGetWithData('/api/Api_Machine/ReportMonthly', data_query).then(function (response) {
            $scope.ListReportMonthly = response.data
            $("#QueryMonthlyModal").modal('hide')
        })
    }

    $scope.tableToExcel = function (tableId,name) { // ex: '#my-table'
        var tab_text = "<table border='2px' style='width:100%;white-spacing:nowrap;'><tr bgcolor='#87AFC6'>";
        var textRange; var j = 0;
        tab = document.getElementById(tableId); // id of table

        for (j = 0 ; j < tab.rows.length ; j++) {
            tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
            //tab_text=tab_text+"</tr>";
        }

        tab_text = tab_text + "</table>";
        tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
        tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
        tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE");
        var dt = new Date();
        var day = dt.getDate();
        var month = dt.getMonth() + 1;
        var year = dt.getFullYear();
        var hour = dt.getHours();
        var mins = dt.getMinutes();
        var postfix = day + "." + month + "." + year + "_" + hour + "." + mins;

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
        {
            txtArea1.document.open("txt/html", "replace");
            txtArea1.document.write(tab_text);
            txtArea1.document.close();
            txtArea1.focus();
            sa = txtArea1.document.execCommand("SaveAs", true, "DataTableExport.xls");
        }
        else // For Chrome and firefox (Other broswers not tested)
        {


            var myBlob = new Blob([tab_text], {
                type: 'application/vnd.ms-excel'
            });
            var url = window.URL.createObjectURL(myBlob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = url;
            a.download = name + postfix + ".xls";
            a.click();
            //adding some delay in removing the dynamically created link solved the problem in FireFox
            setTimeout(function () {
                window.URL.revokeObjectURL(url);
            }, 0);
        }


        return (sa);
    }

    $scope.Hide = function (item,classname) {
        $('.' + classname + '-' + item.MCID).addClass('hidden')
    }
    $scope.Show = function (item, classname) {
        $('.' + classname + '-' + item.MCID).removeClass('hidden')
    }
})
