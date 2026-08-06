using Wise_Report.Enum;

namespace Wise_Report.Shared.Queries.Base
{
public class BaseQuery
{
    public string SearchKeyword { get; set; }
    public int PageIndex { get; set; } =1;
    public int PageSize { get; set; } = 20;
    public string SortColumn { get; set; }
    public SortDirectionEnum SortDirection { get; set; }
}
}