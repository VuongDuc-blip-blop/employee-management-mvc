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
    THROW 53320, 'ERP-0004 procedure deployment is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 53321, 'ERP-0004 procedure deployment is connected to the wrong database.', 1;
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
    THROW 53322, 'ERP-0004 schema ownership token is missing or wrong. Run script 005 first.', 1;
END;

IF OBJECT_ID(N'dbo.SalesOrders', N'U') IS NULL
   OR OBJECT_ID(N'dbo.SalesOrderItems', N'U') IS NULL
   OR OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U') IS NULL
BEGIN
    THROW 53323, 'ERP-0004 sales-order tables are missing. Run script 005 first.', 1;
END;
GO

IF TYPE_ID(N'dbo.SalesOrderLineInput') IS NULL
BEGIN
    EXEC(N'
        CREATE TYPE [dbo].[SalesOrderLineInput] AS TABLE
        (
            [LineNumber] int NOT NULL,
            [ProductCode] nvarchar(50) NOT NULL,
            [ProductName] nvarchar(200) NOT NULL,
            [ProductCategory] nvarchar(100) NULL,
            [Quantity] decimal(18, 3) NOT NULL,
            [UnitPrice] decimal(19, 4) NOT NULL,
            [DiscountAmount] decimal(19, 4) NOT NULL,
            PRIMARY KEY CLUSTERED ([LineNumber] ASC)
        );');
END;
GO

IF OBJECT_ID(N'dbo.SalesOrderNumberSequence', N'SO') IS NULL
BEGIN
    EXEC(N'
        CREATE SEQUENCE [dbo].[SalesOrderNumberSequence]
            AS bigint
            START WITH 1
            INCREMENT BY 1
            MINVALUE 1
            NO MAXVALUE
            NO CYCLE
            CACHE 50;');
END;
GO

IF OBJECT_ID(N'dbo.GetListEmployee', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetListEmployee] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[GetListEmployee]
    @Search nvarchar(256) = NULL,
    @PageNumber int,
    @PageSize int,
    @SortColumn varchar(30),
    @SortDirection varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- ERP-0004: prerequisite for the existing employee-management caller.
    IF @PageNumber IS NULL OR @PageNumber < 1
    BEGIN
        THROW 53400, 'PageNumber must be greater than or equal to 1.', 1;
    END;

    IF @PageSize IS NULL OR @PageSize < 1 OR @PageSize > 200
    BEGIN
        THROW 53400, 'PageSize must be between 1 and 200.', 1;
    END;

    SET @SortColumn = UPPER(LTRIM(RTRIM(COALESCE(@SortColumn, ''))));
    SET @SortDirection = UPPER(LTRIM(RTRIM(COALESCE(@SortDirection, ''))));

    IF @SortColumn NOT IN
       ('EMPLOYEECODE', 'FULLNAME', 'EMAIL', 'CREATEDAT')
    BEGIN
        THROW 53400, 'SortColumn is not allowed.', 1;
    END;

    IF @SortDirection NOT IN ('ASCENDING', 'DESCENDING')
    BEGIN
        THROW 53400, 'SortDirection must be ASCENDING or DESCENDING.', 1;
    END;

    DECLARE @NormalizedSearch nvarchar(256) =
        NULLIF(LTRIM(RTRIM(@Search)), N'');
    DECLARE @SearchPattern nvarchar(514) = NULL;

    IF @NormalizedSearch IS NOT NULL
    BEGIN
        SET @SearchPattern =
            N'%'
            + REPLACE
              (
                  REPLACE
                  (
                      REPLACE
                      (
                          REPLACE(@NormalizedSearch, N'~', N'~~'),
                          N'%', N'~%'
                      ),
                      N'_', N'~_'
                  ),
                  N'[', N'~['
              )
            + N'%';
    END;

    DECLARE @Offset bigint =
        (CONVERT(bigint, @PageNumber) - CONVERT(bigint, 1))
        * CONVERT(bigint, @PageSize);

    SELECT
        [E].[Id],
        [E].[EmployeeCode],
        [E].[FullName],
        [E].[Email],
        [E].[PhoneNumber],
        [E].[Address],
        [E].[Gender],
        [E].[ModerationStatus],
        [E].[CreatedAt]
    FROM [dbo].[Employees] AS [E]
    WHERE
        [E].[IsDeleted] = CONVERT(bit, 0)
        AND
        (
            @SearchPattern IS NULL
            OR [E].[EmployeeCode] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[FullName] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[Email] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[PhoneNumber] LIKE @SearchPattern ESCAPE N'~'
        )
    ORDER BY
        CASE WHEN @SortColumn = 'EMPLOYEECODE' AND @SortDirection = 'ASCENDING'
            THEN [E].[EmployeeCode] END ASC,
        CASE WHEN @SortColumn = 'EMPLOYEECODE' AND @SortDirection = 'DESCENDING'
            THEN [E].[EmployeeCode] END DESC,
        CASE WHEN @SortColumn = 'FULLNAME' AND @SortDirection = 'ASCENDING'
            THEN [E].[FullName] END ASC,
        CASE WHEN @SortColumn = 'FULLNAME' AND @SortDirection = 'DESCENDING'
            THEN [E].[FullName] END DESC,
        CASE WHEN @SortColumn = 'EMAIL' AND @SortDirection = 'ASCENDING'
            THEN [E].[Email] END ASC,
        CASE WHEN @SortColumn = 'EMAIL' AND @SortDirection = 'DESCENDING'
            THEN [E].[Email] END DESC,
        CASE WHEN @SortColumn = 'CREATEDAT' AND @SortDirection = 'ASCENDING'
            THEN [E].[CreatedAt] END ASC,
        CASE WHEN @SortColumn = 'CREATEDAT' AND @SortDirection = 'DESCENDING'
            THEN [E].[CreatedAt] END DESC,
        [E].[Id] ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT_BIG(1) AS [TotalCount]
    FROM [dbo].[Employees] AS [E]
    WHERE
        [E].[IsDeleted] = CONVERT(bit, 0)
        AND
        (
            @SearchPattern IS NULL
            OR [E].[EmployeeCode] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[FullName] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[Email] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[PhoneNumber] LIKE @SearchPattern ESCAPE N'~'
        );
END;
GO

IF OBJECT_ID(N'dbo.GetSessionPrincipal', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetSessionPrincipal] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[GetSessionPrincipal]
    @ActorUserId uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    -- ERP-0004: server-side principal projection; never returns Password/Profile.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';

    IF @ActorUserId IS NULL
       OR NOT EXISTS
       (
           SELECT 1
           FROM [dbo].[Users] AS [U]
           WHERE
               [U].[Id] = @ActorUserId
               AND [U].[IsDeleted] = CONVERT(bit, 0)
               AND [U].[ModerationStatus] = 1
       )
    BEGIN
        THROW 53401, 'The session principal is not active and approved.', 1;
    END;

    SELECT
        [U].[Id] AS [UserId],
        [U].[UserName],
        CASE
            WHEN [U].[Id] = @SeededAdminId THEN 'ADMIN'
            WHEN [E].[Id] IS NOT NULL THEN 'EMPLOYEE'
            ELSE 'UNASSIGNED'
        END AS [PrincipalKind],
        CONVERT(bit, CASE WHEN [U].[Id] = @SeededAdminId THEN 1 ELSE 0 END)
            AS [IsAdmin],
        [E].[Id] AS [EmployeeId],
        [E].[EmployeeCode],
        [E].[FullName] AS [EmployeeFullName],
        CONVERT
        (
            bit,
            CASE
                WHEN [U].[Id] <> @SeededAdminId AND [E].[Id] IS NOT NULL
                    THEN 1
                ELSE 0
            END
        ) AS [CanCreateOrders],
        CONVERT(bit, CASE WHEN [U].[Id] = @SeededAdminId THEN 1 ELSE 0 END)
            AS [CanManageOrders],
        CONVERT
        (
            bit,
            CASE
                WHEN [U].[Id] <> @SeededAdminId AND [E].[Id] IS NOT NULL
                    THEN 1
                ELSE 0
            END
        ) AS [CanViewSelfSales]
    FROM [dbo].[Users] AS [U]
    LEFT JOIN [dbo].[Employees] AS [E]
        ON [E].[UserId] = [U].[Id]
        AND [E].[IsDeleted] = CONVERT(bit, 0)
        AND [E].[ModerationStatus] = 1
    WHERE [U].[Id] = @ActorUserId;
END;
GO

IF OBJECT_ID(N'dbo.GetEmployeeAccountCandidates', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetEmployeeAccountCandidates] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[GetEmployeeAccountCandidates]
    @ActorUserId uniqueidentifier,
    @EmployeeId uniqueidentifier,
    @Search nvarchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ERP-0004: admin-only account-binding read contract.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session user is missing, inactive, or unapproved.', 1;
    END;

    IF @ActorUserId <> @SeededAdminId
    BEGIN
        THROW 53403, 'Only the seeded admin can inspect employee account bindings.', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Employees] AS [E]
        WHERE
            [E].[Id] = @EmployeeId
            AND [E].[IsDeleted] = CONVERT(bit, 0)
            AND [E].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53404, 'The active approved employee was not found.', 1;
    END;

    DECLARE @NormalizedSearch nvarchar(100) =
        NULLIF(LTRIM(RTRIM(@Search)), N'');
    DECLARE @SearchPattern nvarchar(208) = NULL;

    IF @NormalizedSearch IS NOT NULL
    BEGIN
        SET @SearchPattern =
            N'%'
            + REPLACE
              (
                  REPLACE
                  (
                      REPLACE
                      (
                          REPLACE(@NormalizedSearch, N'~', N'~~'),
                          N'%', N'~%'
                      ),
                      N'_', N'~_'
                  ),
                  N'[', N'~['
              )
            + N'%';
    END;

    SELECT
        [E].[Id] AS [EmployeeId],
        [E].[EmployeeCode],
        [E].[FullName] AS [EmployeeFullName],
        [E].[UserId] AS [CurrentUserId],
        [CurrentUser].[UserName] AS [CurrentUserName],
        CONVERT(binary(9), [E].[LastModifiedAt]) AS [EmployeeVersion]
    FROM [dbo].[Employees] AS [E]
    LEFT JOIN [dbo].[Users] AS [CurrentUser]
        ON [CurrentUser].[Id] = [E].[UserId]
    WHERE [E].[Id] = @EmployeeId;

    SELECT TOP (100)
        [U].[Id] AS [UserId],
        [U].[UserName],
        [BoundEmployee].[Id] AS [BoundEmployeeId],
        [BoundEmployee].[EmployeeCode] AS [BoundEmployeeCode],
        [BoundEmployee].[FullName] AS [BoundEmployeeFullName]
    FROM [dbo].[Users] AS [U]
    LEFT JOIN [dbo].[Employees] AS [BoundEmployee]
        ON [BoundEmployee].[UserId] = [U].[Id]
        AND [BoundEmployee].[IsDeleted] = CONVERT(bit, 0)
    WHERE
        [U].[Id] <> @SeededAdminId
        AND [U].[IsDeleted] = CONVERT(bit, 0)
        AND [U].[ModerationStatus] = 1
        AND
        (
            [BoundEmployee].[Id] IS NULL
            OR [BoundEmployee].[Id] = @EmployeeId
        )
        AND
        (
            @SearchPattern IS NULL
            OR [U].[UserName] LIKE @SearchPattern ESCAPE N'~'
        )
    ORDER BY [U].[UserName] ASC, [U].[Id] ASC;
END;
GO

IF OBJECT_ID(N'dbo.BindEmployeeAccount', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[BindEmployeeAccount] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[BindEmployeeAccount]
    @ActorUserId uniqueidentifier,
    @EmployeeId uniqueidentifier,
    @UserId uniqueidentifier,
    @ExpectedEmployeeVersion binary(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- ERP-0004: admin-only account bind/rebind with optimistic concurrency.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';
    DECLARE @NowUtc datetime2(7) = SYSUTCDATETIME();

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session user is missing, inactive, or unapproved.', 1;
    END;

    IF @ActorUserId <> @SeededAdminId
    BEGIN
        THROW 53403, 'Only the seeded admin can bind employee accounts.', 1;
    END;

    IF @UserId IS NULL
    BEGIN
        THROW 53400, 'UserId is required for account bind or rebind.', 1;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @ActualEmployeeVersion binary(9);

        SELECT @ActualEmployeeVersion = CONVERT(binary(9), [E].[LastModifiedAt])
        FROM [dbo].[Employees] AS [E] WITH (UPDLOCK, HOLDLOCK)
        WHERE
            [E].[Id] = @EmployeeId
            AND [E].[IsDeleted] = CONVERT(bit, 0)
            AND [E].[ModerationStatus] = 1;

        IF @ActualEmployeeVersion IS NULL
        BEGIN
            THROW 53404, 'The active approved employee was not found.', 1;
        END;

        IF @ExpectedEmployeeVersion IS NULL
           OR @ActualEmployeeVersion <> @ExpectedEmployeeVersion
        BEGIN
            THROW 53409, 'The employee account binding changed. Reload and try again.', 1;
        END;

        IF @UserId IS NOT NULL
        BEGIN
            IF @UserId = @SeededAdminId
               OR NOT EXISTS
               (
                   SELECT 1
                   FROM [dbo].[Users] AS [U]
                   WHERE
                       [U].[Id] = @UserId
                       AND [U].[IsDeleted] = CONVERT(bit, 0)
                       AND [U].[ModerationStatus] = 1
               )
            BEGIN
                THROW 53400, 'The selected employee user is not active and approved.', 1;
            END;

            IF EXISTS
            (
                SELECT 1
                FROM [dbo].[Employees] AS [OtherEmployee] WITH (UPDLOCK, HOLDLOCK)
                WHERE
                    [OtherEmployee].[UserId] = @UserId
                    AND [OtherEmployee].[Id] <> @EmployeeId
                    AND [OtherEmployee].[IsDeleted] = CONVERT(bit, 0)
            )
            BEGIN
                THROW 53409, 'The selected user is already bound to another active employee.', 1;
            END;
        END;

        UPDATE [dbo].[Employees]
        SET
            [UserId] = @UserId,
            [LastModifiedAt] =
                CASE
                    WHEN @NowUtc <= [LastModifiedAt]
                        THEN DATEADD(nanosecond, 100, [LastModifiedAt])
                    ELSE @NowUtc
                END,
            [LastModifiedBy] = @ActorUserId
        WHERE [Id] = @EmployeeId;

        SELECT
            [E].[Id] AS [EmployeeId],
            [E].[UserId],
            [U].[UserName],
            [E].[EmployeeCode],
            [E].[FullName] AS [EmployeeFullName],
            CONVERT(binary(9), [E].[LastModifiedAt]) AS [EmployeeVersion]
        FROM [dbo].[Employees] AS [E]
        LEFT JOIN [dbo].[Users] AS [U]
            ON [U].[Id] = [E].[UserId]
        WHERE [E].[Id] = @EmployeeId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        THROW;
    END CATCH;
END;
GO

IF OBJECT_ID(N'dbo.GetSalesOrderEmployeeOptions', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetSalesOrderEmployeeOptions] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[GetSalesOrderEmployeeOptions]
    @ActorUserId uniqueidentifier,
    @Search nvarchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ERP-0004: bounded admin picker for order/report filters.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session user is missing, inactive, or unapproved.', 1;
    END;

    IF @ActorUserId <> @SeededAdminId
    BEGIN
        THROW 53403, 'Only the seeded admin can load employee filter options.', 1;
    END;

    DECLARE @NormalizedSearch nvarchar(100) =
        NULLIF(LTRIM(RTRIM(@Search)), N'');
    DECLARE @SearchPattern nvarchar(208) = NULL;

    IF @NormalizedSearch IS NOT NULL
    BEGIN
        SET @SearchPattern =
            N'%'
            + REPLACE
              (
                  REPLACE
                  (
                      REPLACE
                      (
                          REPLACE(@NormalizedSearch, N'~', N'~~'),
                          N'%', N'~%'
                      ),
                      N'_', N'~_'
                  ),
                  N'[', N'~['
              )
            + N'%';
    END;

    SELECT TOP (100)
        [E].[Id] AS [EmployeeId],
        [E].[EmployeeCode],
        [E].[FullName] AS [EmployeeFullName]
    FROM [dbo].[Employees] AS [E]
    WHERE
        [E].[IsDeleted] = CONVERT(bit, 0)
        AND [E].[ModerationStatus] = 1
        AND
        (
            @SearchPattern IS NULL
            OR [E].[EmployeeCode] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[FullName] LIKE @SearchPattern ESCAPE N'~'
        )
    ORDER BY [E].[FullName] ASC, [E].[EmployeeCode] ASC, [E].[Id] ASC;
END;
GO

IF OBJECT_ID(N'dbo.CreateSalesOrder', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[CreateSalesOrder] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[CreateSalesOrder]
    @ActorUserId uniqueidentifier,
    @ClientRequestId uniqueidentifier,
    @PayloadHash binary(32),
    @CustomerCode nvarchar(50) = NULL,
    @CustomerName nvarchar(200),
    @OrderDate date,
    @Notes nvarchar(1000) = NULL,
    @Lines [dbo].[SalesOrderLineInput] READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- ERP-0004: employee creates one immutable, retry-idempotent pending order.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';
    DECLARE @EmployeeId uniqueidentifier;
    DECLARE @NowUtc datetime2(7) = SYSUTCDATETIME();
    DECLARE @NormalizedCustomerCode nvarchar(50) =
        NULLIF(LTRIM(RTRIM(@CustomerCode)), N'');
    DECLARE @NormalizedCustomerName nvarchar(200) =
        NULLIF(LTRIM(RTRIM(@CustomerName)), N'');
    DECLARE @NormalizedNotes nvarchar(1000) =
        NULLIF(LTRIM(RTRIM(@Notes)), N'');

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session principal is not active and approved.', 1;
    END;

    IF @ActorUserId = @SeededAdminId
    BEGIN
        THROW 53403, 'The seeded admin cannot create an employee sales order.', 1;
    END;

    SELECT @EmployeeId = [E].[Id]
    FROM [dbo].[Employees] AS [E]
    WHERE
        [E].[UserId] = @ActorUserId
        AND [E].[IsDeleted] = CONVERT(bit, 0)
        AND [E].[ModerationStatus] = 1;

    IF @EmployeeId IS NULL
    BEGIN
        THROW 53403, 'The session user is not bound to an active approved employee.', 1;
    END;

    IF @ClientRequestId IS NULL OR @PayloadHash IS NULL
    BEGIN
        THROW 53400, 'ClientRequestId and PayloadHash are required.', 1;
    END;

    IF @NormalizedCustomerName IS NULL
       OR LEN(@NormalizedCustomerName) > 200
    BEGIN
        THROW 53400, 'CustomerName is required and cannot exceed 200 characters.', 1;
    END;

    IF @OrderDate IS NULL
       OR @OrderDate > CONVERT(date, DATEADD(hour, 7, @NowUtc))
    BEGIN
        THROW 53400, 'OrderDate is required and cannot be in the future.', 1;
    END;

    IF @NormalizedCustomerCode IS NOT NULL
       AND LEN(@NormalizedCustomerCode) > 50
    BEGIN
        THROW 53400, 'CustomerCode cannot exceed 50 characters.', 1;
    END;

    IF @NormalizedNotes IS NOT NULL AND LEN(@NormalizedNotes) > 1000
    BEGIN
        THROW 53400, 'Notes cannot exceed 1000 characters.', 1;
    END;

    DECLARE @ItemCount int =
        (SELECT COUNT(1) FROM @Lines);

    IF @ItemCount < 1 OR @ItemCount > 100
    BEGIN
        THROW 53400, 'A sales order must contain between 1 and 100 lines.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM @Lines AS [L]
        WHERE
            [L].[LineNumber] < 1
            OR [L].[LineNumber] > 100
            OR NULLIF(LTRIM(RTRIM([L].[ProductCode])), N'') IS NULL
            OR NULLIF(LTRIM(RTRIM([L].[ProductName])), N'') IS NULL
            OR [L].[Quantity] <= CONVERT(decimal(18, 3), 0)
            OR [L].[Quantity] > CONVERT(decimal(18, 3), 999999.999)
            OR [L].[UnitPrice] < CONVERT(decimal(19, 4), 0)
            OR [L].[UnitPrice] > CONVERT(decimal(19, 4), 999999999)
            OR [L].[UnitPrice] <> ROUND([L].[UnitPrice], 0)
            OR [L].[DiscountAmount] < CONVERT(decimal(19, 4), 0)
            OR [L].[DiscountAmount] > CONVERT(decimal(19, 4), 999999999999999)
            OR [L].[DiscountAmount] <> ROUND([L].[DiscountAmount], 0)
            OR [L].[Quantity] * [L].[UnitPrice] <> ROUND([L].[Quantity] * [L].[UnitPrice], 0)
            OR [L].[DiscountAmount] > [L].[Quantity] * [L].[UnitPrice]
    )
    BEGIN
        THROW 53400, 'One or more sales-order lines are invalid.', 1;
    END;

    DECLARE @TotalQuantity decimal(18, 3);
    DECLARE @SubtotalAmount decimal(19, 4);
    DECLARE @DiscountAmount decimal(19, 4);
    DECLARE @TotalAmount decimal(19, 4);

    BEGIN TRY
        SELECT
            @TotalQuantity = CONVERT(decimal(18, 3), SUM([L].[Quantity])),
            @SubtotalAmount = CONVERT
            (
                decimal(19, 4),
                SUM(CONVERT(decimal(19, 4), ROUND([L].[Quantity] * [L].[UnitPrice], 4)))
            ),
            @DiscountAmount = CONVERT
            (
                decimal(19, 4),
                SUM([L].[DiscountAmount])
            ),
            @TotalAmount = CONVERT
            (
                decimal(19, 4),
                SUM
                (
                    CONVERT
                    (
                        decimal(19, 4),
                        ROUND
                        (
                            ([L].[Quantity] * [L].[UnitPrice])
                            - [L].[DiscountAmount],
                            4
                        )
                    )
                )
            )
        FROM @Lines AS [L];
    END TRY
    BEGIN CATCH
        THROW 53400, 'Sales-order totals exceed the supported numeric range.', 1;
    END CATCH;

    IF @TotalQuantity IS NULL
       OR @TotalQuantity <= CONVERT(decimal(18, 3), 0)
       OR @SubtotalAmount IS NULL
       OR @DiscountAmount IS NULL
       OR @TotalAmount IS NULL
       OR @DiscountAmount > @SubtotalAmount
       OR @SubtotalAmount <> ROUND(@SubtotalAmount, 0)
       OR @DiscountAmount <> ROUND(@DiscountAmount, 0)
       OR @TotalAmount <> ROUND(@TotalAmount, 0)
       OR @TotalAmount <= CONVERT(decimal(19, 4), 0)
       OR @TotalAmount <> @SubtotalAmount - @DiscountAmount
    BEGIN
        THROW 53400, 'Sales-order totals are invalid.', 1;
    END;

    DECLARE @SequenceValue bigint;
    DECLARE @OrderNumber varchar(20);
    DECLARE @CreatedOrder TABLE ([Id] uniqueidentifier NOT NULL);
    DECLARE @OrderId uniqueidentifier;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @ExistingPayloadHash binary(32);

        SELECT
            @OrderId = [O].[Id],
            @ExistingPayloadHash = [O].[PayloadHash]
        FROM [dbo].[SalesOrders] AS [O] WITH (UPDLOCK, HOLDLOCK)
        WHERE
            [O].[EmployeeId] = @EmployeeId
            AND [O].[ClientRequestId] = @ClientRequestId;

        IF @OrderId IS NOT NULL
        BEGIN
            IF @ExistingPayloadHash <> @PayloadHash
            BEGIN
                THROW 53409, 'ClientRequestId was already used with a different payload.', 1;
            END;

            SELECT
                [O].[Id] AS [OrderId],
                [O].[OrderNumber],
                [O].[Status],
                [O].[ItemCount],
                [O].[TotalQuantity],
                [O].[SubtotalAmount],
                [O].[DiscountAmount],
                [O].[TotalAmount],
                [O].[CurrencyCode],
                [O].[CreatedAt],
                CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion],
                CONVERT(bit, 1) AS [WasAlreadyCreated]
            FROM [dbo].[SalesOrders] AS [O]
            WHERE [O].[Id] = @OrderId;

            COMMIT TRANSACTION;
            RETURN;
        END;

        SELECT @SequenceValue =
            NEXT VALUE FOR [dbo].[SalesOrderNumberSequence];

        IF @SequenceValue > 999999999999
        BEGIN
            THROW 53409, 'The sales-order number sequence is exhausted.', 1;
        END;

        SET @OrderNumber =
            'SO-' + RIGHT(REPLICATE('0', 12) + CONVERT(varchar(20), @SequenceValue), 12);

        INSERT INTO [dbo].[SalesOrders]
        (
            [OrderNumber],
            [ClientRequestId],
            [PayloadHash],
            [EmployeeId],
            [CustomerCode],
            [CustomerName],
            [OrderDate],
            [Status],
            [Notes],
            [ItemCount],
            [TotalQuantity],
            [SubtotalAmount],
            [DiscountAmount],
            [TotalAmount],
            [CurrencyCode],
            [CreatedAt],
            [CreatedByUserId],
            [ApprovedAt],
            [ApprovedByUserId],
            [RejectedAt],
            [RejectedByUserId],
            [ReviewNote]
        )
        OUTPUT [inserted].[Id] INTO @CreatedOrder ([Id])
        VALUES
        (
            @OrderNumber,
            @ClientRequestId,
            @PayloadHash,
            @EmployeeId,
            @NormalizedCustomerCode,
            @NormalizedCustomerName,
            @OrderDate,
            0,
            @NormalizedNotes,
            @ItemCount,
            @TotalQuantity,
            @SubtotalAmount,
            @DiscountAmount,
            @TotalAmount,
            'VND',
            @NowUtc,
            @ActorUserId,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        );

        SELECT @OrderId = [Id] FROM @CreatedOrder;

        INSERT INTO [dbo].[SalesOrderItems]
        (
            [SalesOrderId],
            [LineNumber],
            [ProductCode],
            [ProductName],
            [ProductCategory],
            [Quantity],
            [UnitPrice],
            [DiscountAmount],
            [CreatedAt]
        )
        SELECT
            @OrderId,
            [L].[LineNumber],
            LTRIM(RTRIM([L].[ProductCode])),
            LTRIM(RTRIM([L].[ProductName])),
            NULLIF(LTRIM(RTRIM([L].[ProductCategory])), N''),
            [L].[Quantity],
            [L].[UnitPrice],
            [L].[DiscountAmount],
            @NowUtc
        FROM @Lines AS [L];

        INSERT INTO [dbo].[SalesOrderStatusHistory]
        (
            [SalesOrderId],
            [FromStatus],
            [ToStatus],
            [ChangedAt],
            [ChangedByUserId],
            [Comment]
        )
        VALUES
        (
            @OrderId,
            NULL,
            0,
            @NowUtc,
            @ActorUserId,
            N'Order created and submitted for approval.'
        );

        SELECT
            [O].[Id] AS [OrderId],
            [O].[OrderNumber],
            [O].[Status],
            [O].[ItemCount],
            [O].[TotalQuantity],
            [O].[SubtotalAmount],
            [O].[DiscountAmount],
            [O].[TotalAmount],
            [O].[CurrencyCode],
            [O].[CreatedAt],
            CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion],
            CONVERT(bit, 0) AS [WasAlreadyCreated]
        FROM [dbo].[SalesOrders] AS [O]
        WHERE [O].[Id] = @OrderId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        THROW;
    END CATCH;
END;
GO

IF OBJECT_ID(N'dbo.ApproveSalesOrder', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[ApproveSalesOrder] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[ApproveSalesOrder]
    @ActorUserId uniqueidentifier,
    @OrderId uniqueidentifier,
    @ExpectedRowVersion binary(8),
    @ReviewNote nvarchar(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- ERP-0004: admin approval is serialized and retry-idempotent.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';
    DECLARE @NowUtc datetime2(7) = SYSUTCDATETIME();
    DECLARE @NormalizedReviewNote nvarchar(500) =
        NULLIF(LTRIM(RTRIM(@ReviewNote)), N'');

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session user is missing, inactive, or unapproved.', 1;
    END;

    IF @ActorUserId <> @SeededAdminId
    BEGIN
        THROW 53403, 'Only the seeded admin can approve sales orders.', 1;
    END;

    IF @OrderId IS NULL OR @ExpectedRowVersion IS NULL
    BEGIN
        THROW 53400, 'OrderId and ExpectedRowVersion are required.', 1;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CurrentStatus tinyint;
        DECLARE @CurrentRowVersion binary(8);

        SELECT
            @CurrentStatus = [O].[Status],
            @CurrentRowVersion = CONVERT(binary(8), [O].[RowVersion])
        FROM [dbo].[SalesOrders] AS [O] WITH (UPDLOCK, HOLDLOCK)
        WHERE [O].[Id] = @OrderId;

        IF @CurrentStatus IS NULL
        BEGIN
            THROW 53404, 'The sales order was not found.', 1;
        END;

        IF @CurrentStatus = 1
        BEGIN
            SELECT
                [O].[Id] AS [OrderId],
                [O].[OrderNumber],
                [O].[Status],
                [O].[TotalAmount],
                [O].[CurrencyCode],
                [O].[ApprovedAt],
                [O].[ApprovedByUserId],
                CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion],
                CONVERT(bit, 1) AS [WasAlreadyApproved]
            FROM [dbo].[SalesOrders] AS [O]
            WHERE [O].[Id] = @OrderId;

            COMMIT TRANSACTION;
            RETURN;
        END;

        IF @CurrentStatus <> 0
        BEGIN
            THROW 53409, 'Only a pending sales order can be approved.', 1;
        END;

        IF @CurrentRowVersion <> @ExpectedRowVersion
        BEGIN
            THROW 53409, 'The sales order changed. Reload and try again.', 1;
        END;

        UPDATE [dbo].[SalesOrders]
        SET
            [Status] = 1,
            [ApprovedAt] = @NowUtc,
            [ApprovedByUserId] = @ActorUserId,
            [RejectedAt] = NULL,
            [RejectedByUserId] = NULL,
            [ReviewNote] = @NormalizedReviewNote
        WHERE [Id] = @OrderId;

        INSERT INTO [dbo].[SalesOrderStatusHistory]
        (
            [SalesOrderId],
            [FromStatus],
            [ToStatus],
            [ChangedAt],
            [ChangedByUserId],
            [Comment]
        )
        VALUES
        (
            @OrderId,
            0,
            1,
            @NowUtc,
            @ActorUserId,
            @NormalizedReviewNote
        );

        SELECT
            [O].[Id] AS [OrderId],
            [O].[OrderNumber],
            [O].[Status],
            [O].[TotalAmount],
            [O].[CurrencyCode],
            [O].[ApprovedAt],
            [O].[ApprovedByUserId],
            CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion],
            CONVERT(bit, 0) AS [WasAlreadyApproved]
        FROM [dbo].[SalesOrders] AS [O]
        WHERE [O].[Id] = @OrderId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        THROW;
    END CATCH;
END;
GO

IF OBJECT_ID(N'dbo.RejectSalesOrder', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[RejectSalesOrder] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[RejectSalesOrder]
    @ActorUserId uniqueidentifier,
    @OrderId uniqueidentifier,
    @ExpectedRowVersion binary(8),
    @ReviewNote nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- ERP-0004: admin rejection is serialized and retry-idempotent.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';
    DECLARE @NowUtc datetime2(7) = SYSUTCDATETIME();
    DECLARE @NormalizedReviewNote nvarchar(500) =
        NULLIF(LTRIM(RTRIM(@ReviewNote)), N'');

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session user is missing, inactive, or unapproved.', 1;
    END;

    IF @ActorUserId <> @SeededAdminId
    BEGIN
        THROW 53403, 'Only the seeded admin can reject sales orders.', 1;
    END;

    IF @OrderId IS NULL OR @ExpectedRowVersion IS NULL
    BEGIN
        THROW 53400, 'OrderId and ExpectedRowVersion are required.', 1;
    END;

    IF @NormalizedReviewNote IS NULL OR LEN(@NormalizedReviewNote) < 3
    BEGIN
        THROW 53400, 'ReviewNote must contain at least 3 characters after trimming.', 1;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CurrentStatus tinyint;
        DECLARE @CurrentRowVersion binary(8);

        SELECT
            @CurrentStatus = [O].[Status],
            @CurrentRowVersion = CONVERT(binary(8), [O].[RowVersion])
        FROM [dbo].[SalesOrders] AS [O] WITH (UPDLOCK, HOLDLOCK)
        WHERE [O].[Id] = @OrderId;

        IF @CurrentStatus IS NULL
        BEGIN
            THROW 53404, 'The sales order was not found.', 1;
        END;

        IF @CurrentStatus = 2
        BEGIN
            SELECT
                [O].[Id] AS [OrderId],
                [O].[OrderNumber],
                [O].[Status],
                [O].[TotalAmount],
                [O].[CurrencyCode],
                [O].[RejectedAt],
                [O].[RejectedByUserId],
                [O].[ReviewNote],
                CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion],
                CONVERT(bit, 1) AS [WasAlreadyRejected]
            FROM [dbo].[SalesOrders] AS [O]
            WHERE [O].[Id] = @OrderId;

            COMMIT TRANSACTION;
            RETURN;
        END;

        IF @CurrentStatus <> 0
        BEGIN
            THROW 53409, 'Only a pending sales order can be rejected.', 1;
        END;

        IF @CurrentRowVersion <> @ExpectedRowVersion
        BEGIN
            THROW 53409, 'The sales order changed. Reload and try again.', 1;
        END;

        UPDATE [dbo].[SalesOrders]
        SET
            [Status] = 2,
            [ApprovedAt] = NULL,
            [ApprovedByUserId] = NULL,
            [RejectedAt] = @NowUtc,
            [RejectedByUserId] = @ActorUserId,
            [ReviewNote] = @NormalizedReviewNote
        WHERE [Id] = @OrderId;

        INSERT INTO [dbo].[SalesOrderStatusHistory]
        (
            [SalesOrderId],
            [FromStatus],
            [ToStatus],
            [ChangedAt],
            [ChangedByUserId],
            [Comment]
        )
        VALUES
        (
            @OrderId,
            0,
            2,
            @NowUtc,
            @ActorUserId,
            @NormalizedReviewNote
        );

        SELECT
            [O].[Id] AS [OrderId],
            [O].[OrderNumber],
            [O].[Status],
            [O].[TotalAmount],
            [O].[CurrencyCode],
            [O].[RejectedAt],
            [O].[RejectedByUserId],
            [O].[ReviewNote],
            CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion],
            CONVERT(bit, 0) AS [WasAlreadyRejected]
        FROM [dbo].[SalesOrders] AS [O]
        WHERE [O].[Id] = @OrderId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        THROW;
    END CATCH;
