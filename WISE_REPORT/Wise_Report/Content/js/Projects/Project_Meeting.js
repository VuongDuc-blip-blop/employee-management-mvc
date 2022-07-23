app.controller('MeetingCtrl', function ($scope, $http, $interval, ajaxService) {
    var username = $('#userid').val();
    var currentuserid = $('#userid').val();
    $scope.userid = $('#userid').val();
    $scope.today = new Date();
    var sotrang = 1;
    //----------
    $scope.array_user_view_project_temp = []; //Khai báo mảng user được phân quyền xem project
    $scope.array_user_view_project = []; //Mảng user xem project kèm project id để lưu vào hệ thống
    $scope.array_user_view_target = [];
    $scope.list_target = [];
    $scope.adduserviewproject = false;
    $scope.gridview = true;
    //$scope.login = currentuserid; // sử dụng để kiểm tra người dùng đăng nhập = recheck user

    $scope.searchFish = '';
    $scope.ListProjectNone = [];
    $scope.LoadListMeeting = function () {
        var data = {
            currentuserid: currentuserid,
            tungay: $scope.tungay,
            denngay: $scope.denngay
        }
        $http.post(origin + '/api/Api_Meeting/ListMeeting', data).then(function successCallback(response) {
            $scope.list_meeting = response.data;
            //$scope.project_details = response.data[0];
            //$scope.projectid = $scope.project_details.ID;
            //$scope.View_target_by_project($scope.project_details.ID);
            //$scope.LoadTaskDefault($scope.project_details.ID);
            //$scope.Get_All_Comment_Project($scope.project_details.ID);
        })
    }
    $scope.LoadListMeeting();
    $scope.PROJECT_TARGERT = '';
    //-------------Create Project-------------------------------------------------------
    $scope.Create_Meeting = function () {
        if ($scope.PROJECT_TARGERT == "") {
            $scope.kiemtraPtarget = "Bạn bắt buộc phải nhập nội dung này";
        }
        else {
            var NGAYBATDAU = $("#ngaybatdauP").val();
            //var NGAYKETTHUC = $("#ngayketthucP").val();

            $("textarea[name=PROJECT_DESCRIPTION]").val(CKEDITOR.instances.PROJECT_DESCRIPTION.getData());
            var project_description = $("[name=PROJECT_DESCRIPTION]").val();

            var data = {
                PROJECT_NAME: $scope.PROJECT_NAME,
                PROJECT_OWNER: $scope.PROJECT_OWNER,
                PROJECT_DESCRIPTION: project_description,
                PROJECT_TARGERT: $scope.PROJECT_TARGERT,
                NGAY_BAT_DAU: NGAYBATDAU,
                USER_CREATE: currentuserid,
                NGUOI_DUOC_XEM: $scope.array_user_view_project_temp,

                TIME_START: $scope.TIME_START,
                TIME_END: $scope.TIME_END,
                PLACE:$scope.PLACE,
                LIST_TARGETS: $scope.ListTargetAdd
            }
            $http.post(origin + '/api/Api_Meeting/CreateMeeting', data).then(function (response) {
                if (response.data.indexOf("thành công") > 0) {
                    //CKEDITOR.instances.PROJECT_TARGET.setData('');
                    SuccessSystem(response.data);
                    $scope.LoadListMeeting();
                }
                else {
                    ErrorSystem(response.data);
                }//end else project     
                
            })//post create project    

            $scope.PROJECT_TARGERT = "";
            CKEDITOR.instances.PROJECT_DESCRIPTION.setData("");
            $scope.PROJECT_NAME = ""
        }

    }
    //---------------end create project-------------------------------------------------------

    //Lấy user được xem project lưu vào mảng
    $scope.Select_multi_user_create_project = function (user) {
        $scope.showtable_UserProject = false;

        $scope.array_user_view_project_temp.push({
            ID_USER: user.ID,
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
    $scope.showtable_User = false;
    //Xóa user được xem project trước khi lưu
    $scope.del_select_user_view_project = function (index) {
        $scope.array_user_view_project_temp.splice(index, 1);

    }

    $scope.ListTargetAdd= [{
        TARGET_NAME: null
    }]

    $scope.AddTarget = function () {
        $scope.ListTargetAdd.push({
            TARGET_NAME: null
        })
    }

    $scope.RemoveTargetRow = function (index) {
        $scope.ListTargetAdd.splice(index, 1)
    }
    //Get Project owner
    $scope.Getuserid = function (user) {
        $scope.showtable_User = false;
        $scope.PROJECT_OWNER = user.ID;
        $scope.PROJECT_OWNER_NAME = user.FULLNAME;

    }

    // Set biến từ ngày đến ngày theo đk đã chọn
    //$scope.timeview = "";
    $scope.Setbien_tungay_denngay = function (timeview) {
        if (timeview == "today") {
            $scope.tungay = moment().format('DD/MM/YYYY');
            $scope.denngay = moment().format('DD/MM/YYYY');
        }
        else if (timeview == "yesterday") {
            $scope.tungay = moment().subtract(1, 'day').format('DD/MM/YYYY');
            $scope.denngay = moment().subtract(1, 'day').format('DD/MM/YYYY');
        }
        else if (timeview == "this_week") {
            $scope.tungay = moment().startOf('week').format('DD/MM/YYYY');
            $scope.denngay = moment().endOf('week').format('DD/MM/YYYY');
        }
        else if (timeview == "this_month") {
            $scope.tungay = moment().startOf('month').format('DD/MM/YYYY');
            $scope.denngay = moment().endOf('month').format('DD/MM/YYYY');
        }
        $scope.LoadListMeeting();
    }

    //=============MODEL MEETING MINUTES=======
    //-----------------------
    //this gets the full url
    var url = window.location.href;
    //this removes the anchor at the end, if there is one
    url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
    //this removes the query after the file name, if there is one
    url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
    //this removes everything before the last slash in the path
    url = url.substring(url.lastIndexOf("/") + 1, url.length);
    //return

    $scope.Get_detail_project = function (url) {
        $scope.projectid = url;
        var data = {
            project_id: url
        }
        $http.post(origin + '/api/Api_Projects/GetProjectDetails', data).then(function (response) {
            $scope.project_details = response.data
        });
        //$scope.PROJECT_NAME = $scope.project_details.PROJECT_NAME;
    }
    $scope.Get_detail_project(url);
    //-------------------------------------------------------------------------
    $scope.LoadListTargetsTasks = function (url) {
        $scope.projectid = url;
        var data = {
            currentuserid: currentuserid,
            project_id: url,
            tungay:"",
            denngay:"",
        }
        $http.post(origin + '/api/Api_Meeting/ListTargetsTasksOfProject', data).then(function successCallback(response) {
            $scope.list_targets_tasks = response.data;
        })
    }
    $scope.LoadListTargetsTasks(url);
    //-----------------------------------
    $scope.Getuserid_targetdo = function (user) {
        $scope.showtable_UserDo = false;
        $scope.target_assignee = user.ID;
        $scope.target_assignee_name = user.FULLNAME;
    }
    $scope.Getuserid_targetcheck = function (user) {
        $scope.showtable_UserCheck = false;
        $scope.target_recheck_user = user.ID;
        $scope.target_recheck_user_name = user.FULLNAME;
    }
    //-------------
    $scope.Find_TargetDept = function (keyword) {
        var data = {
            keyword: keyword
        }
        $http.post(origin + '/api/Api_Departments/Find_Depts', data).then(function (response) {
            $scope.list_dept_find = response.data
        });
    }
    $scope.showtable_tartgetdep = false;

    $scope.Getdeptid_target = function (dept) {
        $scope.showtable_tartgetdep = false;
        $scope.target_dept = dept.ID;
        $scope.target_dept_name = dept.DEPARTMENT_NAME;
    }
    //-----list chi nhánh
    $scope.LoadListBranch = function () {
        var data = {
            currentuserid: currentuserid,
        }
        $http.post(origin + '/api/Api_Meeting/ListBranch',data).then(function (response) {
            $scope.list_branch = response.data
        });
    }
    $scope.LoadListBranch();
    //----List phòng họp
    $scope.LoadListMeetingRoom = function () {
        var data = {
            currentuserid: currentuserid,
        }
        $http.post(origin + '/api/Api_Meeting/ListMeetingRoom', data).then(function (response) {
            $scope.list_room = response.data
        });
    }
    $scope.LoadListMeetingRoom();

    //Điều hướng Gọi hàm tạo Target hay Task
    $scope.Call_CreateTarget_OrTask = function () {
        if ($scope.target_id_add_task!='' && $scope.add_task == true)
            $scope.Create_Task();
        else
            $scope.Create_Target();
    }

    $scope.Create_Target = function () {
        $("textarea[name=TARGET_DESCRIPTION]").val(CKEDITOR.instances.TARGET_DESCRIPTION.getData());
        var target_description = $("[name=TARGET_DESCRIPTION]").val();

        //var NGAYBATDAU = $("#ngaybatdau").val();
        var NGAYKETTHUC = $("#target_date_end").val();        

        var detail_target = {
            TARGET_NAME: $scope.TARGET_NAME,
            DEPARTMENT: $scope.target_dept,
            ASSIGNEE: $scope.target_assignee,
            //DATE_START: NGAYBATDAU,
            DATE_END: NGAYKETTHUC,
            RECHECK_USER: $scope.target_recheck_user,
            //TARGET_DESCRIPTION: $scope.TARGET_DESCRIPTION,
            TARGET_DESCRIPTION:target_description,
            USER_CREATE: currentuserid,
            ID_PROJECT: $scope.projectid,
            BRANCH: $scope.target_branch1
        }

        $http.post(origin + '/api/Api_Targets/AddTarget', detail_target).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)
            }
            else {
                ErrorSystem(response.data);
            }
            $scope.LoadListTargetsTasks(url);
        })
        $scope.TARGET_NAME = "";
        CKEDITOR.instances.TARGET_DESCRIPTION.setData("");
        $scope.add_target = false;
        $scope.LoadListTargetsTasks(url);
    }
    $scope.array_user_view_task = [];
    $scope.Create_Task = function () {
        $("textarea[name=TARGET_DESCRIPTION]").val(CKEDITOR.instances.TARGET_DESCRIPTION.getData());
        var task_description = $("[name=TARGET_DESCRIPTION]").val();
        var NGAYKETTHUC = $("#target_date_end").val();
        var data = {
            DEPARTMENT: $scope.target_dept,
            ID_TARGET: $scope.target_id_add_task,
            TASK_NAME: $scope.TARGET_NAME,
            TASK_DESCRIPTION: task_description, 
            ASSIGNEE: $scope.target_assignee,
            NGAY_KET_THUC: NGAYKETTHUC,
            RECHECK_USER: $scope.target_recheck_user,
            BRANCH: $scope.target_branch1,

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
        $scope.TARGET_NAME = "";
        CKEDITOR.instances.TARGET_DESCRIPTION.setData("");
        $scope.add_task = false;
        $scope.target_id_add_task = '';
        $scope.LoadListTargetsTasks(url);
    }

    //--------OPEN Link
    $scope.openlink = function (Link) {
        window.open(Link);
    }
    //-----For Show/Hide Task rows
    $scope.Hide = function (item) {
        $('.TARGET-' + item.ID_TARGET).addClass('hidden')
    }
    $scope.Show = function (item) {
        $('.TARGET-' + item.ID_TARGET).removeClass('hidden')
    }
    //-----------
    $scope.target_id_add_task = "";
    $scope.Gettargetid = function (item) {
        $scope.add_task = true;
        $scope.import = false;
        $scope.target_id_add_task = item.ID_TARGET;
        $scope.target_name_add_task = item.TARGET_NAME;
        $scope.dept_target_id = item.DEPARTMENT;
    }

    //------------Remove task - target ----------------------------------------------------------------------------------------------
    $scope.DeleteTask = function (id) {

        data = {
            task_id: id,
            currentuserid: currentuserid,
        }
        $http.post(origin + '/api/Api_Tasks/DeleteTask', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.LoadListTargetsTasks(url);
        })
    }

    $scope.DeleteTarget = function (id) {

        data = {
            task_id: id,
            currentuserid: currentuserid,
        }
        $http.post(origin + '/api/Api_Targets/DeleteTarget', data).then(function (response) {
            if (response.data.indexOf("thành công") > 0) {
                SuccessSystem(response.data)

            }
            else {
                ErrorSystem(response.data);
            }
            $scope.LoadListTargetsTasks(url);
        })
    }
    //--------------------------------------------------------------------------------
    $scope.showdata = function () {
        $("textarea[name=mail_content]").val(CKEDITOR.instances.mail_content.getData());
        var mail_content = $("[name=mail_content]").val();
        var res = mail_content.replace('<table', '<table id="tableupload" ');
        $scope.showdatacontent = res;
    }

    $scope.upload_task = function (target_id_add_task, dept_target_id) {
        var tableUp = document.getElementById('tableupload');
        //gets rows of table
        var rowLength = tableUp.rows.length;
        $scope.ListNew = []
        //loops through rows    
        for (i = 0; i < rowLength; i++) {
            var CTHH = {
                TASK_NAME: (document.getElementById("tableupload").rows[i].cells.item(0).innerText),
                TASK_DESCRIPTION: (document.getElementById("tableupload").rows[i].cells.item(1).innerText),
                ASSIGNEE_NAME: (document.getElementById("tableupload").rows[i].cells.item(2).innerText),
                RECHECK_USER_NAME: (document.getElementById("tableupload").rows[i].cells.item(3).innerText),
                NGAY_BAT_DAU: (document.getElementById("tableupload").rows[i].cells.item(4).innerText),
                NGAY_KET_THUC: (document.getElementById("tableupload").rows[i].cells.item(5).innerText),
                DEPARTMENT: dept_target_id,
                ID_TARGET: target_id_add_task,
                DEPT_RELATED: (document.getElementById("tableupload").rows[i].cells.item(6).innerText),
                BRANCH: (document.getElementById("tableupload").rows[i].cells.item(7).innerText)
            }
            $scope.ListNew.push(CTHH);
        }
        //Lưu vào CSDL
        var data_add = {
            listtask1: $scope.ListNew
        }
        $http.post(origin + '/api/Api_Meeting/UploadListTask', data_add).then(function (response) {
            $scope.list_room = response.data;
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.ListTask = []
                //$('#add_group_usergroup_new').modal('hide')                
            } else {
                ErrorSystem(response.data)

            }
        })

    }

    $scope.upload_target = function () {
        var tableUp = document.getElementById('tableupload');
        //gets rows of table
        var rowLength = tableUp.rows.length;
        $scope.ListNew_target = []
        //loops through rows    
        for (i = 0; i < rowLength; i++) {
            var CTHH = {
                TARGET_NAME: (document.getElementById("tableupload").rows[i].cells.item(0).innerText),
                TARGET_DESCRIPTION: (document.getElementById("tableupload").rows[i].cells.item(1).innerText),
                ASSIGNEE_NAME: (document.getElementById("tableupload").rows[i].cells.item(2).innerText),
                DEPT_ASSIGNEE: (document.getElementById("tableupload").rows[i].cells.item(3).innerText),
                RECHECK_USER_NAME: (document.getElementById("tableupload").rows[i].cells.item(4).innerText),
                NGAY_BAT_DAU: (document.getElementById("tableupload").rows[i].cells.item(5).innerText),
                NGAY_KET_THUC: (document.getElementById("tableupload").rows[i].cells.item(6).innerText),
                
                ID_PROJECT: $scope.projectid,
                DEPT_RELATED: (document.getElementById("tableupload").rows[i].cells.item(7).innerText),
                BRANCH: (document.getElementById("tableupload").rows[i].cells.item(8).innerText)
            }
            $scope.ListNew_target.push(CTHH);
        }
        //Lưu vào CSDL
        var data_add = {
            listtarget1: $scope.ListNew_target
        }
        $http.post(origin + '/api/Api_Meeting/UploadListTarget', data_add).then(function (response) {
            $scope.list_room = response.data;
            if (response.data.indexOf("thành công") >= 0) {
                SuccessSystem(response.data)
                $scope.ListTask = []
                //$('#add_group_usergroup_new').modal('hide')                
            } else {
                ErrorSystem(response.data)

            }
        })

    }
    //=============END MODEL MEETING MINUTES=======
})