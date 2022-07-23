
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
    public class Api_DepartmentsController : ApiController
    {
        private SMART_OKRSEntities db = new SMART_OKRSEntities();
        #region - get all depts

        [Route("api/Api_Departments/ListDepts")]
        public IHttpActionResult ListDepts(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Departments_Result>("Proc_List_Departments01 @currentuserid,@pagenum", new SqlParameter("currentuserid", thamso.userid), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }

        [Route("api/Api_Departments/CountListDepts")]
        public IHttpActionResult CountListDepts(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_Departments_Count @currentuserid", new SqlParameter("currentuserid", thamso.userid));
            db.Database.CommandTimeout = 600;
            var result = query.FirstOrDefault().ToString();
            db.Dispose();
            return Ok(result);
        }

        #endregion

        #region - Add Dept
        [HttpPost]
        [Route("api/Api_Departments/AddDept")]
        public IHttpActionResult AddDept(DEPARTMENT dept)
        {

            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", dept.USER_CREATE));
            db.Database.CommandTimeout = 600;
            var check = Convert.ToInt16(query1.FirstOrDefault());

            if (check > 0)
            {                
                DEPARTMENT query = new DEPARTMENT();
                query.DEPARTMENT_NAME = dept.DEPARTMENT_NAME;
                query.USER_CREATE = dept.USER_CREATE;
                query.DEPARTMENT_MANAGER = dept.DEPARTMENT_MANAGER;
                query.DATE_CREATE = DateTime.Now;
                db.DEPARTMENTS.Add(query);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateException)
                {
                    throw;
                }
            }

            return Ok("thành công");
        }
        #endregion

        #region - Update Dept
        [HttpPost]
        [Route("api/Api_Departments/UpdateDept")]
        public IHttpActionResult UpdateDept(DEPARTMENT dept)
        {
            // dept.USER_CREATE lúc này được sử dụng tương tự như user đang sửa, dữ liệu truyền từ web vào là user đang đăng nhập mà không phải là dữ liệu lấy từ hệ thống lên
            var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", dept.USER_CREATE));
            db.Database.CommandTimeout = 600;
            var name_update = db.USERS.Where(x => x.ID == dept.USER_CREATE).FirstOrDefault();
            string name = name_update.FULLNAME;
            var check = Convert.ToInt16(query1.FirstOrDefault());
            if (check > 0)
            {
                
                var query = db.DEPARTMENTS.Where(x => x.ID == dept.ID).FirstOrDefault();
                string name_old_dept = query.DEPARTMENT_NAME;
                if (query != null)
                {
                    query.DEPARTMENT_NAME = dept.DEPARTMENT_NAME;
                    query.DEPARTMENT_MANAGER = dept.DEPARTMENT_MANAGER;     
                }

                try
                {
                    db.SaveChanges();
                    LOG_USER_ACTIONS log = new LOG_USER_ACTIONS();
                    log.USER_ACTION = dept.USER_CREATE;
                    log.COMMENT_ACTIONS = name + " đã sửa thông tin phòng ban " + name_old_dept + " => " + query.DEPARTMENT_NAME+ "vào lúc : " + DateTime.Now;
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

        #region "Find Dept"
        [HttpPost]
        [Route("api/Api_Departments/Find_Depts")]
        public IHttpActionResult Find_Depts(ThamSo thamso)
        {
            var query = (from t1 in db.DEPARTMENTS
                         join t2 in db.USERS on t1.DEPARTMENT_MANAGER equals t2.ID
                         where (t1.DEPARTMENT_NAME.Contains(thamso.keyword))
                         orderby t1.DEPARTMENT_NAME
                         select new
                         {
                             t1.ID,
                             t1.DEPARTMENT_NAME,
                             t1.DEPARTMENT_MANAGER,
                             DEPARTMENT_MANAGER_NAME= t2.FULLNAME
                         }).Distinct().Take(25);
            var result = query.ToList();
            db.Database.Connection.Close();
            return Ok(result);
        }
        #endregion

        #region - Lấy mã phòng của một nhân viên
        [HttpGet]
        [Route("api/Api_Departments/GetIddept_userid/{userid}")]  
        public IHttpActionResult GetIddept_userid(int userid)
        {
            var query = (from t1 in db.DEPARTMENTS
                         join t2 in db.GROUPS on t1.ID equals t2.ID_DEPARTMENT
                         join t3 in db.GROUPS_USERS on t2.ID equals t3.ID_GROUP

                         where (t3.ID_USER == userid)
                         select new
                         {
                             t1.ID,
                             t1.DEPARTMENT_NAME
                         }).Distinct().Take(1);
            var result = query.ToList();
            db.Database.Connection.Close();
            return Ok(result);
        }
        #endregion
    }
}
