using System.ComponentModel.DataAnnotations;
using Wise_Report.Enum;

namespace Wise_Report.Shared.Queries.Base
{
    public class BaseQuery
    {
        [StringLength(256, ErrorMessage = "SearchKeyword cannot exceed 256 characters.")]
        public string SearchKeyword { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "PageIndex must be at least 1.")]
        public int PageIndex { get; set; } = 1;

        [Range(1, 200, ErrorMessage = "PageSize must be between 1 and 200.")]
        public int PageSize { get; set; } = 20;

        [Required(ErrorMessage = "SortColumn is required.")]
        public string SortColumn { get; set; }

        [EnumDataType(typeof(SortDirectionEnum), ErrorMessage = "SortDirection is invalid.")]
        public SortDirectionEnum SortDirection { get; set; }
    }
}
