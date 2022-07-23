
using Wise_Report.Models.BusinessModel;
using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
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
namespace Wise_Report.Api.Setting
{
    public class Api_PermissionController : ApiController
    {
        private SMART_OKRSEntities db = new SMART_OKRSEntities();
        XuLyNgayThang xlnt = new XuLyNgayThang();

        #region - get all Permission
        [HttpPost]
        [Route("api/Api_Permission/ListPermission")]
        public IHttpActionResult ListPermission(ThamSo thamso)
        {
            if (thamso.createdate != "" && thamso.createdate != null)
            {
                var datecreate = xlnt.Xulydatetime(thamso.createdate);
                var query = db.Database.SqlQuery<Proc_List_Permission_Result>("Proc_List_Permission01 @currentuserid,@permission_name,@view,@usercreate,@date,@tag,@subpermission,@permission_type,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid),
                    new SqlParameter("permission_name", thamso.permissionname), new SqlParameter("view", thamso.view), new SqlParameter("usercreate", datecreate), new SqlParameter("date", thamso.createdate), new SqlParameter("tag", thamso.tag),
                    new SqlParameter("subpermission", thamso.subpermission), new SqlParameter("permission_type", thamso.id_permissiontype), new SqlParameter("pagenum", thamso.sotrang));
                db.Database.CommandTimeout = 600;
                var result = query.ToList();
                db.Dispose();
                return Ok(result);
            }
            else
            {
                var query = db.Database.SqlQuery<Proc_List_Permission_Result>("Proc_List_Permission01 @currentuserid,@permission_name,@view,@usercreate,@date,@tag,@subpermission,@permission_type,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid),
                    new SqlParameter("permission_name", thamso.permissionname), new SqlParameter("view", thamso.view), new SqlParameter("usercreate", thamso.creatuser), new SqlParameter("date", ""), new SqlParameter("tag", thamso.tag),
                    new SqlParameter("subpermission", thamso.subpermission), new SqlParameter("permission_type", thamso.id_permissiontype), new SqlParameter("pagenum", thamso.sotrang));
                db.Database.CommandTimeout = 600;
                var result = query.ToList();
                db.Dispose();
                return Ok(result);
            }
        }

