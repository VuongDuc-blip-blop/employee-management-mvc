USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 53370, 'ERP-0004 smoke testing is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 53371, 'ERP-0004 smoke testing is connected to the wrong database.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPSalesOrderModuleOwner'
        AND CONVERT(nvarchar(4000), [value]) =
            N'employee-management-mvc/ERP-0004/v1'
)
BEGIN
    THROW 53372, 'ERP-0004 module ownership token is missing or wrong.', 1;
END;

DECLARE @AdminUserId uniqueidentifier =
    '701A5844-3936-4AE9-8BA6-DBF59294B973';
DECLARE @EmployeeUserA uniqueidentifier =
    '00000000-0000-0000-0000-00000004A001';
DECLARE @EmployeeUserB uniqueidentifier =
    '00000000-0000-0000-0000-00000004A002';
DECLARE @EmployeeA uniqueidentifier =
    '00000000-0000-0000-0000-00000004E001';
DECLARE @EmployeeB uniqueidentifier =
    '00000000-0000-0000-0000-00000004E002';
DECLARE @NowUtc datetime2(7) = SYSUTCDATETIME();
DECLARE @EmployeeAInitialVersion binary(9) =
    CONVERT(binary(9), @NowUtc);
DECLARE @EmployeeBInitialVersion binary(9) =
    CONVERT(binary(9), DATEADD(second, 1, @NowUtc));
DECLARE @SmokeOrderDate date =
    CONVERT(date, DATEADD(hour, 7, @NowUtc));
