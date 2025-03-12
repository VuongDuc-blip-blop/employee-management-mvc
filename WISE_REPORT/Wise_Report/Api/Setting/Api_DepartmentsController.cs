
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
        private TestEntities db = new TestEntities();
        #region - get all depts

        [Route("api/Api_Departments/ListDepts")]
        public IHttpActionResult ListDepts(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<dynamic>("Proc_List_Departments01 @currentuserid,@pagenum", new SqlParameter("currentuserid", thamso.userid), new SqlParameter("pagenum", thamso.sotrang));
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

    }
}
