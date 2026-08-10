USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51901, 'Rollback is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
   OR N'$(ConfirmedDatabase)' <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 51902, 'Database identity confirmation failed.', 1;
END;

IF N'$(ConfirmRollback)' <> N'YES'
BEGIN
    THROW 51903, 'ConfirmRollback must be exactly YES.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPBaselineOwner'
        AND CONVERT(nvarchar(4000), [value]) =
            N'employee-management-mvc/ERP-0000/v1'
)
BEGIN
    THROW 51904, 'ERP-0000 database ownership token is missing or wrong.', 1;
END;

SELECT
    [S].[name] AS [SchemaName],
    [O].[name] AS [ObjectName],
    [O].[type_desc] AS [ObjectType]
FROM [sys].[objects] AS [O]
INNER JOIN [sys].[schemas] AS [S]
    ON [S].[schema_id] = [O].[schema_id]
WHERE [O].[object_id] IN
(
    OBJECT_ID(N'dbo.GetListUser', N'P'),
    OBJECT_ID(N'dbo.FK_Employees_Users_UserId', N'F'),
    OBJECT_ID(N'dbo.FK_Units_Units_ParentUnitId', N'F'),
    OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
    OBJECT_ID(N'dbo.Employees', N'U'),
    OBJECT_ID(N'dbo.Units', N'U'),
    OBJECT_ID(N'dbo.Users', N'U'),
    OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U')
)
ORDER BY [O].[type_desc], [S].[name], [O].[name];

IF OBJECT_ID(N'dbo.EmployeeUnits', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.EmployeeUnits' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[EmployeeUnits];
END;

IF OBJECT_ID(N'dbo.Employees', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.Employees' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[Employees];
END;

IF OBJECT_ID(N'dbo.Units', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.Units' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[Units];
END;

IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.Users' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[Users];
END;

IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
BEGIN
    SELECT N'dbo.__EFMigrationsHistory' AS [ObjectName], COUNT_BIG(1) AS [RowCount]
    FROM [dbo].[__EFMigrationsHistory];
END;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.GetListUser', N'P') IS NOT NULL
    BEGIN
        DROP PROCEDURE [dbo].[GetListUser];
    END;

    IF OBJECT_ID(N'dbo.FK_Employees_Users_UserId', N'F') IS NOT NULL
    BEGIN
        ALTER TABLE [dbo].[Employees]
        DROP CONSTRAINT [FK_Employees_Users_UserId];
    END;

    IF OBJECT_ID(N'dbo.FK_Units_Units_ParentUnitId', N'F') IS NOT NULL
    BEGIN
        ALTER TABLE [dbo].[Units]
        DROP CONSTRAINT [FK_Units_Units_ParentUnitId];
    END;

    IF OBJECT_ID(N'dbo.EmployeeUnits', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[EmployeeUnits];
    END;

    IF OBJECT_ID(N'dbo.Employees', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[Employees];
    END;

    IF OBJECT_ID(N'dbo.Units', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[Units];
    END;

    IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[Users];
    END;

    IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
    BEGIN
        DROP TABLE [dbo].[__EFMigrationsHistory];
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;

PRINT N'ERP-0000 baseline objects were removed; database catalog was retained.';
GO
