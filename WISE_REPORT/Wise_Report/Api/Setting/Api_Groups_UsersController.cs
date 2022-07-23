//using SmartOKRs.Models.BusinessModel;
//using SmartOKRs.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http;
using System.Web.Http.Description;
using Wise_Report.Models.BusinessModel;
using Wise_Report.Models.DataModel;

namespace SmartOKRs.Api.Setting
{
    public class Api_Groups_UsersController : ApiController
    {
        private SMART_OKRSEntities db = new SMART_OKRSEntities();

        #region - get all Groups
        [HttpPost]
        [Route("api/Api_Groups_Users/ListGroups")]
        public IHttpActionResult ListGroups(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Groups_Result>("Proc_List_Groups @currentuserid,@groupname,@description,@purpose,@deptid,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("groupname", thamso.groupname), new SqlParameter("description", thamso.description), new SqlParameter("purpose", thamso.purpose), new SqlParameter("deptid", thamso.deptid), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [Route("api/Api_Groups_Users/CountListGroups")]
        public string CountListGroups(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_Groups_Count @currentuserid,@groupname,@description,@purpose,@deptid", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("groupname", thamso.groupname), new SqlParameter("description", thamso.description), new SqlParameter("purpose", thamso.purpose), new SqlParameter("deptid", thamso.deptid));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        #endregion

        #region - Find Groups
        [HttpPost]
        [Route("api/Api_Groups_Users/FindGroupName")]
        public IHttpActionResult FindGroupName(ThamSo thamso)
        {
            try
            {

                var data = (from t1 in db.GROUPS
                            join t2 in db.USERS on t1.MANAGER_ID equals t2.ID
                            where t1.GROUP_NAME.Contains(thamso.keyword)
                            select new
                            {
                                t1.ID,
                                t1.GROUP_NAME,
                                t2.FULLNAME
                            }).ToList();
                db.Database.Connection.Close();
                return Ok(data);

            }
            catch (Exception ex)
            {
                return Ok("Có lỗi phát sinh, xem chi tiết lỗi:" + ex.InnerException.Message);
            }

        }
        #endregion



        #region - Add Groups
        [Route("api/Api_Groups_Users/AddGroups")]
        public IHttpActionResult AddGroups(GROUP group)
        {
            try
            {
                var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", group.USER_CREATE));
                db.Database.CommandTimeout = 600;
                var check = Convert.ToInt16(query1.FirstOrDefault());

                if (check > 0)
                {
                    GROUP query = new GROUP();
                    query.GROUP_NAME = group.GROUP_NAME;
                    query.DESCRIPTION = group.DESCRIPTION;
                    query.ID_DEPARTMENT = group.ID_DEPARTMENT;
                    query.PURPOSE = group.PURPOSE;
                    query.USER_CREATE = group.USER_CREATE;
                    db.GROUPS.Add(group);
                    db.SaveChanges();
                }                
                return Ok("Thêm thành công!");

            }
            catch (Exception)
            {
                return Ok("Thêm thất bại!");
            }

        }
        #endregion

        #region - Update Groups
        [Route("api/Api_Groups_Users/UpdateGroups")]
        public IHttpActionResult UpdateGroups(GROUP group)
        {
            int id_update = 0; //user update 
            if (group.USER_CREATE != null) id_update = Convert.ToInt32(group.USER_CREATE);
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", id_update));
            db.Database.CommandTimeout = 600;
            var check = Convert.ToInt16(query1.FirstOrDefault());
            if (check > 0)
            {
                var query = db.GROUPS.Where(x => x.ID == group.ID).FirstOrDefault();
                if (query != null)
                {                    
                    string comment = "Sửa id:" + group.ID;
                    if (query.GROUP_NAME != group.GROUP_NAME)
                        comment += " ,GROUP_NAME:" + query.GROUP_NAME + "->" + group.GROUP_NAME;
                    if (query.DESCRIPTION != group.DESCRIPTION)
                        comment += " ,FULLNAME:" + query.DESCRIPTION + "->" + group.DESCRIPTION;
                    if (query.ID_DEPARTMENT != group.ID_DEPARTMENT)
                        comment += " ,ID_DEPARTMENT:" + query.ID_DEPARTMENT + "->" + group.ID_DEPARTMENT;
                    if (query.PURPOSE != group.PURPOSE)
                        comment += " ,PURPOSE:" + query.PURPOSE + "->" + group.PURPOSE;
                    if (query.MANAGER_ID != group.MANAGER_ID)
                        comment += " ,MANAGER_ID:" + query.MANAGER_ID + "->" + group.MANAGER_ID;
                    if (query.PARENT_ID != group.PARENT_ID)
                        comment += " ,PARENT_ID:" + query.PARENT_ID + "->" + group.PARENT_ID;

                    //Add Log LOG_USER_ACTIONS:
                    LOG_GROUPS_ACTIONS ulog = new LOG_GROUPS_ACTIONS();
                    ulog.USER_ACTION = id_update;
                    ulog.COMMENT_ACTIONS = comment;
                    ulog.DATE_ACTION = DateTime.Now;
                    db.LOG_GROUPS_ACTIONS.Add(ulog);

                    //update
                    query.GROUP_NAME = group.GROUP_NAME;
                    query.DESCRIPTION = group.DESCRIPTION;
                    query.ID_DEPARTMENT = group.ID_DEPARTMENT;
                    query.PURPOSE = group.PURPOSE;
                    query.MANAGER_ID = group.MANAGER_ID;
                    query.PARENT_ID = group.PARENT_ID;               
                }

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }
        #endregion

        #region -Delete Groups
        public IHttpActionResult DeleteGroups(int id, GROUP group, int id_delete)
        {
            GROUP nd = db.GROUPS.Find(id);
            if (nd == null)
            {
                return NotFound();
            }
            //Add Log LOG_USER_ACTIONS:
            LOG_GROUPS_ACTIONS ulog = new LOG_GROUPS_ACTIONS();
            ulog.USER_ACTION = id_delete;
            ulog.COMMENT_ACTIONS = "Delete id:" + id + ",GROUP_NAME:"+ group.GROUP_NAME + ",ID_DEPARTMENT:" + group.ID_DEPARTMENT + ",PURPOSE:"+ group.PURPOSE+ ",DESCRIPTION:"+ group.DESCRIPTION+ ",DATE_CREATE:"+ group.DATE_CREATE+ ",USER_CREATE:"+group.USER_CREATE;

            db.GROUPS.Remove(nd);
            db.SaveChanges();

            return Ok(nd);
        }
        #endregion

        #region - Get all Users of group
        [Route("api/Api_Groups_Users/ListGroupUsers")]
        public IHttpActionResult ListGroupUsers(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_GroupUsers_Result>("Proc_List_GroupUsers @currentuserid,@groupid,@userid,@isleader,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("groupid", thamso.groupid), new SqlParameter("userid", thamso.userid), new SqlParameter("isleader", thamso.isleader), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [Route("api/Api_Groups_Users/CountListGroupUsers")]
        public string CountListGroupUsers(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_GroupUsers_Count @currentuserid,@groupid,@userid,@isleader", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("groupid", thamso.groupid), new SqlParameter("userid", thamso.userid), new SqlParameter("isleader", thamso.isleader));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        #endregion

        #region - Add User into Group
        public class NewUserGroup
        {
            public int USER_CREATE { get; set; }
            public int ID_GROUP { set; get; }
            public List<USER> ListUser { set; get; }
        }

        [Route("api/Api_Groups_Users/AddUser_Group")]
        public IHttpActionResult AddUser_Group(NewUserGroup thamso)
        {
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", thamso.USER_CREATE));
            db.Database.CommandTimeout = 600;
            var check1 = Convert.ToInt16(query1.FirstOrDefault());

            if (check1 == 0)
            {
                return Ok("Bạn không có quyền thêm nhân viên vào nhóm!");
            }

            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                foreach (var item in thamso.ListUser)
                {
                    var check = db.GROUPS_USERS.Where(x => x.ID_GROUP == thamso.ID_GROUP && x.ID_USER == item.ID).FirstOrDefault();
                    if (check == null)
                    {
                        GROUPS_USERS NewUserGroup = new GROUPS_USERS();
                        NewUserGroup.ID_GROUP = thamso.ID_GROUP;
                        NewUserGroup.ID_USER = item.ID;
                        NewUserGroup.IS_LEADER = false;
                        NewUserGroup.USER_CREATE = thamso.USER_CREATE;
                        NewUserGroup.DATE_CREATE = DateTime.Now;
                        db.GROUPS_USERS.Add(NewUserGroup);

                        db.SaveChanges();
                    }
                }
                transaction.Commit();
                return Ok("Thêm thành công");
            }
            catch (Exception)
            {
                transaction.Rollback();
                return Ok("Thêm thất bại");
            }
        }
        #endregion

        #region -Delete User out of group
        [HttpPost]
        [Route("api/Api_Groups_Users/DeleteUser_Group")]
        public IHttpActionResult DeleteUser_Group(GROUPS_USERS gu)
        {
            GROUPS_USERS nd = db.GROUPS_USERS.Find(gu.ID);
            int id_delete = Convert.ToInt32(gu.USER_CREATE);

            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", id_delete));
            db.Database.CommandTimeout = 600;
            var check = Convert.ToInt16(query1.FirstOrDefault());

            if (check > 0)
            {                
                if (nd == null)
                {
                    return NotFound();
                }
                //Add Log LOG_USER_ACTIONS:
                GROUPS_USERS_DELETED log = new GROUPS_USERS_DELETED();
                log.ID = gu.ID;
                log.ID_GROUP = gu.ID_GROUP;
                log.ID_USER = gu.ID_USER;
                log.DATE_CREATE = gu.DATE_CREATE;
                log.USER_CREATE = gu.USER_CREATE;
                log.IS_LEADER = gu.IS_LEADER;
                log.USER_CREATE = id_delete;

                db.GROUPS_USERS.Remove(nd);
                db.SaveChanges();
            }            

            return Ok(nd);
        }
        #endregion

        #region - Update Groups
        [Route("api/Api_Groups_Users/UpdateUsersGroup")]
        public IHttpActionResult UpdateUsersGroup(GROUPS_USERS group)
        {
            int id_update = 0; //user update 
            if (group.USER_CREATE != null) id_update = Convert.ToInt32(group.USER_CREATE);
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", id_update));
            db.Database.CommandTimeout = 600;
            var check = Convert.ToInt16(query1.FirstOrDefault());
            if (check > 0)
            {
                var query = db.GROUPS_USERS.Where(x => x.ID == group.ID).FirstOrDefault();
                if (query != null)
                {
                    //string comment = "Sửa id:" + group.ID;
                    //if (query.ID_GROUP != group.ID_GROUP)
                    //    comment += " ,ID_GROUP:" + query.ID_GROUP + "->" + group.ID_GROUP;
                    //if (query.ID_USER != group.ID_USER)
                    //    comment += " ,ID_USER:" + query.ID_USER + "->" + group.ID_USER;
                    //if (query.IS_LEADER != group.IS_LEADER)
                    //    comment += " ,IS_LEADER:" + query.IS_LEADER + "->" + group.IS_LEADER;
                    ////Add Log LOG_USER_ACTIONS:
                    //LOG_GROUPS_USERS_ACTIONS ulog = new LOG_GROUPS_USERS_ACTIONS();
                    //ulog.USER_ACTION = id_update;
                    //ulog.COMMENT_ACTIONS = comment;
                    //ulog.DATE_ACTION = DateTime.Now;
                    //db.LOG_GROUPS_USERS_ACTIONS.Add(ulog);

                    //update
                    query.ID_GROUP = group.ID_GROUP;
                    query.ID_USER = group.ID_USER;
                    query.IS_LEADER = group.IS_LEADER;
                }

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }
        #endregion

        #region List Group - Group User
        //public class Group_GroupUser
        //{
        //    public int ID_GROUP { get; set; }
        //    public string GROUP_NAME { get; set; }
        //    public Nullable<int> MANAGER_ID { get; set; }
        //    public string MANAGER { get; set; }
        //    public string PARENT_ID { get; set; }
            
        //    public List<GROUP> ListGroup { set; get; }
        //    public List<USER> ListUser { set; get; }
        //}

        [Route("api/Api_Groups_Users/ListGroup_GroupUsers")]
        public IHttpActionResult ListGroup_GroupUsers(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Group_UserGroup_Result>("Proc_List_Group_UserGroup @currentuserid,@groupid,@userid,@managerid,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("groupid", thamso.groupid), new SqlParameter("userid", thamso.userid), new SqlParameter("managerid", thamso.managerid), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();

            //Group_GroupUser gru = new Group_GroupUser();
            //List<Group_GroupUser> lisgru = new List<Group_GroupUser>();

            //foreach (var item in result)
            //{
            //    Group_GroupUser gru = new Group_GroupUser();
            //    gru.ID_GROUP = item.ID_GROUP;
            //    gru.GROUP_NAME = item.GROUP_NAME;
            //    gru.MANAGER_ID = item.MANAGER_ID;
            //    gru.MANAGER = item.MANAGER_NAME;

            //    gru.ListGroup
            //}

            db.Dispose();
            return Ok(result);
        }
        [Route("api/Api_Groups_Users/CountListGroup_GroupUsers")]
        public string CountListGroup_GroupUsers(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_Group_UserGroup_Count @currentuserid,@groupid,@userid,@managerid", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("groupid", thamso.groupid), new SqlParameter("userid", thamso.userid), new SqlParameter("isleader", thamso.isleader));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        #endregion

        #region - Add Group & Add User into Group
        public class NewGroup_UserGroup
        {
            public int USER_CREATE { get; set; }
            public string GROUP_NAME { get; set; }
            public string DESCRIPTION { get; set; }
            public int ID_DEPARTMENT { get; set; }
            public string PURPOSE { get; set; }
            public int MANAGER_ID { get; set; }
            public int PARENT_ID { get; set; }
            public List<USER> ListUser { get; set; }
        }

        [Route("api/Api_Groups_Users/AddGroup_User_Group")]
        public IHttpActionResult AddGroup_User_Group(NewGroup_UserGroup thamso)
        {
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", thamso.USER_CREATE));
            db.Database.CommandTimeout = 600;
            var check1 = Convert.ToInt16(query1.FirstOrDefault());

            if (check1 == 0)
            {
                return Ok("Bạn không có quyền tạo group!");
            }
            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {                
                //Add group new
                var check_group = db.GROUPS.Where(x => x.GROUP_NAME == thamso.GROUP_NAME).FirstOrDefault();
                if(check_group==null)
                {
                    GROUP query = new GROUP();
                    query.GROUP_NAME = thamso.GROUP_NAME;
                    query.DESCRIPTION = thamso.DESCRIPTION;
                    query.ID_DEPARTMENT = thamso.ID_DEPARTMENT;
                    query.PURPOSE = thamso.PURPOSE;
                    query.USER_CREATE = thamso.USER_CREATE;
                    query.MANAGER_ID = thamso.MANAGER_ID;
                    query.PARENT_ID = thamso.PARENT_ID;
                    query.DATE_CREATE= DateTime.Now;
                    db.GROUPS.Add(query);
                    db.SaveChanges();
                }
                //lay ID group vừa tạo
                var gr = db.GROUPS.Where(x => x.GROUP_NAME == thamso.GROUP_NAME).FirstOrDefault();
                //Add User into group            

                foreach (var item in thamso.ListUser)
                {
                    var check = db.GROUPS_USERS.Where(x => x.ID_GROUP == gr.ID && x.ID_USER == item.ID).FirstOrDefault();
                    if (check == null)
                    {
                        GROUPS_USERS NewUserGroup = new GROUPS_USERS();
                        NewUserGroup.ID_GROUP = gr.ID;
                        NewUserGroup.ID_USER = item.ID;
                        NewUserGroup.IS_LEADER = false;
                        NewUserGroup.USER_CREATE = thamso.USER_CREATE;
                        NewUserGroup.DATE_CREATE = DateTime.Now;
                        db.GROUPS_USERS.Add(NewUserGroup);

                        db.SaveChanges();
                    }
                }
                transaction.Commit();
                return Ok("Thêm thành công");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Ok("Thêm thất bại");
            }
        }
        #endregion
        
    }
} 