END;
GO

IF OBJECT_ID(N'dbo.GetListSalesOrder', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetListSalesOrder] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[GetListSalesOrder]
    @ActorUserId uniqueidentifier,
    @Search nvarchar(100) = NULL,
    @Status tinyint = NULL,
    @EmployeeId uniqueidentifier = NULL,
    @FromApprovedAt datetime2(7) = NULL,
    @ToApprovedAtExclusive datetime2(7) = NULL,
    @MinTotalAmount decimal(19, 4) = NULL,
    @MaxTotalAmount decimal(19, 4) = NULL,
    @PageNumber int,
    @PageSize int,
    @SortColumn varchar(30),
    @SortDirection varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- ERP-0004: actor-scoped order management page.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';
    DECLARE @IsAdmin bit =
        CONVERT(bit, CASE WHEN @ActorUserId = @SeededAdminId THEN 1 ELSE 0 END);
    DECLARE @ActorEmployeeId uniqueidentifier;

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session principal is not active and approved.', 1;
    END;

    IF @IsAdmin = CONVERT(bit, 0)
    BEGIN
        SELECT @ActorEmployeeId = [E].[Id]
        FROM [dbo].[Employees] AS [E]
        WHERE
            [E].[UserId] = @ActorUserId
            AND [E].[IsDeleted] = CONVERT(bit, 0)
            AND [E].[ModerationStatus] = 1;

        IF @ActorEmployeeId IS NULL
        BEGIN
            THROW 53403, 'The session user is not bound to an active approved employee.', 1;
        END;

        IF @EmployeeId IS NOT NULL AND @EmployeeId <> @ActorEmployeeId
        BEGIN
            THROW 53403, 'An employee cannot inspect another employee sales orders.', 1;
        END;

        SET @EmployeeId = @ActorEmployeeId;
    END;

    IF @Status IS NOT NULL AND @Status NOT IN (0, 1, 2)
    BEGIN
        THROW 53400, 'Status is not allowed.', 1;
    END;

    IF (@FromApprovedAt IS NULL AND @ToApprovedAtExclusive IS NOT NULL)
       OR (@FromApprovedAt IS NOT NULL AND @ToApprovedAtExclusive IS NULL)
       OR
       (
           @FromApprovedAt IS NOT NULL
           AND @FromApprovedAt >= @ToApprovedAtExclusive
       )
    BEGIN
        THROW 53400, 'Approval range must be a valid half-open range.', 1;
    END;

    IF @MinTotalAmount IS NOT NULL
       AND
       (
           @MinTotalAmount < CONVERT(decimal(19, 4), 0)
           OR @MinTotalAmount > CONVERT(decimal(19, 4), 999999999999999)
           OR @MinTotalAmount <> ROUND(@MinTotalAmount, 0)
       )
    BEGIN
        THROW 53400, 'MinTotalAmount must be a supported whole-VND value.', 1;
    END;

    IF @MaxTotalAmount IS NOT NULL
       AND
       (
           @MaxTotalAmount < CONVERT(decimal(19, 4), 0)
           OR @MaxTotalAmount > CONVERT(decimal(19, 4), 999999999999999)
           OR @MaxTotalAmount <> ROUND(@MaxTotalAmount, 0)
       )
    BEGIN
        THROW 53400, 'MaxTotalAmount must be a supported whole-VND value.', 1;
    END;

    IF @MinTotalAmount IS NOT NULL
       AND @MaxTotalAmount IS NOT NULL
       AND @MinTotalAmount > @MaxTotalAmount
    BEGIN
        THROW 53400, 'MinTotalAmount cannot exceed MaxTotalAmount.', 1;
    END;

    IF @PageNumber IS NULL OR @PageNumber < 1
    BEGIN
        THROW 53400, 'PageNumber must be greater than or equal to 1.', 1;
    END;

    IF @PageSize IS NULL OR @PageSize < 1 OR @PageSize > 200
    BEGIN
        THROW 53400, 'PageSize must be between 1 and 200.', 1;
    END;

    SET @SortColumn = UPPER(LTRIM(RTRIM(COALESCE(@SortColumn, ''))));
    SET @SortDirection = UPPER(LTRIM(RTRIM(COALESCE(@SortDirection, ''))));

    IF @SortColumn NOT IN
       (
           'CREATEDAT',
           'ORDERDATE',
           'APPROVEDAT',
           'ORDERNUMBER',
           'CUSTOMERNAME',
           'TOTALAMOUNT',
           'STATUS'
       )
    BEGIN
        THROW 53400, 'SortColumn is not allowed.', 1;
    END;

    IF @SortDirection NOT IN ('ASCENDING', 'DESCENDING')
    BEGIN
        THROW 53400, 'SortDirection must be ASCENDING or DESCENDING.', 1;
    END;

    DECLARE @NormalizedSearch nvarchar(100) =
        NULLIF(LTRIM(RTRIM(@Search)), N'');
    DECLARE @SearchPattern nvarchar(208) = NULL;

    IF @NormalizedSearch IS NOT NULL
    BEGIN
        SET @SearchPattern =
            N'%'
            + REPLACE
              (
                  REPLACE
                  (
                      REPLACE
                      (
                          REPLACE(@NormalizedSearch, N'~', N'~~'),
                          N'%', N'~%'
                      ),
                      N'_', N'~_'
                  ),
                  N'[', N'~['
              )
            + N'%';
    END;

    DECLARE @Offset bigint =
        (CONVERT(bigint, @PageNumber) - CONVERT(bigint, 1))
        * CONVERT(bigint, @PageSize);

    SELECT
        [O].[Id] AS [OrderId],
        [O].[OrderNumber],
        [O].[EmployeeId],
        [E].[EmployeeCode],
        [E].[FullName] AS [EmployeeFullName],
        [O].[CustomerCode],
        [O].[CustomerName],
        [O].[OrderDate],
        [O].[Status],
        [O].[ItemCount],
        [O].[TotalQuantity],
        [O].[TotalAmount],
        [O].[CurrencyCode],
        [O].[CreatedAt],
        [O].[ApprovedAt],
        [O].[RejectedAt],
        CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion]
    FROM [dbo].[SalesOrders] AS [O]
    INNER JOIN [dbo].[Employees] AS [E]
        ON [E].[Id] = [O].[EmployeeId]
    WHERE
        (@EmployeeId IS NULL OR [O].[EmployeeId] = @EmployeeId)
        AND (@Status IS NULL OR [O].[Status] = @Status)
        AND
        (
            @FromApprovedAt IS NULL
            OR
            (
                [O].[ApprovedAt] >= @FromApprovedAt
                AND [O].[ApprovedAt] < @ToApprovedAtExclusive
            )
        )
        AND (@MinTotalAmount IS NULL OR [O].[TotalAmount] >= @MinTotalAmount)
        AND (@MaxTotalAmount IS NULL OR [O].[TotalAmount] <= @MaxTotalAmount)
        AND
        (
            @SearchPattern IS NULL
            OR [O].[OrderNumber] LIKE @SearchPattern ESCAPE N'~'
            OR [O].[CustomerCode] LIKE @SearchPattern ESCAPE N'~'
            OR [O].[CustomerName] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[EmployeeCode] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[FullName] LIKE @SearchPattern ESCAPE N'~'
        )
    ORDER BY
        CASE WHEN @SortColumn = 'CREATEDAT' AND @SortDirection = 'ASCENDING'
            THEN [O].[CreatedAt] END ASC,
        CASE WHEN @SortColumn = 'CREATEDAT' AND @SortDirection = 'DESCENDING'
            THEN [O].[CreatedAt] END DESC,
        CASE WHEN @SortColumn = 'ORDERDATE' AND @SortDirection = 'ASCENDING'
            THEN [O].[OrderDate] END ASC,
        CASE WHEN @SortColumn = 'ORDERDATE' AND @SortDirection = 'DESCENDING'
            THEN [O].[OrderDate] END DESC,
        CASE WHEN @SortColumn = 'APPROVEDAT' AND @SortDirection = 'ASCENDING'
            THEN [O].[ApprovedAt] END ASC,
        CASE WHEN @SortColumn = 'APPROVEDAT' AND @SortDirection = 'DESCENDING'
            THEN [O].[ApprovedAt] END DESC,
        CASE WHEN @SortColumn = 'ORDERNUMBER' AND @SortDirection = 'ASCENDING'
            THEN [O].[OrderNumber] END ASC,
        CASE WHEN @SortColumn = 'ORDERNUMBER' AND @SortDirection = 'DESCENDING'
            THEN [O].[OrderNumber] END DESC,
        CASE WHEN @SortColumn = 'CUSTOMERNAME' AND @SortDirection = 'ASCENDING'
            THEN [O].[CustomerName] END ASC,
        CASE WHEN @SortColumn = 'CUSTOMERNAME' AND @SortDirection = 'DESCENDING'
            THEN [O].[CustomerName] END DESC,
        CASE WHEN @SortColumn = 'TOTALAMOUNT' AND @SortDirection = 'ASCENDING'
            THEN [O].[TotalAmount] END ASC,
        CASE WHEN @SortColumn = 'TOTALAMOUNT' AND @SortDirection = 'DESCENDING'
            THEN [O].[TotalAmount] END DESC,
        CASE WHEN @SortColumn = 'STATUS' AND @SortDirection = 'ASCENDING'
            THEN [O].[Status] END ASC,
        CASE WHEN @SortColumn = 'STATUS' AND @SortDirection = 'DESCENDING'
            THEN [O].[Status] END DESC,
        [O].[Id] ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT_BIG(1) AS [TotalCount]
    FROM [dbo].[SalesOrders] AS [O]
    INNER JOIN [dbo].[Employees] AS [E]
        ON [E].[Id] = [O].[EmployeeId]
    WHERE
        (@EmployeeId IS NULL OR [O].[EmployeeId] = @EmployeeId)
        AND (@Status IS NULL OR [O].[Status] = @Status)
        AND
        (
            @FromApprovedAt IS NULL
            OR
            (
                [O].[ApprovedAt] >= @FromApprovedAt
                AND [O].[ApprovedAt] < @ToApprovedAtExclusive
            )
        )
        AND (@MinTotalAmount IS NULL OR [O].[TotalAmount] >= @MinTotalAmount)
        AND (@MaxTotalAmount IS NULL OR [O].[TotalAmount] <= @MaxTotalAmount)
        AND
        (
            @SearchPattern IS NULL
            OR [O].[OrderNumber] LIKE @SearchPattern ESCAPE N'~'
            OR [O].[CustomerCode] LIKE @SearchPattern ESCAPE N'~'
            OR [O].[CustomerName] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[EmployeeCode] LIKE @SearchPattern ESCAPE N'~'
            OR [E].[FullName] LIKE @SearchPattern ESCAPE N'~'
        );
