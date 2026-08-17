:on error exit

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 53390, 'ERP-0004 rollback is allowed only on SQL Server LocalDB.', 1;
END;

IF N'$(ConfirmedDatabase)' <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 53391, 'ConfirmedDatabase must exactly equal EmployeeManagementCoreDb.', 1;
END;

IF N'$(ConfirmRollback)' <> N'YES'
BEGIN
    THROW 53392, 'ConfirmRollback must exactly equal YES.', 1;
END;
GO

USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 53393, 'ERP-0004 rollback is connected to the wrong database.', 1;
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
    THROW 53394, 'ERP-0000 database ownership token is missing or wrong.', 1;
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
    THROW 53395, 'ERP-0004 module ownership token is missing or wrong.', 1;
END;

DECLARE @ExpectedProcedures TABLE ([Name] sysname NOT NULL PRIMARY KEY);

INSERT INTO @ExpectedProcedures ([Name])
VALUES
    (N'GetListEmployee'),
    (N'GetSessionPrincipal'),
    (N'GetEmployeeAccountCandidates'),
    (N'BindEmployeeAccount'),
    (N'GetSalesOrderEmployeeOptions'),
    (N'CreateSalesOrder'),
    (N'ApproveSalesOrder'),
    (N'RejectSalesOrder'),
    (N'GetListSalesOrder'),
    (N'GetSalesOrderDetail'),
    (N'GetEmployeeSalesReport');

IF EXISTS
(
    SELECT 1
    FROM @ExpectedProcedures AS [E]
    INNER JOIN [sys].[procedures] AS [P]
        ON [P].[schema_id] = SCHEMA_ID(N'dbo')
        AND [P].[name] = [E].[Name]
    WHERE
        OBJECT_DEFINITION([P].[object_id]) IS NULL
        OR OBJECT_DEFINITION([P].[object_id]) NOT LIKE N'%ERP-0004:%'
)
BEGIN
    THROW 53396, 'A procedure name is occupied by an object not marked as ERP-0004; rollback stopped.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM [sys].[indexes]
    WHERE
        [object_id] = OBJECT_ID(N'dbo.Employees', N'U')
        AND [name] = N'UX_Employees_Active_UserId'
        AND
        (
            [is_unique] <> 1
            OR [has_filter] <> 1
            OR UPPER([filter_definition]) NOT LIKE N'%USERID%IS NOT NULL%'
            OR UPPER([filter_definition]) NOT LIKE N'%ISDELETED%0%'
        )
)
BEGIN
    THROW 53397, 'UX_Employees_Active_UserId is not the ERP-0004 binding index; rollback stopped.', 1;
END;

DECLARE @ModuleTables TABLE ([ObjectId] int NOT NULL PRIMARY KEY);

INSERT INTO @ModuleTables ([ObjectId])
SELECT OBJECT_ID(N'dbo.SalesOrders', N'U')
WHERE OBJECT_ID(N'dbo.SalesOrders', N'U') IS NOT NULL
UNION ALL
SELECT OBJECT_ID(N'dbo.SalesOrderItems', N'U')
WHERE OBJECT_ID(N'dbo.SalesOrderItems', N'U') IS NOT NULL
UNION ALL
SELECT OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U')
WHERE OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U') IS NOT NULL;

IF EXISTS
(
    SELECT 1
    FROM [sys].[foreign_keys] AS [F]
    INNER JOIN @ModuleTables AS [M]
        ON [M].[ObjectId] = [F].[referenced_object_id]
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM @ModuleTables AS [ParentModuleTable]
        WHERE [ParentModuleTable].[ObjectId] = [F].[parent_object_id]
    )
)
BEGIN
    THROW 53398, 'A downstream table references ERP-0004 data; rollback stopped.', 1;
END;

SELECT
    [S].[name] AS [SchemaName],
    [O].[name] AS [ObjectName],
    [O].[type_desc] AS [ObjectType]
FROM [sys].[objects] AS [O]
INNER JOIN [sys].[schemas] AS [S]
    ON [S].[schema_id] = [O].[schema_id]
WHERE
    [O].[object_id] IN (SELECT [ObjectId] FROM @ModuleTables)
    OR
    (
        [S].[name] = N'dbo'
        AND EXISTS
        (
            SELECT 1
            FROM @ExpectedProcedures AS [E]
            WHERE [E].[Name] = [O].[name]
        )
    )
