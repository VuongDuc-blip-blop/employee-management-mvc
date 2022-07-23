app.controller('ProjectsCtrl', function ($scope, $http, $interval, ajaxService) {
    var username = $('#userid').val();
    var currentuserid = $('#userid').val();
    $scope.userid = $('#userid').val();
    $scope.today = new Date();


    ////this gets the full url
    //var url = window.location.href;
    ////this removes the anchor at the end, if there is one
    //url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
    ////this removes the query after the file name, if there is one
    //url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
    ////this removes everything before the last slash in the path
    //url = url.substring(url.lastIndexOf("/") + 1, url.length);
    ////return
    //console.log($scope.today);
   
    var sotrang = 1;
    $scope.array_user_view_project_temp = []; //Khai báo mảng user được phân quyền xem project
    $scope.array_user_view_project = []; //Mảng user xem project kèm project id để lưu vào hệ thống
    $scope.array_user_view_target = [];
    $scope.list_target = [];
    $scope.adduserviewproject = false;
    $scope.gridview = true;
    $scope.login = currentuserid; // sử dụng để kiểm tra người dùng đăng nhập = recheck user

    $scope.searchFish = '';
    $scope.ListProjectNone = [];
    $scope.LoadListProject = function () {
      
        var data = {
            currentuserid: currentuserid,
           
        }
        $http.post(origin + '/api/Api_Projects/ListProjects', data).then(function successCallback(response) {
            $scope.list_projects = response.data;
            $scope.project_details = response.data[0];
            $scope.projectid = $scope.project_details.ID;
            $scope.View_target_by_project($scope.project_details.ID);
            $scope.LoadTaskDefault($scope.project_details.ID);
            $scope.Get_All_Comment_Project($scope.project_details.ID);
        })
    }
    //$scope.LoadListProject();
    //-------------Create Project-------------------------------------------------------
    $scope.SelectMultiBranch = function (branch) {
        if ($scope.BRANCH == null)
        {
            $scope.BRANCH = branch;
        }
        else
        {
            $scope.BRANCH = $scope.BRANCH + "," + branch;
        }
        
    }

    $scope.showtable_Dept_Project = false;

    $scope.Getdeptid_project = function (dept) {
        $scope.showtable_Dept_Project = false;
        $scope.DEPARTMENT_NAME_PROJECT = dept.DEPARTMENT_NAME;
        if ($scope.DEPT_NAME_PROJECT == null) {
            $scope.DEPT_NAME_PROJECT = dept.DEPARTMENT_NAME;
        }
        else {
            $scope.DEPT_NAME_PROJECT = $scope.DEPT_NAME_PROJECT + "," + dept.DEPARTMENT_NAME;
        }
    }
    $scope.Create_Project = function () {
        if ($scope.PROJECT_TARGET = "")
        {
            $scope.kiemtraPtarget = "Bạn bắt buộc phải nhập nội dung này";
        }
        else
        {
            var NGAYBATDAU = $("#ngaybatdauP").val();
            var NGAYKETTHUC = $("#ngayketthucP").val();

            $("textarea[name=PROJECT_DESCRIPTION]").val(CKEDITOR.instances.PROJECT_DESCRIPTION.getData());
            var project_description = $("[name=PROJECT_DESCRIPTION]").val();

            var data = {
                PROJECT_NAME: $scope.PROJECT_NAME,
                PROJECT_OWNER: $scope.PROJECT_OWNER,
                PROJECT_DESCRIPTION: project_description,
                PROJECT_TARGERT: $scope.PROJECT_TARGET,
                NGAY_BAT_DAU: NGAYBATDAU,
                NGAY_KET_THUC: NGAYKETTHUC,
                USER_CREATE: currentuserid,
                BRANCH: $scope.BRANCH,
                DEPT: $scope.DEPT_NAME_PROJECT,
                NGUOI_DUOC_XEM: $scope.array_user_view_project_temp
            }
            $http.post(origin + '/api/Api_Projects/CreateProjects', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    //CKEDITOR.instances.PROJECT_TARGET.setData('');
                    SuccessSystem(response.data)
                }
                else {
                    ErrorSystem(response.data);
                }//end else project     
                $scope.LoadListProject();
            })//post create project    

            $scope.PROJECT_TARGET = "";
            CKEDITOR.instances.PROJECT_DESCRIPTION.setData("");
            $scope.PROJECT_NAME = ""
        }
       
    }
    //---------------end create project-------------------------------------------------------
