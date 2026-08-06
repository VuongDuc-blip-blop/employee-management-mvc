
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
using Wise_Report.Shared.Queries;
using Wise_Report.Shared.Forms;
using Wise_Report.Shared.DataSeeded;
using Wise_Report.Enum;
using Wise_Report.Shared.Dtos;


namespace Wise_Report.Api.Setting
{
    public class Api_UserController : ApiController
    {
        private TestEntities db = new TestEntities();

        #region

        [HttpPost]
        [Route("api/Api_UserController/GetListUser")]
        public IHttpActionResult GetListUser(UserPageQuery query)
        {
            
            try
            {
                var returnedData =  db.Database.Connection.Query<User>("GetListUser", new
                {
                    Search = string.IsNullOrWhiteSpace(query.SearchKeyword) ? null : query.SearchKeyword,
                    PageNumber = query.PageIndex,
                    PageSize = query.PageSize,
                    SortColumn = query.SortColumn,
                    SortDirection = query.SortDirection.ToString().ToUpper()
                }
                , commandType: CommandType.StoredProcedure, commandTimeout: 20);

                var mappedDto = returnedData.Select(x => new UserPageItem
                {
                    Id = x.Id,
                    UserName = x.UserName,
                    Password = x.Password,
                    CreatedAt = x.CreatedAt,
                    ModerationStatus = (int)x.ModerationStatus
                }).ToList();
                var totalData = returnedData.Count();
                var pageIndex = query.PageIndex;
                var pageSize = query.PageSize;

                
                return Ok(new
                {
                    Data = mappedDto,
                    TotalData = totalData,
                    PageIndex = pageIndex,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                
                return InternalServerError(ex);
            }
        }


        [HttpPost]
        [Route("api/Api_UserController/AddUser")]
        public IHttpActionResult AddUser(CreateUserForm form)
        {
            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                var user = db.Users.Where(x => x.UserName == form.UserName).FirstOrDefault();
                if (user == null)
                {
                    var newUser = new User();
                    newUser.Id = Guid.NewGuid();
                    newUser.UserName = form.UserName;

                    newUser.Password = form.Password;
                    newUser.CreatedAt = DateTime.Now;
                    newUser.CreatedBy = SeededAdmin.Id;
                    newUser.LastModifiedAt = DateTime.Now;
                    newUser.LastModifiedBy = SeededAdmin.Id;
                    newUser.ModerationStatus = (int)ModerationStatus.Approved;
                    newUser.IsDeleted = false;
                    db.Users.Add(newUser);
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
        [Route("api/Api_UserController/UpdateUser/{id:Guid}")]
        public IHttpActionResult UpdateUser(Guid id, UpdateUserForm form)
        {
            try
            {
                var user = db.Users.Where(x => x.Id == id).FirstOrDefault();
                if (user != null)
                {
                    user.UserName = form.UserName;
                    user.Password = form.Password;
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
        [Route("api/Api_UserController/DeleteUser/{id:Guid}")]
        public IHttpActionResult DeleteUser(Guid id)
        {
            try
            {
                var user = db.Users.Where(x => x.Id == id).FirstOrDefault();
                if (user != null)
                {
                    db.Users.Remove(user);

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
