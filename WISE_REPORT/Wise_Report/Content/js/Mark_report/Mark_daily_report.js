app.controller('Mark_daily_reportCtrl', function ($scope, $http, $interval, ajaxService) {
    var username = $('#userid').val();
    var currentuserid = $('#userid').val();
    $scope.userid = $('#userid').val();
    $scope.today = new Date();
    $scope.addCol = false;
    $scope.addRow = false;
    //$scope.header = [];
    $scope.showdetail = false;
    $scope.tukhoa1 = '';
    $scope.editColH = false;
    $scope.editColC = false;
    $scope.editColF = false;
    $scope.status = false;
    $scope.addnewcmt = false;
    $scope.month = $scope.today.getMonth() + 1;
    $scope.month = $scope.month.toString();
    $scope.year = $scope.today.getFullYear();
    $scope.year = $scope.year.toString();
    $scope.day = $scope.today.getDay();
    $scope.branch = '1'; //Hà nội
    $scope.tungay = '';
    $scope.denngay = '';
    $scope.quater = 0;
    $scope.hidelistrp = false;
    //var date = new Date($scope.year, $scope.month, 1);
    //$scope.week = getWeekNumber(date);

    $scope.week = moment().format('W');

    $scope.headerid = 0;
    $scope.week1 = $scope.week - 4;
    $scope.week2 = $scope.week - 3;
    $scope.week3 = $scope.week - 2;
    $scope.week4 = $scope.week - 1;
    $scope.week5 = $scope.week;
    $scope.week6 = parseInt($scope.week) + 1;

    // ========================================GENERAL REPORT =======================================================================
    //List report
    $scope.LoadReport = function () {
        var data = {
            currentuserid: currentuserid,
            tukhoa1: $scope.tukhoa1, //report_name
            status: $scope.status,
            deptid: $scope.deptid,
            branch:$scope.branch,
            sotrang: 1,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListReport', data).then(function successCallback(response) {
            $scope.list_report = response.data;
        })
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListReport_Count', data).then(function successCallback(response) {
            $scope.sum_listrp = response.data;
            pagination2_Listrp.make(parseInt($scope.sum_listrp), 5);
            pagination2_Listrp_Sale.make(parseInt($scope.sum_listrp), 5);
        })
    }
    $scope.LoadReport();

    function pageClick2_listrp(pageNumber) {
        $scope.tranghientai = pageNumber
        var data = {
            currentuserid: currentuserid,
            tukhoa1: $scope.tukhoa1, //report_name
            status: $scope.status,
            deptid: $scope.deptid,
            branch: $scope.branch,
            sotrang: pageNumber
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListReport', data).then(function successCallback(response) {
            $scope.list_report = response.data;
        })
    }

    var pagination2_Listrp = new Pagination({
        container: $("#phan_trang_listrp"),
        pageClickCallback: pageClick2_listrp,
        maxVisibleElements: 5,
    });
    var pagination2_Listrp_Sale = new Pagination({
        container: $("#phan_trang_listrp_sale"),
        pageClickCallback: pageClick2_listrp,
        maxVisibleElements: 5,
    });

    //Detail report
    $scope.deptid = 0;
    $scope.report = ''; $scope.headerid = ""; $scope.content_1 = ""; $scope.content_2 = ""; $scope.content_3 = ""; $scope.content_5 = ""; $scope.content_6 = ""; $scope.content_7 = ""; $scope.content_8 = ""; $scope.content_9 = ""; $scope.content_10 = ""; $scope.content_4 = "";
    $scope.sort_content_1 = ""; $scope.sort_content_2 = ""; $scope.sort_content_3 = ""; $scope.sort_content_5 = ""; $scope.sort_content_6 = ""; $scope.sort_content_7 = ""; $scope.sort_content_8 = ""; $scope.sort_content_9 = ""; $scope.sort_content_10 = ""; $scope.sort_content_4 = "";
    $scope.LoadListMarkDailyReport = function (header) {
        $scope.headerid = header.ID;
        $scope.deptid = header.ID_DEPT;
        $scope.showdetail = true;
        $scope.editColC = false;

        var data = {
            tukhoa2: header.ID,
            deptid: header.ID_DEPT,
            tukhoa3: $scope.content_1,
            tukhoa4: $scope.content_2,
            content_3: $scope.content_3,
            content_4: $scope.content_4,
            content_5: $scope.content_5,
            content_6: $scope.content_6,
            content_7: $scope.content_7,
            content_8: $scope.content_8,
            content_9: $scope.content_9,
            content_10: $scope.content_10,
            sort_content_1: $scope.sort_content_1,
            sort_content_2: $scope.sort_content_2,
            sort_content_3: $scope.sort_content_3,
            sort_content_4: $scope.sort_content_4,
            sort_content_5: $scope.sort_content_5,
            sort_content_6: $scope.sort_content_6,
            sort_content_7: $scope.sort_content_7,
            sort_content_8: $scope.sort_content_8,
            sort_content_9: $scope.sort_content_9,
            sort_content_10: $scope.sort_content_10,
            currentuserid: currentuserid,
            sotrang: 1,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListMarkDailyReport', data).then(function successCallback(response) {
            $scope.list_mark_daily_report = response.data;
            $scope.header = $scope.list_mark_daily_report[0];
        })
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListMarkDailyReport_Count', data).then(function (response) {
            $scope.sum_detailrp = response.data;
            pagination2.make(parseInt($scope.sum_detailrp), 10);
        });
    }
    //$scope.LoadListMarkDailyReport();

    function pageClick2(pageNumber) {
        $scope.tranghientai = pageNumber
        var data = {
            tukhoa2: $scope.headerid,
            tukhoa3: $scope.content_1,
            tukhoa4: $scope.content_2,
            content_3: $scope.content_3,
            content_4: $scope.content_4,
            content_5: $scope.content_5,
            content_6: $scope.content_6,
            content_7: $scope.content_7,
            content_8: $scope.content_8,
            content_9: $scope.content_9,
            content_10: $scope.content_10,
            sort_content_1: $scope.sort_content_1,
            sort_content_2: $scope.sort_content_2,
            sort_content_3: $scope.sort_content_3,
            sort_content_4: $scope.sort_content_4,
            sort_content_5: $scope.sort_content_5,
            sort_content_6: $scope.sort_content_6,
            sort_content_7: $scope.sort_content_7,
            sort_content_8: $scope.sort_content_8,
            sort_content_9: $scope.sort_content_9,
            sort_content_10: $scope.sort_content_10,
            currentuserid: currentuserid,
            sotrang: pageNumber,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListMarkDailyReport', data).then(function successCallback(response) {
            $scope.list_mark_daily_report = response.data;
        })

    }

    var pagination2 = new Pagination({
        container: $("#phan_trang"),
        pageClickCallback: pageClick2,
        maxVisibleElements: 10,
    });


    $scope.List_row = [{
        CONTENT_1: '',
        CONTENT_2: '',
        CONTENT_3: '',
        CONTENT_4: '',
        CONTENT_5: '',
        CONTENT_6: '',
        CONTENT_7: '',
        CONTENT_8: '',
        CONTENT_9: '',
        CONTENT_10: '',
        CONTENT_11: '',
        CONTENT_12: '',
        CONTENT_13: '',
        CONTENT_14: '',
        CONTENT_15: '',
        CONTENT_16: '',
        CONTENT_17: '',
        CONTENT_18: '',
        CONTENT_19: '',
        CONTENT_20: ''
    }]

    $scope.AddRow = function () {
        $scope.List_row.push({
            CONTENT_1: '',
            CONTENT_2: '',
            CONTENT_3: '',
            CONTENT_4: '',
            CONTENT_5: '',
            CONTENT_6: '',
            CONTENT_7: '',
            CONTENT_8: '',
            CONTENT_9: '',
            CONTENT_10: '',
            CONTENT_11: '',
            CONTENT_12: '',
            CONTENT_13: '',
            CONTENT_14: '',
            CONTENT_15: '',
            CONTENT_16: '',
            CONTENT_17: '',
            CONTENT_18: '',
            CONTENT_19: '',
            CONTENT_20: ''
        })
    }

    $scope.RemoveRow = function (index) {
        $scope.List_row.splice(index, 1)
    }
    //Thêm content
    $scope.AddContent = function () {
        var data_add = {
            ID_HEADER: $scope.header.ID,
            ID_DEPT: $scope.header.ID_DEPT,
            ID_GROUP: $scope.header.ID_GROUP,
            ID_USER: $scope.header.ID_USER,
            VERSION: $scope.header.VERSION,
            CREATE_USER: currentuserid,
            List_row: $scope.List_row
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/AddReportContent', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadListMarkDailyReport(data_add.ID_HEADER);
                $scope.List_row = []
                //$('#add_group_user').modal('hide')

            } else {
                ErrorSystem(response.data)
            }
        })
    }

    //-----CKEditor---------------------------------------------------------------------------
    $scope.showdata = function () {
        $("textarea[name=mail_content]").val(CKEDITOR.instances.mail_content.getData());
        var mail_content = $("[name=mail_content]").val();
        var res = mail_content.replace('<table', '<table id="tableupload" ');
        $scope.showdatacontent = res;
    }

    $scope.upload_content = function () {
        var tableUp = document.getElementById('tableupload');
        //gets rows of table
        var rowLength = tableUp.rows.length;
        $scope.ListNew = []
        //loops through rows    
        for (i = 0; i < rowLength; i++) {
            var cell1 = document.getElementById("tableupload").rows[i].cells.item(0) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(0).innerText
            var cell2 = document.getElementById("tableupload").rows[i].cells.item(1) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(1).innerText
            var cell3 = document.getElementById("tableupload").rows[i].cells.item(2) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(2).innerText
            var cell4 = document.getElementById("tableupload").rows[i].cells.item(3) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(3).innerText
            var cell5 = document.getElementById("tableupload").rows[i].cells.item(4) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(4).innerText
            var cell6 = document.getElementById("tableupload").rows[i].cells.item(5) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(5).innerText
            var cell7 = document.getElementById("tableupload").rows[i].cells.item(6) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(6).innerText
            var cell8 = document.getElementById("tableupload").rows[i].cells.item(7) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(7).innerText
            var cell9 = document.getElementById("tableupload").rows[i].cells.item(8) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(8).innerText
            var cell10 = document.getElementById("tableupload").rows[i].cells.item(9) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(9).innerText
            var cell11 = document.getElementById("tableupload").rows[i].cells.item(10) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(10).innerText
            var cell12 = document.getElementById("tableupload").rows[i].cells.item(11) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(11).innerText
            var cell13 = document.getElementById("tableupload").rows[i].cells.item(12) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(12).innerText
            var cell14 = document.getElementById("tableupload").rows[i].cells.item(13) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(13).innerText
            var cell15 = document.getElementById("tableupload").rows[i].cells.item(14) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(14).innerText
            var cell16 = document.getElementById("tableupload").rows[i].cells.item(15) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(15).innerText
            var cell17 = document.getElementById("tableupload").rows[i].cells.item(16) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(16).innerText
            var cell18 = document.getElementById("tableupload").rows[i].cells.item(17) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(17).innerText
            var cell19 = document.getElementById("tableupload").rows[i].cells.item(18) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(18).innerText
            var cell20 = document.getElementById("tableupload").rows[i].cells.item(19) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(19).innerText

            var CTHH = {
                CONTENT_1: cell1,
                CONTENT_2: cell2,
                CONTENT_3: cell3,
                CONTENT_4: cell4,
                CONTENT_5: cell5,
                CONTENT_6: cell6,
                CONTENT_7: cell7,
                CONTENT_8: cell8,
                CONTENT_9: cell9,
                CONTENT_10: cell10,
                CONTENT_11: cell11,
                CONTENT_12: cell12,
                CONTENT_13: cell13,
                CONTENT_14: cell14,
                CONTENT_15: cell15,
                CONTENT_16: cell16,
                CONTENT_17: cell17,
                CONTENT_18: cell18,
                CONTENT_19: cell19,
                CONTENT_20: cell20
            }
            $scope.ListNew.push(CTHH);
        }
        //Lưu vào CSDL
        var data_add = {
            ID_HEADER: $scope.header.ID,
            ID_DEPT: $scope.header.ID_DEPT,
            ID_GROUP: $scope.header.ID_GROUP,
            ID_USER: $scope.header.ID_USER,
            VERSION: $scope.header.VERSION,
            USER_CREATE: currentuserid,
            List_row: $scope.ListNew
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/AddReportContent', data_add).then(function (response) {
            $scope.list_room = response.data;
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.ListNew = []
                $scope.LoadListMarkDailyReport(data_add.ID_HEADER);
                //$('#add_group_usergroup_new').modal('hide')                
            } else {
                ErrorSystem(response.data)
            }
        })

    }

    //------Add Cột tiêu đề
    $scope.AddCol = function (header_name_add, header) {
        if (header_name_add != null && header_name_add != '') {
            var data_add_header = {
                ID: header.ID,
                CREATE_USER: currentuserid,
                HEADER_1: header.HEADER_1,
                HEADER_2: header.HEADER_2,
                HEADER_3: header.HEADER_3,
                HEADER_4: header.HEADER_4,
                HEADER_5: header.HEADER_5,
                HEADER_6: header.HEADER_6,
                HEADER_7: header.HEADER_7,
                HEADER_8: header.HEADER_8,
                HEADER_9: header.HEADER_9,
                HEADER_10: header.HEADER_10,
                HEADER_11: header.HEADER_11,
                HEADER_12: header.HEADER_12,
                HEADER_13: header.HEADER_13,
                HEADER_14: header.HEADER_14,
                HEADER_15: header.HEADER_15,
                HEADER_16: header.HEADER_16,
                HEADER_17: header.HEADER_17,
                HEADER_18: header.HEADER_18,
                HEADER_19: header.HEADER_19,
                HEADER_20: header.HEADER_20,
                header_name_add: header_name_add
            }
            $http.post(origin + '/api/Api_Mark_Daily_Report/AddColumnHeaderName', data_add_header).then(function (response) {
                if (response.data.indexOf("thành công") >= 0) {
                    SuccessSystem(response.data)
                    $scope.LoadListMarkDailyReport(header.ID);
                }
            })
        }

    }

    // Create new header table & add content
    $scope.upload_content_newtbl = function () {
        var tableUp = document.getElementById('tableupload');
        //gets rows of table
        var rowLength = tableUp.rows.length;
        $scope.ListNew = []
        //loops through rows    
        for (i = 0; i < rowLength; i++) {
            var cell1 = document.getElementById("tableupload").rows[i].cells.item(0) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(0).innerText
            var cell2 = document.getElementById("tableupload").rows[i].cells.item(1) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(1).innerText
            var cell3 = document.getElementById("tableupload").rows[i].cells.item(2) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(2).innerText
            var cell4 = document.getElementById("tableupload").rows[i].cells.item(3) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(3).innerText
            var cell5 = document.getElementById("tableupload").rows[i].cells.item(4) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(4).innerText
            var cell6 = document.getElementById("tableupload").rows[i].cells.item(5) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(5).innerText
            var cell7 = document.getElementById("tableupload").rows[i].cells.item(6) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(6).innerText
            var cell8 = document.getElementById("tableupload").rows[i].cells.item(7) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(7).innerText
            var cell9 = document.getElementById("tableupload").rows[i].cells.item(8) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(8).innerText
            var cell10 = document.getElementById("tableupload").rows[i].cells.item(9) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(9).innerText
            var cell11 = document.getElementById("tableupload").rows[i].cells.item(10) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(10).innerText
            var cell12 = document.getElementById("tableupload").rows[i].cells.item(11) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(11).innerText
            var cell13 = document.getElementById("tableupload").rows[i].cells.item(12) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(12).innerText
            var cell14 = document.getElementById("tableupload").rows[i].cells.item(13) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(13).innerText
            var cell15 = document.getElementById("tableupload").rows[i].cells.item(14) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(14).innerText
            var cell16 = document.getElementById("tableupload").rows[i].cells.item(15) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(15).innerText
            var cell17 = document.getElementById("tableupload").rows[i].cells.item(16) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(16).innerText
            var cell18 = document.getElementById("tableupload").rows[i].cells.item(17) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(17).innerText
            var cell19 = document.getElementById("tableupload").rows[i].cells.item(18) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(18).innerText
            var cell20 = document.getElementById("tableupload").rows[i].cells.item(19) == null ? '' : document.getElementById("tableupload").rows[i].cells.item(19).innerText
            var CTHH = {
                CONTENT_1: cell1,
                CONTENT_2: cell2,
                CONTENT_3: cell3,
                CONTENT_4: cell4,
                CONTENT_5: cell5,
                CONTENT_6: cell6,
                CONTENT_7: cell7,
                CONTENT_8: cell8,
                CONTENT_9: cell9,
                CONTENT_10: cell10,
                CONTENT_11: cell11,
                CONTENT_12: cell12,
                CONTENT_13: cell13,
                CONTENT_14: cell14,
                CONTENT_15: cell15,
                CONTENT_16: cell16,
                CONTENT_17: cell17,
                CONTENT_18: cell18,
                CONTENT_19: cell19,
                CONTENT_20: cell20
            }
            $scope.ListNew.push(CTHH);
        }
        //Lưu vào CSDL
        var data_add = {
            //REPORT_NAME:$scope.header.REPORT_NAME,
            ID_DEPT: 1,
            ID_GROUP: 0,
            ID_USER: currentuserid,
            VERSION: 0,
            USER_CREATE: currentuserid,
            List_row: $scope.ListNew
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/AddNewHeader_ReportContent', data_add).then(function (response) {
            $scope.list_room = response.data;
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.ListNew = [];
                $scope.LoadReport();
                //$('#add_group_usergroup_new').modal('hide')                
            } else {
                ErrorSystem(response.data)

            }
        })

    }

    $scope.Addnew_report = function () {
        var data_add = {
            REPORT_NAME: $scope.report_name,
            ID_USER: currentuserid,
            CREATE_USER: currentuserid
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/AddNewReport', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $('#add_new_report').modal('hide')
                $scope.LoadReport()
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    $scope.Update_file_name = function (item) {
        var data_update = {
            ID: item.ID,
            REPORT_NAME: item.REPORT_NAME,
            CREATE_USER: item.CREATE_USER
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/UpdateFilename', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadReport();
            }
        })
    }

    $scope.UpdateHeader = function (header) {
        $scope.editColH = false;
        var data_update = {
            ID: header.ID,
            CREATE_USER: currentuserid,
            HEADER_1: header.HEADER_1,
            HEADER_2: header.HEADER_2,
            HEADER_3: header.HEADER_3,
            HEADER_4: header.HEADER_4,
            HEADER_5: header.HEADER_5,
            HEADER_6: header.HEADER_6,
            HEADER_7: header.HEADER_7,
            HEADER_8: header.HEADER_8,
            HEADER_9: header.HEADER_9,
            HEADER_10: header.HEADER_10,
            HEADER_11: header.HEADER_11,
            HEADER_12: header.HEADER_12,
            HEADER_13: header.HEADER_13,
            HEADER_14: header.HEADER_14,
            HEADER_15: header.HEADER_15,
            HEADER_16: header.HEADER_16,
            HEADER_17: header.HEADER_17,
            HEADER_18: header.HEADER_18,
            HEADER_19: header.HEADER_19,
            HEADER_20: header.HEADER_20,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/UpdateHeader', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadListMarkDailyReport(header.ID);
            }
        })
    }

    $scope.UpdateContent = function (item) {
        $scope.editColC = false;
        var data_update = {
            ID: item.ID,
            CREATE_USER: currentuserid,
            CONTENT_1: item.HEADER_1,
            CONTENT_2: item.HEADER_2,
            CONTENT_3: item.HEADER_3,
            CONTENT_4: item.HEADER_4,
            CONTENT_5: item.HEADER_5,
            CONTENT_6: item.HEADER_6,
            CONTENT_7: item.HEADER_7,
            CONTENT_8: item.HEADER_8,
            CONTENT_9: item.HEADER_9,
            CONTENT_10: item.HEADER_10,
            CONTENT_11: item.HEADER_11,
            CONTENT_12: item.HEADER_12,
            CONTENT_13: item.HEADER_13,
            CONTENT_14: item.HEADER_14,
            CONTENT_15: item.HEADER_15,
            CONTENT_16: item.HEADER_16,
            CONTENT_17: item.HEADER_17,
            CONTENT_18: item.HEADER_18,
            CONTENT_19: item.HEADER_19,
            CONTENT_20: item.HEADER_20,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/UpdateContent', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data);
                $scope.LoadListMarkDailyReport(item.ID_HEADER);
            }
        })
    }

    //Update status is checked
    $scope.Update_is_checked = function (item) {
        var data_update = {
            ID_HEADER: item.ID,
            USER_CHECK: currentuserid,
            IS_CHECK: item.IS_CHECK
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/UpdateIsChecked', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadReport();
            }
        })
    }

    //Xuất excel từ View
    $scope.tablesToExcelMultiTabsModal = (function ($) {
        var uri = 'data:application/vnd.ms-excel;base64,'
        , html_start = `<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`
        , template_ExcelWorksheet = `<x:ExcelWorksheet><x:Name>{SheetName}</x:Name><x:WorksheetSource HRef="sheet{SheetIndex}.htm"/></x:ExcelWorksheet>`
        , template_ListWorksheet = `<o:File HRef="sheet{SheetIndex}.htm"/>`
        , template_HTMLWorksheet = `
------=_NextPart_dummy
Content-Location: sheet{SheetIndex}.htm
Content-Type: text/html; charset=windows-1252

` + html_start + `
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <link id="Main-File" rel="Main-File" href="../WorkBook.htm">
  <link rel="File-List" href="filelist.xml">
</head>
<body><table>{SheetContent}</table></body>
</html>`
        , template_WorkBook = `MIME-Version: 1.0
X-Document-Type: Workbook
Content-Type: multipart/related; boundary="----=_NextPart_dummy"

------=_NextPart_dummy
Content-Location: WorkBook.htm
Content-Type: text/html; charset=windows-1252

` + html_start + `
<head>
<meta name="Excel Workbook Frameset">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link rel="File-List" href="filelist.xml">
<!--[if gte mso 9]><xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>{ExcelWorksheets}</x:ExcelWorksheets>
  <x:ActiveSheet>1</x:ActiveSheet>
 </x:ExcelWorkbook>
</xml><![endif]-->
</head>
<frameset>
  <frame src="sheet0.htm" name="frSheet">
  <noframes><body><p>This page uses frames, but your browser does not support them.</p></body></noframes>
</frameset>
</html>
{HTMLWorksheets}
Content-Location: filelist.xml
Content-Type: text/xml; charset="utf-8"

<xml xmlns:o="urn:schemas-microsoft-com:office:office">
  <o:MainFile HRef="../WorkBook.htm"/>
  {ListWorksheets}
  <o:File HRef="filelist.xml"/>
</xml>
------=_NextPart_dummy--
`
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        return function (tables, filename) {
            var context_WorkBook = {
                ExcelWorksheets: ''
            , HTMLWorksheets: ''
            , ListWorksheets: ''
            };
            var tables = jQuery(tables);
            var dt = new Date();
            var day = dt.getDate();
            var month = dt.getMonth() + 1;
            var year = dt.getFullYear();
            var hour = dt.getHours();
            var mins = dt.getMinutes();
            var postfix = day + "." + month + "." + year + "_" + hour + "." + mins;
            $.each(tables, function (SheetIndex) {
                var $table = $('#' + tables[SheetIndex]);

                var SheetName = $table.attr('data-SheetName');
                if ($.trim(SheetName) === '') {
                    SheetName = 'Sheet' + SheetIndex;
                }
                context_WorkBook.ExcelWorksheets += format(template_ExcelWorksheet, {
                    SheetIndex: SheetIndex
                , SheetName: SheetName
                });
                context_WorkBook.HTMLWorksheets += format(template_HTMLWorksheet, {
                    SheetIndex: SheetIndex
                , SheetContent: $table.html()
                });
                context_WorkBook.ListWorksheets += format(template_ListWorksheet, {
                    SheetIndex: SheetIndex
                });
            });

            var link = document.createElement("A");
            link.href = uri + base64(format(template_WorkBook, context_WorkBook));
            link.download = "Mau_upload_" + postfix + ".xls";
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    })(jQuery);

    //Lấy user được xem project lưu vào mảng
    $scope.array_user_view_project_temp = [];
    $scope.Select_multi_user_create_project = function (user) {
        $scope.showtable_UserProject = false;
        $scope.array_user_view_project_temp.push({
            ID: user.ID,
            USERNAME: user.USERNAME,
            FULLNAME: user.FULLNAME
        });
    }

    $scope.Find_User = function (ten_nhan_vien) {
        var data_user = {
            fullname: ten_nhan_vien
        }
        $http.post(origin + '/api/Api_Users/Find_Users', data_user).then(function (response) {
            $scope.list_user_find = response.data
        });
    }
    //$scope.showtable_User = false;
    //Xóa user được xem project trước khi lưu
    $scope.del_select_user_view_project = function (index) {
        $scope.array_user_view_project_temp.splice(index, 1);
    }

    $scope.array_del_user_view_project = [];
    $scope.del_user_view_project = function (index, item) {
        $scope.list_user_view_report.splice(index, 1);
        $scope.array_del_user_view_project.push({
            ID: item.USER_CHECK,
            FULLNAME: item.FULLNAME
        });
    }
    //Add người được xem report
    $scope.Add_Report_Viewer = function () {
        var data = {
            ID_HEADER: $scope.headerid,
            USER_CREATE: currentuserid,
            List_viewer: $scope.array_user_view_project_temp,
            List_del: $scope.array_del_user_view_project
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/Add_Report_Viewer', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data);
                $scope.array_user_view_project_temp = [];
            }
            else {
                ErrorSystem(response.data);
            }
        })
    }

    //Select user
    $scope.SelectUser1 = function (user) {
        $scope.fullname1 = user.FULLNAME;
        $scope.userid = user.ID;
    }

    //List comment report
    $scope.LoadListReportComment = function (headerid) {
        var data = {
            tukhoa2: headerid,
            currentuserid: currentuserid,
            sotrang: 1,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListReportComment', data).then(function successCallback(response) {
            $scope.list_report_comment = response.data;
            $scope.latest_report_comment = $scope.list_report_comment[0];
        })
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListReportComment_Count', data).then(function (response) {
            $scope.sum_report_comment = response.data;
            pagination2_rpcmt.make(parseInt($scope.sum_report_comment), 3);
        });
    }

    function pageClick2_rpcmt(pageNumber) {
        $scope.tranghientai = pageNumber
        var data = {
            tukhoa2: $scope.headerid,
            currentuserid: currentuserid,
            sotrang: $scope.tranghientai,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListReportComment', data).then(function successCallback(response) {
            $scope.list_report_comment = response.data;
        })

    }

    var pagination2_rpcmt = new Pagination({
        container: $("#phan_trang_rpcmt"),
        pageClickCallback: pageClick2_rpcmt,
        maxVisibleElements: 3,
    });

    //Add new Comment
    $scope.AddNewCmt = function (headerid) {
        $("textarea[name=COMMENT_SALE]").val(CKEDITOR.instances.COMMENT_SALE.getData());
        var cmt_report = $("[name=COMMENT_SALE]").val();
        if (cmt_report != null && cmt_report != '') {
            var data_add = {
                ID_HEADER: headerid,
                USER_COMMENT: currentuserid,
                //COMMENT: $scope.COMMENT,     
                COMMENT: cmt_report
            }
            $http.post(origin + '/api/Api_Mark_Daily_Report/Add_Report_Comment', data_add).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data);
                    CKEDITOR.instances.COMMENT_SALE.setData("");
                    $scope.LoadListReportComment(headerid);
                }
                else {
                    ErrorSystem(response.data);
                }
            })
        }
    }
    //Add new Comment
    $scope.AddNewCmt1 = function (header) {
        if ($scope.COMMENT != null) {
            var data_add = {
                ID_HEADER: header.ID,
                USER_COMMENT: currentuserid,
                COMMENT: $scope.COMMENT,
            }
            $http.post(origin + '/api/Api_Mark_Daily_Report/Add_Report_Comment', data_add).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data);
                    $scope.COMMENT = null;
                    $scope.LoadListReportComment($scope.header.ID);
                }
                else {
                    ErrorSystem(response.data);
                }
            })
        }
    }

    // List Dept
    $scope.Load_Listdept = function () {
        var data = {
            userid: currentuserid,
            sotrang: 1
        }
        $http.post(origin + '/api/Api_Departments/ListDepts', data).then(function successCallback(response) {
            $scope.list_depts = response.data;
        })
    }
    $scope.Load_Listdept();

    $scope.order_1 = 0;
    $scope.Order_1 = function () {
        $scope.order_1 = ($scope.order_1 + 1) % 3;
        if ($scope.order_1 == 1)
            $scope.sort_content_1 = "desc";
        else if ($scope.order_1 == 2)
            $scope.sort_content_1 = "asc"
    }

    //List comment report
    $scope.LoadListUserViewReport = function (headerid) {
        var data = {
            currentuserid: currentuserid,
            tukhoa2: headerid
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListUserViewReport', data).then(function successCallback(response) {
            $scope.list_user_view_report = response.data;
        })
    }


    $scope.order_2 = 0;
    $scope.Order_2 = function () {
        $scope.order_2 = ($scope.order_1 + 1) % 3;
        if ($scope.order_2 == 1)
            $scope.sort_content_2 = "desc";
        else if ($scope.order_2 == 2)
            $scope.sort_content_2 = "asc"
    }

    $scope.order_3 = 0;
    $scope.Order_3 = function () {
        $scope.order_3 = ($scope.order_3 + 1) % 3;
        if ($scope.order_3 == 1)
            $scope.sort_content_3 = "desc";
        else if ($scope.order_3 == 2)
            $scope.sort_content_3 = "asc"
    }

    $scope.order_4 = 0;
    $scope.Order_4 = function () {
        $scope.order_4 = ($scope.order_4 + 1) % 3;
        if ($scope.order_4 == 1)
            $scope.sort_content_4 = "desc";
        else if ($scope.order_4 == 2)
            $scope.sort_content_4 = "asc"
    }

    $scope.order_5 = 0;
    $scope.Order_5 = function () {
        $scope.order_5 = ($scope.order_5 + 1) % 3;
        if ($scope.order_5 == 1)
            $scope.sort_content_5 = "desc";
        else if ($scope.order_5 == 2)
            $scope.sort_content_5 = "asc"
    }

    $scope.order_6 = 0;
    $scope.Order_6 = function () {
        $scope.order_6 = ($scope.order_6 + 1) % 3;
        if ($scope.order_6 == 1)
            $scope.sort_content_6 = "desc";
        else if ($scope.order_6 == 2)
            $scope.sort_content_6 = "asc"
    }

    $scope.order_7 = 0;
    $scope.Order_7 = function () {
        $scope.order_7 = ($scope.order_7 + 1) % 3;
        if ($scope.order_7 == 1)
            $scope.sort_content_7 = "desc";
        else if ($scope.order_7 == 2)
            $scope.sort_content_7 = "asc"
    }

    $scope.order_8 = 0;
    $scope.Order_8 = function () {
        $scope.order_8 = ($scope.order_8 + 1) % 3;
        if ($scope.order_8 == 1)
            $scope.sort_content_8 = "desc";
        else if ($scope.order_8 == 2)
            $scope.sort_content_8 = "asc"
    }

    $scope.order_9 = 0;
    $scope.Order_9 = function () {
        $scope.order_9 = ($scope.order_9 + 1) % 3;
        if ($scope.order_9 == 1)
            $scope.sort_content_9 = "desc";
        else if ($scope.order_9 == 2)
            $scope.sort_content_9 = "asc"
    }

    $scope.order_10 = 0;
    $scope.Order_10 = function () {
        $scope.order_10 = ($scope.order_10 + 1) % 3;
        if ($scope.order_10 == 1)
            $scope.sort_content_10 = "desc";
        else if ($scope.order_10 == 2)
            $scope.sort_content_10 = "asc"
    }
    // ========================================END GENERAL REPORT =======================================================================

    // ========================================SALE REPORT =======================================================================
    //-----list chi nhánh
    $scope.LoadListBranch = function () {
        var data = {
            currentuserid: currentuserid,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/ListBranch', data).then(function (response) {
            $scope.list_branch = response.data
        });
    }
    //$scope.LoadListBranch();
    //Detail Sale Report
    $scope.reportname = '';
    $scope.LoadDetailSaleReport = function (header) {
        $scope.reportname = header.REPORT_NAME;
        $scope.headerid = header.ID;
        $scope.showdetail = true;
        $scope.editColC = false;
        var data = {
            tukhoa2: header.ID,
            currentuserid: currentuserid,
            week: $scope.week,
            month: $scope.month,
            year: $scope.year,
            quater: $scope.quater,
            sotrang: 1,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/DetailSaleDailyReport', data).then(function successCallback(response) {
            $scope.list_sale_report = response.data;
        })
        //$http.post(origin + '/api/Api_Mark_Daily_Report/DetailSaleDailyReport_Count', data).then(function (response) {
        //    $scope.sum_salerp = response.data;
        //    pagination_sale.make(parseInt($scope.sum_salerp), 10);
        //});
    }
    $scope.SearchDetailSaleReport = function () {
        var data = {
            tukhoa2: $scope.headerid,
            currentuserid: currentuserid,
            week: $scope.week,
            month: $scope.month,
            year: $scope.year,
            quater: $scope.quater,
            sotrang: 1,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/DetailSaleDailyReport', data).then(function successCallback(response) {
            $scope.list_sale_report = response.data;
        })
        //$http.post(origin + '/api/Api_Mark_Daily_Report/DetailSaleDailyReport_Count', data).then(function (response) {
        //    $scope.sum_salerp = response.data;
        //    pagination_sale.make(parseInt($scope.sum_salerp), 10);
        //});
    }

    function pageClick_sale(pageNumber) {
        $scope.tranghientai = pageNumber
        var data = {
            tukhoa2: $scope.headerid,
            tukhoa3: $scope.content_1,
            tukhoa4: $scope.content_2,
            currentuserid: currentuserid,
            sotrang: pageNumber,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/DetailSaleDailyReport', data).then(function successCallback(response) {
            $scope.list_sale_report = response.data;
        })

    }

    var pagination_sale = new Pagination({
        container: $("#phan_trang"),
        pageClickCallback: pageClick_sale,
        maxVisibleElements: 10,
    });

    //Get weeknum of year by date - lấy tuần thứ n trong năm từ biến ngày
    function getWeekNumber(d) {
        var dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    }

    //Reload week radio button
    $scope.ListWeekByMonth = function () {
        var date1 = new Date($scope.year, $scope.month - 1, 1);
        $scope.week = getWeekNumber(date1);

        $scope.week1 = $scope.week;
        $scope.week2 = $scope.week + 1;
        $scope.week3 = $scope.week + 2;
        $scope.week4 = $scope.week + 3;
        $scope.week5 = $scope.week + 4;
        $scope.week6 = $scope.week + 5;

        $scope.week = $scope.week.toString();
    }

    //Load plan of new week
    $scope.LoadNewPlanSalePerforment = function () {
        var data = {
            tukhoa2: $scope.headerid,
            currentuserid: currentuserid,
            year: $scope.year
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/SuggestNewWeekPlan', data).then(function successCallback(response) {
            $scope.list_sale_week_plan = response.data;
            $scope.weekplan = $scope.list_sale_week_plan[0].WEEK;
            $scope.monthplan = $scope.list_sale_week_plan[0].MONTH;
        })
    }

    // Add nhân viên vào nhóm
    $scope.Add_new_sale_week_plan = function () {
        var data_add = {
            ID_HEADER: $scope.headerid,
            ID_DEPT: $scope.deptid,
            WEEK: $scope.weekplan,
            MONTH: $scope.monthplan,
            YEAR: $scope.year,
            BRANCH_ID: $scope.branch,
            USER_CREATE: currentuserid,
            ListPlan: $scope.list_sale_week_plan
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/AddWeekSalePlan', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.ListPlan = []
                $('#add_new_sale_week_plan').modal('hide')
                $scope.week = $scope.weekplan.toString();
                $scope.month = $scope.monthplan.toString();
                $scope.SearchDetailSaleReport();
            } else {
                ErrorSystem(response.data)
            }
        })
    }


    // View chart Total DS_SO by Month
    $scope.typedata = 'DOANH_SO_SO'; $scope.typetime = 'Week';
    $scope.LoadList_Daily_Progress = function () {
        var data3 = {
            tukhoa2: $scope.headerid,
            tukhoa3: $scope.typedata,
            tukhoa4: $scope.typetime
        }
        var chart_fontFamily = 'Time News Roman'
        var title_fonSize_2 = 20
        var axis_fonSize_2 = 16
        $http.post('/api/Api_Mark_Daily_Report/WeeklySaleChart', data3).then(function (data) {
            console.log(data)
            var chart = {
                chart: { renderTo: 'container-chart', height: 500, type: 'column', backgroundColor: '#FFF', marginTop: 50 },
                rangeSelector: { selected: 2 },
                title: { text: '', style: { fontFamlily: chart_fontFamily, fontSize: title_fonSize_2, color: '#333333', fontWeight: 'bold' }, y: 20 },
                xAxis: {
                    labels: { style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, fontWeight: 'normal', color: '#777' }, rotation: 0 },
                    lineColor: '#333333', crossing: 0, lineWidth: 2, minorGridLineColor: '#505053', tickColor: '#707073', tickWidth: 1, categories: []
                },
                yAxis: {
                    title: { text: '', style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, color: '#333333', fontWeight: 'normal' } },
                    labels: { style: { fontFamily: chart_fontFamily, fontSize: axis_fonSize_2, fontWeight: 'normal', color: '#777' }, rotation: 0 },
                    lineColor: '#333333', crossing: 1, lineWidth: 0, minorGridLineColor: '#505053', tickColor: '#707073', tickWidth: 0,
                    minPadding: 0, maxPadding: 0, tickInterval: 20
                },
                legend: {
                    align: 'center', verticalAlign: 'bottom', layout: 'horizontal',
                    itemStyle: { fontFamily: 'Arial', fontSize: 16, fontWeight: 'normal', color: '#333333' },
                    itemHoverStyle: { color: '#FF0000' }, itemHiddenStyle: { color: '#333333' }
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
                    useHTML: true,
                    style: { fontFamily: chart_fontFamily, fontSize: tooltip_fontSize_2 }
                },
                plotOptions: {
                    series: {
                        borderWidth: 0, borderColor: '#FFF000',
                        dataLabels: { fontFamily: 'Time News Roman', fontSize: '16', fontWeight: 'normal', color: '#B0B0B3' },
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

            chart.title.text = $scope.reportname;//"SALE PERFORMENT";
            chart.xAxis.categories = data.data.tuan;
            chart.series = data.data.content;
            chart = new Highcharts.Chart(chart, function (chart) { });
        })
    }


    // ========================================END SALE REPORT =======================================================================
    //====================WARRANTY REPORT ==================================================

    $scope.LoadWarrantyReport = function () {
        var data = {
            currentuserid: currentuserid,
            branch: $scope.branch,
            month: $scope.month,
            year: $scope.year,
            tungay: $scope.tungay,
            denngay: $scope.denngay,
            sotrang: 1,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/DetaiWarrantyReport', data).then(function (response) {
            $scope.list_warranty_rp = response.data
        });
        $http.post(origin + '/api/Api_Mark_Daily_Report/DetaiWarrantyReport_Count', data).then(function successCallback(response) {
            $scope.sum_listwarranty_rp = response.data;
            pagination2_ListWarrantyrp.make(parseInt($scope.sum_listwarranty_rp), 10);
        })
    }
    function pageClick2_listwarrantyrp(pageNumber) {
        $scope.tranghientai = pageNumber
        var data = {
            currentuserid: currentuserid,
            branch: $scope.branch,
            month: $scope.month,
            year: $scope.year,
            tungay: $scope.tungay,
            denngay: $scope.denngay,
            sotrang: pageNumber,
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/DetaiWarrantyReport', data).then(function (response) {
            $scope.list_warranty_rp = response.data
        });
    }

    var pagination2_ListWarrantyrp = new Pagination({
        container: $("#phan_trang_listwarrantyrp"),
        pageClickCallback: pageClick2_listwarrantyrp,
        maxVisibleElements: 5,
    });

    //Show Chart   
    $scope.branchname = 'Hà Nội';
    $scope.LoadWarrantyChart = function () {
        $scope.array_categories = [];
        $scope.array_da_xu_ly = [];
        $scope.array_dang_xu_ly = [];
        $scope.array_gui_ncc = [];
        $scope.array_cho_xu_ly = [];
        var data = {
            currentuserid: currentuserid,
            branch: $scope.branch,
            month: $scope.month,
            year: $scope.year,
            tungay: $scope.tungay,
            denngay: $scope.denngay
        }
        $http.post(origin + '/api/Api_Mark_Daily_Report/DetaiWarrantyReportAll', data).then(function (response) {
            $scope.list_warranty_rp_all = response.data
            if ($scope.branch == 1) $scope.branchname = 'Hà Nội'
            else if ($scope.branch == 2) $scope.branchname = 'HCM'
            else if ($scope.branch == 4) $scope.branchname = 'Hải Phòng'
            else if ($scope.branch == 3) $scope.branchname = 'Đà Nẵng'

            for (var i = 0; i < $scope.list_warranty_rp_all.length; i++) {
                $scope.array_categories.push($scope.list_warranty_rp_all[i].DATE.toString().substring(8, 10));
                $scope.array_da_xu_ly.push($scope.list_warranty_rp_all[i].DA_XU_LY);
                $scope.array_dang_xu_ly.push($scope.list_warranty_rp_all[i].DANG_XU_LY);
                $scope.array_gui_ncc.push($scope.list_warranty_rp_all[i].DA_GUI_NCC);
                $scope.array_cho_xu_ly.push($scope.list_warranty_rp_all[i].CHO_XU_LY);
            }
            //=========VIEW CHART
            Highcharts.chart('container', {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'Warranty daily Progress'
                },
                subtitle: {
                    text: 'Tháng ' + $scope.month + '/' + $scope.year + ' chi nhánh ' + $scope.branchname
                    //text:''
                },
                xAxis: {
                    categories: $scope.array_categories,
                    tickmarkPlacement: 'on',
                    title: {
                        enabled: false
                    }
                },
                yAxis: {
                    title: {
                        text: 'Quantity'
                    },
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                tooltip: {
                    split: true,
                    valueSuffix: ' date'
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#666666'
                        }
                    }
                },
                series: [{
                    name: 'Chờ xử lý',
                    data: $scope.array_cho_xu_ly
                }, {
                    name: 'Đang xử lý',
                    data: $scope.array_dang_xu_ly
                }, {
                    name: 'Đã xử lý',
                    data: $scope.array_da_xu_ly

                }, {
                    name: 'Gửi NCC',
                    data: $scope.array_gui_ncc
                }]
            });
            //=========END VIEW CHART
        });

    }

    //====================END WARRANTY REPORT ==================================================
})