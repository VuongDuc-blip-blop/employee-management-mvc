USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 52200, 'ERP-0002 contract test requires LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 52201, 'ERP-0002 contract test is connected to the wrong database.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[extended_properties]
    WHERE [class] = 0
      AND [major_id] = 0
      AND [minor_id] = 0
      AND [name] = N'ERPBaselineOwner'
      AND CONVERT(nvarchar(128), [value]) = N'employee-management-mvc/ERP-0000/v1'
)
BEGIN
    THROW 52202, 'ERP-0002 contract test requires the workflow-owned database.', 1;
END;

DECLARE @AlphaId uniqueidentifier = '00000000-0000-0000-0000-00000002A001';
DECLARE @PercentId uniqueidentifier = '00000000-0000-0000-0000-00000002A002';
DECLARE @UnderscoreId uniqueidentifier = '00000000-0000-0000-0000-00000002A003';
DECLARE @BracketId uniqueidentifier = '00000000-0000-0000-0000-00000002A004';
DECLARE @DeletedId uniqueidentifier = '00000000-0000-0000-0000-00000002A005';
DECLARE @AuditId uniqueidentifier = '00000000-0000-0000-0000-00000002A0FF';
DECLARE @Now datetime2(7) = SYSUTCDATETIME();

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Users]
    WHERE [Id] IN (@AlphaId, @PercentId, @UnderscoreId, @BracketId, @DeletedId)
)
BEGIN
    THROW 52203, 'Reserved ERP-0002 fixture identifiers already exist.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO [dbo].[Users]
    (
        [Id], [UserName], [Password], [CreatedAt], [LastModifiedAt],
        [CreatedBy], [LastModifiedBy], [IsDeleted], [DeletedAt], [ModerationStatus]
    )
    VALUES
        (@AlphaId, N'erp2-alpha', N'ERP0002_NON_AUTH_TEST_VALUE', @Now, @Now,
         @AuditId, @AuditId, 0, NULL, 1),
        (@PercentId, N'erp2-%-literal', N'ERP0002_NON_AUTH_TEST_VALUE', DATEADD(second, 1, @Now), DATEADD(second, 1, @Now),
         @AuditId, @AuditId, 0, NULL, 1),
        (@UnderscoreId, N'erp2-_-literal', N'ERP0002_NON_AUTH_TEST_VALUE', DATEADD(second, 2, @Now), DATEADD(second, 2, @Now),
         @AuditId, @AuditId, 0, NULL, 1),
        (@BracketId, N'erp2-[-literal', N'ERP0002_NON_AUTH_TEST_VALUE', DATEADD(second, 3, @Now), DATEADD(second, 3, @Now),
         @AuditId, @AuditId, 0, NULL, 1),
        (@DeletedId, N'erp2-deleted', N'ERP0002_NON_AUTH_TEST_VALUE', DATEADD(second, 4, @Now), DATEADD(second, 4, @Now),
         @AuditId, @AuditId, 1, DATEADD(second, 4, @Now), 1);

    DECLARE @Page TABLE
    (
        [Id] uniqueidentifier NOT NULL,
        [UserName] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2(7) NOT NULL,
        [ModerationStatus] int NOT NULL,
        [TotalCount] bigint NOT NULL
    );
    DECLARE @TotalCount bigint;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'erp2',
        @PageNumber = 1,
        @PageSize = 2,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING',
        @TotalCount = @TotalCount OUTPUT;

    IF @TotalCount <> 4 OR (SELECT COUNT_BIG(1) FROM @Page) <> 2
    BEGIN
        THROW 52204, 'First-page count/output total is incorrect.', 1;
    END;

    IF EXISTS (SELECT 1 FROM @Page WHERE [TotalCount] <> 4)
    BEGIN
        THROW 52205, 'Compatibility row TotalCount is incorrect.', 1;
    END;

    DELETE FROM @Page;
    SET @TotalCount = NULL;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'erp2',
        @PageNumber = 3,
        @PageSize = 2,
        @SortColumn = N'USERNAME',
        @SortDirection = 'DESCENDING',
        @TotalCount = @TotalCount OUTPUT;

    IF @TotalCount <> 4 OR EXISTS (SELECT 1 FROM @Page)
    BEGIN
        THROW 52206, 'Empty-page output total is incorrect.', 1;
    END;

    SET @TotalCount = NULL;
    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'erp2-%-literal',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING',
        @TotalCount = @TotalCount OUTPUT;

    IF @TotalCount <> 1
       OR (SELECT COUNT_BIG(1) FROM @Page) <> 1
       OR NOT EXISTS (SELECT 1 FROM @Page WHERE [Id] = @PercentId)
    BEGIN
        THROW 52207, 'Literal percent search escaping is incorrect.', 1;
    END;

    DELETE FROM @Page;
    SET @TotalCount = NULL;
    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'erp2-_-literal',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING',
        @TotalCount = @TotalCount OUTPUT;

    IF @TotalCount <> 1
       OR NOT EXISTS (SELECT 1 FROM @Page WHERE [Id] = @UnderscoreId)
    BEGIN
        THROW 52208, 'Literal underscore search escaping is incorrect.', 1;
    END;

    DELETE FROM @Page;
    SET @TotalCount = NULL;
    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'erp2-[-literal',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING',
        @TotalCount = @TotalCount OUTPUT;

    IF @TotalCount <> 1
       OR NOT EXISTS (SELECT 1 FROM @Page WHERE [Id] = @BracketId)
    BEGIN
        THROW 52209, 'Literal bracket search escaping is incorrect.', 1;
    END;

    ROLLBACK TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;
    THROW;
END CATCH;

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Users]
    WHERE [Id] IN (@AlphaId, @PercentId, @UnderscoreId, @BracketId, @DeletedId)
)
BEGIN
    THROW 52210, 'ERP-0002 fixtures remain after rollback.', 1;
END;

PRINT N'ERP-0002 user-directory DB contract passed.';
GO