        [Route("api/Api_Permission/CountListPermission")]
        public IHttpActionResult CountListPermission(ThamSo thamso)
        {
            if (thamso.createdate != "" && thamso.createdate != null)
            {
                var datecreate = xlnt.Xulydatetime(thamso.createdate);
                var query = db.Database.SqlQuery<int>("Proc_List_Permission_Count @currentuserid,@permission_name,@view,@usercreate,@date,@tag,@subpermission,@permission_type", new SqlParameter("currentuserid", thamso.currentuserid),
                    new SqlParameter("permission_name", thamso.permissionname), new SqlParameter("view", thamso.view), new SqlParameter("usercreate", datecreate), new SqlParameter("date", thamso.createdate), new SqlParameter("tag", thamso.tag),
                    new SqlParameter("subpermission", thamso.subpermission), new SqlParameter("permission_type", thamso.id_permissiontype));
                db.Database.CommandTimeout = 600;
                var result = query.FirstOrDefault().ToString();
                db.Dispose();
                return Ok(result);
            }
            else
            {
                var query = db.Database.SqlQuery<int>("Proc_List_Permission_Count @currentuserid,@permission_name,@view,@usercreate,@date,@tag,@subpermission,@permission_type", new SqlParameter("currentuserid", thamso.currentuserid),
                    new SqlParameter("permission_name", thamso.permissionname), new SqlParameter("view", thamso.view), new SqlParameter("usercreate", thamso.creatuser), new SqlParameter("date", ""), new SqlParameter("tag", thamso.tag),
                    new SqlParameter("subpermission", thamso.subpermission), new SqlParameter("permission_type", thamso.id_permissiontype));
                db.Database.CommandTimeout = 600;
                var result = query.FirstOrDefault().ToString();
                db.Dispose();
                return Ok(result);
            }
        }
        #endregion
        #region - get all list phân quyền người dùng/nhom
        [HttpPost]
        [Route("api/Api_Permission/ListPermissionUserGroup")]
        public IHttpActionResult ListPermissionUserGroup(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Permission_UsersGroup_Result>("Proc_List_Permission_UsersGroup @currentuserid,@permissionid,@groupid,@userid,@permissiontpyeid,@pagenum",new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("permissionid", thamso.permission_id), new SqlParameter("groupid", thamso.groupid), new SqlParameter("userid", thamso.userid), new SqlParameter("permissiontpyeid", thamso.id_permissiontype), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }

        [Route("api/Api_Permission/CountListPermissionUserGroup")]
        public string CountListPermissionUserGroup(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_Permission_UsersGroup_Count @currentuserid,@permissionid,@groupid,@userid,@permissiontpyeid", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("permissionid", thamso.permission_id), new SqlParameter("groupid", thamso.groupid), new SqlParameter("userid", thamso.userid), new SqlParameter("permissiontpyeid", thamso.id_permissiontype));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        #endregion

        #region - Update Permission list
        [Route("api/Api_Permission/UpdatePermission")]
        public IHttpActionResult UpdatePermission(PERMISSION_LIST per)
        {
            int id_update = Convert.ToInt32(per.USER_CREATE);
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_Permission_List @iduser", new SqlParameter("iduser", id_update));
            db.Database.CommandTimeout = 600;
            var check = Convert.ToInt16(query1.FirstOrDefault());
            if (check == 0)
            {
                return Ok("Bạn không có quyền cập nhật!");
            }

            try
            {
                var query = db.PERMISSION_LIST.Where(x => x.ID == per.ID).FirstOrDefault();
                if (query != null)
                {
                    //Add Log LOG_USER_ACTIONS:
                    //PERMISSION_LIST log = new PERMISSION_LIST();
                    //log.USER_ACTION = id_update;
                    //ulog.COMMENT_ACTIONS = "Sửa id:" + id;
                    //if (query.GROUP_NAME != group.GROUP_NAME)
                    //    ulog.COMMENT_ACTIONS += " ,GROUP_NAME:" + query.GROUP_NAME + "->" + group.GROUP_NAME;
                    //if (query.DESCRIPTION != group.DESCRIPTION)
                    //    ulog.COMMENT_ACTIONS += " ,FULLNAME:" + query.DESCRIPTION + "->" + group.DESCRIPTION;
                    //if (query.ID_DEPARTMENT != group.ID_DEPARTMENT)
                    //    ulog.COMMENT_ACTIONS += " ,ID_DEPARTMENT:" + query.ID_DEPARTMENT + "->" + group.ID_DEPARTMENT;
                    //if (query.PURPOSE != group.PURPOSE)
                    //    ulog.COMMENT_ACTIONS += " ,PURPOSE:" + query.PURPOSE + "->" + group.PURPOSE;

                    //update
                    query.PERMISSION_NAME = per.PERMISSION_NAME;
                    query.VIEW_APPLY = per.VIEW_APPLY;
                    query.DESCRIPTION = per.DESCRIPTION;
                    query.TAGS = per.TAGS;
                    query.SUB_PERMISSION = per.SUB_PERMISSION;
                    query.ID_PERMISSION_TYPE = per.ID_PERMISSION_TYPE;
                    db.SaveChanges();                    
                }
                return Ok("Cập nhật thành công!");
            }
            catch (Exception ex)
            {
                return Ok("Cập nhật thất bại!");
            }

            //return StatusCode(HttpStatusCode.NoContent);
        }
        #endregion
        
        #region -List permission type
        [HttpPost]
        [Route("api/Api_Permission/ListPermissionType")]
        public IHttpActionResult ListPermissionType(ThamSo thamso)
        {
            if (thamso.permissionname == null) thamso.permissionname = "";
            var query = (from t1 in db.PERMISSION_TYPE
                         where (t1.PERMISSION_TYPE1.Contains(thamso.permissionname))
                         orderby t1.PERMISSION_TYPE1
                         select new
                         {
                             t1.ID,
                             t1.PERMISSION_TYPE1
                         }).Distinct().Take(25);
            var result = query.ToList();
            db.Database.Connection.Close();
            return Ok(result);
        }
        #endregion

        #region - Add Permisson        
        [Route("api/Api_Permission/AddPermission")]
        public IHttpActionResult AddPermission(PERMISSION_LIST thamso)
        {
            try
            {
                var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_Permission_List @iduser", new SqlParameter("iduser", thamso.USER_CREATE));
                db.Database.CommandTimeout = 600;
                var check = Convert.ToInt16(query1.FirstOrDefault());

                if (check > 0)
                {
                    PERMISSION_LIST query = new PERMISSION_LIST();
                    var checkexist = db.PERMISSION_LIST.Where(x => x.VIEW_APPLY == thamso.VIEW_APPLY && x.ID_PERMISSION_TYPE == thamso.ID_PERMISSION_TYPE).FirstOrDefault();
                    if (checkexist != null)
                    {
                        query.PERMISSION_NAME = thamso.PERMISSION_NAME;
                        query.VIEW_APPLY = thamso.VIEW_APPLY;
                        query.DESCRIPTION = thamso.DESCRIPTION;
                        query.TAGS = thamso.TAGS;
                        query.SUB_PERMISSION = thamso.SUB_PERMISSION;
                        query.ID_PERMISSION_TYPE = thamso.ID_PERMISSION_TYPE;
                        query.DATE_CREATE = thamso.DATE_CREATE;
                        query.USER_CREATE = thamso.USER_CREATE;
                        db.PERMISSION_LIST.Add(thamso);
                        db.SaveChanges();
                    }
                    else return Ok("Đã tồn tại trên hệ thống!");
                }
                return Ok("Thêm thành công!");

            }
            catch (Exception ex)
            {
                return Ok("Thêm thất bại!");
            }

        }
        #endregion

        #region - Add User/Group into Permission_User_Group table
        public class NewPermissionUserGroup
        {
            public int USER_CREATE { get; set; }
            public int ID_PERMISSION { set; get; }
            public List<GROUP> ListGroup { set; get; }
            public List<USER> ListUser { set; get; }
        }
        //[HttpPost]
        [Route("api/Api_Permission/AddPermissionUserGroup")]
        public IHttpActionResult AddPermissionUserGroup(NewPermissionUserGroup thamso)
        {
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", thamso.USER_CREATE));
            db.Database.CommandTimeout = 600;
            var check1 = Convert.ToInt16(query1.FirstOrDefault());

            if (check1 == 0)
            {
                return Ok("Bạn không có quyền thêm permission cho user/group!");
            }

            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                foreach (var item in thamso.ListUser)
                {
                    var check = db.PERMISSION_USERS_GROUP.Where(x => x.ID_PERMISSION == thamso.ID_PERMISSION && x.ID_USER == item.ID).FirstOrDefault();
                    if (check == null)
                    {
                        PERMISSION_USERS_GROUP list_add_per1 = new PERMISSION_USERS_GROUP();
                        list_add_per1.ID_PERMISSION = thamso.ID_PERMISSION;
                        list_add_per1.ID_USER = item.ID;

                        list_add_per1.USER_CREATE = thamso.USER_CREATE;
                        list_add_per1.DATE_CREATE = DateTime.Now;
                        db.PERMISSION_USERS_GROUP.Add(list_add_per1);

                        db.SaveChanges();
                    }
                }

                foreach (var item in thamso.ListGroup)
                {
                    var check = db.PERMISSION_USERS_GROUP.Where(x => x.ID_PERMISSION == thamso.ID_PERMISSION && x.ID_GROUP == item.ID).FirstOrDefault();
                    if (check == null)
                    {
                        PERMISSION_USERS_GROUP list_add_per1 = new PERMISSION_USERS_GROUP();
                        list_add_per1.ID_PERMISSION = thamso.ID_PERMISSION;
                        list_add_per1.ID_GROUP = item.ID;

                        list_add_per1.USER_CREATE = thamso.USER_CREATE;
                        list_add_per1.DATE_CREATE = DateTime.Now;
                        db.PERMISSION_USERS_GROUP.Add(list_add_per1);

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

        #region - Update Permission list
        [HttpPost]
        [Route("api/Api_Permission/DeletePermissionUserGroup")]
        public IHttpActionResult DeletePermissionUserGroup(PERMISSION_USERS_GROUP per)
        {
            int id_update = Convert.ToInt32(per.USER_CREATE);
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_Permission_List @iduser", new SqlParameter("iduser", id_update));
            db.Database.CommandTimeout = 600;
            var check = Convert.ToInt16(query1.FirstOrDefault());
            if (check == 0)
            {
                return Ok("Bạn không có quyền xóa permission của user/group này!");
            }

            try
            {
                var query = db.PERMISSION_USERS_GROUP.Where(x => x.ID == per.ID).FirstOrDefault();
                if (query != null)
                {
                    db.PERMISSION_USERS_GROUP.Remove(query);

                    db.SaveChanges();
                }
                return Ok("Xóa đã thành công permission của user/group");
            }
            catch (Exception ex)
            {
                return Ok("Xóa nhật thất bại!");
            }

            //return StatusCode(HttpStatusCode.NoContent);
        }
        #endregion
    }
}
