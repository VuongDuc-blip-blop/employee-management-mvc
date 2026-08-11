using System;

namespace Wise_Report.Shared.Dtos
{
    internal sealed class UserPageRow
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ModerationStatus { get; set; }
        public long TotalCount { get; set; }
    }
}
