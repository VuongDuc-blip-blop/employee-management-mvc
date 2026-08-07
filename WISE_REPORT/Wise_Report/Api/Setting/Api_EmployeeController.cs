using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Wise_Report.Api.Setting
{
    public class EmployeeController : ApiController
    {
        private TestEntities db = new TestEntities();
        // GET api/<controller>
        [HttpPost]
        [Route("api/Api_EmployeeController/GetListEmployee")]
        public IHttpActionResult GetListEmployee()
        {
            try
            {
                var returnedData = db.Database.Connection.Query<Employee>("GetListEmployee", new
                {
                }
                , commandType: System.Data.CommandType.StoredProcedure, commandTimeout: 20);

                var mappedDto = returnedData.Select(x => new EmployeePageItem
                {
                    Id = x.Id,
                    EmployeeCode = x.EmployeeCode,
                    FullName = x.FullName,
                    Email = x.Email,
                    PhoneNumber = x.PhoneNumber,
                    Address = x.Address,
                    Gender = (int)x.Gender,
                    ModerationStatus = (int)x.ModerationStatus,
                    CreatedAt = x.CreatedAt
                }).ToList();
                var totalData = returnedData.Count();
                return Ok(new { data = mappedDto, totalData });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET api/<controller>/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}