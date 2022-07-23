using Wise_Report.Models.BusinessModel;
using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Wise_Report.Api.Mark_report
{
    public class Api_Mark_Daily_ReportController : ApiController
    {
        private SMART_OKRSEntities db2 = new SMART_OKRSEntities();
        private WISE_REPORTEntities db = new WISE_REPORTEntities();
        XuLyNgayThang xlnt = new XuLyNgayThang();
        //======================GENERAL REPORT====================

        #region List reports
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/ListReport")]
        public IHttpActionResult ListReport(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Report_Result>("Proc_List_Report @currentuserid,@report_name,@ischeck,@deptid,@branch,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("report_name", thamso.tukhoa1), new SqlParameter("ischeck", thamso.status), new SqlParameter("deptid", thamso.deptid), new SqlParameter("branch", thamso.branch), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [Route("api/Api_Mark_Daily_Report/ListReport_Count")]
        public string ListReport_Count(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_Report_Count @currentuserid,@report_name,@ischeck,@deptid,@branch", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("report_name", thamso.tukhoa1), new SqlParameter("ischeck", thamso.status), new SqlParameter("deptid", thamso.deptid), new SqlParameter("branch", thamso.branch));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        #endregion

        #region -Detail report
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/ListMarkDailyReport")]
        public IHttpActionResult ListMarkDailyReport(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Result>("Proc_Get_Report_dynamic @currentuserid,@headerid,@deptid,@content_1,@content_2,@content_3,@content_4,@content_5,@content_6,@content_7,@content_8,@content_9,@content_10,@sort_content_1,@sort_content_2,@sort_content_3,@sort_content_4,@sort_content_5,@sort_content_6,@sort_content_7,@sort_content_8,@sort_content_9,@sort_content_10,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("headerid", thamso.tukhoa2), new SqlParameter("deptid", thamso.deptid), new SqlParameter("content_1", thamso.tukhoa3), new SqlParameter("content_2", thamso.tukhoa4), new SqlParameter("content_3", thamso.content_3), new SqlParameter("content_4", thamso.content_4), new SqlParameter("content_5", thamso.content_5), new SqlParameter("content_6", thamso.content_6), new SqlParameter("content_7", thamso.content_7), new SqlParameter("content_8", thamso.content_8), new SqlParameter("content_9", thamso.content_9), new SqlParameter("content_10", thamso.sort_content_10), new SqlParameter("sort_content_1", thamso.sort_content_1), new SqlParameter("sort_content_2", thamso.sort_content_2), new SqlParameter("sort_content_3", thamso.sort_content_3), new SqlParameter("sort_content_4", thamso.sort_content_4), new SqlParameter("sort_content_5", thamso.sort_content_5), new SqlParameter("sort_content_6", thamso.sort_content_6), new SqlParameter("sort_content_7", thamso.sort_content_7), new SqlParameter("sort_content_8", thamso.sort_content_8), new SqlParameter("sort_content_9", thamso.sort_content_9), new SqlParameter("sort_content_10", thamso.sort_content_10), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [Route("api/Api_Mark_Daily_Report/ListMarkDailyReport_Count")]
        public string ListMarkDailyReport_Count(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_Get_Report_Count @currentuserid,@headerid,@content_1,@content_2", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("headerid", thamso.tukhoa2), new SqlParameter("content_1", thamso.tukhoa3), new SqlParameter("content_2", thamso.tukhoa4));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        #endregion

        #region - Add new Content
        public class ReportContent
        {
            public string REPORT_NAME { get; set; }
            public int ID_HEADER { get; set; }
            public int ID_DEPT { get; set; }
            public int ID_GROUP { get; set; }
            public int ID_USER { get; set; }
            public int VERSION { get; set; }
            public int USER_CREATE { get; set; }
            public List<REPORT_CONTENT_2020> List_row { set; get; }
        }

        [Route("api/Api_Mark_Daily_Report/AddReportContent")]
        public IHttpActionResult AddReportContent(ReportContent thamso)
        {
            string temp = "";
            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                foreach (var item in thamso.List_row)
                {
                    var check = db.REPORT_CONTENT_2020.Where(x => x.ID_HEADER == thamso.ID_HEADER && x.ID_USER == thamso.ID_USER && x.ID_DEPT == thamso.ID_DEPT && x.ID_GROUP == thamso.ID_GROUP && x.VERSION == thamso.VERSION && x.CONTENT_1 == item.CONTENT_1 && x.CONTENT_2 == item.CONTENT_2 && x.CONTENT_3 == item.CONTENT_3 && x.CONTENT_4 == item.CONTENT_4 && x.CONTENT_5 == item.CONTENT_5).FirstOrDefault();
                    if (check == null)
                    {
                        REPORT_CONTENT_2020 NewContent = new REPORT_CONTENT_2020();
                        NewContent.ID_HEADER = thamso.ID_HEADER;
                        NewContent.ID_DEPT = thamso.ID_DEPT;
                        NewContent.ID_GROUP = thamso.ID_GROUP;
                        NewContent.ID_USER = thamso.ID_USER;
                        NewContent.VERSION = thamso.VERSION;
                        NewContent.CREATE_USER = thamso.USER_CREATE;
                        NewContent.CREATE_DATE = DateTime.Now;
                        NewContent.CONTENT_1 = item.CONTENT_1;

                        if (NewContent.CONTENT_1.Trim() == "" || NewContent.CONTENT_1 == null)
                            NewContent.CONTENT_1 = temp;
                        else
                            temp = NewContent.CONTENT_1;

                        NewContent.CONTENT_2 = item.CONTENT_2;
                        NewContent.CONTENT_3 = item.CONTENT_3;
                        NewContent.CONTENT_4 = item.CONTENT_4;
                        NewContent.CONTENT_5 = item.CONTENT_5;
                        NewContent.CONTENT_6 = item.CONTENT_6;
                        NewContent.CONTENT_7 = item.CONTENT_7;
                        NewContent.CONTENT_8 = item.CONTENT_8;
                        NewContent.CONTENT_9 = item.CONTENT_9;
                        NewContent.CONTENT_10 = item.CONTENT_10;
                        NewContent.CONTENT_11 = item.CONTENT_11;
                        NewContent.CONTENT_12 = item.CONTENT_12;
                        NewContent.CONTENT_13 = item.CONTENT_13;
                        NewContent.CONTENT_14 = item.CONTENT_14;
                        NewContent.CONTENT_15 = item.CONTENT_15;
                        NewContent.CONTENT_16 = item.CONTENT_16;
                        NewContent.CONTENT_17 = item.CONTENT_17;
                        NewContent.CONTENT_18 = item.CONTENT_18;
                        NewContent.CONTENT_19 = item.CONTENT_19;
                        NewContent.CONTENT_20 = item.CONTENT_20;

                        db.REPORT_CONTENT_2020.Add(NewContent);

                        db.SaveChanges();
                    }
                }
                transaction.Commit();
                temp = "";
                return Ok("Thêm thành công");

            }
            catch (Exception)
            {
                transaction.Rollback();
                return Ok("Thêm thất bại");
            }
        }
        #endregion

        #region - Add new report: create new header row & add content
        [Route("api/Api_Mark_Daily_Report/AddNewHeader_ReportContent")]
        public IHttpActionResult AddNewHeader_ReportContent(ReportContent thamso)
        {
            thamso.REPORT_NAME = "NewReport";
            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                //Add header
                var checkheader = db.REPORT_HEADER_MASTER.Where(x => x.REPORT_NAME == thamso.REPORT_NAME && x.ID_USER == thamso.ID_USER && x.ID_DEPT == thamso.ID_DEPT && x.ID_GROUP == thamso.ID_GROUP && x.VERSION == thamso.VERSION).FirstOrDefault();
                if (checkheader == null)
                {
                    #region add header new
                    REPORT_HEADER_MASTER newHeader = new REPORT_HEADER_MASTER();
                    newHeader.REPORT_NAME = thamso.REPORT_NAME;
                    newHeader.ID_DEPT = thamso.ID_DEPT;
                    newHeader.ID_GROUP = thamso.ID_GROUP;
                    newHeader.ID_USER = thamso.ID_USER;
                    newHeader.VERSION = thamso.VERSION;
                    newHeader.CREATE_USER = thamso.USER_CREATE;
                    newHeader.CREATE_DATE = DateTime.Now;
                    newHeader.HEADER_1 = thamso.List_row[0].CONTENT_1;
                    newHeader.HEADER_2 = thamso.List_row[0].CONTENT_2;
                    newHeader.HEADER_3 = thamso.List_row[0].CONTENT_3;
                    newHeader.HEADER_4 = thamso.List_row[0].CONTENT_4;
                    newHeader.HEADER_5 = thamso.List_row[0].CONTENT_5;
                    newHeader.HEADER_6 = thamso.List_row[0].CONTENT_6;
                    newHeader.HEADER_7 = thamso.List_row[0].CONTENT_7;
                    newHeader.HEADER_8 = thamso.List_row[0].CONTENT_8;
                    newHeader.HEADER_9 = thamso.List_row[0].CONTENT_9;
                    newHeader.HEADER_10 = thamso.List_row[0].CONTENT_10;
                    newHeader.HEADER_11 = thamso.List_row[0].CONTENT_11;
                    newHeader.HEADER_12 = thamso.List_row[0].CONTENT_12;
                    newHeader.HEADER_13 = thamso.List_row[0].CONTENT_13;
                    newHeader.HEADER_14 = thamso.List_row[0].CONTENT_14;
                    newHeader.HEADER_15 = thamso.List_row[0].CONTENT_15;
                    newHeader.HEADER_16 = thamso.List_row[0].CONTENT_16;
                    newHeader.HEADER_17 = thamso.List_row[0].CONTENT_17;
                    newHeader.HEADER_18 = thamso.List_row[0].CONTENT_18;
                    newHeader.HEADER_19 = thamso.List_row[0].CONTENT_19;
                    newHeader.HEADER_20 = thamso.List_row[0].CONTENT_20;

                    db.REPORT_HEADER_MASTER.Add(newHeader);
                    db.SaveChanges();
                    #endregion

                    #region add content
                    var headernew = db.REPORT_HEADER_MASTER.Where(x => x.REPORT_NAME == thamso.REPORT_NAME && x.ID_USER == thamso.ID_USER && x.ID_DEPT == thamso.ID_DEPT && x.ID_GROUP == thamso.ID_GROUP && x.VERSION == thamso.VERSION).FirstOrDefault();

                    //Add content
                    for (int i = 1; i < thamso.List_row.Count; i++)
                    {
                        #region add content new
                        REPORT_CONTENT_2020 NewContent = new REPORT_CONTENT_2020();
                        NewContent.ID_HEADER = headernew.ID;
                        NewContent.ID_DEPT = thamso.ID_DEPT;
                        NewContent.ID_GROUP = thamso.ID_GROUP;
                        NewContent.ID_USER = thamso.ID_USER;
                        NewContent.VERSION = thamso.VERSION;
                        NewContent.CREATE_USER = thamso.USER_CREATE;
                        NewContent.CREATE_DATE = DateTime.Now;
                        NewContent.CONTENT_1 = thamso.List_row[i].CONTENT_1;
                        NewContent.CONTENT_2 = thamso.List_row[i].CONTENT_2;
                        NewContent.CONTENT_3 = thamso.List_row[i].CONTENT_3;
                        NewContent.CONTENT_4 = thamso.List_row[i].CONTENT_4;
                        NewContent.CONTENT_5 = thamso.List_row[i].CONTENT_5;
                        NewContent.CONTENT_6 = thamso.List_row[i].CONTENT_6;
                        NewContent.CONTENT_7 = thamso.List_row[i].CONTENT_7;
                        NewContent.CONTENT_8 = thamso.List_row[i].CONTENT_8;
                        NewContent.CONTENT_9 = thamso.List_row[i].CONTENT_9;
                        NewContent.CONTENT_10 = thamso.List_row[i].CONTENT_10;
                        NewContent.CONTENT_11 = thamso.List_row[i].CONTENT_11;
                        NewContent.CONTENT_12 = thamso.List_row[i].CONTENT_12;
                        NewContent.CONTENT_13 = thamso.List_row[i].CONTENT_13;
                        NewContent.CONTENT_14 = thamso.List_row[i].CONTENT_14;
                        NewContent.CONTENT_15 = thamso.List_row[i].CONTENT_15;
                        NewContent.CONTENT_16 = thamso.List_row[i].CONTENT_16;
                        NewContent.CONTENT_17 = thamso.List_row[i].CONTENT_17;
                        NewContent.CONTENT_18 = thamso.List_row[i].CONTENT_18;
                        NewContent.CONTENT_19 = thamso.List_row[i].CONTENT_19;
                        NewContent.CONTENT_20 = thamso.List_row[i].CONTENT_20;

                        db.REPORT_CONTENT_2020.Add(NewContent);
                        #endregion
                        db.SaveChanges();
                    }

                    #region View Permission -> đã Auto created on trigger
                    //REPORT_CHECK check = new REPORT_CHECK();
                    //check.ID_HEADER = headernew.ID;
                    //check.USER_CHECK = thamso.ID_USER;
                    //check.CREATE_DATE = DateTime.Now;
                    //db.REPORT_CHECK.Add(check);
                    #endregion
                    db.SaveChanges();
                    transaction.Commit();
                    #endregion

                    return Ok("Thêm thành công");
                }
                else
                    return Ok("Upload thất bại! Đã có file: NewReport trên hệ thống! ");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Ok("Thêm thất bại");
            }
        }
        #endregion

        #region - Update Header
        [Route("api/Api_Mark_Daily_Report/UpdateHeader")]
        public IHttpActionResult UpdateHeader(REPORT_HEADER_MASTER header)
        {
            var query = db.REPORT_HEADER_MASTER.Where(x => x.ID == header.ID).FirstOrDefault();
            if (query != null && query.CREATE_USER == header.CREATE_USER)
            {
                query.HEADER_1 = header.HEADER_1;
                query.HEADER_2 = header.HEADER_2;
                query.HEADER_3 = header.HEADER_3;
                query.HEADER_4 = header.HEADER_4;
                query.HEADER_5 = header.HEADER_5;
                query.HEADER_6 = header.HEADER_6;
                query.HEADER_7 = header.HEADER_7;
                query.HEADER_8 = header.HEADER_8;
                query.HEADER_9 = header.HEADER_9;
                query.HEADER_10 = header.HEADER_10;
                query.HEADER_11 = header.HEADER_11;
                query.HEADER_12 = header.HEADER_12;
                query.HEADER_13 = header.HEADER_13;
                query.HEADER_14 = header.HEADER_14;
                query.HEADER_15 = header.HEADER_15;
                query.HEADER_16 = header.HEADER_16;
                query.HEADER_17 = header.HEADER_17;
                query.HEADER_18 = header.HEADER_18;
                query.HEADER_19 = header.HEADER_19;
                query.HEADER_20 = header.HEADER_20;
            }
            else
            {
                return Ok("Chỉ người tạo mới được sửa nội dung này!");
            }

            try
            {
                db.SaveChanges();
                return Ok("Update thành công!");
            }
            catch (Exception ex)
            {
                return Ok("Update thất bại!");
            }

        }
        #endregion

        #region - Add Column
        public class Header_add : REPORT_HEADER_MASTER
        {
            public string header_name_add { get; set; }
        }
        [Route("api/Api_Mark_Daily_Report/AddColumnHeaderName")]
        public IHttpActionResult AddColumnHeaderName(Header_add header)
        {
            try
            {
                string column_add = header.header_name_add;
                var query = db.REPORT_HEADER_MASTER.Where(x => x.ID == header.ID).FirstOrDefault();
                if (query != null && query.CREATE_USER == header.CREATE_USER)
                {
                    #region Check xem Column header nào nhỏ nhất cập nhật
                    if (header.HEADER_1 != null && header.HEADER_1 != "")
                        query.HEADER_1 = header.HEADER_1;
                    else
                    {
                        query.HEADER_1 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_2 != null && header.HEADER_2 != "")
                        query.HEADER_2 = header.HEADER_2;
                    else
                    {
                        query.HEADER_2 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_3 != null && header.HEADER_3 != "")
                        query.HEADER_3 = header.HEADER_3;
                    else
                    {
                        query.HEADER_3 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_4 != null && header.HEADER_4 != "")
                        query.HEADER_4 = header.HEADER_4;
                    else
                    {
                        query.HEADER_4 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_5 != null && header.HEADER_5 != "")
                        query.HEADER_5 = header.HEADER_5;
                    else
                    {
                        query.HEADER_5 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_6 != null && header.HEADER_6 != "")
                        query.HEADER_6 = header.HEADER_6;
                    else
                    {
                        query.HEADER_6 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_7 != null && header.HEADER_7 != "")
                        query.HEADER_7 = header.HEADER_7;
                    else
                    {
                        query.HEADER_7 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_8 != null && header.HEADER_8 != "")
                        query.HEADER_8 = header.HEADER_8;
                    else
                    {
                        query.HEADER_8 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_9 != null && header.HEADER_9 != "")
                        query.HEADER_9 = header.HEADER_9;
                    else
                    {
                        query.HEADER_9 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_10 != null && header.HEADER_10 != "")
                        query.HEADER_10 = header.HEADER_10;
                    else
                    {
                        query.HEADER_10 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_11 != null && header.HEADER_11 != "")
                        query.HEADER_11 = header.HEADER_11;
                    else
                    {
                        query.HEADER_11 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_12 != null && header.HEADER_12 != "")
                        query.HEADER_12 = header.HEADER_12;
                    else
                    {
                        query.HEADER_12 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_13 != null && header.HEADER_13 != "")
                        query.HEADER_13 = header.HEADER_13;
                    else
                    {
                        query.HEADER_13 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_14 != null && header.HEADER_14 != "")
                        query.HEADER_14 = header.HEADER_14;
                    else
                    {
                        query.HEADER_14 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_15 != null && header.HEADER_15 != "")
                        query.HEADER_15 = header.HEADER_15;
                    else
                    {
                        query.HEADER_15 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_16 != null && header.HEADER_16 != "")
                        query.HEADER_16 = header.HEADER_16;
                    else
                    {
                        query.HEADER_16 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_17 != null && header.HEADER_17 != "")
                        query.HEADER_17 = header.HEADER_17;
                    else
                    {
                        query.HEADER_17 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_18 != null && header.HEADER_18 != "")
                        query.HEADER_18 = header.HEADER_18;
                    else
                    {
                        query.HEADER_18 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_19 != null && header.HEADER_19 != "")
                        query.HEADER_19 = header.HEADER_19;
                    else
                    {
                        query.HEADER_19 = column_add;
                        column_add = null; goto save;
                    }
                    if (header.HEADER_20 != null && header.HEADER_20 != "")
                        query.HEADER_20 = header.HEADER_20;
                    else
                    {
                        query.HEADER_20 = column_add;
                        column_add = null; goto save;
                    }
                    #endregion
                }
                else
                {
                    return Ok("Chỉ người tạo mới được xóa nội dung này!");
                }
                save:
                db.SaveChanges();
                return Ok("Thêm cột thành công!");
            }
            catch (Exception ex)
            {
                return Ok("Thêm cột thất bại!");
            }

        }

        #endregion

        #region - Create report name: Add Header with name
        [Route("api/Api_Mark_Daily_Report/AddNewReport")]
        public IHttpActionResult AddNewReport(REPORT_HEADER_MASTER header)
        {
            try
            {
                string report_name = header.REPORT_NAME;
                var query = db.REPORT_HEADER_MASTER.Where(x => x.REPORT_NAME == header.REPORT_NAME && x.ID_USER == header.ID_USER).FirstOrDefault();
                if (query == null)
                {
                    if (header.REPORT_NAME != null)
                    {
                        REPORT_HEADER_MASTER newrp = new REPORT_HEADER_MASTER();
                        newrp.REPORT_NAME = header.REPORT_NAME;
                        newrp.CREATE_DATE = DateTime.Now;
                        newrp.CREATE_USER = header.CREATE_USER;
                        newrp.ID_USER = header.ID_USER;
                        db.REPORT_HEADER_MASTER.Add(newrp);
                        db.SaveChanges();
                    }
                }
                return Ok("Tạo thành công report mới!");
            }
            catch (Exception ex)
            {
                return Ok("Tạo report thất bại!");
            }

        }
        #endregion

        #region - Update File name
        [Route("api/Api_Mark_Daily_Report/UpdateFilename")]
        public IHttpActionResult UpdateFilename(REPORT_HEADER_MASTER header)
        {
            var query = db.REPORT_HEADER_MASTER.Where(x => x.ID == header.ID).FirstOrDefault();
            if (query != null && query.CREATE_USER == header.CREATE_USER)
            {
                query.REPORT_NAME = header.REPORT_NAME;
            }
            else
            {
                return Ok("Chỉ người tạo mới được sửa nội dung này!");
            }

            try
            {
                db.SaveChanges();
                return Ok("Update thành công report name!");
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }
        #endregion

        #region - Update Header
        [Route("api/Api_Mark_Daily_Report/UpdateContent")]
        public IHttpActionResult UpdateContent(REPORT_CONTENT_2020 item)
        {
            var query = db.REPORT_CONTENT_2020.Where(x => x.ID == item.ID).FirstOrDefault();
            if (query != null && query.CREATE_USER == item.CREATE_USER)
            {
                query.CONTENT_1 = item.CONTENT_1;
                query.CONTENT_2 = item.CONTENT_2;
                query.CONTENT_3 = item.CONTENT_3;
                query.CONTENT_4 = item.CONTENT_4;
                query.CONTENT_5 = item.CONTENT_5;
                query.CONTENT_6 = item.CONTENT_6;
                query.CONTENT_7 = item.CONTENT_7;
                query.CONTENT_8 = item.CONTENT_8;
                query.CONTENT_9 = item.CONTENT_9;
                query.CONTENT_10 = item.CONTENT_10;
                query.CONTENT_11 = item.CONTENT_11;
                query.CONTENT_12 = item.CONTENT_12;
                query.CONTENT_13 = item.CONTENT_13;
                query.CONTENT_14 = item.CONTENT_14;
                query.CONTENT_15 = item.CONTENT_15;
                query.CONTENT_16 = item.CONTENT_16;
                query.CONTENT_17 = item.CONTENT_17;
                query.CONTENT_18 = item.CONTENT_18;
                query.CONTENT_19 = item.CONTENT_19;
                query.CONTENT_20 = item.CONTENT_20;
            }
            else
            {
                return Ok("Chỉ người tạo mới được sửa nội dung này!");
            }

            try
            {
                db.SaveChanges();
                return Ok("Update thành công!");
            }
            catch (Exception ex)
            {
                return Ok("Update thất bại!");
            }

        }
        #endregion

        #region - User view report update status is checked
        [Route("api/Api_Mark_Daily_Report/UpdateIsChecked")]
        public IHttpActionResult UpdateIsChecked(REPORT_CHECK check)
        {
            try
            {
                var query = db.REPORT_CHECK.Where(x => x.ID_HEADER == check.ID_HEADER && x.USER_CHECK == check.USER_CHECK).FirstOrDefault();
                if (query != null)
                {
                    query.IS_CHECK = check.IS_CHECK;
                }
                db.SaveChanges();
                return Ok("Update thành công report name!");
            }
            catch (Exception ex)
            {
                return Ok("Update thất bại!");
            }

        }
        #endregion

        #region - Add/Delete View user
        public class Report_Viewer
        {
            public int ID_HEADER { get; set; }
            public int USER_CREATE { get; set; }
            public List<USER> List_viewer { set; get; }
            public List<USER> List_del { set; get; }
        }

        [Route("api/Api_Mark_Daily_Report/Add_Report_Viewer")]
        public IHttpActionResult Add_Report_Viewer(Report_Viewer thamso)
        {
            var check_permission = db2.GROUPS_USERS.Where(x => x.ID_USER == thamso.USER_CREATE && (x.ID_GROUP ==5 || x.ID_GROUP == 6 || x.ID_GROUP == 14)).FirstOrDefault();   // IT/Admin/Vận hành
            if (check_permission == null)
            {
                return Ok("Bạn không có quyền thêm/xóa người xem!"); 
            }

            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                foreach (var item in thamso.List_del)
                {
                    var check = db.REPORT_CHECK.Where(x => x.ID_HEADER == thamso.ID_HEADER && x.USER_CHECK == item.ID).FirstOrDefault();
                    if (check != null)
                    {
                        db.REPORT_CHECK.Remove(check);
                        db.SaveChanges();
                    }
                }
                foreach (var item in thamso.List_viewer)
                {
                    var check = db.REPORT_CHECK.Where(x => x.ID_HEADER == thamso.ID_HEADER && x.USER_CHECK == item.ID).FirstOrDefault();
                    if (check == null)
                    {
                        REPORT_CHECK NewViewer = new REPORT_CHECK();
                        NewViewer.ID_HEADER = thamso.ID_HEADER;
                        NewViewer.USER_CHECK = item.ID;
                        NewViewer.CREATE_USER = thamso.USER_CREATE;
                        NewViewer.CREATE_DATE = DateTime.Now;

                        db.REPORT_CHECK.Add(NewViewer);

                        db.SaveChanges();
                    }
                }
                transaction.Commit();
                return Ok("Cập nhật thành công");
            }
            catch (Exception)
            {
                transaction.Rollback();
                return Ok("Thêm thất bại");
            }
        }
        #endregion

        #region -Detail comment report
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/ListReportComment")]
        public IHttpActionResult ListReportComment(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_Report_Comment_Result>("Proc_List_Report_Comment @currentuserid,@headerid,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("headerid", thamso.tukhoa2), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [Route("api/Api_Mark_Daily_Report/ListReportComment_Count")]
        public string ListReportComment_Count(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_List_Report_Comment_Count @currentuserid,@headerid", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("headerid", thamso.tukhoa2));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        #endregion

        #region - Add new Comment

        [Route("api/Api_Mark_Daily_Report/Add_Report_Comment")]
        public IHttpActionResult Add_Report_Comment(REPORT_COMMENT thamso)
        {
            try
            {
                var check = db.REPORT_COMMENT.Where(x => x.ID_HEADER == thamso.ID_HEADER && x.USER_COMMENT == thamso.USER_COMMENT && x.COMMENT == thamso.COMMENT).FirstOrDefault();
                if (check == null)
                {
                    REPORT_COMMENT NewCmt = new REPORT_COMMENT();
                    NewCmt.ID_HEADER = thamso.ID_HEADER;
                    NewCmt.USER_COMMENT = thamso.USER_COMMENT;
                    NewCmt.COMMENT = thamso.COMMENT;
                    NewCmt.CREATE_DATE = DateTime.Now;

                    db.REPORT_COMMENT.Add(NewCmt);

                    db.SaveChanges();
                }
                return Ok("Thêm thành công");
            }
            catch (Exception ex)
            {
                return Ok("Thêm thất bại");
            }
        }
        #endregion

        #region - List user view report
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/ListUserViewReport")]
        public IHttpActionResult ListUserViewReport(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_List_User_View_Report_Result>("Proc_List_User_View_Report @currentuserid,@headerid", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("headerid", thamso.tukhoa2));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        #endregion  

        //======================SALE REPORT====================

        #region -List Branch
        //[Route("api/Api_Mark_Daily_Report/ListBranch")]
        //public IHttpActionResult ListBranch(ThamSo thamso)
        //{
        //    var result = (from t1 in db.BRANCHes
        //                  where t1.Status != false
        //                  select new
        //                  {
        //                      t1.BRANCH_NAME,
        //                      t1.BRANCH_CODE
        //                  }).ToList();
        //    return Ok(result);
        //}
        #endregion

        #region -Detail Sale report
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/DetailSaleDailyReport")]
        public IHttpActionResult DetailSaleDailyReport(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Sale_Performent_Result>("Proc_Get_Report_Sale_Performent_dynamic @currentuserid,@headerid,@week,@month,@year,@quater,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("headerid", thamso.tukhoa2), new SqlParameter("week", thamso.week), new SqlParameter("month", thamso.month), new SqlParameter("year", thamso.year), new SqlParameter("quater", thamso.quater), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        #endregion

        #region Load plan new week base on plan old week
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/SuggestNewWeekPlan")]
        public IHttpActionResult SuggestNewWeekPlan(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Sale_Performent_Plan_Result>("Proc_Get_Report_Sale_Performent_Plan @currentuserid,@headerid,@year", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("headerid", thamso.tukhoa2), new SqlParameter("year", thamso.year));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        #endregion
        #region - Add New Sale week plan
        public class ListSalePlan
        {
            public int ID_HEADER { get; set; }
            public Nullable<int> ID_DEPT { get; set; }
            public int WEEK { get; set; }
            public int MONTH { get; set; }
            public int YEAR { get; set; }
            public bool IS_PLAN { get; set; }
            public Nullable<int> ID_GROUP { get; set; }
            public Nullable<int> BRANCH_ID { get; set; }
            public Nullable<System.DateTime> CREATE_DATE { get; set; }
            public Nullable<int> USER_CREATE { get; set; }
            public List<Proc_Get_Report_Sale_Performent_Plan_Result> ListPlan { set; get; }
        }
        [Route("api/Api_Mark_Daily_Report/AddWeekSalePlan")]
        public IHttpActionResult AddWeekSalePlan(ListSalePlan newplan)
        {
            //var query1 = db.Database.SqlQuery<int>("Proc_CheckPermissionCRUD_USER @iduser", new SqlParameter("iduser", thamso.USER_CREATE));
            //db.Database.CommandTimeout = 600;
            //var check1 = Convert.ToInt16(query1.FirstOrDefault());

            //if (check1 == 0)
            //{
            //    return Ok("Bạn không có quyền thêm nhân viên vào nhóm!");
            //}

            System.Data.Entity.DbContextTransaction transaction = db.Database.BeginTransaction();
            try
            {
                var check = db.REPORT_SALE_PERFORMENT.Where(x => x.ID_HEADER == newplan.ID_HEADER && x.WEEK == newplan.WEEK && x.YEAR == newplan.YEAR).ToList();
                foreach (var item in check) //delete all to create new
                {
                    db.REPORT_SALE_PERFORMENT.Remove(item);
                    db.SaveChanges();
                }

                foreach (var item in newplan.ListPlan)
                {
                    REPORT_SALE_PERFORMENT plan = new REPORT_SALE_PERFORMENT();
                    plan.ID = 1;
                    plan.ID_HEADER = newplan.ID_HEADER;
                    plan.ID_DEPT = newplan.ID_DEPT;
                    plan.WEEK = newplan.WEEK;
                    plan.MONTH = newplan.MONTH;
                    plan.YEAR = newplan.YEAR;
                    plan.IS_PLAN = true;
                    plan.ID_GROUP = newplan.ID_GROUP;
                    plan.BRANCH_ID = newplan.BRANCH_ID;
                    plan.USER_CREATE = newplan.USER_CREATE;
                    plan.CREATE_DATE = DateTime.Now;

                    plan.ID_USER = item.ID_USER;
                    plan.FULLNAME = item.FULLNAME;
                    plan.DOANH_SO_BG = item.DOANH_SO_BG;
                    plan.DOANH_SO_SO = item.DOANH_SO_SO;
                    plan.DOANH_SO_THUC_HIEN = item.DOANH_SO_THUC_HIEN;
                    plan.SO_BG = item.SO_BG;
                    plan.SO_CUOI_GOI = item.SO_CUOI_GOI;
                    plan.SO_KH_PHAT_SINH = item.SO_KH_PHAT_SINH;
                    if (item.TY_LE_TRUNG_DON > 100) item.TY_LE_TRUNG_DON = item.TY_LE_TRUNG_DON / 100;
                    plan.TY_LE_TRUNG_DON = item.TY_LE_TRUNG_DON;
                    plan.KH_1NAM_CHUA_PS_BG = item.KH_1NAM_CHUA_PS_BG;
                    plan.KH_1NAM_CHUA_PS_SO = item.KH_1NAM_CHUA_PS_SO;
                    plan.KH_6THANG_CHUA_PS_BG = item.KH_6THANG_CHUA_PS_BG;
                    plan.KH_6THANG_CHUA_PS_SO = item.KH_6THANG_CHUA_PS_SO;
                    plan.KH_3THANG_CHUA_PS_BG = item.KH_3THANG_CHUA_PS_BG;
                    plan.KH_3THANG_CHUA_PS_SO = item.KH_3THANG_CHUA_PS_SO;
                    plan.TY_LE_CMT_BAO_GIA = item.TY_LE_CMT_BAO_GIA;

                    db.REPORT_SALE_PERFORMENT.Add(plan);

                    db.SaveChanges();
                }

                var query = db.REPORT_HEADER_MASTER.Where(x => x.ID == newplan.ID_HEADER).FirstOrDefault();
                if (query != null)
                {
                    query.DATE_UPDATE = DateTime.Now;  //Date update 
                    db.SaveChanges();
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

        #region - List Total SO IN 12 Month
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/ListTotalSOMonth")]
        public IHttpActionResult ListTotalSOMonth(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Sale_Performent_DynamicPivotTable_Month_Result>("Proc_Sale_Performent_DynamicPivotTable_Month @headerid", new SqlParameter("headerid", thamso.tukhoa2));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }

        #endregion  

        #region - Get data Sale performent Chart
        public class Proc_Get_Chart_Sale_Performent
        {
            public string TIME { get; set; }
            //public int ID_USER { get; set; }
            public string FULLNAME { get; set; }
            public decimal DATA { get; set; }
        }

        public class RETURN_DATA
        {
            public List<string> tuan { set; get; }
            public List<Daily_STATUS> content { set; get; }
        }
        public class Daily_STATUS
        {
            public string color { set; get; }
            public string name { set; get; }
            public List<Daily_JSON> data { set; get; }
            public string type { set; get; }
            public int? legendIndex { set; get; }
        }
        public class Daily_JSON
        {
            public decimal? y { set; get; }

        }
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/WeeklySaleChart")]
        public IHttpActionResult WeeklySaleChart(ThamSo thamso)
        {
            RETURN_DATA newreturn = new RETURN_DATA();

            var query = db.Database.SqlQuery<Proc_Get_Chart_Sale_Performent>("Proc_Get_Chart_Sale_Performent @headerid,@datachart,@typetime", new SqlParameter("headerid", thamso.tukhoa2), new SqlParameter("datachart", thamso.tukhoa3), new SqlParameter("typetime", thamso.tukhoa4));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();

            //var query = (from t1 in db.REPORT_SALE_PERFORMENT
            //             where t1.ID_HEADER == 28
            //             select new
            //             {
            //                 t1.FULLNAME,
            //                 t1.WEEK,
            //                 t1.DOANH_SO_SO
            //             }).ToList();
            var week = (from t1 in result
                        select new
                        {
                            t1.TIME
                        }).Distinct().ToList();
            var listcolumn = (from t1 in result
                              select new
                              {
                                  name = t1.FULLNAME,
                              }).Distinct().ToList();

            List<Daily_STATUS> datareturn = new List<Daily_STATUS>();
            List<string> newtuan = new List<string>();
            foreach (var item in listcolumn)
            {
                Daily_STATUS newstatus = new Daily_STATUS();
                newstatus.name = item.name;
                if (newstatus.name == "TOTAL_PLAN")
                {
                    newstatus.type = "line";
                    newstatus.color = "#2d42ff";
                    newstatus.legendIndex = 1;
                    //newstatus.yAxis = 0;
                }
                datareturn.Add(newstatus);
            }

            foreach (var item in datareturn)
            {
                List<Daily_JSON> newlistjson = new List<Daily_JSON>();
                foreach (var zitem in result)
                {
                    if (item.name == zitem.FULLNAME)
                    {
                        Daily_JSON newjson = new Daily_JSON();
                        newjson.y = zitem.DATA;
                        newlistjson.Add(newjson);
                    }
                }
                item.data = newlistjson;
            }

            foreach (var item in week)
            {
                newtuan.Add(item.TIME);
            }
            newreturn.tuan = newtuan;
            newreturn.content = datareturn;
            return Ok(newreturn);
        }
        #endregion
        //======================END SALE REPORT====================

        //======================WARRANTY REPORT====================
        #region Bảo Hành (Warranty) Report
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/DetaiWarrantyReport")]
        public IHttpActionResult DetaiWarrantyReport(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Warranty_Result>("Proc_Get_Report_Warranty @currentuserid,@branch,@month,@year,@tungay,@denngay,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("branch", thamso.branch), new SqlParameter("month", thamso.month), new SqlParameter("year", thamso.year), new SqlParameter("tungay", thamso.tungay), new SqlParameter("denngay", thamso.denngay), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [Route("api/Api_Mark_Daily_Report/DetaiWarrantyReport_Count")]
        public string DetaiWarrantyReport_Count(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<int>("Proc_Get_Report_Warranty_Count @currentuserid,@branch,@month,@year,@tungay,@denngay", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("branch", thamso.branch), new SqlParameter("month", thamso.month), new SqlParameter("year", thamso.year), new SqlParameter("tungay", thamso.tungay), new SqlParameter("denngay", thamso.denngay));
            var result = query.FirstOrDefault().ToString();
            return result;
        }
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/DetaiWarrantyReportAll")]
        public IHttpActionResult DetaiWarrantyReportAll(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Warranty_Result>("Proc_Get_Report_Warranty_All @currentuserid,@branch,@month,@year,@tungay,@denngay", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("branch", thamso.branch), new SqlParameter("month", thamso.month), new SqlParameter("year", thamso.year), new SqlParameter("tungay", thamso.tungay), new SqlParameter("denngay", thamso.denngay));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        #endregion
        //======================END WARRANTY REPORT====================

        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/DetaiWarrantyReport")]
        public IHttpActionResult DetaiWarrantyReport(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Warranty_Result>("Proc_Get_Report_Warranty @currentuserid,@branch,@month,@year,@tungay,@denngay,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("branch", thamso.branch), new SqlParameter("month", thamso.month), new SqlParameter("year", thamso.year), new SqlParameter("tungay", thamso.tungay), new SqlParameter("denngay", thamso.denngay), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/DetaiWarrantyReport")]
        public IHttpActionResult DetaiWarrantyReport1(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Warranty_Result>("Proc_Get_Report_Warranty @currentuserid,@branch,@month,@year,@tungay,@denngay,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("branch", thamso.branch), new SqlParameter("month", thamso.month), new SqlParameter("year", thamso.year), new SqlParameter("tungay", thamso.tungay), new SqlParameter("denngay", thamso.denngay), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
        [HttpPost]
        [Route("api/Api_Mark_Daily_Report/DetaiWarrantyReport")]
        public IHttpActionResult DetaiWarrantyReport2(ThamSo thamso)
        {
            var query = db.Database.SqlQuery<Proc_Get_Report_Warranty_Result>("Proc_Get_Report_Warranty @currentuserid,@branch,@month,@year,@tungay,@denngay,@pagenum", new SqlParameter("currentuserid", thamso.currentuserid), new SqlParameter("branch", thamso.branch), new SqlParameter("month", thamso.month), new SqlParameter("year", thamso.year), new SqlParameter("tungay", thamso.tungay), new SqlParameter("denngay", thamso.denngay), new SqlParameter("pagenum", thamso.sotrang));
            db.Database.CommandTimeout = 600;
            var result = query.ToList();
            db.Dispose();
            return Ok(result);
        }
    }
}
