
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
            if (query == null)
            {
                return BadRequest("Request body is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add(
                    "Search",
                    string.IsNullOrWhiteSpace(query.SearchKeyword)
                        ? null
                        : query.SearchKeyword.Trim(),
                    DbType.String);
                parameters.Add("PageNumber", query.PageIndex, DbType.Int32);
                parameters.Add("PageSize", query.PageSize, DbType.Int32);
                parameters.Add("SortColumn", query.SortColumn, DbType.String);
                parameters.Add(
                    "SortDirection",
                    query.SortDirection == SortDirectionEnum.Ascending
                        ? "ASCENDING"
                        : "DESCENDING",
                    DbType.AnsiString);

                var rows = db.Database.Connection
                    .Query<UserPageRow>(
                        "GetListUser",
                        parameters,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 20)
                    .ToList();

                var data = rows.Select(row => new UserPageItem
                {
                    Id = row.Id,
                    UserName = row.UserName,
                    CreatedAt = row.CreatedAt,
                    ModerationStatus = row.ModerationStatus
                }).ToList();

                return Ok(new PagedResult<UserPageItem>
                {
                    Data = data,
                    TotalData = db.Users.Count(user => !user.IsDeleted),
                    PageIndex = query.PageIndex,
                    PageSize = query.PageSize
                });
            }
            catch (Exception)
            {
                return InternalServerError();
            }
        }


        [HttpPost]
        [Route("api/Api_UserController/AddUser")]
        public IHttpActionResult AddUser(CreateUserForm form)
        {
            if(form == null)
            {
                return BadRequest("Request body is required.");
            }
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
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
                    newUser.ModerationStatus = form.ModerationStatus;
                    newUser.IsDeleted = false;
                    if(!string.IsNullOrWhiteSpace(form.ProfileDescription))
                    {
                        newUser.Profile = form.ProfileDescription;
                    }
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
            if (form == null)
            {
                return BadRequest("Request body is required.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var user = db.Users.Where(x => x.Id == id).FirstOrDefault();
                if (user != null)
                {
                    user.UserName = form.UserName;
                    user.Password = form.Password;
                    if(!string.IsNullOrWhiteSpace(form.ProfileDescription))
                    {
                        user.Profile = form.ProfileDescription;
                    }
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

        [HttpGet]
        [Route("api/Api_UserController/GetUserById/{id:Guid}")]
        public IHttpActionResult GetUserById(Guid id)
        {
            try
            {
                var user = db.Users.Where(x => x.Id == id).FirstOrDefault();
                if (user != null)
                {
                    var userDto = new UserDetailDto
                    {
                        Id = user.Id,
                        UserName = user.UserName,
                        CreatedAt = user.CreatedAt,
                        ProfileDescription = user.Profile,
                        ModerationStatus = (int)user.ModerationStatus
                    };
                    return Ok(userDto);
                }
                else
                {
                    return NotFound();
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
