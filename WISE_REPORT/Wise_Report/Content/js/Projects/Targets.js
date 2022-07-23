app.controller('TargetsCtrl', function ($scope, $http, $interval, ajaxService) {
    var d = new Date();
    $scope.Date = new Date();

    //this gets the full url
    var url = window.location.href;
    //this removes the anchor at the end, if there is one
    url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
    //this removes the query after the file name, if there is one
    url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
    //this removes everything before the last slash in the path
    url = url.substring(url.lastIndexOf("/") + 1, url.length);
    //return

    var username = $('#userid').val();
    var currentuserid = $('#userid').val();
    $scope.currentuseridlogin = $('#userid').val();
    $scope.array_user_view_target = [];
    $scope.array_user_view_task = [];
    $scope.userid = $('#userid').val();

    $scope.View_detail_target = function (id) {
        
        $http.get(origin + '/api/Api_Targets/Get_detail_target/'+id).then(function (response) {
            $scope.detail_target = response.data
            console.log(response.data)
        });
    }
    $scope.Get_user_view_target = function (id) {

        $http.get(origin + '/api/Api_Targets/Get_user_view_target/' + id).then(function (response) {
            $scope.user_view_target = response.data
            //console.log($scope.user_view_target)
        });
    }
    $scope.View_detail_target(url);
    $scope.Get_user_view_target(url);

    

  
    $scope.Create_user_viewTarget = function () {
     
        $http.post(origin + '/api/Api_Targets/AddUserViewTarget', $scope.array_user_view_target).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                $scope.Get_user_view_target(url);
                $scope.adduserviewtarget = false;
            }
            else {
                ErrorSystem(response.data);
            }//end else project                                  
        })//post create project      
    }

    //----------------select user-------------------------------------------------
    $scope.Find_User = function (ten_nhan_vien) {
        var data_user = {
            fullname: ten_nhan_vien
        }
        $http.post(origin + '/api/Api_Users/Find_Users', data_user).then(function (response) {
            $scope.list_user_find = response.data
        });
    }
    $scope.Getuserid = function (user) {
        $scope.showtable_UserTarget = false;
        $scope.PROJECT_OWNER = user.ID;
        $scope.PROJECT_OWNER_NAME = user.FULLNAME;

    }
    //----------------end select user-------------------------------------------------

    $scope.showtable_UserTarget = false;
    //Lấy user được xem project lưu vào mảng
    $scope.Select_multi_user = function (user) {
        $scope.showtable_UserTarget = false;

        $scope.array_user_view_target.push({
        ID_USER: user.ID,
        ID_TARGET: url,
        FULLNAME: user.FULLNAME
        });
    }
    //Xóa user được xem project trước khi lưu
    $scope.del_select_user_view_target = function (index) {
        $scope.array_user_view_target.splice(index, 1);

    }
    $scope.Del_user_view_target = function (permissionid) {
        var data = {
            permission_id: permissionid
        }
        $http.post(origin + '/api/Api_Targets/DeleteUserViewTarget_orProject_orTask', data).then(function (response) {
            $scope.Get_user_view_target(url);
        });
    }


    //--------------------------------------------------------------------------------

    //----------------Select department----------------------------------
    $scope.Find_Dept = function (keyword) {
        var data = {
            keyword: keyword
        }
        $http.post(origin + '/api/Api_Departments/Find_Depts', data).then(function (response) {
            $scope.list_dept_find = response.data
        });
    }
    $scope.showtable_Dept = false;

    $scope.Getdeptid = function (dept) {
        $scope.showtable_Dept = false;
        $scope.DEPARTMENT = dept.ID;
        $scope.DEPARTMENT_NAME = dept.DEPARTMENT_NAME;
        $scope.DEPARTMENT_MANAGER = dept.DEPARTMENT_MANAGER;
        $scope.DEPARTMENT_MANAGER_NAME = dept.DEPARTMENT_MANAGER_NAME;

    }

    $scope.Getdeptid_edit = function (item,dept) {
        $scope.showtable_Dept_edit = false;
        item.DEPARTMENT = dept.ID;
        item.DEPARTMENT_NAME = dept.DEPARTMENT_NAME;
    }
    //-----------------------------------------------------------------------

    //----------Select Asignee------------------------------------------------------------
    $scope.showtable_Assigee = false;
    $scope.GetAssigneeId = function (user) {
        $scope.showtable_Assigee = false;
        $scope.ASSIGNEE = user.ID;
        $scope.ASSIGNEE_NAME = user.FULLNAME;
    }
    //-----------------------------------------------------------------------

    //----------Select Recheck user------------------------------------------------------------
    $scope.showtable_recheckuser = false;
    $scope.GetRecheckUserId = function (user) {
        $scope.showtable_recheckuser = false;
        $scope.RECHECK_USER = user.ID;
        $scope.RECHECK_USER_NAME = user.FULLNAME;
    }
    //-----------------------------------------------------------------------

    //--------select list user view task-------------------------------------------------------------------
    $scope.showtable_UserViewTask = false;
    //Lấy user được xem project lưu vào mảng
    $scope.Select_multi_user_Task = function (user) {
        $scope.showtable_UserViewTask = false;

        $scope.array_user_view_task.push({
            ID_USER: user.ID,
            FULLNAME: user.FULLNAME
        });
    }
    //Xóa user được xem project trước khi lưu
    $scope.del_select_user_view_task = function (index) {
        $scope.array_user_view_task.splice(index, 1);

    }
    //---------------------------------------------------------------------------

    //--------CREATE TASK-------------------------------------------------------------------
    $scope.Create_Task = function () {
        $("textarea[name=TASK_DESCRIPTION]").val(CKEDITOR.instances.TASK_DESCRIPTION.getData());
        var task_description = $("[name=TASK_DESCRIPTION]").val();

        var date_end = $("#date_end").val();
        var date_start = $("#date_start").val();

        var data = {
            DEPARTMENT: $scope.DEPARTMENT,
            ID_TARGET: url,
            TASK_NAME: $scope.TASK_NAME,
            TASK_DESCRIPTION: task_description, //$scope.TASK_DESCRIPTION,
            ASSIGNEE: $scope.ASSIGNEE,
            NGAY_BAT_DAU: date_start,
            NGAY_KET_THUC:date_end,
            RECHECK_USER: $scope.RECHECK_USER,

            USER_CREATE: currentuserid,
            NGUOI_DUOC_XEM: $scope.array_user_view_task
        }
        $http.post(origin + '/api/Api_Tasks/CreateTask', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                $scope.Get_Tasks_By_Target_ID(url);
            }
            else {
                ErrorSystem(response.data);
            }//end else project                                  
        })//post create project      
    }
    //---------------------------------------------------------------------------
    //--------GET LIST TASK BY ID TARGET-------------------------------------------------------------------
    $scope.Get_Tasks_By_Target_ID = function (id) {
        var data = {
            targetid: id,
            currentuserid: currentuserid
        }

        $http.post(origin + '/api/Api_Tasks/Get_Tasks_By_Target_ID', data).then(function (response) {
            $scope.list_tasks = response.data
        });


    }
    $scope.Get_Tasks_By_Target_ID(url);
    //---------------------------------------------------------------------------

    //--------OPEN TASK DETAIL-------------------------------------------------------------------
    $scope.dbclick_open_task = function (id_task) {
        window.open("/Projects/DetailTask/" + id_task, "_self");
    }
    //---------------------------------------------------------------------------

    //--------GET LIST COMMENT TARGET-------------------------------------------------------------------
    $scope.Get_All_Comment_Target = function (id) {

        $http.get(origin + '/api/Api_Targets/Get_target_comment/' + id).then(function (response) {
            $scope.list_comment_target = response.data
        });

    }
    $scope.Get_All_Comment_Target(url);

    //---------------------------------------------------------------------------

    //--------ADD COMMENT TARGET-------------------------------------------------------------------
    $scope.AddNewComment = function () {

        var data = {
            USER_CREATE: currentuserid,
            COMMENT1: $scope.chat_comment,
            ID_TASK: url
        }

        $http.post(origin + '/api/Api_Targets/AddCommentTarget', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                $scope.Get_All_Comment_Target(url);
            }
            else {
                ErrorSystem(response.data);
            }
        })

    }
    //---------------------------------------------------------------------------

    //Add recheck comment Task
    //$scope.AddRecommentTask = function (item) {
    //    var data_update = {
    //        ID: item.ID,
    //        RECHECK_COMMENT: item.RECHECK_COMMENT,
    //        RECHECK_USER: currentuserid,
    //        RECHECK_TIME: $scope.Date
    //    }
    //    $http.post(origin + '/api/Api_Tasks/UpdateTask', data_update).then(function (response) {
    //        if (response.data.indexOf("thành công") >= 0) {
    //            SuccessSystem(response.data)
    //            RECHECK_TIME: null;
    //            RECHECK_COMMENT: null;
    //            $scope.Get_Tasks_By_Target_ID(url);
    //        } else {
    //            ErrorSystem(response.data)
    //        }
    //    })
    //}

    //// Get detail Task
    //$scope.View_detail_task = function (id) {

    //    $http.get(origin + '/api/Api_Tasks/Get_detail_task/' + id).then(function (response) {
    //        $scope.detail_task = response.data
    //        console.log(response.data)
    //    });
    //}

    //// Get users view task
    //$scope.Get_user_view_task = function (id) {

    //    $http.get(origin + '/api/Api_Tasks/Get_user_view_task/' + id).then(function (response) {
    //        $scope.user_view_task = response.data
    //        //console.log($scope.user_view_target)
    //    });
    //}

    //Update Task
    //$scope.Update_Task = function (detail_task) {
    //    var NGAY = $("#ngay_hoan_thanh_edit").val();

    //    data = {
    //        ID: detail_task.ID,
    //        DEPARTMENT: detail_task.DEPARTMENT,
    //        ID_TARGET: detail_task.ID_TARGET,
    //        TASK_NAME: detail_task.TASK_NAME,
    //        TASK_DESCRIPTION: detail_task.TASK_DESCRIPTION,
    //        ASSIGNEE: detail_task.ASSIGNEE,
    //        deadline: NGAY,
    //        RECHECK_USER: detail_task.RECHECK_USER,

    //        USER_CREATE: currentuserid,
    //        NGUOI_DUOC_XEM: $scope.array_user_view_task
    //    }
    //    $http.post(origin + '/api/Api_Tasks/UpdateTask', data).then(function (response) {
    //        if (response.data.indexOf("thành công") > 0) {
    //            SuccessSystem(response.data)
    //            $scope.Get_Tasks_By_Target_ID(url);
    //        }
    //        else {
    //            ErrorSystem(response.data);
    //        }//end else project                                  
    //    })//post create project      
    //}

    // Check permission update Task
    //$scope.Is_allowed_update_task = function (id) {
    //    $http.get(origin + '/api/Api_Tasks/Is_allowed_update_task/' + id).then(function (response) {
    //        $scope.Is_allowed_update_task_ = response.data
    //    });
    //}

    //Update kết quả task
    //$scope.UpdateIsDone = function (id,checked) {
    //    data = {
    //        ID: id,
    //        IS_DONE: checked,
    //    }
    //    $http.post(origin + '/api/Api_Tasks/UpdateIsDone', data).then(function (response) {
    //        if (response.data.indexOf("thành công") > 0) {
    //            SuccessSystem(response.data)
    //        }
    //        else {
    //            ErrorSystem(response.data);
    //        }                                 
    //    })
    //}

    //-----Update target status----------------------------------------------------------------
    $scope.UpdateTargetStatus = function (id, status) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            TARGET_STATUS: status
        }
        $http.post(origin + '/api/Api_Targets/UpdateTargetStatus', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data);
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_target(url);
        })
    }
    $scope.edit_status = false;
    $scope.show_status = true;


    //-----------------------------------------------------------------------------------------
    //-----Update target is done----------------------------------------------------------------
    $scope.UpdateTargetIsDone = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            IS_DONE: true
        }
        $http.post(origin + '/api/Api_Targets/UpdateTargetIsDone', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_target(url);
        })
    }


    //-----------------------------------------------------------------------------------------

    //-----Update target Assignee----------------------------------------------------------------
    $scope.UpdateTargetAssinee = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            ASSIGNEE: $scope.ASSIGNEE_ID
        }
        $http.post(origin + '/api/Api_Targets/UpdateTargetAssignee', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_target(url);
        })
    }
    $scope.showtable_AssigneeEdit = false;
    $scope.GetAssigneeEdit = function (user) {
        $scope.showtable_AssigneeEdit = false;
        $scope.ASSIGNEE_ID = user.ID;
        $scope.ASSIGNEE_EDIT_NAME = user.FULLNAME;
    }

    //-----------------------------------------------------------------------------------------

    //-----Update target Recheck user----------------------------------------------------------------
    $scope.UpdateTargetRecheckUser = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            RECHECK_USER: $scope.RECHECK_USER_EDIT
        }
        $http.post(origin + '/api/Api_Targets/UpdateTargetRecheckUser', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_target(url);
        })
    }
    $scope.showtable_RecheckEdit = false;
    $scope.GetRecheckEdit = function (user) {
        $scope.showtable_RecheckEdit = false;
        $scope.RECHECK_USER_EDIT = user.ID;
        $scope.RECHECK_USER_EDIT_NAME = user.FULLNAME;
    }

    //-----------------------------------------------------------------------------------------

    //-----Update target Description----------------------------------------------------------------
    $scope.editdescription = function (description) {

        CKEDITOR.instances.TARGET_DESCRIPTION.setData(description);
    };

    $scope.UpdateTargetDescription = function (id) {
        $("textarea[name=TARGET_DESCRIPTION]").val(CKEDITOR.instances.TARGET_DESCRIPTION.getData());
        var target_description_edit = $("[name=TARGET_DESCRIPTION]").val();
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            TARGET_DESCRIPTION: target_description_edit
        }
        $http.post(origin + '/api/Api_Targets/UpdateTargetDescription', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_target(url);
        })
    }


    //-----------------------------------------------------------------------------------------
    //-----Update target Recheck comment----------------------------------------------------------------
    $scope.editrecheck = function (description) {

        CKEDITOR.instances.RECHECK_COMMENT.setData(description);
    };
    $scope.UpdateTargetRecheckComment = function (id) {
        $("textarea[name=RECHECK_COMMENT]").val(CKEDITOR.instances.RECHECK_COMMENT.getData());
        var target_recheck_edit = $("[name=RECHECK_COMMENT]").val();
        data = {
            ID: id,
            RECHECK_USER: currentuserid,
            RECHECK_COMMENT: target_recheck_edit  // $scope.detail_target.RECHECK_COMMENT
        }
        $http.post(origin + '/api/Api_Targets/UpdateTargetRecheckComment', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_target(url);
        })
    }


    //-----------------------------------------------------------------------------------------
    //------------Remove comment----------------------------------------------------------------------------------------------------
    $scope.RemoveComment = function (id) {

        data = {
            ID: id,
            USER_CREATE: currentuserid,
        }
        $http.post(origin + '/api/Api_Tasks/RemoveComment', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList(url);
            $scope.Get_Worklogs_By_Task_ID(url);
        })
    }
    //----------------------------------------------------------------------------------------------------------------

    //-----------Update Target Date start and date end-----------------------------------------------------
    $scope.Update_Target_Date = function (id) {
        var startdate = $("#startdate").val();
        var enddate = $("#enddate").val();
        var deadline = $("#deadline_require").val();
        var 
        data = {
            targetid: id,
            currentuserid: currentuserid,
            tungay: startdate,
            denngay: enddate,
            deadline: deadline
        }

        $http.post(origin + '/api/Api_Targets/UpdateTargetDate', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }//end else project     
            $scope.View_detail_target(url);
        })//post create project      
    }
})