END;
GO

IF OBJECT_ID(N'dbo.GetSalesOrderDetail', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetSalesOrderDetail] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[GetSalesOrderDetail]
    @ActorUserId uniqueidentifier,
    @OrderId uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    -- ERP-0004: scoped header plus immutable line detail.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';
    DECLARE @IsAdmin bit =
        CONVERT(bit, CASE WHEN @ActorUserId = @SeededAdminId THEN 1 ELSE 0 END);
    DECLARE @ActorEmployeeId uniqueidentifier;

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session principal is not active and approved.', 1;
    END;

    IF @IsAdmin = CONVERT(bit, 0)
    BEGIN
        SELECT @ActorEmployeeId = [E].[Id]
        FROM [dbo].[Employees] AS [E]
        WHERE
            [E].[UserId] = @ActorUserId
            AND [E].[IsDeleted] = CONVERT(bit, 0)
            AND [E].[ModerationStatus] = 1;

        IF @ActorEmployeeId IS NULL
        BEGIN
            THROW 53403, 'The session user is not bound to an active approved employee.', 1;
        END;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[SalesOrders] AS [O]
        WHERE
            [O].[Id] = @OrderId
            AND
            (
                @IsAdmin = CONVERT(bit, 1)
                OR [O].[EmployeeId] = @ActorEmployeeId
            )
    )
    BEGIN
        THROW 53404, 'The sales order was not found.', 1;
    END;

    SELECT
        [O].[Id] AS [OrderId],
        [O].[OrderNumber],
        [O].[EmployeeId],
        [E].[EmployeeCode],
        [E].[FullName] AS [EmployeeFullName],
        [O].[CustomerCode],
        [O].[CustomerName],
        [O].[OrderDate],
        [O].[Status],
        [O].[Notes],
        [O].[ItemCount],
        [O].[TotalQuantity],
        [O].[SubtotalAmount],
        [O].[DiscountAmount],
        [O].[TotalAmount],
        [O].[CurrencyCode],
        [O].[CreatedAt],
        [O].[CreatedByUserId],
        [O].[ApprovedAt],
        [O].[ApprovedByUserId],
        [O].[RejectedAt],
        [O].[RejectedByUserId],
        [O].[ReviewNote],
        CONVERT(binary(8), [O].[RowVersion]) AS [RowVersion]
    FROM [dbo].[SalesOrders] AS [O]
    INNER JOIN [dbo].[Employees] AS [E]
        ON [E].[Id] = [O].[EmployeeId]
    WHERE [O].[Id] = @OrderId;

    SELECT
        [I].[Id] AS [LineId],
        [I].[LineNumber],
        [I].[ProductCode],
        [I].[ProductName],
        [I].[ProductCategory],
        [I].[Quantity],
        [I].[UnitPrice],
        [I].[DiscountAmount],
        [I].[LineAmount]
    FROM [dbo].[SalesOrderItems] AS [I]
    WHERE [I].[SalesOrderId] = @OrderId
    ORDER BY [I].[LineNumber] ASC, [I].[Id] ASC;
