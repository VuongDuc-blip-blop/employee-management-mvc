USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51200, 'Smoke test is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 51201, 'Smoke test is connected to the wrong database.', 1;
END;

DECLARE @ValidationWasRejected bit = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 0,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51001
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51202, 'PageNumber validation did not reject zero.', 1;
END;

SET @ValidationWasRejected = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 1,
        @PageSize = 201,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51002
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51203, 'PageSize validation did not reject 201.', 1;
END;

SET @ValidationWasRejected = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'PASSWORD',
        @SortDirection = 'ASCENDING';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51003
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51204, 'SortColumn allowlist accepted PASSWORD.', 1;
END;

SET @ValidationWasRejected = 0;

BEGIN TRY
    EXEC [dbo].[GetListUser]
        @Search = NULL,
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASC';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() <> 51004
    BEGIN
        THROW;
    END;

    SET @ValidationWasRejected = 1;
END CATCH;

IF @ValidationWasRejected = 0
BEGIN
    THROW 51205, 'SortDirection validation accepted ASC instead of the enum contract.', 1;
END;

DECLARE @ActiveAlphaId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E001';
DECLARE @ActivePercentId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E002';
DECLARE @DeletedId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E003';
DECLARE @AuditId uniqueidentifier =
    '00000000-0000-0000-0000-00000000E0FF';
DECLARE @Now datetime2(7) = SYSUTCDATETIME();

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Users]
    WHERE [Id] IN (@ActiveAlphaId, @ActivePercentId, @DeletedId)
)
BEGIN
    THROW 51206, 'Reserved smoke-test identifiers already exist.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

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
        [ModerationStatus]
    )
    VALUES
    (
        @ActiveAlphaId,
        N'baseline-smoke-alpha',
        N'ERP0000_NON_AUTHENTICATING_TEST_VALUE',
        @Now,
        @Now,
        @AuditId,
        @AuditId,
        0,
        NULL,
        1
    ),
    (
        @ActivePercentId,
        N'baseline-smoke-100%-literal',
        N'ERP0000_NON_AUTHENTICATING_TEST_VALUE',
        DATEADD(second, 1, @Now),
        DATEADD(second, 1, @Now),
        @AuditId,
        @AuditId,
        0,
        NULL,
        1
    ),
    (
        @DeletedId,
        N'baseline-smoke-deleted',
        N'ERP0000_NON_AUTHENTICATING_TEST_VALUE',
        DATEADD(second, 2, @Now),
        DATEADD(second, 2, @Now),
        @AuditId,
        @AuditId,
        1,
        DATEADD(second, 2, @Now),
        1
    );

    DECLARE @Page TABLE
    (
        [Id] uniqueidentifier NOT NULL,
        [UserName] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2(7) NOT NULL,
        [ModerationStatus] int NOT NULL,
        [TotalCount] bigint NOT NULL
    );

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'baseline-smoke',
        @PageNumber = 1,
        @PageSize = 1,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';

    IF (SELECT COUNT_BIG(1) FROM @Page) <> 1
    BEGIN
        THROW 51207, 'First page did not return exactly one row.', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Page
        WHERE
            [Id] = @ActivePercentId
            AND [UserName] = N'baseline-smoke-100%-literal'
            AND [TotalCount] = 2
    )
    BEGIN
        THROW 51208, 'Ascending first page or TotalCount is incorrect.', 1;
    END;

    DELETE FROM @Page;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'baseline-smoke',
        @PageNumber = 2,
        @PageSize = 1,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Page
        WHERE [Id] = @ActiveAlphaId AND [TotalCount] = 2
    )
    BEGIN
        THROW 51209, 'Second page is missing, overlapping, or has wrong TotalCount.', 1;
    END;

    DELETE FROM @Page;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'baseline-smoke',
        @PageNumber = 1,
        @PageSize = 1,
        @SortColumn = N'USERNAME',
        @SortDirection = 'DESCENDING';

    IF NOT EXISTS
    (
        SELECT 1
        FROM @Page
        WHERE [Id] = @ActiveAlphaId AND [TotalCount] = 2
    )
    BEGIN
        THROW 51210, 'Descending order is incorrect.', 1;
    END;

    DELETE FROM @Page;

    INSERT INTO @Page
        ([Id], [UserName], [CreatedAt], [ModerationStatus], [TotalCount])
    EXEC [dbo].[GetListUser]
        @Search = N'%',
        @PageNumber = 1,
        @PageSize = 20,
        @SortColumn = N'USERNAME',
        @SortDirection = 'ASCENDING';

    IF (SELECT COUNT_BIG(1) FROM @Page) <> 1
       OR NOT EXISTS
       (
           SELECT 1
           FROM @Page
           WHERE [Id] = @ActivePercentId AND [TotalCount] = 1
       )
    BEGIN
        THROW 51211, 'Literal percent search escaping is incorrect.', 1;
    END;

    IF EXISTS (SELECT 1 FROM @Page WHERE [Id] = @DeletedId)
    BEGIN
        THROW 51212, 'A soft-deleted user was returned.', 1;
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
    WHERE [Id] IN (@ActiveAlphaId, @ActivePercentId, @DeletedId)
)
BEGIN
    THROW 51213, 'Smoke-test rows remained after rollback.', 1;
END;

PRINT N'Transactional LocalDB smoke test passed; test data was rolled back.';
GO
