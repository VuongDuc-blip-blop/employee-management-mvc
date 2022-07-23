app.controller('TasksCtrl', function ($scope, $http, $interval, ajaxService){
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


    $scope.View_detail_task = function (id) {
        url = id;
        $http.get(origin + '/api/Api_Tasks/Get_detail_task/' + id).then(function (response) {
            $scope.detail_task = response.data;
            $scope.target_name = $scope.detail_task.TARGET_NAME;
            $scope.target_id = $scope.detail_task.ID_TARGET;
            $scope.Get_Tasks_By_Target_ID();
            $scope.Get_List_CheckList(url);
            $scope.Get_Worklogs_By_Task_ID(url);
            if ($scope.detail_task.IS_DONE == true) {
                $scope.isdone = "Đã hoàn thành";
            }
            else {
                $scope.isdone = "Đang làm";
            }
        });
        
        
    }
    $scope.View_detail_task(url);

    $scope.Get_user_view_task = function (id) {

        $http.get(origin + '/api/Api_Tasks/Get_user_view_task/' + id).then(function (response) {
            $scope.user_view_task = response.data
            //console.log($scope.user_view_target)
        });
    }
    $scope.Get_user_view_task(url);

    $scope.Create_user_viewTask = function () {

        $http.post(origin + '/api/Api_Tasks/AddUserViewTask', $scope.array_user_view_task).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)            
                
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.adduserviewtask = false;
            $scope.Get_user_view_task(url);
        })
    }
    $scope.showtable_UserTask = false;
    //Lấy user được xem project lưu vào mảng
    $scope.Select_multi_user = function (user) {
        $scope.showtable_UserTask = false;

        $scope.array_user_view_task.push({
            ID_USER: user.ID,
            ID_TARGET: url,
            FULLNAME: user.FULLNAME
        });
    }
    //Xóa user được xem target trước khi lưu
    $scope.del_select_user_view_task = function (index) {
        $scope.array_user_view_task.splice(index, 1);
    }
    $scope.Del_user_view_task = function (permissionid) {
        var data = {
            permission_id: permissionid
        }
        $http.post(origin + '/api/Api_Targets/DeleteUserViewTarget_orProject_orTask', data).then(function (response) {
            $scope.Get_user_view_task(url);
        });
    }

    //List worklog by Task
    $scope.Get_Worklogs_By_Task_ID = function (id) {

        $http.get(origin + '/api/Api_Tasks/Get_Worklogs_By_Task_ID/' + id).then(function (response) {
            $scope.list_worklogs = response.data
        });

    }
    
    //View detail target
    $scope.View_detail_target = function (id) {

        $http.get(origin + '/api/Api_Tasks/Get_detail_target_taskid/' + id).then(function (response) {
            $scope.detail_target = response.data
            console.log(response.data)
        });
    }
    $scope.View_detail_target(url);

   


    //------------------Go to page target and project detail----------------------------------------------------------
    $scope.dbclick_open_target = function (id) {
        window.open("/Projects/DetailTarget/" + id, "_self");
    }

    $scope.dbclick_open_project = function (id) {
        window.open("/Home/HomeLayout/" + id, "_self");
    }
    //----------------------------------------------------------------------------------------------------------------

    //------------------UPDATE TASK DESCRIPTION----------------------------------------------------------

    $scope.editdes = function (description) {

        CKEDITOR.instances.TASK_DESCRIPTION.setData(description);
    };

    $scope.UpdateTaskDescription = function (id) {
        $("textarea[name=TASK_DESCRIPTION]").val(CKEDITOR.instances.TASK_DESCRIPTION.getData());
        var task_des_edit = $("[name=TASK_DESCRIPTION]").val();
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            TASK_DESCRIPTION: task_des_edit  // $scope.detail_task.TASK_DESCRIPTION
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskDescription', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(id);
        })
    }
    //----------------------------------------------------------------------------------------------------------------

    //------------------UPDATE TASK RECHECK COMMENT----------------------------------------------------------
    $scope.editrecheck = function (description) {

        CKEDITOR.instances.RECHECK_COMMENT.setData(description);
    };
    $scope.UpdateTaskRecheckComment = function (id) {
        
        $("textarea[name=RECHECK_COMMENT]").val(CKEDITOR.instances.RECHECK_COMMENT.getData());
        var task_recheck_edit = $("[name=RECHECK_COMMENT]").val();
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            RECHECK_COMMENT:task_recheck_edit // $scope.detail_task.RECHECK_COMMENT
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskResultCheck', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(url);
        })
    }
    //----------------------------------------------------------------------------------------------------------------

    //-----------Update Project Date start and date end-----------------------------------------------------
    $scope.Update_Task_Date = function (id) {
        var startdate = $("#startdate").val();
        var enddate = $("#enddate").val();
        var deadline = $("#deadline_require").val();
        var
        data = {
            task_id: id,
            currentuserid: currentuserid,
            tungay: startdate,
            denngay: enddate,
            deadline: deadline
        }

        $http.post(origin + '/api/Api_Tasks/UpdateTaskDate', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }//end else project     
            $scope.View_detail_task(url);
        })//post create project      
    }
    //-------------------------------------------------------------------------------------

    //-----Update target Assignee----------------------------------------------------------------
    $scope.UpdateTaskAssinee = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            ASSIGNEE: $scope.ASSIGNEE_ID
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskAssignee', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(url);
        })
    }
    $scope.showtable_AssigneeEdit = false;
    $scope.GetAssigneeEdit = function (user) {
        $scope.showtable_AssigneeEdit = false;
        $scope.ASSIGNEE_ID = user.ID;
        $scope.ASSIGNEE_EDIT_NAME = user.FULLNAME;
    }

    //-----------------------------------------------------------------------------------------

    $scope.Find_User = function (ten_nhan_vien) {
        var data_user = {
            fullname: ten_nhan_vien
        }
        $http.post(origin + '/api/Api_Users/Find_Users', data_user).then(function (response) {
            $scope.list_user_find = response.data
        });
    }


    //-----Update target Recheck user----------------------------------------------------------------
    $scope.UpdateTaskRecheckUser = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            RECHECK_USER: $scope.RECHECK_USER_EDIT
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskRecheckUser', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(url);
        })
    }
    $scope.showtable_RecheckEdit = false;
    $scope.GetRecheckEdit = function (user) {
        $scope.showtable_RecheckEdit = false;
        $scope.RECHECK_USER_EDIT = user.ID;
        $scope.RECHECK_USER_EDIT_NAME = user.FULLNAME;
    }

    //-----------------------------------------------------------------------------------------

    //-----Update task status----------------------------------------------------------------
    $scope.UpdateTaskStatus = function (status) {
        data = {
            ID: url,
            USER_CREATE: currentuserid,
            TASK_STATUS: status
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskStatus', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data);
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(url);
        })
    }
    $scope.edit_status = false;
    $scope.show_status = true;


    //-----------------------------------------------------------------------------------------

    //-----Update target is done----------------------------------------------------------------
    $scope.UpdateTaskIsDone = function (id, isdone) {
        if (isdone == "Đang làm") {
            $scope.tt = true;
            data = {
                ID: id,
                USER_CREATE: currentuserid,
                IS_DONE: $scope.tt
            }
            $http.post(origin + '/api/Api_Tasks/UpdateTaskIsDone', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data)
                }
                else {
                    ErrorSystem(response.data);
                }
                $scope.View_detail_task(url);
            })
        }
        else {
            ErrorSystem("Task này đã được hoàn thành trước đó, bạn vui lòng không tích hoàn thành lần nữa");
        }
       
    }


    //-----------------------------------------------------------------------------------------

    //--------ADD COMMENT TARGET-------------------------------------------------------------------
    $scope.AddNewComment = function () {

        var data = {
            USER_CREATE: currentuserid,
            COMMENT1: $scope.chat_comment,
            ID_TASK: url
        }

        $http.post(origin + '/api/Api_Tasks/AddCommentTask', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                $scope.Get_All_Comment_Task(url);
            }
            else {
                ErrorSystem(response.data);
            }
        })

    }
    //---------------------------------------------------------------------------
    //--------GET LIST COMMENT TARGET-------------------------------------------------------------------
    $scope.Get_All_Comment_Task = function (id) {

        $http.get(origin + '/api/Api_Targets/Get_task_comment/' + id).then(function (response) {
            $scope.list_comment_task = response.data
        });

    }
    $scope.Get_All_Comment_Task(url);

    //---------------------------------------------------------------------------

    //------------------UPDATE TASK NAME----------------------------------------------------------
    $scope.UpdateTaskName = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            TASK_NAME: $scope.detail_task.TASK_NAME
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskName', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(url);
        })
    }
    //----------------------------------------------------------------------------------------------------------------


    //------------------UPDATE TASK DESCRIPTION----------------------------------------------------------
    $scope.AddCheckList = function () {

        data = {
            ID_TASK: url,
            CONTENT_CHECKLIST: $scope.CONTENT_CHECKLIST
        }
        $http.post(origin + '/api/Api_Tasks/AddCheckList', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList(url);
        })
    }
    //----------------------------------------------------------------------------------------------------------------
    //----------------List worklog by Task----------------------------------------------------------------------------
    $scope.Get_List_CheckList = function (id) {

        $http.get(origin + '/api/Api_Tasks/ListCheckList/' + id).then(function (response) {
            $scope.list_checklist = response.data
        });

    }
    
    //----------------------------------------------------------------------------------------------------------------

    //------------------UPDATE CHECK LIST CONTENT----------------------------------------------------------
    $scope.UpdateCheckListContent = function (id) {
        data = {
            ID: id,
            CONTENT_CHECKLIST: $scope.CONTENT_CHECKLIST
        }
        $http.post(origin + '/api/Api_Tasks/UpdateCheckListContent', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList(url);
        })
    }
    //----------------------------------------------------------------------------------------------------------------

    //------------------START WORKING CHECK LIST----------------------------------------------------------
    $scope.StartWorkingToDo = function (item) {
        data = {
        ID_TASK: url,
        USER_CREATE: currentuserid,
        TITLE_WORKLOG: item.CONTENT_CHECKLIST,
        ID_CHECK_LIST: item.ID
        }
        $http.post(origin + '/api/Api_Tasks/StartWorkLog', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem("Bạn đang bắt đầu làm công việc: " + item.CONTENT_CHECKLIST)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList(url);
            $scope.Get_Worklogs_By_Task_ID(url);
        })
    }
    //----------------------------------------------------------------------------------------------------------------
    $scope.getChecklistid = function (item) {
        $scope.idChecklist = item;
    }

    //------------------LOG WORKING CHECK LIST----------------------------------------------------------
    $scope.checkisdone = function (item) {
        $scope.isDone = item;
    }
    
    $scope.LogWorkingToDo = function () {
        $("textarea[name=CONTENT_LOGTODO]").val(CKEDITOR.instances.CONTENT_LOGTODO.getData());
        var logtodo = $("[name=CONTENT_LOGTODO]").val();
        data = {
            ID_TASK: url,
            USER_CREATE: currentuserid,
            RESULT_WORK: logtodo, //$scope.CONTENT_LOGTODO,
            ID_CHECK_LIST: $scope.idChecklist,
            todo_done: $scope.isDone
        }
        $http.post(origin + '/api/Api_Tasks/EndWorkLog', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem("Bạn đã log công việc thành công")

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList(url);
            $scope.Get_Worklogs_By_Task_ID(url);
            CKEDITOR.instances.CONTENT_LOGTODO.setData("");
        })
    }
    //----------------------------------------------------------------------------------------------------------------

    //----------------List worklog by CheckList ID----------------------------------------------------------------------------
    $scope.Get_worklog_CheckList_ID = function (id) {

        $http.get(origin + '/api/Api_Tasks/Get_WorkLlog_By_CheckListID/' + id).then(function (response) {
            $scope.cl_wl = response.data
        });

    }

    $scope.dbclick_checklist = function (id) {

        $http.get(origin + '/api/Api_Tasks/Get_WorkLlog_By_CheckListID/' + id).then(function (response) {
            $scope.list_worklogs = response.data
        });

    }
    
    $('textarea#input-default').on('keyup', function (event) {
        if (event.keyCode == 13) {
            if (!event.shiftKey) {
                event.preventDefault();
                $scope.AddNewComment();
            }
        }      
    });

    //------------Remove comment----------------------------------------------------------------------------------------------------
    $scope.RemoveComment = function (id) {
        
        data = {
            ID : id,
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
    //-----VIEW TARGET BY PROJECT ID-----------------------------------------------------------------------------------------------------------
    $scope.Get_Tasks_By_Target_ID = function () {
        var data = {
            targetid: $scope.target_id,
            currentuserid: currentuserid
        }

        $http.post(origin + '/api/Api_Tasks/Get_Tasks_By_Target_ID', data).then(function (response) {
            $scope.list_tasks = response.data
        });


    }

    //-------------------------------------------------------------------------------------------------------------------
})