//------------Select user--------------------------------------------------
    $scope.Find_User = function (ten_nhan_vien) {
        var data_user = {
            fullname: ten_nhan_vien
        }
        $http.post(origin + '/api/Api_Users/Find_Users', data_user).then(function (response) {
            $scope.list_user_find = response.data
        });
    }
    $scope.showtable_User = false;
    $scope.showtable_UserProject = false;
    $scope.showtable_assignee = false;
    $scope.showtable_recheck_user = false;
    // hiển thị danh sách đổi tượng user(LẤY THEO MÃ)
    $scope.Getuserid = function (user) {
        $scope.showtable_User = false;
        $scope.PROJECT_OWNER = user.ID;
        $scope.PROJECT_OWNER_NAME = user.FULLNAME;

    }
    //Lấy user được xem project lưu vào mảng
    $scope.Select_multi_user_create_project = function (user) {
        $scope.showtable_UserProject = false;
        
        $scope.array_user_view_project_temp.push({
            ID_USER: user.ID,
            USERNAME: user.USERNAME,
            FULLNAME : user.FULLNAME
        });
    }

    $scope.Getassigneeid = function (user) {
        $scope.showtable_assignee = false;
        $scope.ASSIGNEE = user.ID;
        $scope.ASSIGNEE_NAME = user.FULLNAME;

    }       
    $scope.Get_recheckuser_id = function (user) {
        $scope.showtable_recheck_user = false;
        $scope.RECHECK_USER = user.ID;
        $scope.RECHECK_USER_NAME = user.FULLNAME;

    }

    $scope.Get_recheckuser_id_edit = function (detail_target,user) {
        $scope.showtable_recheck_user_edit = false;
        detail_target.RECHECK_USER = user.ID;
        detail_target.RECHECK_USER_NAME = user.FULLNAME;

    }
    

    //Xóa user được xem project trước khi lưu
    $scope.del_select_user_view_project = function (index) {
        $scope.array_user_view_project_temp.splice(index, 1);
        
    }
    //Xóa task được tao trước khi lưu

    //------------Select user--------------------------------------------------
    
    //----------------Add new target----------------------------------
    $scope.SelectMultiBranch_target = function (branch) {
        if ($scope.BRANCH_TARGET == null) {
            $scope.BRANCH_TARGET = branch;
        }
        else {
            $scope.BRANCH_TARGET = $scope.BRANCH_TARGET + "," + branch;
        }

    }
    $scope.Create_Target = function () {
         $("textarea[name=TARGET_DESCRIPTION]").val(CKEDITOR.instances.TARGET_DESCRIPTION.getData());
        var target_description = $("[name=TARGET_DESCRIPTION]").val();
        var NGAYBATDAU = $("#ngaybatdau").val();
        var NGAYKETTHUC = $("#ngayketthuc").val();

        var detail_target = {
            TARGET_NAME: $scope.TARGET_NAME,
            DEPARTMENT: $scope.DEPARTMENT,
            ASSIGNEE: $scope.ASSIGNEE,
            DATE_START: NGAYBATDAU,
            DATE_END: NGAYKETTHUC,
            RECHECK_USER: $scope.RECHECK_USER,
            TARGET_DESCRIPTION: target_description,
            USER_CREATE: currentuserid,
            ID_PROJECT: $scope.projectid,
            BRANCH: $scope.BRANCH_TARGET
        }
        
        $http.post(origin + '/api/Api_Targets/AddTarget', detail_target).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_target_by_project($scope.projectid);
        })
        $scope.TARGET_NAME = "";
        CKEDITOR.instances.TARGET_DESCRIPTION.setData("");
    }

    
    //---------------------------------------------------------------------------------

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
        $scope.DEPARTMENT_TASK = dept.ID;
        $scope.DEPARTMENT_NAME = dept.DEPARTMENT_NAME;
        $scope.DEPARTMENT_NAME_TASK = dept.DEPARTMENT_NAME;
        $scope.DEPARTMENT_MANAGER = dept.DEPARTMENT_MANAGER;
        $scope.DEPARTMENT_MANAGER_NAME = dept.DEPARTMENT_MANAGER_NAME;

    }

    $scope.Getdeptid_edit = function (detail_target,dept) {
        $scope.showtable_Dept_edit = false;
        detail_target.DEPARTMENT = dept.ID;
        detail_target.DEPARTMENT_NAME = dept.DEPARTMENT_NAME;
        detail_target.DEPARTMENT_MANAGER = dept.DEPARTMENT_MANAGER;
        detail_target.DEPARTMENT_MANAGER_NAME = dept.DEPARTMENT_MANAGER_NAME;

    }
    //-----------------------------------------------------------------------

    //----------------Get target from project----------------------------------
    $scope.View_target_by_project = function (id) {
        var data = {
            project_id: id,
            currentuserid: currentuserid
        }
        $http.post(origin + '/api/Api_Projects/Filter_target_byProject', data).then(function (response) {
            $scope.list_targets = response.data
            $scope.detail_target = $scope.list_targets[0];
            $scope.projectid = id;
        });
      
    }

    //-----------------------------------------------------------------------

    //------------------GET DETAIL PROJECT------------------------------------------------------
    $scope.Get_detail_project = function (id) {
        $scope.projectid = id;
        var data = {
            project_id: id
        }
        $http.post(origin + '/api/Api_Projects/GetProjectDetails', data).then(function (response) {
            $scope.project_details = response.data
        });
        //$scope.PROJECT_NAME = $scope.project_details.PROJECT_NAME;
    }
    //-------------------------------------------------------------------------
    //------------------GET USER VIEW PROJECT------------------------------------------------------
    $scope.Get_user_view_project = function (id) {
        
        $http.get(origin + '/api/Api_Projects/Get_user_view_project/' + id).then(function (response) {
            $scope.user_view_project = response.data
            if($scope.user_view_project.length ==0)
            {
                $scope.user_view_project.push({
                    FULLNAME: "No person"
                });
            }
        });

    }

    $scope.Del_user_view_project = function (permissionid) {
        var data = {
            permission_id: permissionid
        }
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Targets/DeleteUserViewTarget_orProject_orTask', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data);
                    $scope.Get_user_view_project($scope.projectid);
                }
                else {
                    ErrorSystem(response.data);
                }
            });
        }
    }
    //--------------------------------------------------------------------------------------------


    //------------------GET USER VIEW PROJECT------------------------------------------------------
    $scope.Create_user_viewProject = function () {

        $http.post(origin + '/api/Api_Projects/AddUserViewProject', $scope.array_user_view_project).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                $scope.adduserviewproject = false;
                $scope.Get_user_view_project($scope.projectid);
            }
            else {
                ErrorSystem(response.data);
            }                                  
        })      
    }


   

    $scope.showtable_UserProject = false;
    //Lấy user được xem project lưu vào mảng
    $scope.Select_multi_user_project = function (user) {
        $scope.showtable_UserProject = false;

        $scope.array_user_view_project.push({
            ID_USER: user.ID,
            ID_TARGET: $scope.projectid,
            FULLNAME: user.FULLNAME
        });
    }
    //Xóa user được xem project trước khi lưu
    $scope.del_select_user_view_project2 = function (index) {
        $scope.array_user_view_project.splice(index, 1);
    }
    //-----------------END GET USER VIEW PROJECT---------------------------------------------------------------------------

    //------------Load task by project id-----------------------------------------    

    $scope.LoadTaskDefault = function (id) {
        var data = {
            project_id: id,
            currentuserid: currentuserid
        }

        $http.post(origin + '/api/Api_Tasks/Get_Tasks_show_in_dashboard', data).then(function successCallback(response) {
            $scope.list_tasks = response.data;
        })
    }
    //----------------------------------------------------------------------------
    //--------GET LIST TASK BY ID TARGET-------------------------------------------------------------------
    $scope.Get_Tasks_By_Target_ID = function (id, name) {
        $scope.ID_TARGET = id;
        $scope.curentTarget = name;
        var data = {
            targetid: id,
            currentuserid: currentuserid
        }

        $http.post(origin + '/api/Api_Tasks/Get_Tasks_By_Target_ID', data).then(function (response) {
            $scope.list_tasks = response.data
        });

    }

    //---------------------------------------------------------------------------

    //--------GET LIST COMMENT PROJECT-------------------------------------------------------------------
    $scope.Get_All_Comment_Project = function (id) {

        $http.get(origin + '/api/Api_Projects/Get_project_comment/' + id).then(function (response) {
            $scope.list_comment_project = response.data
        });

    }
   
    //---------------------------------------------------------------------------

    //--------ADD COMMENT PROJECT-------------------------------------------------------------------
    $scope.AddNewComment = function () {

        var data = {
            USER_CREATE: currentuserid,
            COMMENT1: $scope.chat_comment,
            ID_TASK: $scope.projectid
        }

        $http.post(origin + '/api/Api_Projects/AddCommentProject', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                //$scope.Get_All_Comment_Project($scope.projectid);
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_All_Comment_Project($scope.projectid);
        })

    }
    //---------------------------------------------------------------------------

    //--------GET LIST COMMENT TARGET-------------------------------------------------------------------
    $scope.Get_All_Comment_Target = function (id) {

        $http.get(origin + '/api/Api_Targets/Get_target_comment/' + id).then(function (response) {
            $scope.list_comment_target = response.data
        });

    }

    //---------------------------------------------------------------------------

    //--------ADD COMMENT TARGET-------------------------------------------------------------------
    $scope.AddNewComment_Target = function () {

        var data = {
            USER_CREATE: currentuserid,
            COMMENT1: $scope.chat_comment_target,
            ID_TASK: $scope.ID_TARGET
        }

        $http.post(origin + '/api/Api_Targets/AddCommentTarget', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_All_Comment_Target($scope.ID_TARGET);
        })

    }
    //---------------------------------------------------------------------------

    //Add recheck comment Target
    $scope.AddRecommentTarget = function (item) {
        detail_target = {
            ID: item.ID,
            RECHECK_COMMENT: item.RECHECK_COMMENT
        }

        $http.post(origin + '/api/Api_Targets/AddRecommentTarget', detail_target).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
        })
    }
 

    //Xóa user được xem project trước khi lưu
    $scope.del_select_user_view_target = function (index) {
        $scope.array_user_view_target.splice(index, 1);

    }

    //-----------Update Project Target-----------------------------------------------------
    $scope.Update_Project_Target = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            PROJECT_TARGERT: $scope.project_details.PROJECT_TARGERT
        }

        $http.post(origin + '/api/Api_Projects/UpdateProjectTarget', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }//end else project     
            $scope.Get_detail_project(id);
        })//post create project      
    }
    //-------------------------------------------------------------------------------------

    //-----------Update Project Description-----------------------------------------------------
    $scope.editdescription_project = function (description) {

        CKEDITOR.instances.PROJECT_DESCRIPTION_EDIT.setData(description);
    };

    $scope.Update_Project_Description = function (id) {
        $("textarea[name=PROJECT_DESCRIPTION_EDIT]").val(CKEDITOR.instances.PROJECT_DESCRIPTION_EDIT.getData());
        var project_description_edit = $("[name=PROJECT_DESCRIPTION_EDIT]").val();

        data = {
            ID: id,
            USER_CREATE: currentuserid,
            PROJECT_DESCRIPTION: project_description_edit    //$scope.project_details.PROJECT_DESCRIPTION
        }

        $http.post(origin + '/api/Api_Projects/UpdateProjectDescription', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }//end else project     
            $scope.Get_detail_project(id);
        })//post create project      
    }
    //-------------------------------------------------------------------------------------

    //-----------Update Project Date start and date end-----------------------------------------------------
    $scope.Update_Project_Date = function (id) {
        var startdate = $("#startdateProject").val();
        var enddate = $("#enddateProject").val();
        var deadline = $("#deadline_require_editProject").val();
        data = {
            project_id: id,
            currentuserid: currentuserid,
            tungay: startdate,
            denngay: enddate,
            deadline: deadline
        }

        $http.post(origin + '/api/Api_Projects/UpdateProjectDate', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }//end else project     
            $scope.Get_detail_project(id);
        })//post create project      
    }
    //-------------------------------------------------------------------------------------

    //-----------Update Project Manager-----------------------------------------------------
    $scope.Update_Project_Manager = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            PROJECT_OWNER: $scope.PROJECT_OWNER_ID
        }

        $http.post(origin + '/api/Api_Projects/UpdateProjectManager', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }//end else project     
            $scope.Get_detail_project(id);
        })//post create project      
    }

    $scope.showtable_AssigneeEdit = false;
    $scope.GetAssigneeEdit = function (user) {
        $scope.showtable_AssigneeEdit = false;
        $scope.PROJECT_OWNER_ID = user.ID;
        $scope.PROJECT_OWNER_NAME = user.FULLNAME;
    }
    //-------------------------------------------------------------------------------------

    //-----------Create task-----------------------------------------------------
    $scope.SelectMultiBranch_task = function (branch) {
        if ($scope.BRANCH_TASK == null) {
            $scope.BRANCH_TASK = branch;
        }
        else {
            $scope.BRANCH_TASK = $scope.BRANCH_TASK + "," + branch;
        }

    }
    $scope.Create_Task = function () {
        $("textarea[name=TASK_DESCRIPTION]").val(CKEDITOR.instances.TASK_DESCRIPTION.getData());
        var task_description = $("[name=TASK_DESCRIPTION]").val();

        var date_end = $("#date_end").val();
        var date_start = $("#date_start").val();

        var data = {
            DEPARTMENT: $scope.DEPARTMENT,
            ID_TARGET: $scope.ID_TARGET,
            TASK_NAME: $scope.TASK_NAME,
            TASK_DESCRIPTION: task_description, //$scope.TASK_DESCRIPTION,
            ASSIGNEE: $scope.ASSIGNEE_TASK,
            NGAY_BAT_DAU: date_start,
            NGAY_KET_THUC: date_end,
            RECHECK_USER: $scope.RECHECK_USER_TASK,
            BRANCH: $scope.BRANCH_TASK,
            WORKFLOW_ID : $scope.WORKFLOW_ID,

            USER_CREATE: currentuserid,
            NGUOI_DUOC_XEM: $scope.array_user_view_task
        }
        $http.post(origin + '/api/Api_Tasks/CreateTask', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                $scope.Get_Tasks_By_Target_ID($scope.ID_TARGET, "");
                $scope.Get_detail_target_and_list_task($scope.ID_TARGET);
            }
            else {
                ErrorSystem(response.data);
            }//end else project                                  
        })//post create project   
        $scope.array_user_view_task = [];
        $scope.TASK_NAME = "";
        CKEDITOR.instances.TASK_DESCRIPTION.setData("");
    }
    $scope.showtable_assignee_task = false;
    $scope.Getassigneeid_task = function (user) {
        $scope.showtable_assignee_task = false;
        $scope.ASSIGNEE_TASK = user.ID;
        $scope.ASSIGNEE_TASK_NAME = user.FULLNAME;

    }
    $scope.array_user_view_task = [];
    $scope.Get_recheckuser_id_TASK = function (user) {
        $scope.showtable_recheck_user_task = false;
        $scope.RECHECK_USER_TASK = user.ID;
        $scope.RECHECK_USER_TASK_NAME = user.FULLNAME;

    }

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
            $scope.Get_All_Comment_Project($scope.projectid);
            $scope.Get_All_Comment_Target($scope.ID_TARGET);
        })
    }
    //----------------------------------------------------------------------------------------------------------------
    
    //----------------FILTER DATA---------------------------------------------------
    $scope.keyword_filter = 'assigned';
    $scope.GetStatus = function (keyword) {
        $scope.keyword_filter = keyword;
    }

    $scope.GetComplete = function (complete) {
        $scope.iscomplete = complete;
    }

    $scope.Filter_Data = function () {
        data = {
            currentuserid: currentuserid,
            keyword: $scope.keyword_filter,
            is_done: $scope.iscomplete
        }

        $http.post(origin + '/api/Api_Projects/Filter_project', data).then(function (response) {
            $scope.list_projects = response.data
        })
        $http.post(origin + '/api/Api_Projects/Filter_Targets', data).then(function (response) {
            $scope.list_targets = response.data
        })
        $http.post(origin + '/api/Api_Projects/Filter_Tasks', data).then(function (response) {
            $scope.list_tasks = response.data;
        })
    }
    //-------------------------------------------------------------------------------

    //-------------------------View Target Detail-----------------------------------------------------
    $scope.View_detail_target = function (id) {
        data = {
            currentuserid: currentuserid,
            targetid: id
        }

        $http.post(origin + '/api/Api_Targets/Get_detail_target', data).then(function (response) {
            $scope.detail_target = response.data;
            $scope.ID_TARGET = $scope.detail_target.ID;
            $scope.Get_user_view_target($scope.ID_TARGET);
            $scope.Get_All_Comment_Target($scope.ID_TARGET);
            $scope.projectid = $scope.detail_target.ID_PROJECT;
            $scope.total_target = $scope.detail_target.Count();
        });
        if ($scope.detail_target.IS_DONE == true) {
            $scope.isdone = "Đã hoàn thành";
        }
        else {
            $scope.isdone = "Đang làm";
        }
    }

    $scope.Get_detail_target_and_list_task = function (id) {
        data = {
            currentuserid: currentuserid,
            targetid: id
        }

        $http.post(origin + '/api/Api_Targets/Get_detail_target_Task', data).then(function (response) {
            $scope.list_targets = response.data;
            $scope.detail_target = $scope.list_targets[0];
            $scope.ID_TARGET = $scope.detail_target.ID;
            $scope.Get_user_view_target($scope.ID_TARGET);
            $scope.Get_All_Comment_Target($scope.ID_TARGET);
            $scope.projectid = $scope.detail_target.ID_PROJECT;
        });
        if ($scope.detail_target.IS_DONE == true) {
            $scope.isdone = "Đã hoàn thành";
        }
        else {
            $scope.isdone = "Đang làm";
        }
    }

    $scope.Get_user_view_target = function (id) {

        $http.get(origin + '/api/Api_Targets/Get_user_view_target/' + id).then(function (response) {
            $scope.user_view_target = response.data
            //console.log($scope.user_view_target)
        });
    }
    //---------------------------------------------------------------------------------------------------
    //-----------Update Target Date start and date end-----------------------------------------------------
    $scope.Update_Target_Date = function (id) {
        var startdate = $("#startdateTargetEdit").val();
        var enddate = $("#enddateTargetEdit").val();
        var deadline = $("#deadline_require_targetEdit").val();
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
            $scope.View_detail_target($scope.id);
        })//post create project      
    }
    //----------------------------------------------------------------------------------------------------

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
            $scope.View_detail_target(id);
        })
    }
    $scope.showtable_AssigneeEdit_target = false;
    $scope.GetAssigneeEdit_target = function (user) {
        $scope.showtable_AssigneeEdit_target = false;
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
            $scope.View_detail_target(id);
        })
    }
    $scope.showtable_RecheckEdit_target = false;
    $scope.GetRecheckEdit_target = function (user) {
        $scope.showtable_RecheckEdit_target = false;
        $scope.RECHECK_USER_EDIT = user.ID;
        $scope.RECHECK_USER_EDIT_NAME = user.FULLNAME;
    }

    //-----------------------------------------------------------------------------------------

    $scope.showtable_UserTarget = false;
    //Lấy user được xem project lưu vào mảng
    $scope.Select_multi_user_target = function (user) {
        $scope.showtable_UserTarget = false;

        $scope.array_user_view_target.push({
            ID_USER: user.ID,
            ID_TARGET: $scope.ID_TARGET,
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
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Targets/DeleteUserViewTarget_orProject_orTask', data).then(function (response) {
                $scope.Get_user_view_target($scope.ID_TARGET);
            });
        }
    }

    $scope.Create_user_viewTarget = function () {

        $http.post(origin + '/api/Api_Targets/AddUserViewTarget', $scope.array_user_view_target).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
                
                $scope.adduserviewtarget = false;
            }
            else {
                ErrorSystem(response.data);
            }//end else project   
            $scope.Get_user_view_target($scope.ID_TARGET);
            $scope.array_user_view_target = [];
        })//post create project      
    }


    //--------------------------------------------------------------------------------
    //-----Update target Recheck comment----------------------------------------------------------------
    $scope.editrecheck = function (description) {

        CKEDITOR.instances.RECHECK_COMMENT_TARGET_EDIT.setData(description);
    };
    $scope.UpdateTargetRecheckComment = function (id) {
        $("textarea[name=RECHECK_COMMENT_TARGET_EDIT]").val(CKEDITOR.instances.RECHECK_COMMENT_TARGET_EDIT.getData());
        var target_recheck_edit = $("[name=RECHECK_COMMENT_TARGET_EDIT]").val();
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
            $scope.View_detail_target(id);
        })
    }
    //-----------------------------------------------------------------------------------------


    //-----Update target Description----------------------------------------------------------------
    $scope.editdescription = function (description) {

        CKEDITOR.instances.TARGET_DESCRIPTION_EDIT.setData(description);
    };

    $scope.UpdateTargetDescription = function (id) {
        $("textarea[name=TARGET_DESCRIPTION_EDIT]").val(CKEDITOR.instances.TARGET_DESCRIPTION_EDIT.getData());
        var target_description_edit = $("[name=TARGET_DESCRIPTION_EDIT]").val();
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
            $scope.View_detail_target(id);
        })
    }


    //-----------------------------------------------------------------------------------------

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
            $scope.View_detail_target(id);
        })
    }
    $scope.edit_status = false;
    $scope.show_status = true;


    //-----------------------------------------------------------------------------------------

    //-----Update target Name----------------------------------------------------------------
    $scope.UpdateTargetName = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            TARGET_NAME: $scope.detail_target.TARGET_NAME
        }
        $http.post(origin + '/api/Api_Targets/UpdateTargetName', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data);
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_target(id);
        })
    }

    //-----------------------------------------------------------------------------------------

    //-----Update target is done----------------------------------------------------------------
    $scope.UpdateTargetIsDone = function (id, isdone) {
        if (isdone == "Đang làm") {
            $scope.tt = true;
            data = {
                ID: id,
                USER_CREATE: currentuserid,
                IS_DONE: $scope.tt
            }
            $http.post(origin + '/api/Api_Targets/UpdateTargetIsDone', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data)
                }
                else {
                    ErrorSystem(response.data);
                }
                $scope.View_detail_target(id);
            })
        }
        else {
            ErrorSystem("Target này đã được hoàn thành trước đó, bạn vui lòng không tích hoàn thành lần nữa");
        }
    }


    //-----------------------------------------------------------------------------------------

 


    //------------Remove task - target - project----------------------------------------------------------------------------------------------------
    $scope.DeleteTask = function (id) {

        data = {
            task_id: id,
            currentuserid: currentuserid,
        }
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Tasks/DeleteTask', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data)

                }
                else {
                    ErrorSystem(response.data);
                }
                $scope.Get_Tasks_By_Target_ID($scope.ID_TARGET, "");
            })
        }
    }

    $scope.DeleteTodoList = function (id) {

        data = {
            todolistid: id,
            currentuserid: currentuserid,
        }
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Tasks/DeleteToDoList', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data)

                }
                else {
                    ErrorSystem(response.data);
                }
                $scope.Get_List_CheckList($scope.ID_TASK);
            })
        }
    }

    $scope.DeleteTarget = function (id) {

        data = {
            task_id: id,
            currentuserid: currentuserid,
        }
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Targets/DeleteTarget', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data)

                }
                else {
                    ErrorSystem(response.data);
                }
                $scope.View_target_by_project($scope.projectid);
            })
        }
    }

    $scope.DeleteProject = function (id) {

        data = {
            project_id: id,
            currentuserid: currentuserid,
        }
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Projects/DeleteProject', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data)

                }
                else {
                    ErrorSystem(response.data);
                }
                $scope.LoadListProject();
            })
        }
    }
    //----------------------------------------------------------------------------------------------------------------

    //-------------------------View Target Detail-----------------------------------------------------
    $scope.View_User_Subordinate = function (keyword) {
        data = {
            keyword: keyword,
            currentuserid: currentuserid,
        }
        $http.post(origin + '/api/Api_Projects/Get_User_Subordinate', data).then(function (response) {
            $scope.Subordinate = response.data
        })
    }
    $scope.Show_subordinate = function (id) {
        currentuserid = id;
        $scope.LoadListProject();
    }
    $scope.Show_self = function () {
        currentuserid = $('#userid').val();
        $scope.LoadListProject();
    }
    //---------------------------------------------------------------------------------------------------
    //------------------UPDATE CHECK LIST CONTENT----------------------------------------------------------
    $scope.UpdateCheckListContent = function (id, content) {
        data = {
            ID: id,
            CONTENT_CHECKLIST: content
        }
        $http.post(origin + '/api/Api_Tasks/UpdateCheckListContent', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList($scope.ID_TASK);
        })
    }

    
    //----------------------------------------------------------------------------------------------------------------
    //------------------UPDATE CHECK LIST CONTENT----------------------------------------------------------
    $scope.UpdateCheckListTaskID = function (id) {
        data = {
            ID: id,
            ID_TASK: $scope.CL_TASK_ID
        }
        $http.post(origin + '/api/Api_Tasks/UpdateCheckListIDTask', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList($scope.ID_TASK);
        })
    }

    $scope.showtable_TaskID = false;
    // hiển thị danh sách đổi tượng user(LẤY THEO MÃ)
    $scope.GetCLtaskid = function (task) {
        $scope.showtable_TaskID = false;
        $scope.CL_TASK_ID = task.ID;
        $scope.CL_TASK_NAME = task.TASK_NAME;

    }


    //----------------------------------------------------------------------------------------------------------------
    //--------Load List Project filter by many field-----------------------------------------------------
    //$scope.nhanvien_management = currentuserid;
    $scope.Getdeptname = function (dept) {
        $scope.showtable_Dept = false;
        $scope.phongban_management = dept.DEPARTMENT_NAME;

    }
    $scope.Getuserid_management = function (user) {
        $scope.showtable_User = false;
        $scope.nhanvien_management = user.ID;
        $scope.nhanvien_management_name = user.FULLNAME;

    }
    
    $scope.LoadListProjects_Manager = function () {

        var data = {
            currentuserid: currentuserid,
            branch: $scope.branch_management,
            deptname: $scope.phongban_management,
            userid: $scope.nhanvien_management

        }
        $http.post(origin + '/api/Api_Projects/ListProjects_Manager', data).then(function successCallback(response) {
            $scope.list_projects_manager = response.data;
        })
    }

    $scope.Hide_project = function (name, id) {
        $scope.PROJECT_NAME = name;
        $scope.Get_detail_project(id);
    }
    //---------------------------------------------------------------------------------------------------
    $scope.Show_target = function () {
        $scope.show_target_detail = true;
        $scope.show_task_detail = false;
        $scope.show_project_detail = false;
    }
    $scope.Show_task = function () {
        $scope.show_target_detail = false;
        $scope.show_task_detail = true;
        $scope.show_project_detail = false;
    }
    $scope.Show_project = function () {
        $scope.show_target_detail = false;
        $scope.show_task_detail = false;
        $scope.show_project_detail = true;
    }

    //-------View detail task-----------------------------------------------------------------------------------------------
    $scope.View_detail_task = function (id) {
        $scope.ID_TASK = id;
        $http.get(origin + '/api/Api_Tasks/Get_detail_task/' + id).then(function (response) {
            $scope.detail_task = response.data
            $scope.ID_TARGET = $scope.detail_task.ID_TARGET;
            if ($scope.detail_task.IS_DONE == true) {
                $scope.isdone = "Đã hoàn thành";
            }
            else {
                $scope.isdone = "Đang làm";
            }
        });
        $scope.Get_List_CheckList(id);
        $scope.Get_Worklogs_By_Task_ID(id);
        $scope.Get_All_Comment_Task(id);
        $scope.Get_user_view_task(id);

    }

    $scope.GenerateListTarget = function (id, name) {
        $scope.list_targets = [];
        $scope.list_targets.push({
            ID: id,
            TARGET_NAME: name
        });
        console.log($scope.list_targets);
    }
    $scope.Del_user_view_task = function (permissionid) {
        var data = {
            permission_id: permissionid
        }
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Targets/DeleteUserViewTarget_orProject_orTask', data).then(function (response) {
                $scope.Get_user_view_task($scope.ID_TASK);
            });
        }
    }

    $scope.editdes_task = function (description) {

        CKEDITOR.instances.RECHECK_TASK_COMMENT.setData(description);
    };

    $scope.UpdateTaskRecheckComment = function (id) {

        $("textarea[name=RECHECK_TASK_COMMENT]").val(CKEDITOR.instances.RECHECK_TASK_COMMENT.getData());
        var task_recheck_edit = $("[name=RECHECK_TASK_COMMENT]").val();
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            RECHECK_COMMENT: task_recheck_edit // $scope.detail_task.RECHECK_COMMENT
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskResultCheck', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(id);
        })
    }

    $scope.Get_List_CheckList = function (id) {

        $http.get(origin + '/api/Api_Tasks/ListCheckList/' + id).then(function (response) {
            $scope.list_checklist = response.data
        });

    }

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
    //List worklog by Task
    $scope.Get_Worklogs_By_Task_ID = function (id) {

        $http.get(origin + '/api/Api_Tasks/Get_Worklogs_By_Task_ID/' + id).then(function (response) {
            $scope.list_worklogs = response.data
        });

    }
    $scope.Get_All_Comment_Task = function (id) {

        $http.get(origin + '/api/Api_Targets/Get_task_comment/' + id).then(function (response) {
            $scope.list_comment_task = response.data
        });

    }
    $scope.Hide = function (item, classname) {
        $('.' + classname + '-' + item.ID).addClass('hidden')
    }
    $scope.Show = function (item, classname) {
        $('.' + classname + '-' + item.ID).removeClass('hidden')
    }
    //------------------------------------------------------------------------------------------------------




    //-------------------------------TASKS JS --------------------------------------------------------------------

    $scope.AddRecommentTask = function (item) {
        var data_update = {
            ID: item.ID,
            RECHECK_RECOMMENT: item.RECHECK_RECOMMENT,
            RECHECK_USER: currentuserid,
            RECHECK_TIME: $scope.today,
            TIME_LOG: $scope.today,
        }
        $http.post(origin + '/api/Api_Tasks/UpdateWorklog', data_update).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                RECHECK_TIME: null;
                TIME_LOG: null;
                $scope.Get_Worklogs_By_Task_ID($scope.ID_TASK);
            } else {
                ErrorSystem(response.data)
            }
        })
    }

    //Creat Worklog
    $scope.CreateWorklog = function () {
        var data_add = {
            TITLE_WORKLOG: $scope.TITLE_WORKLOG,
            ID_TASK: $scope.ID_TASK,
            RESULT_WORK: $scope.RESULT_WORK,
            TIME_SPENT: $scope.TIME_SPENT,
            TIME_LOG: $scope.today,
            RECHECK_USER: $scope.detail_task.RECHECK_USER,
            USER_CREATE: currentuserid,
            DATE_CREATE: $scope.today
        }
        $http.post(origin + '/api/Api_Tasks/AddWorklog', data_add).then(function (response) {
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                TITLE_WORKLOG: null;
                RESULT_WORK: null;
                TIME_SPENT: null;
                TIME_LOG: null;
                $scope.Get_Worklogs_By_Task_ID($scope.ID_TASK);
            } else {
                ErrorSystem(response.data)
            }
        })
        $scope.RESULT_WORK = "";
        $scope.TITLE_WORKLOG = "";

    }

    $scope.CloseAddWorklog = function () {
        $('#Modal_create_worklog').modal('hide');
    }

    //------------------LOG WORKING CHECK LIST----------------------------------------------------------
    $scope.checkisdone = function (item) {
        $scope.isDone = item;
    }
    $scope.getChecklistdetail = function (item) {
        $scope.checklistdetail = item;
    }

    $scope.UpdateToDoListStatus = function (item) {
        var data = {
            ID: item.ID,
            ID_TASK: item.ID_TASK,
            IS_DONE: item.IS_DONE
        }
        $http.post(origin + '/api/Api_Tasks/UpdateWorkLogStatus', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList($scope.ID_TASK);
        })
    }
    $scope.LogWorkingToDo = function (item) {
        $("textarea[name=CONTENT_LOGTODO]").val(CKEDITOR.instances.CONTENT_LOGTODO.getData());
        var logtodo = $("[name=CONTENT_LOGTODO]").val();
        data = {
            ID_TASK: item.ID_TASK,
            USER_CREATE: currentuserid,
            RESULT_WORK: logtodo, //$scope.CONTENT_LOGTODO,
            ID_CHECK_LIST: item.ID,
            IS_CHECK_OK: item.IS_CHECK_OK,
            todo_done: $scope.isDone
        }
        $http.post(origin + '/api/Api_Tasks/EndWorkLog', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem("Bạn đã log công việc thành công")

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task($scope.ID_TASK);
            $scope.Get_List_CheckList($scope.ID_TASK);
            $scope.Get_Worklogs_By_Task_ID($scope.ID_TASK);
            CKEDITOR.instances.CONTENT_LOGTODO.setData("");
        })
    }

   

    //-----------------
    $scope.AddCheckList = function () {

        data = {
            ID_TASK: $scope.ID_TASK,
            CONTENT_CHECKLIST: $scope.CONTENT_CHECKLIST
        }
        $http.post(origin + '/api/Api_Tasks/AddCheckList', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_List_CheckList($scope.ID_TASK);
        })
    }
    //-----------------
    $scope.editdes = function (description) {

        CKEDITOR.instances.TASK_DESCRIPTION_EDIT.setData(description);
    };

    $scope.UpdateTaskDescription = function (id) {
        $("textarea[name=TASK_DESCRIPTION_EDIT").val(CKEDITOR.instances.TASK_DESCRIPTION_EDIT.getData());
        var task_des_edit = $("[name=TASK_DESCRIPTION_EDIT]").val();
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
    //-----------------
    $scope.showtable_UserTask = false;
    $scope.Select_multi_user_edit_Task = function (user) {
        $scope.showtable_UserTask = false;

        $scope.array_user_view_task.push({
            ID_USER: user.ID,
            ID_TARGET: $scope.ID_TASK,
            FULLNAME: user.FULLNAME
        });
    }
    $scope.Create_user_viewTask = function () {

        $http.post(origin + '/api/Api_Tasks/AddUserViewTask', $scope.array_user_view_task).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.adduserviewtask = false;
            $scope.Get_user_view_task($scope.ID_TASK);
        })
    }
    $scope.Get_user_view_task = function (id) {

        $http.get(origin + '/api/Api_Tasks/Get_user_view_task/' + id).then(function (response) {
            $scope.user_view_task = response.data
            //console.log($scope.user_view_target)
        });
    }
    //-----------------
    $scope.UpdateTaskRecheckUser = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            RECHECK_USER: $scope.RECHECK_USER_EDIT_TASK
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskRecheckUser', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(id);
        })
    }
    $scope.showtable_RecheckEdit_Task = false;
    $scope.GetRecheckEdit_Task = function (user) {
        $scope.showtable_RecheckEdit_Task = false;
        $scope.RECHECK_USER_EDIT_TASK = user.ID;
        $scope.RECHECK_USER_EDIT_TASK_NAME = user.FULLNAME;
    }
    //-----------------
    $scope.UpdateTaskAssinee = function (id) {
        data = {
            ID: id,
            USER_CREATE: currentuserid,
            ASSIGNEE: $scope.ASSIGNEE_TASK_ID
        }
        $http.post(origin + '/api/Api_Tasks/UpdateTaskAssignee', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.View_detail_task(id);
        })
    }
    $scope.showtable_AssigneeEdit_Task = false;
    $scope.GetAssigneeEdit_Task = function (user) {
        $scope.showtable_AssigneeEdit_Task = false;
        $scope.ASSIGNEE_TASK_ID = user.ID;
        $scope.ASSIGNEE_EDIT_TASK_NAME = user.FULLNAME;
    }
    //----------------------------------------------------------------------------------------------------------------
    $scope.Update_Task_Date = function (id) {
        var startdate = $("#startdate_editTask").val();
        var enddate = $("#enddate_editTask").val();
        var deadline = $("#deadline_require_editTask").val();
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
            $scope.View_detail_task(id);
        })//post create project      
    }

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
            $scope.View_detail_task(id);
        })
    }
    //----------------------------------------------------------------------------------------------------------------
    $scope.UpdateTaskStatus = function (id, status) {
        data = {
            ID: id,
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
            $scope.View_detail_task(id);
        })
    }
    //------------------START WORKING CHECK LIST----------------------------------------------------------
    $scope.StartWorkingToDo = function (item) {
        data = {
            ID_TASK: $scope.ID_TASK,
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
            $scope.Get_List_CheckList($scope.ID_TASK);
            $scope.Get_Worklogs_By_Task_ID($scope.ID_TASK);
        })
    }

    $scope.DeleteWorklog = function (item) {
        var data = {
            ID: item.ID,
            USER_CREATE: currentuserid
        }
        var r = confirm("Bạn có thực sự muốn xóa?");
        if (r == true) {
            $http.post(origin + '/api/Api_Tasks/DeleteWorklog', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    SuccessSystem(response.data)

                }
                else {
                    ErrorSystem(response.data);
                }
                $scope.Get_Worklogs_By_Task_ID($scope.ID_TASK);
            })
        }
        
    }
    $scope.SetContentWorklogEdit = function (description, id, name) {
        $scope.worklogName = name;
        $scope.worklogID = id;
        CKEDITOR.instances.LOG_RESULT_EDIT.setData(description);
    };

    $scope.UpdateWorklogContent = function (ID) {
        $("textarea[name=LOG_RESULT_EDIT]").val(CKEDITOR.instances.LOG_RESULT_EDIT.getData());
        var content = $("[name=LOG_RESULT_EDIT]").val();
        var data = {
            ID: ID,
            USER_CREATE: currentuserid,
            RESULT_WORK: content
        }
        $http.post(origin + '/api/Api_Tasks/UpdateWorklogContent', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.Get_Worklogs_By_Task_ID($scope.ID_TASK);
        })
    }
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
                $scope.View_detail_task($scope.ID_TASK);
            })
        }
        else {
            ErrorSystem("Task này đã được hoàn thành trước đó, bạn vui lòng không tích hoàn thành lần nữa");
        }

    }


    //-----------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    $scope.CloseModalTodoList = function () {
        $('#AddToDo').modal('hide');
    }
    
    
    //-------------------------------END TASKS JS --------------------------------------------------------------------

    //-=======================DASHBOARD WORK==============================================================================
    //--------GET MY WORK TODO-------------------------------------------------------------------
    $scope.Get_MyWork_Todo = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mywork_todo/' + currentuserid).then(function (response) {
            $scope.list_MyWork_Todo = response.data
        });

    }
    
    //---------------------------------------------------------------------------

    //--------GET MY WORK RECHECK-------------------------------------------------------------------
    $scope.Get_MyWork_Recheck = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mywork_recheck/' + currentuserid).then(function (response) {
            $scope.List_MyWork_Recheck = response.data
        });

    }
    
    //---------------------------------------------------------------------------

    //--------GET MY WORK MISSED-------------------------------------------------------------------
    $scope.Get_MyWork_Missed = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mywork_missed/' + currentuserid).then(function (response) {
            $scope.List_MyWork_Missed = response.data
        });

    }
    
    //---------------------------------------------------------------------------

    //--------GET MY WORK ONPROGRESSs------------------------------------------------------------------
    $scope.Get_MyWork_Onprogress = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mywork_onprogress/' + currentuserid).then(function (response) {
            $scope.List_MyWork_Onprogress = response.data
        });

    }
    
    //---------------------------------------------------------------------------
    //--------GET MY WORK OVERDUE------------------------------------------------------------------
    $scope.Get_MyWork_Overdue = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mywork_overdue/' + currentuserid).then(function (response) {
            $scope.List_MyWork_Overdue = response.data
        });

    }
    
    //---------------------------------------------------------------------------
    //--------GET MY WORK NOT YET START-------------------------------------------------------------------
    $scope.Get_MyWork_Notyetstart = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mywork_notyetstart/' + currentuserid).then(function (response) {
            $scope.List_MyWork_Notyetstart = response.data
        });

    }
    
    //---------------------------------------------------------------------------



    //--------GET MY TARGET TODO-------------------------------------------------------------------
    $scope.Get_MyTarget_Todo = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mytarget_todo/' + currentuserid).then(function (response) {
            $scope.List_MyTarget_Todo = response.data
        });

    }
    
    //---------------------------------------------------------------------------
    //--------GET MY TARGET RECHECK-------------------------------------------------------------------
    $scope.Get_MyTarget_Recheck = function () {

        $http.get(origin + '/api/Api_DashBoard_Works/Get_mytarget_recheck/' + currentuserid).then(function (response) {
            $scope.Get_MyTarget_Recheck = response.data
        });

    }
    
    //---------------------------------------------------------------------------
    $scope.Call_My_Work = function () {
        $scope.Get_MyWork_Todo();
        $scope.Get_MyWork_Recheck();
        $scope.Get_MyWork_Missed();
        $scope.Get_MyWork_Onprogress();
        $scope.Get_MyWork_Overdue();
        $scope.Get_MyWork_Notyetstart();
        $scope.Get_MyTarget_Todo();
        $scope.Get_MyTarget_Recheck();
    }
    //-=======================END DASHBOARD WORK==============================================================================

    //-----=======================WORKFLOW=====================================================================================
    $scope.Find_workflow_by_dept = function () {
        $http.get(origin + '/api/Api_Workflow/Get_List_Workflow_By_DeptId/' + $scope.DEPARTMENT_TASK).then(function (response) {
            $scope.list_workflow = response.data
        });
    }
    $scope.GetWFid = function (wf) {
        $scope.WORKFLOW_ID = wf.ID;
        $scope.WORKFLOW_NAME = wf.WORKFLOW_NAME;
    }
    //-----=======================END WORKFLOW=====================================================================================


    //-----=======================View Task=====================================================================================
    $scope.GetAllTask = function (keyword) {
        var data = {
            currentuserid: currentuserid,
            keyword: keyword
        }
        $http.post(origin + '/api/Api_Tasks/Get_All_Tasks', data).then(function (response) {
            $scope.List_All_Task = response.data
        });
    }
    //-----=======================END View Task=====================================================================================
    $scope.GetdataGanttChart = function (projectid) {
        var data = {
            project_id: projectid
        }
        
        $http.post(origin + '/api/Api_Tasks/Get_Gantt_chart', data).then(function (response) {
            $scope.DataGanttChart = response.data
            $scope.Test("");
            $scope.Test($scope.DataGanttChart);
        });
    }

    $scope.Test = function (dataChart) {
        $("#ganttChart").ganttView({
            data: dataChart,
            slideWidth: 1300,
            behavior: {
                onClick: function (data) {
                    var msg = "You clicked on an event: { start: " + data.start.toString("M/d/yyyy") + ", end: " + data.end.toString("M/d/yyyy") + " }";
                    $("#eventMessage").text(msg);
                },
                onResize: function (data) {
                    var msg = "You resized an event: { start: " + data.start.toString("M/d/yyyy") + ", end: " + data.end.toString("M/d/yyyy") + " }";
                    $("#eventMessage").text(msg);
                },
                onDrag: function (data) {
                    var msg = "You dragged an event: { start: " + data.start.toString("M/d/yyyy") + ", end: " + data.end.toString("M/d/yyyy") + " }";
                    $("#eventMessage").text(msg);
                }
            }
        });
    }

    //--====================================================================================================================
    $scope.Load_ListNewProject = function () {
        var data = {
            currentuserid: $scope.login,

        }
        $http.post(origin + '/api/Api_Projects/ListNewProject', data).then(function successCallback(response) {
            $scope.ListNewProject = response.data;
        })
    }
    $scope.Load_ListNewProject();

   //=============== lay target theo project
    //$scope.Load_ListTarget_Project = function (url) {
    //    var data = {
    //        Id_project: url,
    //    }
    //    $http.post(origin + '/api/Api_Projects/ListTarget_Project', data).then(function successCallback(response) {
    //        $scope.ListTarget_Project = response.data;
    //    })
    //}
    //$scope.Load_ListTarget_Project(url);

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

