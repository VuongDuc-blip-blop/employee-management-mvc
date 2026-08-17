using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Dtos
{
    public sealed class SalesOrderListItemDto
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; }
        public Guid EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeFullName { get; set; }
        public string CustomerCode { get; set; }
        public string CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public byte Status { get; set; }
        public int ItemCount { get; set; }
        public decimal TotalQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? RejectedAt { get; set; }
        public byte[] RowVersion { get; set; }
    }

    public sealed class SalesOrderEmployeeOptionDto
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeFullName { get; set; }
    }

    public sealed class SalesOrderDetailHeaderDto
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; }
        public Guid EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeFullName { get; set; }
        public string CustomerCode { get; set; }
        public string CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public string Notes { get; set; }
        public byte Status { get; set; }
        public int ItemCount { get; set; }
        public decimal TotalQuantity { get; set; }
        public decimal SubtotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public Guid? ApprovedByUserId { get; set; }
        public DateTime? RejectedAt { get; set; }
        public Guid? RejectedByUserId { get; set; }
        public string ReviewNote { get; set; }
        public byte[] RowVersion { get; set; }
    }

    public sealed class SalesOrderLineDto
    {
        public Guid LineId { get; set; }
        public int LineNumber { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductCategory { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal LineAmount { get; set; }

    }

    public sealed class SalesOrderDetailDto
    {
        public SalesOrderDetailHeaderDto Header { get; set; }
        public IReadOnlyCollection<SalesOrderLineDto> Lines { get; set; }
    }

    public sealed class SalesOrderCreateResultDto
    {
        public Guid OrderId {get; set;}
        public string OrderNumber {get; set;}
        public byte Status {get; set;}
        public int ItemCount {get; set;}
        public decimal TotalQuantity {get; set;}
        public decimal SubtotalAmount {get; set;}
        public decimal DiscountAmount {get; set;}
        public decimal TotalAmount {get; set;}
        public string CurrencyCode {get; set;}
        public DateTime CreatedAt {get; set;}
        public bool WasAlreadyCreated {get; set;}
        public byte[] RowVersion {get; set;}
    }

    public sealed class SalesOrderApprovalResultDto
    {
        public Guid OrderId {get; set;}
        public string OrderNumber {get; set;}
        public byte Status {get; set;}
        public decimal TotalAmount {get; set;}
        public string CurrencyCode {get; set;}
        public DateTime ApprovedAt {get; set;}
        public Guid ApprovedByUserId {get; set;}
        public byte[] RowVersion {get; set;}
        public bool WasAlreadyApproved {get; set;}
    }

    public sealed class SalesOrderRejectionResultDto
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; }
        public byte Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime RejectedAt { get; set; }
        public Guid RejectedByUserId { get; set; }
        public string ReviewNote { get; set; }
        public byte[] RowVersion { get; set; }
        public bool WasAlreadyRejected { get; set; }
    }

    public sealed class SalesOrderPageDto
    {
        public IReadOnlyCollection<SalesOrderListItemDto> Data { get; set; }
        public long TotalData { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}