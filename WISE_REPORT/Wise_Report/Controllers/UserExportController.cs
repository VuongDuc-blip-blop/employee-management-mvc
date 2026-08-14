using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Wise_Report.Models.DataModel;

namespace Wise_Report.Controllers
{
    public sealed class UserExportController : Controller
    {
        private const int MaxExportRows = 5000;
        private readonly TestEntities db = new TestEntities();

        [HttpGet]
        public ActionResult Htmlxlsx(string search, int sortDirection = 1)
        {
            List<UserExportRow> rows;
            ActionResult error;
            if (!TryLoadRows(search, sortDirection, out rows, out error))
            {
                return error;
            }

            try
            {
                var content = BuildHtmlWorkbook(rows);
                return File(
                    content,
                    "application/vnd.ms-excel",
                    BuildFileName("users-server-html", ".xls"));
            }
            catch(Exception ex)
            {
                return new HttpStatusCodeResult(500, "An unexpected error occurred.");
            }
        }

        [HttpGet]
        public ActionResult Xlsx(string search, int sortDirection = 1)
        {
        

            List<UserExportRow> rows;
            ActionResult error;
            if (!TryLoadRows(search, sortDirection, out rows, out error))
            {
                return error;
            }

            try
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using (var package = new ExcelPackage())
                {
                    var sheet = package.Workbook.Worksheets.Add("Users");
                    sheet.Cells[1, 1].Value = "Id";
                    sheet.Cells[1, 2].Value = "UserName";
                    sheet.Cells[1, 3].Value = "CreatedAt";
                    sheet.Cells[1, 4].Value = "ModerationStatus";
                    sheet.Cells[1, 1, 1, 4].Style.Font.Bold = true;

                    for (var index = 0; index < rows.Count; index++)
                    {
                        var excelRow = index + 2;
                        sheet.Cells[excelRow, 1].Value = rows[index].Id.ToString("D");
                        sheet.Cells[excelRow, 2].Value = NeutralizeFormula(rows[index].UserName);
                        sheet.Cells[excelRow, 3].Value = rows[index].CreatedAt;
                        sheet.Cells[excelRow, 3].Style.Numberformat.Format = "yyyy-mm-dd hh:mm:ss";
                        sheet.Cells[excelRow, 4].Value = rows[index].ModerationStatus;
                    }

                    sheet.View.FreezePanes(2, 1);
                    sheet.Cells[sheet.Dimension.Address].AutoFitColumns(12, 40);
                    return File(
                        package.GetAsByteArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        BuildFileName("users-epplus", ".xlsx"));
                }
            }
            catch (Exception)
            {
                return new HttpStatusCodeResult(500, "Unable to create the export.");
            }
        }

        private bool TryLoadRows(
            string search,
            int sortDirection,
            out List<UserExportRow> rows,
            out ActionResult error
        )
        {
            rows = null;
            error = null;

            Guid userId;
            if(Session["userid"] == null
                || !Guid.TryParse(Convert.ToString(Session["userid"]), out userId))
            {
                error = new HttpStatusCodeResult(401, "Authentication is required.");
                return false;
            }

            if(search != null && search.Length > 256)
            {
                error = new HttpStatusCodeResult(400, "Search cannot exceed 256 characters.");
                return false;
            }

            if(sortDirection != 1 && sortDirection != 2)
            {
                error = new HttpStatusCodeResult(400, "Sort direction is invalid.");
                return false;
            }

            try
            {
                var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
                var users = db.Users
                    .Where(user => !user.IsDeleted);
                if(normalizedSearch != null)
                {
                    users = users.Where(user => user.UserName.Contains(normalizedSearch));
                }

                var ordered = sortDirection == 1
                    ? users.OrderBy(user => user.UserName).ThenBy(user => user.Id)
                    : users.OrderByDescending(user => user.UserName).ThenBy(user => user.Id);
                
                var rawRows = ordered
                    .Select(user => new
                    {
                        user.Id,
                        user.UserName,
                        user.CreatedAt,
                        user.ModerationStatus
                    })
                    .Take(MaxExportRows + 1)
                    .ToList();
                
                if(rawRows.Count > MaxExportRows)
                {
                    error = new HttpStatusCodeResult(
                        400,
                        $"Cannot export more than {MaxExportRows} rows. Please refine your search."
                    );
                    return false;
                }

                rows = rawRows.Select(raw => new UserExportRow
                {
                    Id = raw.Id,
                    UserName = raw.UserName,
                    CreatedAt = raw.CreatedAt,
                    ModerationStatus = StatusText(raw.ModerationStatus)
                }).ToList();

                return true;
            }
            catch(Exception ex)
            {
                error = new HttpStatusCodeResult(500, "An unexpected error occurred.");
                return false;
            }
        }

        private static byte[] BuildHtmlWorkbook(IEnumerable<UserExportRow> rows)
        {
            var html = new StringBuilder();
            html.Append("<html><head><meta charset=\"utf-8\"></head><body><table border=\"1\">");
            html.Append("<thead><tr><th>Id</th><th>UserName</th><th>CreatedAt</th><th>ModerationStatus</th></tr></thead><tbody>");
            foreach (var row in rows)
            {
                html.Append("<tr><td>")
                    .Append(HttpUtility.HtmlEncode(row.Id.ToString("D")))
                    .Append("</td><td>")
                    .Append(HttpUtility.HtmlEncode(NeutralizeFormula(row.UserName)))
                    .Append("</td><td>")
                    .Append(HttpUtility.HtmlEncode(row.CreatedAt.ToString(
                        "yyyy-MM-dd HH:mm:ss",
                        CultureInfo.InvariantCulture)))
                    .Append("</td><td>")
                    .Append(HttpUtility.HtmlEncode(row.ModerationStatus))
                    .Append("</td></tr>");
            }
            html.Append("</tbody></table></body></html>");

            var body = Encoding.UTF8.GetBytes(html.ToString());
            var preamble = Encoding.UTF8.GetPreamble();
            return preamble.Concat(body).ToArray();
        }

        private static string NeutralizeFormula(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }

            var first = value[0];
            return first == '=' || first == '+' || first == '-'
                || first == '@' || first == '\t' || first == '\r'
                ? "'" + value
                : value;
        }

        private static string StatusText(int status)
        {
            switch (status)
            {
                case 0:
                    return "Chưa phê duyệt";
                case 1:
                    return "Đã phê duyệt";
                case 2: 
                    return "Bị từ chối";
                default:
                    return "Không xác định";
            }
        }

        private static string BuildFileName(string prefix, string extension)
        {
            return prefix + "-" + DateTime.Now.ToString("yyyyMMdd-HHmmss", CultureInfo.InvariantCulture) + extension;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }


        private sealed class UserExportRow
        {
            public Guid Id { get; set; }
            public string UserName { get; set; }
            public DateTime CreatedAt { get; set; }
            public string ModerationStatus { get; set; }
        }
    }
}