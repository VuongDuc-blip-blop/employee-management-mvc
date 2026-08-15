
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
    public sealed class EmployeeController : ApiController
    {
        private static  readonly HashSet<string> AllowedSortColumns = new HashSet<string>(new[]
        {
            "EMPLOYEECODE",
            "FULLNAME",
            "EMAIL",
            "CREATEDAT"
        }, StringComparer.OrdinalIgnoreCase);
        private TestEntities db = new TestEntities();
        // GET api/<controller>
        [HttpPost]
        [Route("api/Api_EmployeeController/GetListEmployee")]
        public IHttpActionResult GetListEmployee(EmployeePageQuery query)
        {
            if(query == null)
            {
                return BadRequest("Request body is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sortColumn = NormalizeSortColumn(query.SortColumn);

            var sortDirection = query.SortDirection == SortDirectionEnum.Descending ? "DESCENDING" : "ASCENDING";

            var parameters = new DynamicParameters();

            parameters.Add("Search", string.IsNullOrEmpty(query.SearchKeyword)? null : query.SearchKeyword.Trim(), DbType.String);

            parameters.Add("PageNumber", query.PageIndex, DbType.Int32);

            parameters.Add("PageSize", query.PageSize, DbType.Int32);

            parameters.Add("SortColumn", sortColumn, DbType.String);

            parameters.Add("SortDirection", sortDirection, DbType.String);

            try
            {
                using(var multi = db.Database.Connection.QueryMultiple("dbo.GetListEmployee",param: parameters,commandTimeout: 20, commandType: CommandType.StoredProcedure))
                {
                    var rows = multi.Read<EmployeePageItem>().ToList();
                    var totalCount = multi.Read<long>().SingleOrDefault();

                    return Ok(new
                    {
                        Data = rows,
                        TotalData = totalCount,
                        PageIndex = query.PageIndex,
                        PageSize = query.PageSize
                    });
                }
            }
            catch(Exception ex)
            {
                return InternalServerError(ex);
            }

        }

        [HttpGet]
        [Route("api/Api_EmployeeController/GetEmployeeDetail/{id:Guid}")]
        public IHttpActionResult GetEmployeeDetail(Guid id)
        {
            if(id == Guid.Empty)
            {
                return BadRequest("Employee ID is required.");
            }

            try
            {
                var employee = db.Employees
                    .Where(e => e.Id == id && !e.IsDeleted)
                    .SingleOrDefault();
                
                if(employee == null)
                {
                    return NotFound();
                }

                return Ok(MapDetail(employee));

            }
            catch(Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("api/Api_EmployeeController/AddEmployee")]
        public IHttpActionResult AddEmployee(CreateEmployeeForm form)
        {
            if(form == null)
            {
                return BadRequest("Request body is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var now = DateTime.UtcNow;
            var employeeCode = NormalizeRequired(form.EmployeeCode);

            using(var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    var duplicated = db.Employees
                        .Where(e => !e.IsDeleted && e.EmployeeCode == employeeCode)
                        .Any();
                    if (duplicated)
                    {
                        transaction.Rollback();
                        return Content(HttpStatusCode.Conflict, "Mã nhân viên đã tồn tại.");
                    }

                    var employee = new Employee
                    {
                        Id = Guid.NewGuid(),
                        EmployeeCode = employeeCode,
                        FullName = NormalizeRequired(form.FullName),
                        Email = NormalizeRequired(form.Email),
                        PhoneNumber = NormalizeRequired(form.PhoneNumber),
                        Address = NormalizeRequired(form.Address),
                        Gender = form.Gender,
                        UserId = null,
                        CreatedAt = now,
                        LastModifiedAt = now,
                        CreatedBy = SeededAdmin.Id,
                        LastModifiedBy = SeededAdmin.Id,
                        IsDeleted = false,
                        ModerationStatus = form.ModerationStatus
                    };
                    db.Employees.Add(employee);
                    db.SaveChanges();
                    transaction.Commit();
                    return Ok(new
                    {
                        Message = "Thêm nhân viên thành công.",
                        Id = employee.Id
                    });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return InternalServerError(ex);
                }
            }
        }
        
        [HttpPost]
        [Route("api/Api_EmployeeController/UpdateEmployee/{id:Guid}")]
        public IHttpActionResult UpdateEmployee(Guid id, UpdateEmployeeForm form)
        {
            if(form == null)
            {
                return BadRequest("Request body is required.");
            }

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if(form.Id == Guid.Empty || form.Id != id)
            {
                return BadRequest("Id truyền vào không hợp lệ hoặc không khớp với Id trong form.");
            }

            var employeeCode = NormalizeRequired(form.EmployeeCode);
            var now = DateTime.UtcNow;

            using(var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    var employee = db.Employees
                        .Where(e => e.Id == id && !e.IsDeleted)
                        .SingleOrDefault();
                    if(employee == null)
                    {
                        transaction.Rollback();
                        return NotFound();
                    }

                    var duplicated = db.Employees
                        .Where(e => e.Id != id && !e.IsDeleted && e.EmployeeCode == employeeCode)
                        .Any();
                    
                    if(duplicated)
                    {
                        transaction.Rollback();
                        return BadRequest("Mã nhân viên đã tồn tại.");
                    }

                    employee.EmployeeCode = employeeCode;
                    employee.FullName = NormalizeRequired(form.FullName);
                    employee.Email = NormalizeRequired(form.Email);
                    employee.PhoneNumber = NormalizeRequired(form.PhoneNumber);
                    employee.Address = NormalizeRequired(form.Address);
                    employee.Gender = form.Gender;
                    employee.ModerationStatus = form.ModerationStatus;
                    employee.LastModifiedAt = now;
                    employee.LastModifiedBy = SeededAdmin.Id;

                    db.SaveChanges();
                    transaction.Commit();
                    return Ok(new
                    {
                        Message = "Cập nhật nhân viên thành công."
                    });
                }
                catch(Exception ex)
                {
                    transaction.Rollback();
                    return InternalServerError(ex);
                }
            }
        }

        [HttpPost]
        [Route("api/Api_EmployeeController/DeleteEmployee/{id:Guid}")]
        public IHttpActionResult DeleteEmployee(Guid id)
        {
            if(id == Guid.Empty)
            {
                return BadRequest("Employee ID is required.");
            }

            try
            {
                var employee = db.Employees
                    .Where(e => e.Id == id && !e.IsDeleted)
                    .SingleOrDefault();
                if(employee == null)
                {
                    return NotFound();
                }
                employee.IsDeleted = true;
                employee.DeletedAt = DateTime.UtcNow;
                employee.LastModifiedAt = DateTime.UtcNow;
                employee.LastModifiedBy = SeededAdmin.Id;
                db.SaveChanges();
                return Ok(new
                {
                    Message = "Xóa nhân viên thành công."
                });
            }
            catch(Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        private static EmployeeDetailDto MapDetail(Employee employee)
        {
            return new EmployeeDetailDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                Email = employee.Email,
                PhoneNumber = employee.PhoneNumber,
                Address = employee.Address,
                Gender = employee.Gender,
                ModerationStatus = employee.ModerationStatus,
                UserId = employee.UserId??Guid.Empty,
                CreatedAt = employee.CreatedAt,
                LastModifiedAt = employee.LastModifiedAt
            };
        }

        private string NormalizeSortColumn(string sortColumn)
        {
            var normalized = String.IsNullOrWhiteSpace(sortColumn) ? "FULLNAME" : sortColumn.Trim().ToUpperInvariant();

            return AllowedSortColumns.Contains(normalized) ? normalized : "FULLNAME";
        }

        private static string NormalizeRequired(string value)
        {
            return value == null ? string.Empty : value.Trim();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}