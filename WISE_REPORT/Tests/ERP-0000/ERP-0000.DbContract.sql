USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT OFF;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 52000, 'ERP-0000 tester contract is allowed only on LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 52001, 'ERP-0000 tester contract is connected to the wrong database.', 1;
END;

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
   OR OBJECT_ID(N'dbo.Employees', N'U') IS NULL
   OR OBJECT_ID(N'dbo.Units', N'U') IS NULL
   OR OBJECT_ID(N'dbo.EmployeeUnits', N'U') IS NULL
   OR OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL
   OR OBJECT_ID(N'dbo.GetListUser', N'P') IS NULL
BEGIN
    THROW 52002, 'Required ERP-0000 database objects are missing.', 1;
END;

DECLARE @NullableEmployeeId uniqueidentifier =
    '00000000-0000-0000-0000-00000000F001';
DECLARE @InvalidEmployeeId uniqueidentifier =
    '00000000-0000-0000-0000-00000000F002';
DECLARE @InvalidUnitId uniqueidentifier =
    '00000000-0000-0000-0000-00000000F003';
DECLARE @MissingReferenceId uniqueidentifier =
    '00000000-0000-0000-0000-00000000F0FE';
DECLARE @AuditId uniqueidentifier =
    '00000000-0000-0000-0000-00000000F0FF';
DECLARE @Now datetime2(7) = SYSUTCDATETIME();

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Employees]
    WHERE [Id] IN (@NullableEmployeeId, @InvalidEmployeeId)
)
OR EXISTS
(
    SELECT 1
    FROM [dbo].[Units]
    WHERE [Id] = @InvalidUnitId
)
BEGIN
    THROW 52003, 'Reserved tester identifiers already exist.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

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
        @NullableEmployeeId,
        N'ERP0000-NULL-USER',
        N'ERP-0000 transaction-only fixture',
        N'erp0000.invalid',
        N'0000000000',
        N'TEST_ONLY',
        0,
        NULL,
        @Now,
        @Now,
        @AuditId,
        @AuditId,
        0,
        NULL,
        1
    );

    IF NOT EXISTS
    (
        SELECT 1
        FROM [dbo].[Employees]
        WHERE [Id] = @NullableEmployeeId AND [UserId] IS NULL
    )
    BEGIN
        THROW 52004, 'Nullable Employees.UserId contract failed.', 1;
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

DECLARE @EmployeeFkRejected bit = 0;

BEGIN TRY
    BEGIN TRANSACTION;

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
        @InvalidEmployeeId,
        N'ERP0000-BAD-USER',
        N'ERP-0000 invalid reference fixture',
        N'erp0000.invalid',
        N'0000000000',
        N'TEST_ONLY',
        0,
        @MissingReferenceId,
        @Now,
        @Now,
        @AuditId,
        @AuditId,
        0,
        NULL,
        1
    );

    ROLLBACK TRANSACTION;
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 547
    BEGIN
        SET @EmployeeFkRejected = 1;
    END;

    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    IF ERROR_NUMBER() <> 547
    BEGIN
        THROW;
    END;
END CATCH;

IF @EmployeeFkRejected = 0
BEGIN
    THROW 52005, 'Employees.UserId accepted a missing Users.Id.', 1;
END;

DECLARE @UnitFkRejected bit = 0;

BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO [dbo].[Units]
    (
        [Id],
        [UnitCode],
        [UnitName],
        [ParentUnitId],
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
        @InvalidUnitId,
        N'ERP0000-BAD-PARENT',
        N'ERP-0000 invalid parent fixture',
        @MissingReferenceId,
        @Now,
        @Now,
        @AuditId,
        @AuditId,
        0,
        NULL,
        1
    );

    ROLLBACK TRANSACTION;
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 547
    BEGIN
        SET @UnitFkRejected = 1;
    END;

    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    IF ERROR_NUMBER() <> 547
    BEGIN
        THROW;
    END;
END CATCH;

IF @UnitFkRejected = 0
BEGIN
    THROW 52006, 'Units.ParentUnitId accepted a missing Units.Id.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM [dbo].[Employees]
    WHERE [Id] IN (@NullableEmployeeId, @InvalidEmployeeId)
)
OR EXISTS
(
    SELECT 1
    FROM [dbo].[Units]
    WHERE [Id] = @InvalidUnitId
)
BEGIN
    THROW 52007, 'ERP-0000 tester fixtures remained after rollback.', 1;
END;

PRINT N'ERP-0000 independent DB integrity contract passed; fixtures were rolled back.';
GO
