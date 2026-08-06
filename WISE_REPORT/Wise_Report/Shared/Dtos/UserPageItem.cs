using System;
namespace Wise_Report.Shared.Dtos
{
public class UserPageItem
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ModerationStatus { get; set; }
}
}