END;
GO

IF OBJECT_ID(N'dbo.GetEmployeeSalesReport', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetEmployeeSalesReport] AS BEGIN SET NOCOUNT ON; END;');
END;
GO

ALTER PROCEDURE [dbo].[GetEmployeeSalesReport]
    @ActorUserId uniqueidentifier,
    @EmployeeId uniqueidentifier = NULL,
    @FromApprovedAt datetime2(7),
    @ToApprovedAtExclusive datetime2(7),
    @GroupBy varchar(10),
    @Search nvarchar(100) = NULL,
    @ProductKeyword nvarchar(100) = NULL,
    @MinTotalAmount decimal(19, 4) = NULL,
    @MaxTotalAmount decimal(19, 4) = NULL,
    @Mode varchar(10) = 'PAGE',
    @PageNumber int = 1,
    @PageSize int = 20,
    @SortColumn varchar(30) = 'APPROVEDAT',
    @SortDirection varchar(10) = 'DESCENDING'
AS
BEGIN
    SET NOCOUNT ON;

    -- ERP-0004: ApprovedAt is UTC; trend buckets are Vietnam UTC+07.
    DECLARE @SeededAdminId uniqueidentifier =
        '701A5844-3936-4AE9-8BA6-DBF59294B973';
    DECLARE @IsAdmin bit =
        CONVERT(bit, CASE WHEN @ActorUserId = @SeededAdminId THEN 1 ELSE 0 END);
    DECLARE @ActorEmployeeId uniqueidentifier;

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Users] AS [U]
        WHERE
            [U].[Id] = @ActorUserId
            AND [U].[IsDeleted] = CONVERT(bit, 0)
            AND [U].[ModerationStatus] = 1
    )
    BEGIN
        THROW 53401, 'The session principal is not active and approved.', 1;
    END;

    IF @IsAdmin = CONVERT(bit, 1)
    BEGIN
        IF @EmployeeId IS NULL
        BEGIN
            THROW 53400, 'EmployeeId is required for an admin sales report.', 1;
        END;

        IF NOT EXISTS
        (
            SELECT 1
            FROM [dbo].[Employees] AS [E]
            WHERE [E].[Id] = @EmployeeId
        )
        BEGIN
            THROW 53404, 'The employee was not found.', 1;
        END;
    END
    ELSE
    BEGIN
        SELECT @ActorEmployeeId = [E].[Id]
        FROM [dbo].[Employees] AS [E]
        WHERE
            [E].[UserId] = @ActorUserId
            AND [E].[IsDeleted] = CONVERT(bit, 0)
            AND [E].[ModerationStatus] = 1;

        IF @ActorEmployeeId IS NULL
        BEGIN
            THROW 53403, 'The session user is not bound to an active approved employee.', 1;
        END;

        IF @EmployeeId IS NOT NULL AND @EmployeeId <> @ActorEmployeeId
        BEGIN
            THROW 53403, 'An employee cannot inspect another employee sales report.', 1;
        END;

        SET @EmployeeId = @ActorEmployeeId;
    END;

    IF @FromApprovedAt IS NULL
       OR @ToApprovedAtExclusive IS NULL
       OR @FromApprovedAt >= @ToApprovedAtExclusive
    BEGIN
        THROW 53400, 'Approval range must be a valid half-open UTC range.', 1;
    END;

    SET @GroupBy = UPPER(LTRIM(RTRIM(COALESCE(@GroupBy, ''))));
    SET @Mode = UPPER(LTRIM(RTRIM(COALESCE(@Mode, ''))));
    SET @SortColumn = UPPER(LTRIM(RTRIM(COALESCE(@SortColumn, ''))));
    SET @SortDirection = UPPER(LTRIM(RTRIM(COALESCE(@SortDirection, ''))));

    IF @GroupBy NOT IN ('DAY', 'MONTH')
    BEGIN
        THROW 53400, 'GroupBy must be DAY or MONTH.', 1;
    END;

    IF @Mode NOT IN ('PAGE', 'EXPORT')
    BEGIN
        THROW 53400, 'Mode must be PAGE or EXPORT.', 1;
    END;

    IF @Mode = 'PAGE'
       AND (@PageNumber IS NULL OR @PageNumber < 1)
    BEGIN
        THROW 53400, 'PageNumber must be greater than or equal to 1.', 1;
    END;

    IF @Mode = 'PAGE'
       AND (@PageSize IS NULL OR @PageSize < 1 OR @PageSize > 200)
    BEGIN
        THROW 53400, 'PageSize must be between 1 and 200.', 1;
    END;

    IF @SortColumn NOT IN
       ('APPROVEDAT', 'ORDERDATE', 'ORDERNUMBER', 'CUSTOMERNAME', 'TOTALAMOUNT')
    BEGIN
        THROW 53400, 'SortColumn is not allowed.', 1;
    END;

    IF @SortDirection NOT IN ('ASCENDING', 'DESCENDING')
    BEGIN
        THROW 53400, 'SortDirection must be ASCENDING or DESCENDING.', 1;
    END;

    IF @MinTotalAmount IS NOT NULL
       AND
       (
           @MinTotalAmount < CONVERT(decimal(19, 4), 0)
           OR @MinTotalAmount > CONVERT(decimal(19, 4), 999999999999999)
           OR @MinTotalAmount <> ROUND(@MinTotalAmount, 0)
       )
    BEGIN
        THROW 53400, 'MinTotalAmount must be a supported whole-VND value.', 1;
    END;

    IF @MaxTotalAmount IS NOT NULL
       AND
       (
           @MaxTotalAmount < CONVERT(decimal(19, 4), 0)
           OR @MaxTotalAmount > CONVERT(decimal(19, 4), 999999999999999)
           OR @MaxTotalAmount <> ROUND(@MaxTotalAmount, 0)
       )
    BEGIN
        THROW 53400, 'MaxTotalAmount must be a supported whole-VND value.', 1;
    END;

    IF @MinTotalAmount IS NOT NULL
       AND @MaxTotalAmount IS NOT NULL
       AND @MinTotalAmount > @MaxTotalAmount
    BEGIN
        THROW 53400, 'MinTotalAmount cannot exceed MaxTotalAmount.', 1;
    END;

    DECLARE @NormalizedSearch nvarchar(100) =
        NULLIF(LTRIM(RTRIM(@Search)), N'');
    DECLARE @SearchPattern nvarchar(208) = NULL;
    DECLARE @NormalizedProductKeyword nvarchar(100) =
        NULLIF(LTRIM(RTRIM(@ProductKeyword)), N'');
    DECLARE @ProductPattern nvarchar(208) = NULL;

    IF @NormalizedSearch IS NOT NULL
    BEGIN
        SET @SearchPattern =
            N'%'
            + REPLACE
              (
                  REPLACE
                  (
                      REPLACE
                      (
                          REPLACE(@NormalizedSearch, N'~', N'~~'),
                          N'%', N'~%'
                      ),
                      N'_', N'~_'
                  ),
                  N'[', N'~['
              )
            + N'%';
    END;

    IF @NormalizedProductKeyword IS NOT NULL
    BEGIN
        SET @ProductPattern =
            N'%'
            + REPLACE
              (
                  REPLACE
                  (
                      REPLACE
                      (
                          REPLACE(@NormalizedProductKeyword, N'~', N'~~'),
                          N'%', N'~%'
                      ),
                      N'_', N'~_'
                  ),
                  N'[', N'~['
              )
            + N'%';
    END;

    CREATE TABLE [#FilteredSalesOrders]
    (
        [OrderId] uniqueidentifier NOT NULL,
        [OrderNumber] varchar(20) NOT NULL,
        [EmployeeId] uniqueidentifier NOT NULL,
        [CustomerCode] nvarchar(50) NULL,
        [CustomerName] nvarchar(200) NOT NULL,
        [OrderDate] date NOT NULL,
        [ItemCount] int NOT NULL,
        [TotalQuantity] decimal(18, 3) NOT NULL,
        [TotalAmount] decimal(19, 4) NOT NULL,
        [CurrencyCode] char(3) NOT NULL,
        [CreatedAt] datetime2(7) NOT NULL,
        [ApprovedAt] datetime2(7) NOT NULL,
        PRIMARY KEY CLUSTERED ([OrderId] ASC)
    );

    INSERT INTO [#FilteredSalesOrders]
    (
        [OrderId],
        [OrderNumber],
        [EmployeeId],
        [CustomerCode],
        [CustomerName],
        [OrderDate],
        [ItemCount],
        [TotalQuantity],
        [TotalAmount],
        [CurrencyCode],
        [CreatedAt],
        [ApprovedAt]
    )
    SELECT
        [O].[Id],
        [O].[OrderNumber],
        [O].[EmployeeId],
        [O].[CustomerCode],
        [O].[CustomerName],
        [O].[OrderDate],
        [O].[ItemCount],
        [O].[TotalQuantity],
        [O].[TotalAmount],
        [O].[CurrencyCode],
        [O].[CreatedAt],
        [O].[ApprovedAt]
    FROM [dbo].[SalesOrders] AS [O]
    WHERE
        [O].[EmployeeId] = @EmployeeId
        AND [O].[Status] = 1
        AND [O].[ApprovedAt] >= @FromApprovedAt
        AND [O].[ApprovedAt] < @ToApprovedAtExclusive
        AND (@MinTotalAmount IS NULL OR [O].[TotalAmount] >= @MinTotalAmount)
        AND (@MaxTotalAmount IS NULL OR [O].[TotalAmount] <= @MaxTotalAmount)
        AND
        (
            @SearchPattern IS NULL
            OR [O].[OrderNumber] LIKE @SearchPattern ESCAPE N'~'
            OR [O].[CustomerCode] LIKE @SearchPattern ESCAPE N'~'
            OR [O].[CustomerName] LIKE @SearchPattern ESCAPE N'~'
        )
        AND
        (
            @ProductPattern IS NULL
            OR EXISTS
            (
                SELECT 1
                FROM [dbo].[SalesOrderItems] AS [I]
                WHERE
                    [I].[SalesOrderId] = [O].[Id]
                    AND
                    (
                        [I].[ProductCode] LIKE @ProductPattern ESCAPE N'~'
                        OR [I].[ProductName] LIKE @ProductPattern ESCAPE N'~'
                        OR [I].[ProductCategory] LIKE @ProductPattern ESCAPE N'~'
                    )
            )
        );

    DECLARE @TotalCount bigint =
        (SELECT COUNT_BIG(1) FROM [#FilteredSalesOrders]);

    IF @Mode = 'EXPORT' AND @TotalCount > 10000
    BEGIN
        THROW 53413, 'The filtered export exceeds 10000 rows.', 1;
    END;

    DECLARE @ApprovedSalesAmount decimal(38, 4) =
    (
        SELECT COALESCE
        (
            SUM(CONVERT(decimal(38, 4), [TotalAmount])),
            CONVERT(decimal(38, 4), 0)
        )
        FROM [#FilteredSalesOrders]
    );

    DECLARE @ApprovedTotalQuantity decimal(38, 3) =
    (
        SELECT COALESCE
        (
            SUM(CONVERT(decimal(38, 3), [TotalQuantity])),
            CONVERT(decimal(38, 3), 0)
        )
        FROM [#FilteredSalesOrders]
    );

    IF @ApprovedSalesAmount > CONVERT(decimal(38, 4), 999999999999999)
       OR @ApprovedTotalQuantity > CONVERT(decimal(38, 3), 999999999999.999)
    BEGIN
        THROW 53413, 'The approved-sales aggregate exceeds the safe JSON and Excel numeric range.', 1;
    END;

    SELECT
        [E].[Id] AS [EmployeeId],
        [E].[EmployeeCode],
        [E].[FullName] AS [EmployeeFullName],
        @FromApprovedAt AS [FromApprovedAt],
        @ToApprovedAtExclusive AS [ToApprovedAtExclusive],
        @TotalCount AS [ApprovedOrderCount],
        @ApprovedTotalQuantity AS [TotalQuantity],
        @ApprovedSalesAmount AS [ApprovedSalesAmount],
        COALESCE
        (
            CONVERT
            (
                decimal(19, 4),
                @ApprovedSalesAmount
                / NULLIF(CONVERT(decimal(38, 4), @TotalCount), 0)
            ),
            CONVERT(decimal(19, 4), 0)
        ) AS [AverageOrderValue]
    FROM [dbo].[Employees] AS [E]
    LEFT JOIN [#FilteredSalesOrders] AS [F]
        ON [F].[EmployeeId] = [E].[Id]
    WHERE [E].[Id] = @EmployeeId
    GROUP BY [E].[Id], [E].[EmployeeCode], [E].[FullName];

    SELECT
        [Period].[PeriodStart],
        CASE
            WHEN @GroupBy = 'DAY'
                THEN DATEADD(day, 1, [Period].[PeriodStart])
            ELSE DATEADD(month, 1, [Period].[PeriodStart])
        END AS [PeriodEndExclusive],
        COUNT_BIG(1) AS [ApprovedOrderCount],
        SUM(CONVERT(decimal(38, 3), [F].[TotalQuantity])) AS [TotalQuantity],
        SUM(CONVERT(decimal(38, 4), [F].[TotalAmount])) AS [ApprovedSalesAmount]
    FROM [#FilteredSalesOrders] AS [F]
    CROSS APPLY
    (
        SELECT
            CONVERT
            (
                datetime2(7),
                CASE
                    WHEN @GroupBy = 'DAY'
                        THEN DATEADD
                        (
                            day,
                            DATEDIFF(day, 0, DATEADD(hour, 7, [F].[ApprovedAt])),
                            0
                        )
                    ELSE DATEADD
                    (
                        month,
                        DATEDIFF(month, 0, DATEADD(hour, 7, [F].[ApprovedAt])),
                        0
                    )
                END
            ) AS [PeriodStart]
    ) AS [Period]
    GROUP BY [Period].[PeriodStart]
    ORDER BY [Period].[PeriodStart] ASC;

    IF @Mode = 'EXPORT'
    BEGIN
        SELECT
            [F].[OrderId],
            [F].[OrderNumber],
            [F].[EmployeeId],
            [E].[EmployeeCode],
            [E].[FullName] AS [EmployeeFullName],
            [F].[CustomerCode],
            [F].[CustomerName],
            [F].[OrderDate],
            [F].[ItemCount],
            [F].[TotalQuantity],
            [F].[TotalAmount],
            [F].[CurrencyCode],
            [F].[CreatedAt],
            [F].[ApprovedAt]
        FROM [#FilteredSalesOrders] AS [F]
        INNER JOIN [dbo].[Employees] AS [E]
            ON [E].[Id] = [F].[EmployeeId]
        ORDER BY
            CASE WHEN @SortColumn = 'APPROVEDAT' AND @SortDirection = 'ASCENDING'
                THEN [F].[ApprovedAt] END ASC,
            CASE WHEN @SortColumn = 'APPROVEDAT' AND @SortDirection = 'DESCENDING'
                THEN [F].[ApprovedAt] END DESC,
            CASE WHEN @SortColumn = 'ORDERDATE' AND @SortDirection = 'ASCENDING'
                THEN [F].[OrderDate] END ASC,
            CASE WHEN @SortColumn = 'ORDERDATE' AND @SortDirection = 'DESCENDING'
                THEN [F].[OrderDate] END DESC,
            CASE WHEN @SortColumn = 'ORDERNUMBER' AND @SortDirection = 'ASCENDING'
                THEN [F].[OrderNumber] END ASC,
            CASE WHEN @SortColumn = 'ORDERNUMBER' AND @SortDirection = 'DESCENDING'
                THEN [F].[OrderNumber] END DESC,
            CASE WHEN @SortColumn = 'CUSTOMERNAME' AND @SortDirection = 'ASCENDING'
                THEN [F].[CustomerName] END ASC,
            CASE WHEN @SortColumn = 'CUSTOMERNAME' AND @SortDirection = 'DESCENDING'
                THEN [F].[CustomerName] END DESC,
            CASE WHEN @SortColumn = 'TOTALAMOUNT' AND @SortDirection = 'ASCENDING'
                THEN [F].[TotalAmount] END ASC,
            CASE WHEN @SortColumn = 'TOTALAMOUNT' AND @SortDirection = 'DESCENDING'
                THEN [F].[TotalAmount] END DESC,
            [F].[OrderId] ASC;
    END
    ELSE
    BEGIN
        DECLARE @Offset bigint =
            (CONVERT(bigint, @PageNumber) - CONVERT(bigint, 1))
            * CONVERT(bigint, @PageSize);

        SELECT
            [F].[OrderId],
            [F].[OrderNumber],
            [F].[EmployeeId],
            [E].[EmployeeCode],
            [E].[FullName] AS [EmployeeFullName],
            [F].[CustomerCode],
            [F].[CustomerName],
            [F].[OrderDate],
            [F].[ItemCount],
            [F].[TotalQuantity],
            [F].[TotalAmount],
            [F].[CurrencyCode],
            [F].[CreatedAt],
            [F].[ApprovedAt]
        FROM [#FilteredSalesOrders] AS [F]
        INNER JOIN [dbo].[Employees] AS [E]
            ON [E].[Id] = [F].[EmployeeId]
        ORDER BY
            CASE WHEN @SortColumn = 'APPROVEDAT' AND @SortDirection = 'ASCENDING'
                THEN [F].[ApprovedAt] END ASC,
            CASE WHEN @SortColumn = 'APPROVEDAT' AND @SortDirection = 'DESCENDING'
                THEN [F].[ApprovedAt] END DESC,
            CASE WHEN @SortColumn = 'ORDERDATE' AND @SortDirection = 'ASCENDING'
                THEN [F].[OrderDate] END ASC,
            CASE WHEN @SortColumn = 'ORDERDATE' AND @SortDirection = 'DESCENDING'
                THEN [F].[OrderDate] END DESC,
            CASE WHEN @SortColumn = 'ORDERNUMBER' AND @SortDirection = 'ASCENDING'
                THEN [F].[OrderNumber] END ASC,
            CASE WHEN @SortColumn = 'ORDERNUMBER' AND @SortDirection = 'DESCENDING'
                THEN [F].[OrderNumber] END DESC,
            CASE WHEN @SortColumn = 'CUSTOMERNAME' AND @SortDirection = 'ASCENDING'
                THEN [F].[CustomerName] END ASC,
            CASE WHEN @SortColumn = 'CUSTOMERNAME' AND @SortDirection = 'DESCENDING'
                THEN [F].[CustomerName] END DESC,
            CASE WHEN @SortColumn = 'TOTALAMOUNT' AND @SortDirection = 'ASCENDING'
                THEN [F].[TotalAmount] END ASC,
            CASE WHEN @SortColumn = 'TOTALAMOUNT' AND @SortDirection = 'DESCENDING'
                THEN [F].[TotalAmount] END DESC,
            [F].[OrderId] ASC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    END;

    SELECT @TotalCount AS [TotalCount];
END;
GO

PRINT N'ERP-0004 sales-order procedure deployment completed.';
GO
