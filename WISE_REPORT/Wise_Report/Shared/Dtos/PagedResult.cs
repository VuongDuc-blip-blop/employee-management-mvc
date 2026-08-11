using System;
using System.Collections.Generic;

namespace Wise_Report.Shared.Dtos
{
    public class PagedResult<T>
    {
        public List<T> Data { get; set; }
        public long TotalData { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}
