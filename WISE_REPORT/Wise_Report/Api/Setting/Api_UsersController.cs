
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
    public class Api_UsersController : ApiController
    {
        private SMART_OKRSEntities db = new SMART_OKRSEntities();

        #region - get all users
        [Route("api/Api_Users/ListUsers")]
        public IHttpActionResult ListUsers(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Users_Result>("Proc_List_Users @currentuserid,@username,@fullname,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("username", thamso.username), new SqlParameter("fullname", thamso.fullname), new SqlParameter("pagenum", thamso.sotrang));
            var result = query.ToList();
            return Ok(result);
        }
        
        [Route("api/Api_Users/CountListUsers")]
        public string CountListUsers(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_Users_Count @currentuserid,@username,@fullname", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("username", thamso.username), new SqlParameter("fullname", thamso.fullname));
            var result = query.FirstOrDefault().ToString();
            return result;
        }

        #endregion
        #region - Add user
        [Route("api/Api_Users/AddUser")]
        public IHttpActionResult AddUser(USER user)
        {
            try
            {
                var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", user.USER_CREATE));
                db.Database.CommandTimeout = 600;
                var check = Convert.ToInt16(query1.FirstOrDefault());
                if (check > 0)
                {
                    string passwordMD5 = Commons.MD5Hash(user.PASSWORD);
                    USER query = new USER();
                    query.USERNAME = user.USERNAME;
                    query.PASSWORD = passwordMD5;
                    query.FULLNAME = user.FULLNAME;
                    query.USER_CREATE = user.USER_CREATE;
                    query.IS_ALLOWED = user.IS_ALLOWED;
                    query.DATE_CREATE = DateTime.Now;
                    db.USERS.Add(query);
                }
                db.SaveChanges();
                return Ok("Thêm thành công!");
            }
            catch (Exception ex)
            {
                return Ok("Thêm thất bại!");
            }
            
        }
        #endregion

        #region - Update User
        [HttpPost]
        [Route("api/Api_Users/UpdateUser")]
        public IHttpActionResult UpdateUser(USER user)
        {
            try
            {
                int id_update = user.USER_CREATE;
                var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", id_update));
                db.Database.CommandTimeout = 600;
                var check = Convert.ToInt16(query1.FirstOrDefault());
                if (check > 0)
                {
                    var query = db.USERS.Where(x => x.ID == user.ID).FirstOrDefault();
                    if (query != null)
                    {
                        string comment = "Sửa id:" + user.ID;
                        if (query.USERNAME != user.USERNAME)
                            comment += " ,username:" + query.USERNAME + "->" + user.USERNAME;
                        if (query.FULLNAME != user.FULLNAME)
                            comment += " ,FULLNAME:" + query.FULLNAME + "->" + user.FULLNAME;
                        if (query.IS_ALLOWED != user.IS_ALLOWED)
                            comment += " ,IS_ALLOWED:" + query.IS_ALLOWED + "->" + user.IS_ALLOWED;
                        
                        if(query.USERNAME != user.USERNAME || query.FULLNAME != user.FULLNAME || query.IS_ALLOWED != user.IS_ALLOWED)
                        {
                            //Add Log LOG_USER_ACTIONS:
                            LOG_USER_ACTIONS ulog = new LOG_USER_ACTIONS();
                            ulog.USER_ACTION = id_update;
                            ulog.COMMENT_ACTIONS = comment;
                            ulog.DATE_ACTION = DateTime.Now;
                            db.LOG_USER_ACTIONS.Add(ulog);
                        }                        

                        //Save new info
                        query.USERNAME = user.USERNAME;
                        query.FULLNAME = user.FULLNAME;
                        query.IS_ALLOWED = user.IS_ALLOWED;                        
                    }
                }
                db.SaveChanges();
                return Ok("Sửa thành công");
            }
            catch(Exception ex)
            {
                return Ok("Sửa thất bại");
            }          
            
            
        }
        #endregion

        #region "Tim kiem Users"
        [HttpPost]
        [Route("api/Api_Users/Find_Users")]
        public IHttpActionResult Find_Users(ThamSo thamso)
        {
                var query = (from t1 in db.USERS
                             where (t1.IS_ALLOWED==true && (t1.FULLNAME.Contains(thamso.fullname) || t1.USERNAME.Contains(thamso.fullname)))
                             orderby t1.FULLNAME
                             select new
                             {
                                 t1.ID,
                                 t1.USERNAME,
                                 t1.FULLNAME 
                             }).Distinct().Take(25);
                var result = query.ToList();
                db.Database.Connection.Close();
                return Ok(result);
        }

        #endregion

        #region Admin được tìm all user/ chỉ leader group mới chọn được user trong nhóm
        [Route("api/Api_Users/ListUsers_WithPermission")]
        public IHttpActionResult ListUsers_WithPermission(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Users_WithPermission_Result>("Proc_List_Users_WithPermission @currentuserid,@fullname", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("fullname", thamso.fullname));
            var result = query.ToList();
            return Ok(result);
        }

        #endregion

        #region - Update User
        [HttpPost]
        [Route("api/Api_Users/UpdateUser1")]
        public IHttpActionResult UpdateUser1(USER user)
        {
            //Code Tiên thêm

        }
        #endregion
    }
}
