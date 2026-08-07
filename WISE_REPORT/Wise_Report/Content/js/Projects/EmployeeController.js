app.controller('EmployeeCtrl', function ($scope, $http, $interval, ajaxService) {

    $scope.userid = $('#userid').val();
    $scope.today = new Date();

    //-----=======================WORKFLOW=====================================================================================
    $scope.GetListUser = function () {
        var data = {
            SearchKeyword: "",
            PageIndex: 1,
            PageSize:20,
            SortColumn: "USERNAME",
            SortDirection: "ASC"
        }
        $http.post(origin + '/api/Api_UserController/GetListUser', data).then(function (response) {
            console.log(response)
            console.log(response.data.Data)
            $scope.listUser = response.data.Data;
            //console.log(response.data)
        });
    }
    $scope.GetListUser()

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
                return "Đã duyệt";``
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
            }, columns: [
                { columnid: 'ID', title: 'Id', width: 50 },
                { columnid: 'USERNAME', title: 'USERNAME', width: 80 },
                { columnid: 'FULLNAME', title: 'FULLNAME', width: 120 },
                { columnid: 'PASSWORD', title: 'PASSWORD', width: 80 }
            ]
        }; alasql('SELECT  *  INTO  XLSXML("List user",?)  FROM  ?', [cancelstyle, $scope.listUser]);
    };

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