ORDER BY [ObjectType], [SchemaName], [ObjectName];

SELECT N'dbo.SalesOrders' AS [TableName], COUNT_BIG(1) AS [RowsToDelete]
FROM [dbo].[SalesOrders]
WHERE OBJECT_ID(N'dbo.SalesOrders', N'U') IS NOT NULL
UNION ALL
SELECT N'dbo.SalesOrderItems', COUNT_BIG(1)
FROM [dbo].[SalesOrderItems]
WHERE OBJECT_ID(N'dbo.SalesOrderItems', N'U') IS NOT NULL
UNION ALL
SELECT N'dbo.SalesOrderStatusHistory', COUNT_BIG(1)
FROM [dbo].[SalesOrderStatusHistory]
WHERE OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U') IS NOT NULL;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.GetEmployeeSalesReport', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[GetEmployeeSalesReport];

    IF OBJECT_ID(N'dbo.GetSalesOrderDetail', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[GetSalesOrderDetail];

    IF OBJECT_ID(N'dbo.GetListSalesOrder', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[GetListSalesOrder];

    IF OBJECT_ID(N'dbo.RejectSalesOrder', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[RejectSalesOrder];

    IF OBJECT_ID(N'dbo.ApproveSalesOrder', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[ApproveSalesOrder];

    IF OBJECT_ID(N'dbo.CreateSalesOrder', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[CreateSalesOrder];

    IF OBJECT_ID(N'dbo.GetSalesOrderEmployeeOptions', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[GetSalesOrderEmployeeOptions];

    IF OBJECT_ID(N'dbo.BindEmployeeAccount', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[BindEmployeeAccount];

    IF OBJECT_ID(N'dbo.GetEmployeeAccountCandidates', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[GetEmployeeAccountCandidates];

    IF OBJECT_ID(N'dbo.GetSessionPrincipal', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[GetSessionPrincipal];

    IF OBJECT_ID(N'dbo.GetListEmployee', N'P') IS NOT NULL
        DROP PROCEDURE [dbo].[GetListEmployee];

    IF TYPE_ID(N'dbo.SalesOrderLineInput') IS NOT NULL
        DROP TYPE [dbo].[SalesOrderLineInput];

    IF OBJECT_ID(N'dbo.SalesOrderNumberSequence', N'SO') IS NOT NULL
        DROP SEQUENCE [dbo].[SalesOrderNumberSequence];

    IF OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U') IS NOT NULL
        DROP TABLE [dbo].[SalesOrderStatusHistory];

    IF OBJECT_ID(N'dbo.SalesOrderItems', N'U') IS NOT NULL
        DROP TABLE [dbo].[SalesOrderItems];

    IF OBJECT_ID(N'dbo.SalesOrders', N'U') IS NOT NULL
        DROP TABLE [dbo].[SalesOrders];

    IF EXISTS
    (
        SELECT 1
        FROM [sys].[indexes]
        WHERE
            [object_id] = OBJECT_ID(N'dbo.Employees', N'U')
            AND [name] = N'UX_Employees_Active_UserId'
    )
        DROP INDEX [UX_Employees_Active_UserId] ON [dbo].[Employees];

    EXEC [sys].[sp_dropextendedproperty]
        @name = N'ERPSalesOrderModuleOwner';

    COMMIT TRANSACTION;
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
    FROM [sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPSalesOrderModuleOwner'
)
   OR OBJECT_ID(N'dbo.SalesOrders', N'U') IS NOT NULL
   OR OBJECT_ID(N'dbo.SalesOrderItems', N'U') IS NOT NULL
   OR OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U') IS NOT NULL
   OR TYPE_ID(N'dbo.SalesOrderLineInput') IS NOT NULL
   OR OBJECT_ID(N'dbo.SalesOrderNumberSequence', N'SO') IS NOT NULL
BEGIN
    THROW 53399, 'ERP-0004 rollback postcondition failed.', 1;
END;

IF COL_LENGTH(N'dbo.Users', N'Profile') IS NULL
BEGIN
    THROW 53389, 'Rollback removed dbo.Users.Profile, which must be retained.', 1;
END;

PRINT N'ERP-0004 module rollback completed. dbo.Users.Profile and ERP-0000 baseline objects were retained.';
GO
