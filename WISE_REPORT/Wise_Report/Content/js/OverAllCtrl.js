app.controller('OverAllCtrl', function ($scope, $http, $interval, ajaxService) {
    var username = $('#userid').val();

    var currentuserid = $('#userid').val();
    var sotrang = 1;
    var d = new Date();
    $scope.Date = new Date();
    $scope.nam = d.getFullYear();
    $scope.thang = d.getMonth() + 1;
    $scope.tranghientai = 1;
    $scope.username = "";
    $scope.fullname = "";
    //==============================LOAD LIST USERS===========================================================
    var datas = {
        currentuserid: currentuserid,
        username: $scope.username,
        fullname: $scope.fullname,
        sotrang: 1
    }
    $scope.LoadListuser = function () {

        $http.post(origin + '/api/Api_Users/ListUsers', datas).then(function successCallback(response) {
            $scope.listusers = response.data;
            //$scope.sortedFriends = orderByFilter($scope.filtered);
        })

        $http.post(origin + '/api/Api_Users/CountListUsers', datas).then(function (response) {
            $scope.tongso_user = response.data;
            pagination2_user.make(parseInt($scope.tongso_user), 15);
        });
    }

    function pageClick2_user(pageNumber) {
        $scope.tranghientai = pageNumber
        var datas = {
            currentuserid: currentuserid,
            username: $scope.username,
            fullname: $scope.fullname,
            sotrang: pageNumber
        }
        $http.post(origin + '/api/Api_Users/ListUsers', datas).then(function successCallback(response) {
            $scope.listusers = response.data;
        })
    }

    var pagination2_user = new Pagination({
        container: $("#phan_trang_user"),
        pageClickCallback: pageClick2_user,
        maxVisibleElements: 15,
    });

    $scope.SearchUser = function () {
        datas = {
            currentuserid: currentuserid,
            username: $scope.username,
            fullname: $scope.fullname,
            sotrang: 1
        }

        $scope.LoadListuser();
    }
    // Tạo nhân viên mới -> Lưu vào database
    $scope.CreateUser = function () {
        var data_add = {
            USERNAME: $scope.USERNAME,
            PASSWORD: $scope.PASSWORD,
            FULLNAME: $scope.FULLNAME,
            USER_CREATE: $('#userid').val(),
            IS_ALLOWED: true,
            DATE_CREATE: $scope.Date
        }
        $http.post(origin + '/api/Api_Users/AddUser', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                USERNAME: null;
                PASSWORD: null;
                FULLNAME: null;
                $scope.LoadListuser()
            } else {
                ErrorSystem(response.data)
            }
        })
    }
    // Update nhân viên
    $scope.UpdateUser = function (item) {
        var data_update = {
            ID: item.ID,
            USERNAME: item.USERNAME,
            PASSWORD: item.PASSWORD,
            FULLNAME: item.FULLNAME,
            USER_CREATE: currentuserid,
            IS_ALLOWED: item.IS_ALLOWED,
            DATE_CREATE: item.Date
        }
        $http.post(origin + '/api/Api_Users/UpdateUser', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                USERNAME: null
                PASSWORD: null
                FULLNAME: null
                $scope.LoadListuser();
            }
        })
    }
    //==============================END LOAD LIST USERS===========================================================

    //==============================LOAD LIST DEPARTMENT===========================================================
    $scope.Load_Listdept = function () {
        var data = {
            userid: currentuserid,
            sotrang: 1
        }
        $http.post(origin + '/api/Api_Departments/ListDepts', data).then(function successCallback(response) {
            $scope.list_depts = response.data;
        })
        $http.post(origin + '/api/Api_Departments/CountListDepts', data).then(function (response) {
            $scope.tongso_dept = response.data;
            pagination2_dept.make(parseInt($scope.tongso_dept), 15);
        });
    }

    function pageClick2_dept(pageNumber) {
        $scope.tranghientai = pageNumber

        var data = {
            userid: currentuserid,
            sotrang: pageNumber
        }
        $http.post(origin + '/api/Api_Departments/ListDepts', data).then(function successCallback(response) {
            $scope.list_depts = response.data;
        })
    }

    var pagination2_dept = new Pagination({
        container: $("#phan_trang_dept"),
        pageClickCallback: pageClick2_dept,
        maxVisibleElements: 15,
    });

    $scope.get_detail_dept = function (item) {
        $scope.details = {
            ID: item.ID,
            DEPARTMENT_NAME: item.DEPARTMENT_NAME,
            DEPARTMENT_MANAGER: item.DEPARTMENT_MANAGER,
            USER_CREATE: currentuserid
        }
    }

    $scope.Update_Dept = function () {
        var data = {
            ID: $scope.details.ID,
            DEPARTMENT_NAME: $scope.details.DEPARTMENT_NAME,
            DEPARTMENT_MANAGER: $scope.details.DEPARTMENT_MANAGER,
            DEPARTMENT_MANAGER_NAME: $scope.details.DEPARTMENT_MANAGER_NAME,
            USER_CREATE: currentuserid
        }
        $http.post('/api/Api_Departments/UpdateDept', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                $('#InputNG').modal('hide')
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    $scope.Addnew_Dept = function () {
        var data = {
            ID: $scope.ID,
            DEPARTMENT_NAME: $scope.DEPARTMENT_NAME,
            DEPARTMENT_MANAGER: $scope.DEPARTMENT_MANAGER,
            USER_CREATE: currentuserid
        }
        $http.post('/api/Api_Departments/AddDept', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                $('#InputNG').modal('hide')
            } else {
                ErrorSystem(response.data)
            }
        })
    }


    //$scope.Find_User = function (ten_nhan_vien) {
    //    var data_user = {
    //        fullname: ten_nhan_vien
    //    }
    //    $http.post(origin + '/api/Api_Users/Find_Users', data_user).then(function (response) {
    //        $scope.list_user_find = response.data
    //    });
    //}
    $scope.showtable_User = false;
    // hiển thị danh sách đổi tượng user(LẤY THEO MÃ)
    $scope.Getuserid = function (user) {
        $scope.showtable_User = false;
        $scope.DEPARTMENT_MANAGER = user.ID;
        $scope.DEPARTMENT_MANAGER_NAME = user.FULLNAME;
        $scope.details.DEPARTMENT_MANAGER = user.ID;
        $scope.details.DEPARTMENT_MANAGER_NAME = user.FULLNAME;

    }
    
    $scope.Find_Dept = function (keyword) {
        var data = {
            keyword: keyword
        }
        $http.post(origin + '/api/Api_Departments/Find_Depts', data).then(function (response) {
            $scope.list_dept_find = response.data
        });
    }

    //Load_Listdept();
    //==============================END LOAD LIST DEPARTMENT===========================================================

    //==============================LOAD LIST GROUPS===========================================================
    $scope.groupname = "";
    $scope.description = "";
    $scope.purpose = "";
    $scope.deptid = "";

    var datagroup = {
        currentuserid: currentuserid,
        groupname: $scope.groupname,
        description: $scope.description,
        purpose: $scope.purpose,
        deptid: $scope.deptid,
        sotrang: $scope.tranghientai
    }
    $scope.LoadListGroups = function () {

        $http.post(origin + '/api/Api_Groups_Users/ListGroups', datagroup).then(function successCallback(response) {
            $scope.listgroups = response.data;
        })

        $http.post(origin + '/api/Api_Groups_Users/CountListGroups', datagroup).then(function (response) {
            $scope.tongso_group = response.data;
            pagination2_group.make(parseInt($scope.tongso_group), 15);
        });
    }

    function pageClick2_group(pageNumber) {
        $scope.tranghientai = pageNumber
        var datagroup = {
            currentuserid: currentuserid,
            groupname: $scope.groupname,
            description: $scope.description,
            purpose: $scope.purpose,
            deptid: $scope.deptid,
            sotrang: $scope.tranghientai
        }
        $http.post(origin + '/api/Api_Groups_Users/ListGroups', datagroup).then(function successCallback(response) {
            $scope.listgroups = response.data;
        })
    }

    var pagination2_group = new Pagination({
        container: $("#phan_trang_group"),
        pageClickCallback: pageClick2_group,
        maxVisibleElements: 15,
    });

    //Tạo nhóm 
    $scope.CreateGroup = function () {
        var data_add = {
            GROUP_NAME: $scope.GROUP_NAME,
            DESCRIPTION: $scope.DESCRIPTION,
            ID_DEPARTMENT: $scope.ID_DEPARTMENT,
            USER_CREATE: currentuserid,
            PURPOSE: $scope.PURPOSE,
            DATE_CREATE: $scope.Date
        }
        $http.post(origin + '/api/Api_Groups_Users/AddGroups', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                GROUP_NAME: null;
                DESCRIPTION: null;
                ID_DEPARTMENT: null;
                PURPOSE: null;
                $scope.LoadListGroups()
            } else {
                ErrorSystem(response.data)
            }
        })
    }
    // Update nhóm
    $scope.UpdateGroup = function (item) {
        var data_update = {
            ID: item.ID,
            GROUP_NAME: item.GROUP_NAME,
            DESCRIPTION: item.DESCRIPTION,
            ID_DEPARTMENT: item.ID_DEPARTMENT,
            USER_CREATE: currentuserid,
            PURPOSE: item.PURPOSE,
            MANAGER_ID:item.MANAGER_ID,
            PARENT_ID:item.PARENT_ID
        }
        $http.post(origin + '/api/Api_Groups_Users/UpdateGroups', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadListuser();
            }
        })
    }
    //Search group
    $scope.SearchGroup = function () {
        datagroup = {
            currentuserid: currentuserid,
            groupname: $scope.groupname,
            description: $scope.description,
            purpose: $scope.purpose,
            deptid: $scope.deptid,
            sotrang: 1
        }
        $scope.LoadListGroups();
    }
    //==============================END LOAD LIST GROUPS==========================================================

    //==============================LOAD LIST GROUP USERS===========================================================
    $scope.groupid = "";
    $scope.userid = "";
    $scope.groupname1 = "";
    $scope.isleader = null;

    var datagroupuser = {
        currentuserid: currentuserid,
        groupid: $scope.groupid,
        userid: $scope.userid,
        isleader: $scope.isleader,
        sotrang: 1
    }
    $scope.LoadListUserGroup = function () {

        $http.post(origin + '/api/Api_Groups_Users/ListGroupUsers', datagroupuser).then(function successCallback(response) {
            $scope.listusersgroup = response.data;
            //$scope.sortedFriends = orderByFilter($scope.filtered);
        })

        $http.post(origin + '/api/Api_Groups_Users/CountListGroupUsers', datagroupuser).then(function (response) {
            $scope.tongso_groupuser = response.data;
            pagination2_groupuser.make(parseInt($scope.tongso_groupuser), 15);
        });
    }

    function pageClick2_groupuser(pageNumber) {
        $scope.tranghientai = pageNumber
        var datagroupuser = {
            currentuserid: currentuserid,
            groupid: $scope.groupid,
            userid: $scope.userid,
            isleader: $scope.isleader,
            sotrang: pageNumber
        }
        $http.post(origin + '/api/Api_Groups_Users/ListGroupUsers', datagroupuser).then(function successCallback(response) {
            $scope.listusersgroup = response.data;
        })

    }

    var pagination2_groupuser = new Pagination({
        container: $("#phan_trang_groupuser"),
        pageClickCallback: pageClick2_groupuser,
        maxVisibleElements: 15,
    });

    $scope.SearchUserGroup = function () {
        datagroupuser = {
            currentuserid: currentuserid,
            groupid: $scope.groupid,
            userid: $scope.userid,
            isleader: $scope.isleader,
            sotrang: 1
        }
        $scope.LoadListUserGroup();
    }

    //FindGroup
    $scope.FindGroup = function (group) {
        if (group != null && group != "") {
            datagroup = {
                currentuserid: currentuserid,
                groupname: group,
                description: $scope.description,
                purpose: $scope.purpose,
                deptid: $scope.deptid,
                sotrang: $scope.tranghientai
            }
            $scope.LoadListGroups();
        }
        else {  //TH người dùng bỏ đk search cột group 
            $scope.groupid = "";
            //$scope.SearchUserGroup();
            $scope.SearchPermissionUserGroup();
            $scope.LoadListGroup_GroupUser();
        }

    }
    //chọn nhóm cần add user
    $scope.SelectGroup = function (group) {
        $scope.groupname1 = group.GROUP_NAME;
        $scope.groupid1 = group.ID;
    }

    //chọn nhóm tìm kiếm
    $scope.SelectGroup2 = function (group) {
        $scope.groupname2 = group.GROUP_NAME;
        $scope.groupid = group.ID;
    }

    $scope.ListUser = [{
        ID: null,
        FULLNAME: null
    }]

    $scope.AddRow = function () {
        $scope.ListUser.push({
            ID: null,
            FULLNAME: null
        })
    }

    $scope.RemoveRow = function (index) {
        $scope.ListUser.splice(index, 1)
    }

    //Find User
    $scope.FindUser = function (fullname) {
        if (fullname != "" && fullname != null) {
            data = {
                fullname: fullname
            }
            $http.post(origin + '/api/Api_Users/Find_Users', data).then(function successCallback(response) {
                $scope.listuser2 = response.data;
                //$scope.sortedFriends = orderByFilter($scope.filtered);
            })
        }
        else { //TH người dùng bỏ đk search cột nhân viên/permission user group
            $scope.userid = "";
            //$scope.SearchUserGroup();
            $scope.SearchPermissionUserGroup();
            $scope.LoadListGroup_GroupUser();
        }
    }
    //chọn nhóm
    $scope.SelectUser = function (item, user) {
        item.FULLNAME = user.FULLNAME;
        item.ID = user.ID;
    }

    $scope.SelectUser1 = function (user) {
        $scope.fullname1 = user.FULLNAME;
        $scope.userid = user.ID;
    }    

    // Add nhân viên vào nhóm
    $scope.AddGroupUser = function () {
        var data_add = {
            USER_CREATE: currentuserid,
            ID_GROUP: $scope.groupid1,
            ListUser: $scope.ListUser
        }
        $http.post(origin + '/api/Api_Groups_Users/AddUser_Group', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.groupid1 = null
                $scope.ListUser = []
                $('#add_group_user').modal('hide')
                $scope.LoadListUserGroup()
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    // Update user group
    $scope.UpdateUsersGroup = function (item) {
        var data_update = {
            ID: item.ID,
            ID_GROUP: item.ID_GROUP,
            ID_USER: item.ID_USER,
            IS_LEADER: item.IS_LEADER,
            USER_CREATE: currentuserid,
        }
        $http.post(origin + '/api/Api_Groups_Users/UpdateUsersGroup', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadListUserGroup();
            }
        })
    }

    //Delete user group
    $scope.DeleteUsersGroup = function (item) {
        var data_update = {
            ID: item.ID,
            USER_CREATE: currentuserid
        }
        $http.post(origin + '/api/Api_Groups_Users/DeleteUser_Group', data_update).then(function (response) {
            //if (response.data.indexOf("thành công") >= 0) {
            //    SuccessSystem(response.data)
            //    //$scope.LoadListUserGroup();
            //}
            $scope.LoadListGroup_GroupUser();
        })
    }    

    //==============================END LOAD LIST GROUP USERS===========================================================
    //==============================LOAD LIST PERMISSION===========================================================
    $scope.permissionname = "";
    $scope.view = "";
    $scope.subpermission = "";
    $scope.permissiontype = "";
    $scope.id_permissiontype = "";
    $scope.tag = "";
    $scope.usercreate = "";

    var dataper = {
        currentuserid: currentuserid,
        permissionname: $scope.permissionname,
        view: $scope.view,
        id_permissiontype: $scope.id_permissiontype,
        subpermission: $scope.subpermission,
        tag: $scope.tag,
        sotrang: $scope.tranghientai
    }
    $scope.LoadListPermission = function () {

        $http.post(origin + '/api/Api_Permission/ListPermission', dataper).then(function successCallback(response) {
            $scope.listpermission1 = response.data;
        })

        $http.post(origin + '/api/Api_Permission/CountListPermission', dataper).then(function (response) {
            $scope.tongso_permission = response.data;
            pagination2_permission.make(parseInt($scope.tongso_permission), 15);
        });
    }

    function pageClick2_permission(pageNumber) {
        $scope.tranghientai = pageNumber
        var dataper = {
            currentuserid: currentuserid,
            permissionname: $scope.permissionname,
            view: $scope.view,
            id_permissiontype: $scope.id_permissiontype,
            subpermission: $scope.subpermission,
            tag: $scope.tag,
            sotrang: $scope.tranghientai
        }
        $http.post(origin + '/api/Api_Permission/ListPermission', dataper).then(function successCallback(response) {
            $scope.listpermission1 = response.data;
        })

    }

    var pagination2_permission = new Pagination({
        container: $("#phan_trang_permission"),
        pageClickCallback: pageClick2_permission,
        maxVisibleElements: 15,
    });

    //Search perrmission
    $scope.SearchPermission = function () {
        dataper = {
            currentuserid: currentuserid,
            permissionname: $scope.permissionname,
            view: $scope.view,
            id_permissiontype: $scope.id_permissiontype,
            subpermission: $scope.subpermission,
            tag: $scope.tag,
            sotrang: $scope.tranghientai
        }
        $scope.LoadListPermission();
    }

    var datapermissiontype = {
        permissiontype: $scope.permissiontype
    }
    $scope.ListPermissionType = function () {
        $http.post(origin + '/api/Api_Permission/ListPermissionType', datapermissiontype).then(function successCallback(response) {
            $scope.listpermissiontype = response.data;
        })
    }

    //Add Permission
    $scope.CreatePermission = function () {
        var data_add = {
            PERMISSION_NAME: $scope.PERMISSION_NAME,
            VIEW_APPLY: $scope.VIEW_APPLY,
            DESCRIPTION: $scope.DESCRIPTION,
            TAGS: $scope.TAGS,
            SUB_PERMISSION: $scope.SUB_PERMISSION,
            USER_CREATE: currentuserid,
            ID_PERMISSION_TYPE: $scope.ID_PERMISSION_TYPE,
            DATE_CREATE: $scope.Date
        }
        $http.post(origin + '/api/Api_Permission/AddPermission', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                PERMISSION_NAME: null;
                VIEW_APPLY: null;
                DESCRIPTION: null;
                TAGS: null;
                SUB_PERMISSION: null;
                ID_PERMISSION_TYPE: null;
                $scope.LoadListPermission()
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    //Update Permission
    $scope.UpdatePermission = function (item) {
        var data_update_per = {
            ID: item.ID,
            PERMISSION_NAME: item.PERMISSION_NAME,
            VIEW_APPLY: item.VIEW_APPLY,
            DESCRIPTION: item.DESCRIPTION,
            TAGS: item.TAGS,
            SUB_PERMISSION: item.SUB_PERMISSION,
            USER_CREATE: currentuserid,
            ID_PERMISSION_TYPE: item.ID_PERMISSION_TYPE
        }
        $http.post(origin + '/api/Api_Permission/UpdatePermission', data_update_per).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadListPermission();
            }
        })
    }

    //==============================END LOAD LIST PERMISSION===========================================================

    //==============================LOAD LIST PROCESSING DEFAULT===========================================================
    //Load processing default list
    $scope.id_process = 0;
    var data_processing_default = {
        currentuserid: currentuserid,
        id: $scope.id_process,
        sotrang: 1
    }
    $scope.LoadListProcessingDefault = function () {
        $http.post(origin + '/api/Api_ProcessingDefault/ListProcessingDefault', data_processing_default).then(function successCallback(response) {
            $scope.listProcessingDefault = response.data;
        })
        $http.post(origin + '/api/Api_ProcessingDefault/CountListProcessingDefault', data_processing_default).then(function (response) {
            $scope.tongso_processdefault = response.data;
            pagination2_processdefault.make(parseInt($scope.tongso_processdefault), 15);
        });
    }

    function pageClick2_processdefault(pageNumber) {
        $scope.tranghientai = pageNumber
        var data_processing_default = {
            currentuserid: currentuserid,
            id: $scope.id_process,
            sotrang: pageNumber
        }
        $http.post(origin + '/api/Api_ProcessingDefault/ListProcessingDefault', data_processing_default).then(function successCallback(response) {
            $scope.listProcessingDefault = response.data;
        })

    }

    var pagination2_processdefault = new Pagination({
        container: $("#phan_trang_processdefault"),
        pageClickCallback: pageClick2_processdefault,
        maxVisibleElements: 15,
    });

    //Search processsing default
    $scope.SearchProcessingDefault = function () {
        data_processing_default = {
            ID_NAME_DEFAULT: $scope.id_process
        }
        $scope.LoadListProcessingDefault();
    }
    //Load list processing default name
    $scope.processname = "";
    var data_processname = {
        processname: $scope.processname
    }
    $scope.LoadListProcessingDefaultName = function (processname) {
        $http.post(origin + '/api/Api_ProcessingDefault/ListProcessingDefaultName/', data_processname).then(function successCallback(response) {
            $scope.listProcessingDefaultName = response.data;
        })
    }
    //Find processing default name
    $scope.FindProcessingDefaultName = function (processname) {
        $http.get(origin + '/api/Api_ProcessingDefault/ListProcessingDefaultName/' + processname).then(function successCallback(response) {
            $scope.listProcessingDefaultName = response.data;
        })
    }
    //chọn processing default name phần search 
    $scope.SelectProcessingDefaultName = function (process) {
        $scope.processname = process.NAME_DEFAULT;
        $scope.id_process = process.ID;
    }
    //chọn processing default name phần add new
    $scope.SelectProcessingDefaultName1 = function (process1) {
        $scope.processname1 = process1.NAME_DEFAULT;
        $scope.id_process_add = process1.ID;
    }
    //Find processing default name phần add new
    $scope.FindProcessingDefaultName1 = function (processname) {
        $http.get(origin + '/api/Api_ProcessingDefault/ListProcessingDefaultName/' + processname).then(function successCallback(response) {
            $scope.listProcessingDefaultName1 = response.data;
        })
    }

    $scope.ListStep = [{
        STEP: null,
        ID_STATUS_BEGIN: null,
        TRANZITION_TASK: null,
        ID_STATUS_END: null,
        status_begin: null,
        status_end: null
    }]

    $scope.AddRowStep = function () {
        $scope.ListStep.push({
            STEP: null,
            ID_STATUS_BEGIN: null,
            TRANZITION_TASK: null,
            ID_STATUS_END: null,
            status_begin: null,
            status_end: null
        })
    }

    $scope.RemoveRowStep = function (index) {
        $scope.ListStep.splice(index, 1)
    }

    // Add processing default
    $scope.AddProcessingDefault = function () {
        var data_add = {
            USER_CREATE: currentuserid,
            ID_NAME_DEFAULT: $scope.id_process_add,
            ListStep: $scope.ListStep
        }
        $http.post(origin + '/api/Api_ProcessingDefault/AddProcessingDefault', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.id_process_add = null
                $scope.ListStep = []
                $('#add_process_default').modal('hide')
                $scope.LoadListProcessingDefault()
            } else {
                ErrorSystem(response.data)
            }
        })
    }
    // Add processing default name
    $scope.AddProcessingDefaultName = function () {
        var data_add = {
            CREATE_USER: currentuserid,
            NAME_DEFAULT: $scope.processname2,
            TYPE_DEFAULT: $scope.type_default,
            IS_ALLOW: true,
            CREATE_DATE: $scope.Date
        }
        $http.post(origin + '/api/Api_ProcessingDefault/AddProcessingDefaultName', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.processname2 = null
                $('#add_process_default_name').modal('hide')
                //$scope.LoadListProcessingDefault()
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    //chọn status end
    $scope.Selectstatusend = function (item, status) {
        item.status_end = status.STATUS_NAME;
        item.ID_STATUS_END = status.ID;
    }
    //chọn status begin
    $scope.Selectstatusbegin = function (item, status) {
        item.status_begin = status.STATUS_NAME;
        item.ID_STATUS_BEGIN = status.ID;
    }

    //==============================END LOAD LIST PROCESSING DEFAULT===========================================================

    //==============================LOAD LIST STATUS===========================================================   
    $scope.statusname = "";
    var datastatus = {
        currentuserid: currentuserid,
        statusname: $scope.statusname,
        sotrang: $scope.tranghientai
    }
    //Load danh sách Status
    $scope.LoadStatus = function () {

        $http.post(origin + '/api/Api_Status/ListStatus', datastatus).then(function successCallback(response) {
            $scope.liststatus = response.data;
        })

        $http.post(origin + '/api/Api_Status/CountListStatus', datastatus).then(function (response) {
            $scope.tongso_status = response.data;
            pagination2_status.make(parseInt($scope.tongso_status), 15);
        });
    }

    function pageClick2_status(pageNumber) {
        $scope.tranghientai = pageNumber
        var datastatus = {
            currentuserid: currentuserid,
            statusname: $scope.statusname,
            sotrang: $scope.tranghientai
        }
        $http.post(origin + '/api/Api_Status/ListStatus', datastatus).then(function successCallback(response) {
            $scope.liststatus = response.data;
        })

    }

    var pagination2_status = new Pagination({
        container: $("#phan_trang_status"),
        pageClickCallback: pageClick2_status,
        maxVisibleElements: 15,
    });

    $scope.SearchStatus = function (status) {
        $scope.statusname = status
        datastatus = {
            currentuserid: currentuserid,
            statusname: $scope.statusname,
            sotrang: $scope.tranghientai
        }
        $scope.LoadStatus();
    }

    //Add Status
    $scope.AddStatus = function () {
        var data_add = {
            STATUS_NAME: $scope.STATUS_NAME,
            USER_CREATE: currentuserid,
            DATE_CREATE: $scope.Date
        }
        $http.post(origin + '/api/Api_Status/AddStatus', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                STATUS_NAME: null;
                $scope.LoadStatus();
            } else {
                ErrorSystem(response.data)
            }
        })
    }
    // Update Group
    $scope.UpdateStatus = function (item) {
        var data_update = {
            ID: item.ID,
            STATUS_NAME: item.STATUS_NAME,
            USER_CREATE: currentuserid
        }
        $http.post(origin + '/api/Api_Status/UpdateStatus', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadStatus();
            }
        })
    }

    //==============================END LOAD LIST STATUS===========================================================

    //==============================LOAD MODEL HR EMPLOYEE===========================================================   

    $scope.userid_hr = "";
    $scope.deptid_hr = "";

    var datahr = {
        currentuserid: currentuserid,
        userid: $scope.userid_hr,
        deptid: $scope.deptid_hr,
        sotrang:1
    }
    //Load danh sách Status
    $scope.LoadListHR_Employee = function () {

        $http.post(origin + '/api/Api_HR_Employee/ListHR_Employee', datahr).then(function successCallback(response) {
            $scope.listshremp = response.data;
        })

        $http.post(origin + '/api/Api_HR_Employee/CountListHR_Employee', datahr).then(function (response) {
            $scope.tongso_hremp = response.data;
            pagination2_hremp.make(parseInt($scope.tongso_hremp), 15);
        });
    }

    function pageClick2_hremp(pageNumber) {
        $scope.tranghientai = pageNumber
        var datahr = {
            currentuserid: currentuserid,
            userid: $scope.userid_hr,
            deptid: $scope.deptid_hr
        }
        $http.post(origin + '/api/Api_HR_Employee/ListHR_Employee', datahr).then(function successCallback(response) {
            $scope.listshremp = response.data;
        })

    }

    var pagination2_hremp = new Pagination({
        container: $("#phan_trang_hremp"),
        pageClickCallback: pageClick2_hremp,
        maxVisibleElements: 15,
    });

    $scope.SelectUser_hr = function (user) {
        $scope.fullname_hr = user.FULLNAME;
        $scope.userid_hr = user.ID;        
    }

    $scope.SelectUserhr_find = function (user) {
        $scope.fullnamehr_find = user.FULLNAME;
        $scope.useridhr_find = user.ID;
    }

    //Get id dept from userid
    $scope.Getdept = function (userid) {
        $http.get(origin + '/api/Api_Departments/GetIddept_userid/' + userid).then(function successCallback(response) {
            $scope.dept_user = response.data;

            $scope.deptid_hr = $scope.dept_user[0].ID;
            $scope.deptname_hr = $scope.dept_user[0].DEPARTMENT_NAME;
        })
    }


    //Add
    $scope.AddHR_Employee = function () {
        var a = $('#imgInp').val();
        var name_without_ext = (a.split('\\').pop().split('/').pop().split())[0];
        var data_add = {
            ID_USER: $scope.userid_hr,
            ID_DEPARTMENT: $scope.deptid_hr,
            AVATAR: name_without_ext,
            ZALO: $scope.ZALO,
            NUMBER_PHONE: $scope.NUMBER_PHONE,
            PERSONAL_EMAIL: $scope.PERSONAL_EMAIL,
            BIRTH_DAY: Date.parse($scope.BIRTH_DAY),
            DATE_IN: Date.parse($scope.DATE_IN),
            DATE_OUT: $scope.DATE_OUT,
            DATE_CREATE: $scope.Date,
            USER_CREATE:currentuserid
        }
        $http.post(origin + '/api/Api_HR_Employee/AddHR_Employee', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                
                $scope.LoadListHR_Employee();
            } else {
                ErrorSystem(response.data)
            }
        })

    }

    $scope.SearchHR_Employee = function (useridhr_find) {
        datahr = {
            currentuserid: currentuserid,
            userid: useridhr_find,
            deptid: null,
            sotrang: 1
        }
        $scope.LoadListHR_Employee();
    }

    //Lấy thông tin HR_EMployee
    $scope.get_detail_hremp = function (item) {
        $scope.details = {
            ID:item.ID,
            FULLNAME: item.FULLNAME,
            ID_USER: item.ID_USER,
            DEPARTMENT_NAME: item.DEPARTMENT_NAME,
            AVATAR: item.AVATAR,
            ZALO: item.ZALO,
            NUMBER_PHONE: item.NUMBER_PHONE,
            PERSONAL_EMAIL: item.PERSONAL_EMAIL,
            BIRTH_DAY: item.BIRTH_DAY,
            DATE_IN: item.DATE_IN,
            DATE_OUT:item.DATE_OUT
        }
    }

    //Update HR_Employee
    $scope.Update_hr_emp = function (item) {
        var a = $('#imgInp_update').val();
        var name_without_ext = (a.split('\\').pop().split('/').pop().split())[0];
        var data_update = {
            ID: item.ID,
            ID_USER:item.ID_USER,
            AVATAR: name_without_ext,
            ZALO: item.ZALO,
            NUMBER_PHONE: item.NUMBER_PHONE,
            PERSONAL_EMAIL: item.PERSONAL_EMAIL,
            BIRTH_DAY: Date.parse(item.BIRTH_DAY),
            DATE_IN: Date.parse(item.DATE_IN),
            DATE_OUT: item.DATE_OUT,
            USER_CREATE: currentuserid
        }
        $http.post(origin + '/api/Api_HR_Employee/UpdateHR_Employee', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)                
            }
            $scope.LoadListHR_Employee();
        })
    }

    //==============================END MODEL HR EMPLOYEE===========================================================   

    //=====================MODEL UPLOAD IMAGE =======================================================================
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#blah').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    function read_editURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#edit_img').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#imgInp").change(function () {
        readURL(this);
    });
    $("#imgInp_update").change(function () {
        readURL(this);
    });
    $("#imgEdit").change(function () {
        read_editURL(this);
    });

    //=====================END MODEL UPLOAD IMAGE =======================================================================

    //=====================MODEL PERMISSION USER GROUP =======================================================================
   
    var datapergroupuser = {
        currentuserid: currentuserid,
        permission_id: $scope.permission_id,
        groupid: $scope.groupid,
        userid: $scope.userid,
        id_permissiontype: $scope.permissiontpyeid,
        sotrang: 1
    }
    $scope.LoadListPermissionUserGroup = function () {

        $http.post(origin + '/api/Api_Permission/ListPermissionUserGroup', datapergroupuser).then(function successCallback(response) {
            $scope.listperusersgroup = response.data;
            //$scope.sortedFriends = orderByFilter($scope.filtered);
        })

        $http.post(origin + '/api/Api_Permission/CountListPermissionUserGroup', datapergroupuser).then(function (response) {
            $scope.tongso_pergroupuser = response.data;
            pagination2_pergroupuser.make(parseInt($scope.tongso_pergroupuser), 15);
        });
    }

    function pageClick2_pergroupuser(pageNumber) {
        $scope.tranghientai = pageNumber
        var datapergroupuser = {
            currentuserid: currentuserid,
            permission_id: $scope.permissionid,
            groupid: $scope.groupid,
            userid: $scope.userid,
            permissiontpyeid: $scope.permissiontpyeid,
            sotrang: pageNumber
        }
        $http.post(origin + '/api/Api_Permission/ListPermissionUserGroup', datapergroupuser).then(function successCallback(response) {
            $scope.listperusersgroup = response.data;
        })

    }

    var pagination2_pergroupuser = new Pagination({
        container: $("#phan_trang_pergroupuser"),
        pageClickCallback: pageClick2_pergroupuser,
        maxVisibleElements: 15,
    });

    $scope.SearchPermissionUserGroup = function () {
        datapergroupuser = {
            currentuserid: currentuserid,
            permission_id: $scope.permission_id,
            groupid: $scope.groupid,
            userid: $scope.userid,
            id_permissiontype: $scope.permissiontpyeid,
            sotrang: 1
        }
        $http.post(origin + '/api/Api_Permission/ListPermissionUserGroup', datapergroupuser).then(function successCallback(response) {
            $scope.listperusersgroup = response.data;
            //$scope.sortedFriends = orderByFilter($scope.filtered);
        })
    }
    //Find Permission name
    $scope.FindPermission = function (permission_name) {
        if (permission_name != null && permission_name != "") {
            dataper = {
                currentuserid: currentuserid,
                permissionname: permission_name,
                view: "",
                id_permissiontype: "",
                subpermission: "",
                tag: "",
                sotrang: 1
            }
            $scope.LoadListPermission();
        }
        else {  //TH người dùng bỏ đk search 
            $scope.permission_id = "";
            $scope.SearchPermissionUserGroup();
        }

    }

    //chọn tên permission
    $scope.permission_name = "";    
    $scope.SelectPermission = function (per) {
        $scope.permission_name = per.PERMISSION_NAME;
        $scope.permission_id = per.ID;
    }

    //chọn tên permission_add
    $scope.permission_name = "";
    $scope.SelectPermission_add = function (per) {
        $scope.permission_name_add = per.PERMISSION_NAME;
        $scope.permission_id_add = per.ID;
    }

   ///
    $scope.ListGroup = [{
        ID: null,
        GROUP_NAME: null
    }]

    $scope.AddRow_Group = function () {
        $scope.ListGroup.push({
            ID: null,
            GROUP_NAME: null
        })
    }

    $scope.RemoveRow_Group = function (index) {
        $scope.ListGroup.splice(index, 1)
    }

    $scope.SelectGroup_Add_Per = function (item2, group) {
        item2.GROUP_NAME = group.GROUP_NAME;
        item2.ID = group.ID;
    }

    // Add permission for user/group 
    $scope.AddPermissionUserGroup = function () {
        var data_add = {
            USER_CREATE: currentuserid,
            ID_PERMISSION: $scope.permission_id_add,
            ListUser: $scope.ListUser,
            ListGroup:$scope.ListGroup
        }
        $http.post(origin + '/api/Api_Permission/AddPermissionUserGroup', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.ID_PERMISSION = null;
                $scope.ListUser = [];
                $scope.ListGroup = [];
                $('#add_permission_group_user').modal('hide')
                $scope.LoadListPermissionUserGroup()
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    //Xóa permission user group
    $scope.DeletePermissionUserGroup = function (item) {
        var data_delete = {
            ID: item.ID,
            USER_CREATE: currentuserid,
        }
        $http.post(origin + '/api/Api_Permission/DeletePermissionUserGroup', data_delete).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.LoadListPermissionUserGroup();
            }
        })
    }

    //=====================END MODEL PERMISSION USER GROUP =======================================================================

    //============================MODAL GROUP - USERS GROUP=========================================   
   
    $scope.LoadListGroup_GroupUser = function () {
        var datagru = {
            currentuserid: currentuserid,
            groupid: $scope.groupid,
            userid: $scope.userid,
            managerid: $scope.managerid,
            sotrang: $scope.tranghientai
        }
        $http.post(origin + '/api/Api_Groups_Users/ListGroup_GroupUsers', datagru).then(function successCallback(response) {
            $scope.listgru = response.data;
        })
    }
    $scope.LoadListGroup_GroupUser();

    //$scope.SearchGroup_GroupUser = function () {
    //    datagru = {
    //        currentuserid: currentuserid,
    //        groupid: $scope.groupid,
    //        userid: $scope.userid,
    //        managerid: $scope.managerid,
    //        sotrang: $scope.tranghientai
    //    }
    //    $scope.LoadListGroup_GroupUser();
    //}

    $scope.SelectGroupAddUser = function (item) {
        if (item.GROUP_NAME!='')
            $scope.groupname_selected = item.GROUP_NAME;
        if (item.SUB_GROUP != '')
            $scope.groupname_selected = item.SUB_GROUP;
        $scope.ID_GROUP = item.ID_GROUP;
    }

    //$scope.SelectGroup = function (group) {
    //    $scope.groupname1 = group.GROUP_NAME;
    //    $scope.groupid1 = group.ID;
    //}

    // Add new group & add user into group
    $scope.AddGroup_UserGroup = function () {
        var data_add_gru = {
            USER_CREATE: currentuserid,
            GROUP_NAME: $scope.groupname_add,
            DESCRIPTION: $scope.DESCRIPTION,
            ID_DEPARTMENT: $scope.ID_DEPARTMENT,
            PURPOSE: $scope.PURPOSE,
            MANAGER_ID: $scope.MANAGER_ID,
            PARENT_ID: $scope.PARENT_ID,
            ListUser: $scope.ListUser
        }
        $http.post(origin + '/api/Api_Groups_Users/AddGroup_User_Group', data_add_gru).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.groupname_add = null;
                $scope.ListUser = []
                $('#add_group_usergroup_new').modal('hide')
                $scope.LoadListGroup_GroupUser()
            } else {
                ErrorSystem(response.data)
            }
        })
    }
    //FindDept
    $scope.FindDept = function (deptname) {
        datadept = {
            currentuserid: currentuserid,
            groupname: deptname,
            description: "",
            purpose: "",
            deptid: "",
            sotrang: 1
        }
        $scope.LoadListGroups();
    }

    $scope.SelectDept = function (dept) {
        $scope.deptname = dept.DEPARTMENT_NAME;
        $scope.ID_DEPARTMENT = dept.ID;
    }

    $scope.SelectUser_add_gr = function (user) {
        $scope.manager_goup = user.FULLNAME;
        $scope.MANAGER_ID = user.ID;
    }

    $scope.SelectGroup_Parent = function (group) {
        $scope.groupparent_name = group.GROUP_NAME;
        $scope.PARENT_ID = group.ID;
    }

    $scope.SelectGroup_Find = function (group) {
        $scope.groupname_find = group.GROUP_NAME;
        $scope.groupid = group.ID;
    }
    $scope.SelectUser_gru = function (user) {
        $scope.username_find = user.FULLNAME;
        $scope.userid = user.ID;
    }

    $scope.SelectUser_Mgr = function (item,user) {
        item.MANAGER_NAME = user.FULLNAME;
        item.MANAGER_ID = user.ID;
    }

    $scope.LoadDetailGroup = function (item) {
        $scope.ID_GROUP = item.ID_GROUP;
        $scope.GROUP_NAME = item.GROUP_NAME;        
        if (item.SUB_GROUP != '')
            $scope.GROUP_NAME = item.SUB_GROUP;
        $scope.DESCRIPTION = item.DESCRIPTION;
        $scope.ID_DEPARTMENT = item.ID_DEPARTMENT;
        $scope.deptname = item.DEPARTMENT_NAME;
        $scope.PURPOSE = item.PURPOSE;
        $scope.manager_goup = item.MANAGER_NAME
        $scope.MANAGER_ID = item.MANAGER_ID;
        $scope.PARENT_ID = item.PARENT_ID;
        $scope.groupparent_name = $scope.GROUP_PRARENT1;
    }

    $scope.UpdateGroup2 = function () {
        var data_update = {
            ID: $scope.ID_GROUP,
            GROUP_NAME: $scope.GROUP_NAME,
            DESCRIPTION: $scope.DESCRIPTION,
            ID_DEPARTMENT: $scope.ID_DEPARTMENT,
            USER_CREATE: currentuserid,
            PURPOSE: $scope.PURPOSE,
            MANAGER_ID: $scope.MANAGER_ID,
            PARENT_ID: $scope.PARENT_ID
        }
        $http.post(origin + '/api/Api_Groups_Users/UpdateGroups', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data);
            }
            $('#update_group_user_group').modal('hide');
            $scope.LoadListGroup_GroupUser();
        })
    }

    // Add nhân viên vào nhóm
    $scope.AddGroupUser2 = function () {
        var data_add = {
            USER_CREATE: currentuserid,
            ID_GROUP: $scope.ID_GROUP,
            ListUser: $scope.ListUser
        }
        $http.post(origin + '/api/Api_Groups_Users/AddUser_Group', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.groupid1 = null
                $scope.ListUser = []
                $('#add_user_into_group').modal('hide');
                $scope.LoadListGroup_GroupUser();
            } else {
                ErrorSystem(response.data)
            }
        })
    }
    //============================END MODAL GROUP - USERS GROUP=========================================

})


