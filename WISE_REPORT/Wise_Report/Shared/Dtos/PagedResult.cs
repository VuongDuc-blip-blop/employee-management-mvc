using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Dtos
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; }
        public long TotalData { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}