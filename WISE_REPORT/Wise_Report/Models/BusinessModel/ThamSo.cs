using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Models.BusinessModel
{
    public class ThamSo
    {
        public int group_id { set; get; }
        public string color { set; get; }
        public string mac_address { set; get; }
        public int term { set; get; }
        public int thang { set; get; }
        public int nam { set; get; }
        public int sotrang { set; get; }
        public string tukhoa4 { set; get; }
        public string tukhoa3 { set; get; }
        public string tukhoa2 { set; get; }
        public string tukhoa1 { set; get; }
        public string denngay { set; get; }
        public string tungay { set; get; }
        public int start { set; get; }
        public int end { set; get; }
        public string mode { set; get; }
        public string calamviec { set; get; }
        public string date { set; get; }
        public string machinename { set; get; }
        public string product { set; get; }
        public List<ListThang> ListThang { set; get; }

        public string permissionname { get; set; }
        public string subpermission { get; set; }
        public string permissiontype { get; set; }
        public string view { get; set; }
        public string tag { get; set; }
        public int userid { get; set; }
        public string username { get; set; }
        public string fullname { get; set; }
        public int currentuserid { get; set; }
        public string createdate { get; set; }
        public int creatuser { get; set; }
        public string groupname { get; set; }
        public string description { get; set; }
        public string purpose { get; set; }
        public int deptid { get; set; }
        public int groupid { get; set; }
        public int id_permissiontype { get; set; }
        public string statusname { get; set; }
        public int project_id { get; set; }
        public int targetid { get; set; }
        public int permission_id { get; set; }
        public string keyword { get; set; }
        public string status_end { get; set; }        
        public bool isleader { get; set; }
        public int month { get; set; }
        public int year { get; set; }
        public int task_id { get; set; }
        public int is_read { get; set; }
        public int id { get; set; }
        public string deadline { get; set; }
        public bool is_done { get; set; }
        public int managerid { get; set; }
        public int todolistid { get; set; }

        public string branch { get; set; }
        public string deptname { get; set; }
        public string projectname { get; set; }
        public string frequently { get; set; }
        public Nullable<bool> status { get; set; }
        public string content_1 { get; set; }
        public string content_2 { get; set; }
        public string content_3 { get; set; }
        public string content_4 { get; set; }
        public string content_5 { get; set; }
        public string content_6 { get; set; }
        public string content_7 { get; set; }
        public string content_8 { get; set; }
        public string content_9 { get; set; }
        public string content_10 { get; set; }
        public string sort_content_1 { get; set; }
        public string sort_content_2 { get; set; }
        public string sort_content_3 { get; set; }
        public string sort_content_4 { get; set; }
        public string sort_content_5 { get; set; }
        public string sort_content_6 { get; set; }
        public string sort_content_7 { get; set; }
        public string sort_content_8 { get; set; }
        public string sort_content_9 { get; set; }
        public string sort_content_10 { get; set; }

        public int Id_project { get; set; }
        public int Id_Target { get; set; }

        public int week { get; set; }
        public int quater { get; set; }

        public int quaterq { get; set; }
    }
    public class ListThang
    {
        public int thang { set; get; }
    }
    public class ListTarget
    {
        public int USER_CREATE { get; set; }
        public string TARGET_NAME { get; set; }
        public string TARGET_DESCRIPTION { get; set; }
        public int? RECHECK_USER { get; set; }
        public int DEPARTMENT { get; set; }
        public string DATE_COMPLETE { get; set; }
        public string DATE_START { get; set; }
        public string DATE_END { get; set; }
        public int ASSIGNEE { get; set; }
        public int ID_PROJECT { get; set; }
        public string BRANCH { get; set; }
    }
    public class newproject : Proc_List_Projects_Data_Result
    {
        public List<Proc_Filter_Target_ByProject_Result> projectTarget { get; set; }
        public List<Proc_List_Projects_UserViewer_Result> listUserViewProject { get; set; }
    }

    public class newTarget : Proc_ListTargets_Project_Result
    {
        public List<Proc_Filter_Task_ByTarget_Result> targetTask { get; set; }
    }

    public class WorkFlowFull : WORKFLOW
    {
        public List<WF_Detail> listWorkFlowDetail { set; get; }
        public List<WF_transition> listWorkFlowTransition { set; get; }
    }
    public class WF_Detail: Proc_Workflow_get_WFDetail_by_ID_Result
    {
        public int? key { get; set; }
    }
    public class WF_transition : Proc_Workflow_get_WFTransition_by_ID_Result
    {
        public int? from { get; set; }
        public int? to { get; set; }
    }
    public class List_Task : Proc_Task_GetAllTask_Result
    {
        public List<Proc_Task_GetTodolist_By_Task_Result> listWFD { set; get; }
    }
    
        public class Gantt_chart : Proc_Project_Gantt_target_Result
    {
        public List<Gantt_task> series { set; get; }
    }
    public class Gantt_task : Proc_Project_Gantt_task_Result
    {
        public string end { set; get; }
    }

    public class newTarget_project : Proc_ListTargets_Project_Result
    {
        public List<Proc_Tasks_by_Target_Result> TaskTarget { get; set; }
    }


}