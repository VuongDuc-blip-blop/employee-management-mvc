
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
using Dapper;
using System.Data;

namespace Wise_Report.Api.Setting
{
    public class Api_UserController : ApiController
    {
        private TestEntities db = new TestEntities();

        #region

        [HttpPost]
        [Route("api/Api_UserController/GetListUser")]
        public dynamic GetListUser(ThamSo thamso)
        {
            
            try
            {
                dynamic returnedData =  db.Database.Connection.Query<dynamic>("GetListUser", new
                {
                    name = thamso.tukhoa1
                }
                , commandType: CommandType.StoredProcedure, commandTimeout: 20);
                
                return Ok(returnedData);
            }
            catch (Exception ex)
            {
                
                return InternalServerError(ex);
            }
        }


        [HttpPost]
        [Route("api/Api_UserController/AddUser")]
        public IHttpActionResult AddUser(ThamSo thamso)
        {
            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                var user = db.USERS.Where(x => x.USERNAME == thamso.username).FirstOrDefault();
                if (user == null)
                {
                    USER newUser = new USER();
                    newUser.USERNAME = thamso.username;
                    newUser.FULLNAME = thamso.fullname;
                    newUser.PASSWORD = thamso.tukhoa1;
                    //newUser.NGAY = DateTime.Now;
                    db.USERS.Add(newUser);
                    db.SaveChanges();


                    transaction.Commit();
                    return Ok("Thêm thành công!");
                }
                else
                {
                    transaction.Rollback();
                    return Ok("Đã có tài khoản này rồi");
                }
              
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("api/Api_UserController/UpdateUser/{username}")]
        public IHttpActionResult UpdateUser(ThamSo thamso, string username)
        {
            try
            {
                var user = db.USERS.Where(x => x.USERNAME == thamso.username).FirstOrDefault();
                if (user != null)
                {
                    user.USERNAME = thamso.username;
                    user.FULLNAME = thamso.fullname;
                    user.PASSWORD = thamso.tukhoa1;

                    db.SaveChanges();
                    return Ok("Sửa thành công!");
                }
                else
                {
                    return Ok("Không tìm thấy");
                }

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("api/Api_UserController/DeleteUser/{username}")]
        public IHttpActionResult DeleteUser(string username)
        {
            try
            {
                var user = db.USERS.Where(x => x.USERNAME == username).FirstOrDefault();
                if (user != null)
                {
                    db.USERS.Remove(user);

                    db.SaveChanges();
                    return Ok("Xóa thành công!");
                }
                else
                {
                    return Ok("Không tìm thấy");
                }

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        #endregion


    }
}
