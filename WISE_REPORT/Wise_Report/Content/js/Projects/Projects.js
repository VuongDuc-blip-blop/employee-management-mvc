app.controller('ProjectsCtrl', function ($scope, $http, $interval, ajaxService) {

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
    $scope.userTotalData = 0;
    $scope.userListError = "";

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
            }, function () {
                $scope.listUser = [];
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

    $scope.GetListUser();


    $scope.AddUser = () => {
        var data = {
            username: $scope.newUser.UserName,
            Password: $scope.newUser.Password,
        }
        $http.post(origin + '/api/Api_UserController/AddUser', data).then(function (response) {
            if (response.status == 200) {
                console.log("Thành công")
            } else {
                console.log("Thất bại")
            }
        });
    }
    $scope.UpdateUser = (item) => {
        var data = {
            UserName: item.USERNAME,
            Password: item.PASSWORD,
        }
        $http.post(origin + '/api/Api_UserController/UpdateUser/' + item.Id, data).then(function (response) {
            if (response.status == 200) {
                console.log("Thành công")
                $scope.sua = false;
                $scope.GetListUser()
            } else {
                console.log("Thất bại")
            }
        });
    }
    $scope.DeleteUser = (item) => {
        console.log("DeleteUser", item)
        if (confirm('bạn có chắc chắn muốn xóa?')) {
            $http.post(origin + '/api/Api_UserController/DeleteUser/' + item.Id).then(function (response) {
                if (response.status == 200) {
                    console.log("Thành công")
                    $scope.GetListUser()
                } else {
                    console.log("Thất bại")
                }
            });
        }
        
    }

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
        ModerationStatus: 0
    };

    $("#addUserModal").modal("show");
};

    $scope.OpenEdit = function (item) {
        $scope.editUser = angular.copy(item);
        $("#editUserModal").modal("show");
    }

   $scope.XuatExcel = function () {
        var cancelstyle = {
            headers: true,
            column: {
                style: { Font: { Bold: "1" } }
            },
            columns: [
                { columnid: 'ID', title: 'Id', width: 50 },
                { columnid: 'UserName', title: 'Tên người dùng', width: 80 },
                { columnid: 'CreatedAt', title: 'Ngày tạo', width: 120 },
                { columnid: 'ModerationStatus', title: 'Trạng thái', width: 80 }
            ]
        };

        var dataExport = $scope.listUser.map(function (item) {
            return {
                ID: item.Id,
                UserName: item.UserName,
                CreatedAt: $scope.formatDate(item.CreatedAt),
                ModerationStatus: $scope.GetStatusText(item.ModerationStatus)
            };
        });

        alasql(
            'SELECT * INTO XLSXML("List user", ?) FROM ?',
            [cancelstyle, dataExport]
        );
    };

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