DECLARE @AdminAlreadyExisted bit =
    CONVERT
    (
        bit,
        CASE WHEN EXISTS
        (
            SELECT 1 FROM [dbo].[Users] WHERE [Id] = @AdminUserId
        ) THEN 1 ELSE 0 END
    );

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Users]
    WHERE [Id] IN (@EmployeeUserA, @EmployeeUserB)
)
BEGIN
    THROW 53373, 'Reserved ERP-0004 smoke-test user IDs already exist.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Employees]
    WHERE [Id] IN (@EmployeeA, @EmployeeB)
)
BEGIN
    THROW 53374, 'Reserved ERP-0004 smoke-test employee IDs already exist.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    IF @AdminAlreadyExisted = CONVERT(bit, 0)
    BEGIN
        INSERT INTO [dbo].[Users]
        (
            [Id],
            [UserName],
            [Password],
            [CreatedAt],
            [LastModifiedAt],
            [CreatedBy],
            [LastModifiedBy],
            [IsDeleted],
            [DeletedAt],
            [ModerationStatus],
            [Profile]
        )
        VALUES
        (
            @AdminUserId,
            N'erp4.smoke.admin',
            N'ERP0004_NON_AUTHENTICATING_TEST_VALUE',
            @NowUtc,
            @NowUtc,
            @AdminUserId,
            @AdminUserId,
            CONVERT(bit, 0),
            NULL,
            1,
            NULL
        );
    END
    ELSE
    BEGIN
        UPDATE [dbo].[Users]
        SET
            [IsDeleted] = CONVERT(bit, 0),
            [DeletedAt] = NULL,
            [ModerationStatus] = 1
        WHERE [Id] = @AdminUserId;
    END;

    INSERT INTO [dbo].[Users]
    (
        [Id],
        [UserName],
        [Password],
        [CreatedAt],
        [LastModifiedAt],
        [CreatedBy],
        [LastModifiedBy],
        [IsDeleted],
        [DeletedAt],
        [ModerationStatus],
        [Profile]
    )
    VALUES
    (
        @EmployeeUserA,
        N'erp4.smoke.employee.a',
        N'ERP0004_NON_AUTHENTICATING_TEST_VALUE',
        @NowUtc,
        @NowUtc,
        @AdminUserId,
        @AdminUserId,
        CONVERT(bit, 0),
        NULL,
        1,
        NULL
    ),
    (
        @EmployeeUserB,
        N'erp4.smoke.employee.b',
        N'ERP0004_NON_AUTHENTICATING_TEST_VALUE',
        DATEADD(second, 1, @NowUtc),
        DATEADD(second, 1, @NowUtc),
        @AdminUserId,
        @AdminUserId,
        CONVERT(bit, 0),
        NULL,
        1,
        NULL
    );

    INSERT INTO [dbo].[Employees]
    (
        [Id],
        [EmployeeCode],
        [FullName],
        [Email],
        [PhoneNumber],
        [Address],
        [Gender],
        [UserId],
        [CreatedAt],
        [LastModifiedAt],
        [CreatedBy],
        [LastModifiedBy],
        [IsDeleted],
        [DeletedAt],
        [ModerationStatus]
    )
    VALUES
    (
        @EmployeeA,
        N'ERP4-A',
        N'ERP-0004 Smoke Employee A',
        N'erp4.a@example.invalid',
        N'0000000001',
        N'ERP-0004 smoke address A',
        0,
        NULL,
        @NowUtc,
        @NowUtc,
        @AdminUserId,
        @AdminUserId,
        CONVERT(bit, 0),
        NULL,
        1
    ),
    (
        @EmployeeB,
        N'ERP4-B',
        N'ERP-0004 Smoke Employee B',
        N'erp4.b@example.invalid',
        N'0000000002',
        N'ERP-0004 smoke address B',
        1,
        NULL,
        DATEADD(second, 1, @NowUtc),
        DATEADD(second, 1, @NowUtc),
        @AdminUserId,
        @AdminUserId,
        CONVERT(bit, 0),
        NULL,
        1
    );

    EXEC [dbo].[GetEmployeeAccountCandidates]
        @ActorUserId = @AdminUserId,
        @EmployeeId = @EmployeeA,
        @Search = N'erp4.smoke';

    EXEC [dbo].[BindEmployeeAccount]
        @ActorUserId = @AdminUserId,
        @EmployeeId = @EmployeeA,
        @UserId = @EmployeeUserA,
        @ExpectedEmployeeVersion = @EmployeeAInitialVersion;

    DECLARE @EmployeeAVersionAfterInitialBind binary(9) =
        (
            SELECT CONVERT(binary(9), [LastModifiedAt])
            FROM [dbo].[Employees]
            WHERE [Id] = @EmployeeA
        );

    IF @EmployeeAVersionAfterInitialBind = CONVERT(binary(9), @NowUtc)
    BEGIN
        THROW 53385, 'Initial account bind did not advance EmployeeVersion.', 1;
    END;

    EXEC [dbo].[BindEmployeeAccount]
        @ActorUserId = @AdminUserId,
        @EmployeeId = @EmployeeA,
        @UserId = @EmployeeUserB,
        @ExpectedEmployeeVersion = @EmployeeAVersionAfterInitialBind;

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Employees]
        WHERE [Id] = @EmployeeA AND [UserId] = @EmployeeUserB
    )
    BEGIN
        THROW 53386, 'BindEmployeeAccount did not rebind the employee.', 1;
    END;

    DECLARE @EmployeeAVersionAfterRebind binary(9) =
        (
            SELECT CONVERT(binary(9), [LastModifiedAt])
            FROM [dbo].[Employees]
            WHERE [Id] = @EmployeeA
        );

    IF @EmployeeAVersionAfterRebind = @EmployeeAVersionAfterInitialBind
    BEGIN
        THROW 53386, 'Account rebind did not advance EmployeeVersion.', 1;
    END;

    EXEC [dbo].[BindEmployeeAccount]
        @ActorUserId = @AdminUserId,
        @EmployeeId = @EmployeeA,
        @UserId = @EmployeeUserA,
        @ExpectedEmployeeVersion = @EmployeeAVersionAfterRebind;

    IF
    (
        SELECT CONVERT(binary(9), [LastModifiedAt])
        FROM [dbo].[Employees]
        WHERE [Id] = @EmployeeA
    ) = @EmployeeAVersionAfterRebind
    BEGIN
        THROW 53387, 'Account rebind-back did not advance EmployeeVersion.', 1;
    END;

    EXEC [dbo].[BindEmployeeAccount]
        @ActorUserId = @AdminUserId,
        @EmployeeId = @EmployeeB,
        @UserId = @EmployeeUserB,
        @ExpectedEmployeeVersion = @EmployeeBInitialVersion;

    EXEC [dbo].[GetSessionPrincipal]
        @ActorUserId = @AdminUserId;

    EXEC [dbo].[GetSessionPrincipal]
        @ActorUserId = @EmployeeUserA;

    EXEC [dbo].[GetSalesOrderEmployeeOptions]
        @ActorUserId = @AdminUserId,
        @Search = N'ERP4';

    DECLARE @Lines [dbo].[SalesOrderLineInput];

    INSERT INTO @Lines
    (
        [LineNumber],
        [ProductCode],
        [ProductName],
        [ProductCategory],
        [Quantity],
        [UnitPrice],
        [DiscountAmount]
    )
    VALUES
    (1, N'ERP4-PERCENT-100%', N'ERP-0004 Product One', N'Hardware', 2.000, 100.0000, 10.0000),
    (2, N'ERP4-PRODUCT-2', N'ERP-0004 Product Two', N'Service', 1.500, 200.0000, 0.0000);

    DECLARE @CreateResult TABLE
    (
        [OrderId] uniqueidentifier NOT NULL,
        [OrderNumber] varchar(20) NOT NULL,
        [Status] tinyint NOT NULL,
        [ItemCount] int NOT NULL,
        [TotalQuantity] decimal(18, 3) NOT NULL,
        [SubtotalAmount] decimal(19, 4) NOT NULL,
        [DiscountAmount] decimal(19, 4) NOT NULL,
        [TotalAmount] decimal(19, 4) NOT NULL,
        [CurrencyCode] char(3) NOT NULL,
        [CreatedAt] datetime2(7) NOT NULL,
        [RowVersion] binary(8) NOT NULL,
        [WasAlreadyCreated] bit NOT NULL
    );

    DECLARE @ClientRequestId uniqueidentifier =
        '00000000-0000-0000-0000-00000004C001';
    DECLARE @PayloadHash binary(32) =
        CONVERT(binary(32), HASHBYTES('SHA2_256', N'ERP-0004-SMOKE-PAYLOAD-1'));

    INSERT INTO @CreateResult
    EXEC [dbo].[CreateSalesOrder]
        @ActorUserId = @EmployeeUserA,
        @ClientRequestId = @ClientRequestId,
        @PayloadHash = @PayloadHash,
        @CustomerCode = N'ERP4-CUSTOMER',
        @CustomerName = N'ERP-0004 Smoke Customer',
        @OrderDate = @SmokeOrderDate,
        @Notes = N'Rollback-only smoke order',
        @Lines = @Lines;

    DECLARE @OrderId uniqueidentifier =
        (SELECT TOP (1) [OrderId] FROM @CreateResult);
    DECLARE @PendingRowVersion binary(8) =
        (SELECT TOP (1) [RowVersion] FROM @CreateResult);

    IF NOT EXISTS
    (
        SELECT 1
        FROM @CreateResult
        WHERE
            [Status] = 0
            AND [ItemCount] = 2
            AND [TotalQuantity] = CONVERT(decimal(18, 3), 3.500)
            AND [SubtotalAmount] = CONVERT(decimal(19, 4), 500.0000)
            AND [DiscountAmount] = CONVERT(decimal(19, 4), 10.0000)
            AND [TotalAmount] = CONVERT(decimal(19, 4), 490.0000)
            AND [WasAlreadyCreated] = CONVERT(bit, 0)
    )
    BEGIN
        THROW 53375, 'CreateSalesOrder returned incorrect pending-order totals.', 1;
    END;

    DELETE FROM @CreateResult;

    INSERT INTO @CreateResult
    EXEC [dbo].[CreateSalesOrder]
        @ActorUserId = @EmployeeUserA,
        @ClientRequestId = @ClientRequestId,
        @PayloadHash = @PayloadHash,
        @CustomerCode = N'ERP4-CUSTOMER',
        @CustomerName = N'ERP-0004 Smoke Customer',
        @OrderDate = @SmokeOrderDate,
        @Notes = N'Rollback-only smoke order',
        @Lines = @Lines;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @CreateResult
        WHERE
            [OrderId] = @OrderId
            AND [WasAlreadyCreated] = CONVERT(bit, 1)
    )
       OR
       (
           SELECT COUNT_BIG(1)
           FROM [dbo].[SalesOrders]
           WHERE
               [EmployeeId] = @EmployeeA
               AND [ClientRequestId] = @ClientRequestId
       ) <> 1
    BEGIN
        THROW 53376, 'CreateSalesOrder same-payload retry is not idempotent.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM [dbo].[SalesOrders]
        WHERE [Id] = @OrderId AND [Status] = 1
    )
    BEGIN
        THROW 53377, 'A pending order was counted as approved before review.', 1;
    END;

    DECLARE @ApproveResult TABLE
    (
        [OrderId] uniqueidentifier NOT NULL,
        [OrderNumber] varchar(20) NOT NULL,
        [Status] tinyint NOT NULL,
        [TotalAmount] decimal(19, 4) NOT NULL,
        [CurrencyCode] char(3) NOT NULL,
        [ApprovedAt] datetime2(7) NOT NULL,
        [ApprovedByUserId] uniqueidentifier NOT NULL,
        [RowVersion] binary(8) NOT NULL,
        [WasAlreadyApproved] bit NOT NULL
    );

    INSERT INTO @ApproveResult
    EXEC [dbo].[ApproveSalesOrder]
        @ActorUserId = @AdminUserId,
        @OrderId = @OrderId,
        @ExpectedRowVersion = @PendingRowVersion,
        @ReviewNote = N'ERP-0004 smoke approval';

    DECLARE @ApprovedAt datetime2(7) =
        (SELECT TOP (1) [ApprovedAt] FROM @ApproveResult);
    DECLARE @ReportFromApprovedAt datetime2(7) =
        DATEADD(day, -1, @ApprovedAt);
    DECLARE @ReportToApprovedAtExclusive datetime2(7) =
        DATEADD(day, 1, @ApprovedAt);
    DECLARE @ReportMinimumAmount decimal(19, 4) =
        CONVERT(decimal(19, 4), 0);
    DECLARE @ReportMaximumAmount decimal(19, 4) =
        CONVERT(decimal(19, 4), 1000);

    IF NOT EXISTS
    (
        SELECT 1
        FROM @ApproveResult
        WHERE
            [Status] = 1
            AND [ApprovedByUserId] = @AdminUserId
            AND [WasAlreadyApproved] = CONVERT(bit, 0)
    )
    BEGIN
        THROW 53378, 'ApproveSalesOrder did not approve the pending order.', 1;
    END;

    DELETE FROM @ApproveResult;

    INSERT INTO @ApproveResult
    EXEC [dbo].[ApproveSalesOrder]
        @ActorUserId = @AdminUserId,
        @OrderId = @OrderId,
        @ExpectedRowVersion = @PendingRowVersion,
        @ReviewNote = N'ERP-0004 smoke approval retry';

    IF NOT EXISTS
    (
        SELECT 1
        FROM @ApproveResult
        WHERE [WasAlreadyApproved] = CONVERT(bit, 1)
    )
       OR
       (
           SELECT COUNT_BIG(1)
           FROM [dbo].[SalesOrderStatusHistory]
           WHERE [SalesOrderId] = @OrderId AND [ToStatus] = 1
       ) <> 1
    BEGIN
        THROW 53379, 'ApproveSalesOrder same-decision retry is not idempotent.', 1;
    END;

    DECLARE @RejectLines [dbo].[SalesOrderLineInput];

    INSERT INTO @RejectLines
    (
        [LineNumber],
        [ProductCode],
        [ProductName],
        [ProductCategory],
        [Quantity],
        [UnitPrice],
        [DiscountAmount]
    )
    VALUES
    (1, N'ERP4-REJECTED', N'ERP-0004 Rejected Product', N'Other', 1.000, 50.0000, 0.0000);

    DECLARE @RejectedPayloadHash binary(32) =
        CONVERT(binary(32), HASHBYTES('SHA2_256', N'ERP-0004-SMOKE-PAYLOAD-2'));

    DELETE FROM @CreateResult;

    INSERT INTO @CreateResult
    EXEC [dbo].[CreateSalesOrder]
        @ActorUserId = @EmployeeUserA,
        @ClientRequestId = '00000000-0000-0000-0000-00000004C002',
        @PayloadHash = @RejectedPayloadHash,
        @CustomerCode = N'ERP4-REJECTED',
        @CustomerName = N'ERP-0004 Rejected Customer',
        @OrderDate = @SmokeOrderDate,
        @Notes = NULL,
        @Lines = @RejectLines;

    DECLARE @RejectedOrderId uniqueidentifier =
        (SELECT TOP (1) [OrderId] FROM @CreateResult);
    DECLARE @RejectedPendingVersion binary(8) =
        (SELECT TOP (1) [RowVersion] FROM @CreateResult);

    DECLARE @RejectResult TABLE
    (
        [OrderId] uniqueidentifier NOT NULL,
        [OrderNumber] varchar(20) NOT NULL,
        [Status] tinyint NOT NULL,
        [TotalAmount] decimal(19, 4) NOT NULL,
        [CurrencyCode] char(3) NOT NULL,
        [RejectedAt] datetime2(7) NOT NULL,
        [RejectedByUserId] uniqueidentifier NOT NULL,
        [ReviewNote] nvarchar(500) NOT NULL,
        [RowVersion] binary(8) NOT NULL,
        [WasAlreadyRejected] bit NOT NULL
    );

    INSERT INTO @RejectResult
    EXEC [dbo].[RejectSalesOrder]
        @ActorUserId = @AdminUserId,
        @OrderId = @RejectedOrderId,
        @ExpectedRowVersion = @RejectedPendingVersion,
        @ReviewNote = N'ERP-0004 smoke rejection';

    DELETE FROM @RejectResult;

    INSERT INTO @RejectResult
    EXEC [dbo].[RejectSalesOrder]
        @ActorUserId = @AdminUserId,
        @OrderId = @RejectedOrderId,
        @ExpectedRowVersion = @RejectedPendingVersion,
        @ReviewNote = N'ERP-0004 smoke rejection retry';

    IF NOT EXISTS
    (
        SELECT 1
        FROM @RejectResult
        WHERE [WasAlreadyRejected] = CONVERT(bit, 1)
    )
       OR
       (
           SELECT COUNT_BIG(1)
           FROM [dbo].[SalesOrderStatusHistory]
           WHERE [SalesOrderId] = @RejectedOrderId AND [ToStatus] = 2
       ) <> 1
    BEGIN
        THROW 53380, 'RejectSalesOrder same-decision retry is not idempotent.', 1;
    END;

    IF
    (
        SELECT COUNT_BIG(1)
        FROM [dbo].[SalesOrders]
        WHERE
            [EmployeeId] = @EmployeeA
            AND [Status] = 1
            AND [ApprovedAt] >= DATEADD(day, -1, @ApprovedAt)
            AND [ApprovedAt] < DATEADD(day, 1, @ApprovedAt)
    ) <> 1
    BEGIN
        THROW 53381, 'ApprovedAt recognition included a non-approved order or missed the approved order.', 1;
    END;

    EXEC [dbo].[GetListEmployee]
        @Search = N'ERP4',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = 'FULLNAME',
        @SortDirection = 'ASCENDING';

    EXEC [dbo].[GetListSalesOrder]
        @ActorUserId = @EmployeeUserA,
        @Search = N'ERP4',
        @Status = NULL,
        @EmployeeId = NULL,
        @FromApprovedAt = NULL,
        @ToApprovedAtExclusive = NULL,
        @MinTotalAmount = NULL,
        @MaxTotalAmount = NULL,
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = 'CREATEDAT',
        @SortDirection = 'DESCENDING';

    EXEC [dbo].[GetSalesOrderDetail]
        @ActorUserId = @EmployeeUserA,
        @OrderId = @OrderId;

    EXEC [dbo].[GetEmployeeSalesReport]
        @ActorUserId = @EmployeeUserA,
        @EmployeeId = NULL,
        @FromApprovedAt = @ReportFromApprovedAt,
        @ToApprovedAtExclusive = @ReportToApprovedAtExclusive,
        @GroupBy = 'DAY',
        @Search = N'ERP4',
        @ProductKeyword = N'%',
        @MinTotalAmount = @ReportMinimumAmount,
        @MaxTotalAmount = @ReportMaximumAmount,
        @Mode = 'PAGE',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = 'APPROVEDAT',
        @SortDirection = 'DESCENDING';

    EXEC [dbo].[GetEmployeeSalesReport]
        @ActorUserId = @AdminUserId,
        @EmployeeId = @EmployeeA,
        @FromApprovedAt = @ReportFromApprovedAt,
        @ToApprovedAtExclusive = @ReportToApprovedAtExclusive,
        @GroupBy = 'MONTH',
        @Search = NULL,
        @ProductKeyword = NULL,
        @MinTotalAmount = NULL,
        @MaxTotalAmount = NULL,
        @Mode = 'EXPORT',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = 'APPROVEDAT',
        @SortDirection = 'ASCENDING';

    ROLLBACK TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Users]
    WHERE [Id] IN (@EmployeeUserA, @EmployeeUserB)
)
   OR EXISTS
   (
       SELECT 1
       FROM [dbo].[Employees]
       WHERE [Id] IN (@EmployeeA, @EmployeeB)
   )
   OR EXISTS
   (
       SELECT 1
       FROM [dbo].[SalesOrders]
       WHERE [CreatedByUserId] IN (@EmployeeUserA, @EmployeeUserB)
   )
BEGIN
    THROW 53382, 'ERP-0004 smoke-test rows remained after rollback.', 1;
END;

PRINT N'ERP-0004 transactional smoke test passed; test data was rolled back.';
PRINT N'SalesOrderNumberSequence gaps after rollback are expected and valid.';
GO
