using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Database
{
    public sealed class StoredProcedureHttpException : Exception
    {
        public StoredProcedureHttpException(int statusCode, string safeMessage) : base(safeMessage)
        {
            StatusCode = statusCode;
            SafeMessage = safeMessage;
        }
        public int StatusCode {get ; set;}
        public string SafeMessage {get ; set;}
    }
}