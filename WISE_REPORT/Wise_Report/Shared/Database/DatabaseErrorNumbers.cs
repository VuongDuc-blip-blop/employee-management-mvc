using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Database
{
    public static class DatabaseErrorNumbers
    {
        public const int BadRequest = 53400;
        public const int Unauthorized = 53401;
        public const int Forbidden = 53403;
        public const int NotFound = 53404;
        public const int Conflict = 53409;
        public const int PayloadTooLarge = 53413;
    }
}