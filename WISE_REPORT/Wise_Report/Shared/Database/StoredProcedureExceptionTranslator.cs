using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Net;

namespace Wise_Report.Shared.Database
{
    public static class StoredProcedureExceptionTranslator
    {
        public static StoredProcedureHttpException Translate(SqlException exception)
        {
            switch (exception.Number)
            {
                case DatabaseErrorNumbers.BadRequest:
                    return new StoredProcedureHttpException((int)HttpStatusCode.BadRequest, "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại dữ liệu.");
                case DatabaseErrorNumbers.Unauthorized:
                    return new StoredProcedureHttpException((int)HttpStatusCode.Unauthorized, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                case DatabaseErrorNumbers.Forbidden:
                    return new StoredProcedureHttpException((int)HttpStatusCode.Forbidden, "Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên để được cấp quyền.");
                case DatabaseErrorNumbers.NotFound:
                    return new StoredProcedureHttpException((int)HttpStatusCode.NotFound, "Dữ liệu không tồn tại. Vui lòng kiểm tra lại dữ liệu.");
                case DatabaseErrorNumbers.Conflict:
                    return new StoredProcedureHttpException((int)HttpStatusCode.Conflict, "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại dữ liệu.");
                case DatabaseErrorNumbers.PayloadTooLarge:
                    return new StoredProcedureHttpException((int)HttpStatusCode.RequestEntityTooLarge, "Dữ liệu gửi lên quá lớn. Vui lòng kiểm tra lại dữ liệu.");
                default:
                    return null;
            }
        }
    }
}