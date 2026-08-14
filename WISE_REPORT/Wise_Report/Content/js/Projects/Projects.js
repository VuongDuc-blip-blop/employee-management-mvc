app.controller('ProjectsCtrl', function ($scope, $http, $interval, $sce, ajaxService, userExcelShowcase) {

    $scope.userid = $('#userid').val();
    $scope.today = new Date();
    $scope.a = 1 
    $scope.newUser = ''
    $scope.newName = ''
    $scope.newPassword = ''
    $scope.sua = false
    $scope.tukhoa1 = ''
    //-----=======================WORKFLOW=====================================================================================
    $scope.userQuery = {
        SearchKeyword: "",
        PageIndex: 1,
        PageSize: 20,
        SortColumn: "USERNAME",
        SortDirection: 1
    };
    $scope.userPageSizeOptions = [5,10, 20, 50, 100];
    $scope.userTotalData = 0;
    $scope.userListError = "";
    $scope.pendingDeleteUser = null;
    $scope.deleteUserError = "";
    $scope.deleteBusy = false;
    $scope.addUserValidation = {
        summary: []
    };
    $scope.editUserValidation = {
        summary: []
    };
    
    var USER_TABLE_MODES = {
        'Standard': 'standard',
        'Dynamic': 'dynamic',
        'Pivot': 'pivot'
    }

    var USER_DYNAMIC_COLUMN_KEYS=[
        'Username',
        'CreatedAt',
        'ModerationStatus',
    ]

    var USER_DYNAMIC_COLUMN_META={
        Username:{
            Key:'Username',
            Title:'Tên người dùng',
            Type:'user',
            Order:10
        },

        CreatedAt:{
            Key:'CreatedAt',
            Title:'Ngày tạo',
            Type:'date',
            Order:20
        },

        ModerationStatus:{
            Key:'ModerationStatus',
            Title:'Trạng thái',
            Type:'status',
            Order:30
        }

    }

    var USER_PIVOT_STATUS_ORDER = {
        '0': 0,
        '1': 1,
        '2': 2
    };


    $scope.SetUserTableMode = function(mode){
        var isSupported = mode === USER_TABLE_MODES.Standard || mode === USER_TABLE_MODES.Dynamic || mode === USER_TABLE_MODES.Pivot;
        if(!isSupported){
            return
        }

        $scope.userTableMode = mode;
    }

    function BuildUserDynamicColumns(rows){
        var presentKeys = {};
        var columns = [];
        
        var hasRows = angular.isArray(rows) && rows.length > 0;

        angular.forEach(rows || [], function(row){
            angular.forEach(USER_DYNAMIC_COLUMN_KEYS, function(key){
                if(row && Object.prototype.hasOwnProperty.call(row, key)){
                    presentKeys[key] = true;
                }
            })
        });

        angular.forEach(USER_DYNAMIC_COLUMN_KEYS, function(key){
            if(!hasRows || presentKeys[key]){
                columns.push(USER_DYNAMIC_COLUMN_META[key]);
            }
        });

        columns.sort(function(left, right){
            return left.Order - right.Order;
        });

        $scope.userDynamicColumns = columns;
    }

    function GetUserPivotStatusOrder(statusKey){
        if(Object.prototype.hasOwnProperty.call(USER_PIVOT_STATUS_ORDER, statusKey)){
            return USER_PIVOT_STATUS_ORDER[statusKey];
        }

        return 999;
    }

    function buildUserPivotGroups(rows) {
        var groupsByStatus = {};
        var groups = [];

        angular.forEach(rows || [], function(item) {
            var hasStatus =
                item &&
                item.ModerationStatus !== null &&
                !angular.isUndefined(item.ModerationStatus);

            var statusKey = hasStatus
                ? String(item.ModerationStatus)
                : 'unknown';

            if (!groupsByStatus[statusKey]) {
                groupsByStatus[statusKey] = {
                    Key: statusKey,
                    Status: hasStatus ? item.ModerationStatus : null,
                    Order: GetUserPivotStatusOrder(statusKey),
                    Items: []
                };
            }

            groupsByStatus[statusKey].Items.push(item);
        });

        angular.forEach(groupsByStatus, function(group) {
            groups.push(group);
        });

        groups.sort(function(left, right) {
            if (left.Order !== right.Order) {
                return left.Order - right.Order;
            }

            return left.Key.localeCompare(right.Key);
        });

        $scope.userPivotGroups = groups;
    }

    function refreshUserTablePresentations(){
        var rows = angular.isArray($scope.listUser) ? $scope.listUser : [];
        BuildUserDynamicColumns(rows);
        buildUserPivotGroups(rows);
    }

    

    function showToast(type, title, text) {
        if (!window.PNotify) {
            return;
        }

        new PNotify({
            title: title,
            text: text,
            type: type,
            styling: 'bootstrap3',
            addclass: 'user-toast',
            delay: 2400,
            mouse_reset: false,
            buttons: {
                closer: true,
                sticker: false
            },
            stack: {
                dir1: 'down',
                dir2: 'left',
                push: 'top',
                spacing1: 10,
                spacing2: 10
            }
        });
    }

    function showSuccessToast(text) {
        showToast('success', 'Thành công', text);
    }

    function showErrorToast(text) {
        showToast('error', 'Thất bại', text);
    }

    function resetValidationState(target) {
        target.summary = [];
        target.UserName = [];
        target.Password = [];
    }

    function addValidationMessage(target, fieldName, message) {
        if (!message) {
            return;
        }

        target[fieldName] = target[fieldName] || [];
        target[fieldName].push(message);
    }

    function collectServerValidationErrors(response, target) {
        var data = response && response.data;

        if (angular.isString(data)) {
            target.summary.push(data);
            return;
        }

        if (data && angular.isArray(data.errors)) {
            angular.forEach(data.errors, function (message) {
                addValidationMessage(target, 'summary', message);
            });
            return;
        }

        if (data && data.ModelState) {
            angular.forEach(data.ModelState, function (messages, key) {
                var normalizedKey = (key || '').toLowerCase();
                var list = angular.isArray(messages) ? messages : [messages];

                angular.forEach(list, function (message) {
                    if (!message) {
                        return;
                    }

                    if (normalizedKey.indexOf('username') !== -1) {
                        addValidationMessage(target, 'UserName', message);
                        return;
                    }

                    if (normalizedKey.indexOf('password') !== -1) {
                        addValidationMessage(target, 'Password', message);
                        return;
                    }

                    addValidationMessage(target, 'summary', message);
                });
            });

            return;
        }

        if (data && data.message) {
            addValidationMessage(target, 'summary', data.message);
            return;
        }

        addValidationMessage(target, 'summary', 'Có lỗi xảy ra.');
    }

    function getValidationState(target) {
        return {
            summary: [],
            UserName: [],
            Password: [],
            ProfileDescription: []
        };
    }

    function isSuccessMessage(response, expectedKeyword) {
        var data = response && response.data;
        var message = angular.isString(data) ? data : '';

        if (!message) {
            return response && response.status >= 200 && response.status < 300;
        }

        return message.toLowerCase().indexOf(expectedKeyword.toLowerCase()) !== -1;
    }

    $scope.GetListUser = function () {
        $scope.userListError = "";

        return $http
            .post(
                origin + '/api/Api_UserController/GetListUser',
                angular.copy($scope.userQuery))
            .then(function (response) {
                var page = response.data || {};
                $scope.listUser = angular.isArray(page.Data)
                    ? page.Data
                    : [];
                $scope.userTotalData = page.TotalData || 0;
                refreshUserTablePresentations();
            }, function () {
                $scope.listUser = [];
                refreshUserTablePresentations();
                $scope.userTotalData = 0;
                $scope.userListError = "Không thể tải danh sách người dùng.";
            });
    };

    $scope.SearchUsers = function () {
        $scope.userQuery.PageIndex = 1;
        return $scope.GetListUser();
    };

    $scope.ToggleUserNameSort = function () {
        $scope.userQuery.SortDirection =
            $scope.userQuery.SortDirection === 1 ? 2 : 1;
        $scope.userQuery.PageIndex = 1;
        return $scope.GetListUser();
    };

    $scope.GetUserPageCount = function () {
        return Math.max(
            1,
            Math.ceil($scope.userTotalData / $scope.userQuery.PageSize));
    };

    $scope.PreviousUserPage = function () {
        if ($scope.userQuery.PageIndex > 1) {
            $scope.userQuery.PageIndex--;
            return $scope.GetListUser();
        }
    };

    $scope.NextUserPage = function () {
        if ($scope.userQuery.PageIndex < $scope.GetUserPageCount()) {
            $scope.userQuery.PageIndex++;
            return $scope.GetListUser();
        }
    };

    $scope.OnUserPageSizeChange = function () {
        if (!$scope.userQuery.PageSize) {
            $scope.userQuery.PageSize = 20;
        }

        $scope.userQuery.PageIndex = 1;
        return $scope.GetListUser();
    };

    $scope.GetListUser();


    $scope.AddUser = function (form) {
        $scope.addUserValidation = getValidationState();

        if (form && form.$invalid) {
            return;
        }

        var data = {
            UserName: $scope.newUser.UserName,
            Password: $scope.newUser.Password,
            ModerationStatus: $scope.newUser.ModerationStatus,
            ProfileDescription: $scope.newUser.ProfileDescription
        };

        $http.post(origin + '/api/Api_UserController/AddUser', data).then(function (response) {
            if (isSuccessMessage(response, 'thêm thành công')) {
                $("#addUserModal").modal("hide");
                showSuccessToast('Đã thêm người dùng thành công.');
                $scope.GetListUser();
                return;
            }

            showErrorToast(angular.isString(response.data) ? response.data : 'Không thể thêm người dùng.');
        }, function (response) {
            collectServerValidationErrors(response, $scope.addUserValidation);
            showErrorToast('Không thể thêm người dùng. Vui lòng kiểm tra lại dữ liệu.');
        });
    };

    $scope.UpdateUser = function (item, form) {
        $scope.editUserValidation = getValidationState();

        if (form && form.$invalid) {
            return;
        }

        var data = {
            Id: item.Id,
            UserName: item.UserName,
            Password: item.Password,
            ProfileDescription: item.ProfileDescription
        };

        $http.post(origin + '/api/Api_UserController/UpdateUser/' + item.Id, data).then(function (response) {
            if (isSuccessMessage(response, 'sửa thành công')) {
                $scope.sua = false;
                $("#editUserModal").modal("hide");
                showSuccessToast('Đã sửa người dùng thành công.');
                $scope.GetListUser();
                return;
            }

            showErrorToast(angular.isString(response.data) ? response.data : 'Không thể sửa người dùng.');
        }, function (response) {
            collectServerValidationErrors(response, $scope.editUserValidation);
            showErrorToast('Không thể sửa người dùng. Vui lòng kiểm tra lại dữ liệu.');
        });
    };

    $scope.DeleteUser = function (item) {
        $scope.pendingDeleteUser = angular.copy(item);
        $scope.deleteUserError = '';
        $("#deleteUserModal").modal("show");
    };


    $scope.ConfirmDeleteUser = function () {
        if (!$scope.pendingDeleteUser || $scope.deleteBusy) {
            return;
        }

        $scope.deleteBusy = true;
        $scope.deleteUserError = '';

        $http.post(origin + '/api/Api_UserController/DeleteUser/' + $scope.pendingDeleteUser.Id).then(function (response) {
            if (isSuccessMessage(response, 'xóa thành công')) {
                $("#deleteUserModal").modal("hide");
                showSuccessToast('Đã xóa người dùng thành công.');
                $scope.pendingDeleteUser = null;
                $scope.GetListUser();
                return;
            }

            $scope.deleteUserError = angular.isString(response.data)
                ? response.data
                : 'Không thể xóa người dùng.';
            showErrorToast($scope.deleteUserError);
        }, function (response) {
            $scope.deleteUserError = angular.isString(response.data)
                ? response.data
                : 'Không thể xóa người dùng.';
            showErrorToast($scope.deleteUserError);
        }).finally(function () {
            $scope.deleteBusy = false;
        });
    };

    $scope.GetStatusText = function (status){
        switch (status){
            case 0:
                return "Đang chờ duyệt";
            case 1:
                return "Đã duyệt";
            case 2:
                return "Bị từ chối";
            default:
                return "Không xác định";
        }
    }

   $scope.OpenAdd = function () {

    $scope.newUser = {
        UserName: "",
        Password: "",
        ModerationStatus: 0,
        ProfileDescription: ""
    };
    $scope.addUserValidation = getValidationState();

    $("#addUserModal").modal("show");
};


   
    $scope.exportBusy = false;
    $scope.exportError = '';
    $scope.exportUsers = function(mode){
        if($scope.exportBusy){
            return;
        }
        $scope.exportError = '';

        try
        {
            if(mode === 'alasql-current'){
                userExcelShowcase.alaSqlCurrentPage($scope.listUser)
                return;
            }
            if(mode === 'html-current'){
                userExcelShowcase.htmlCurrentPage($scope.listUser)
                return;
            }
            if(mode === 'multisheet-current'){
                userExcelShowcase.multiSheetCurrentPage($scope.listUser, angular.copy($scope.userQuery))
                return;
            }

            $scope.exportBusy = true;
            var request = mode === 'server-html-all'
                ? userExcelShowcase.serverHtmlAllFiltered($scope.userQuery)
                : userExcelShowcase.serverEpplusAllFiltered($scope.userQuery);
            
            request.catch(function(message){
                $scope.exportError = message;
            }).finally(function(){
                $scope.exportBusy = false;
            });
        }catch(error){
            $scope.exportError = error.message || 'Có lỗi xảy ra trong quá trình xuất dữ liệu';
            $scope.exportBusy = false;
        }

    }

    $scope.OpenEdit = function (item) {
        $scope.editUserValidation = getValidationState();

        loadUserDetail(item.Id).then(
            function (response) {
                $scope.editUser = angular.copy(response.data);
                $scope.editUser.Password = '';

                $("#editUserModal").modal("show");
            },
            function () {
                showErrorToast(
                    'Không thể tải thông tin người dùng.'
                );
            }
        );
    };

    $scope.OpenUserDetail = function (item) {
        $scope.userDetail = null;
        $scope.userDetailProfileHtml = null;
        $scope.userDetailError = null;
        $scope.userDetailLoading = true;

        $("#userDetailModal").modal("show");

        loadUserDetail(item.Id).then(
            function (response) {
                $scope.userDetail = response.data;

                $scope.userDetailProfileHtml = $sce.trustAsHtml(
                    response.data.ProfileDescription || ''
                );
            },
            function () {
                $scope.userDetailError =
                    'Không thể tải thông tin người dùng.';
            }
        ).finally(function () {
            $scope.userDetailLoading = false;
        });
    };

    function loadUserDetail(id) {
        return $http.get(
            origin + '/api/Api_UserController/GetUserById/' + id
        );
    }

     $scope.formatDate = function (dateValue) {
        if (!dateValue) return '';

        var date = new Date(dateValue);

        var day = ('0' + date.getDate()).slice(-2);
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        var year = date.getFullYear();

        return day + '/' + month + '/' + year;
    }
    $scope.showdata = function () {
        $("textarea[name=mail_content]").val(CKEDITOR.instances.mail_content.getData());
        var mail_content = $("[name=mail_content]").val();
        var res = mail_content.replace('<table', '<table id="tableupload" ');
        $scope.showdatacontent = res;
    }

    $scope.helpdata = function () {

        var tableUp = document.getElementById('tableupload');
        if (tableUp === null || tableUp === undefined) {
            alert("vui lòng nhấn \"click\" trước khi \"upload\", hoặc đã xảy ra lỗi !");
        }
        //gets rows of table
        var rowLength = tableUp.rows.length;
        var List_import = []
        //loops through rows    
        for (i = 0; i < rowLength; i++) {

            var DATA_IMPORT = {
                ID: (document.getElementById("tableupload").rows[i].cells.item(0).innerText),
                USERNAME: (document.getElementById("tableupload").rows[i].cells.item(1).innerText),
                FULLNAME: (document.getElementById("tableupload").rows[i].cells.item(2).innerText),
                PASSWORD: (document.getElementById("tableupload").rows[i].cells.item(3).innerText),
            }
            List_import.push(DATA_IMPORT);

        }

        //console.log(List_import)
        //$http.post(origin + '/api/Api_UserController/UpdateUser/', data).then(function (response) {
        //    if (response.status == 200) {
        //        console.log("Thành công")
        //        $scope.sua = false;
        //        $scope.GetListUser()
        //    } else {
        //        console.log("Thất bại")
        //    }
        //});
        
    }
    //-----=======================END View Task=====================================================================================
    $scope.tableToExcel = function (tableId) { // ex: '#my-table'
        var tab_text = "<table border='2px' style='width:100%'><tr bgcolor='#87AFC6'>";
        var textRange; var j = 0;
        tab = document.getElementById(tableId); // id of table

        for (j = 0; j < tab.rows.length; j++) {
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
            a.download = "listUser" + postfix + ".xls";
            a.click();
            //adding some delay in removing the dynamically created link solved the problem in FireFox
            setTimeout(function () {
                window.URL.revokeObjectURL(url);
            }, 0);
        }


        return (sa);

    }
})

app.directive('editInPlace', function () {
    return {
        restrict: 'E',
        scope: {
            value: '='
        },
        template: '<span  ng-bind="value"></span><input ng-model="value"></input>',
        link: function ($scope, element, attrs) {
            // Let's get a reference to the input element, as we'll want to reference it.
            var inputElement = angular.element(element.children()[1]);

            // This directive should have a set class so we can style it.
            element.addClass('edit-in-place');

            // Initially, we're not editing.
            $scope.editing = false;

            // ng-click handler to activate edit-in-place
            $scope.edit = function () {
                $scope.editing = true;

                // We control display through a class on the directive itself. See the CSS.
                element.addClass('active');

                // And we must focus the element. 
                // `angular.element()` provides a chainable array, like jQuery so to access a native DOM function, 
                // we have to reference the first element in the array.
                inputElement[0].focus();
            };

            // When we leave the input, we're done editing.
            inputElement.prop('onblur', function () {
                $scope.editing = false;
                element.removeClass('active');
            });
        }
    };
});
