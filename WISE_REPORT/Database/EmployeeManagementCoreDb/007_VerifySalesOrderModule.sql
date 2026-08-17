USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 53340, 'ERP-0004 verification is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 53341, 'ERP-0004 verification is connected to the wrong database.', 1;
END;

IF
(
    SELECT [compatibility_level]
    FROM [sys].[databases]
    WHERE [name] = DB_NAME()
) < 110
BEGIN
    THROW 53342, 'Database compatibility level must be at least 110.', 1;
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
    THROW 53343, 'ERP-0004 module ownership token is missing or wrong.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[columns] AS [C]
    INNER JOIN [sys].[types] AS [T]
        ON [T].[user_type_id] = [C].[user_type_id]
    WHERE
        [C].[object_id] = OBJECT_ID(N'dbo.Users', N'U')
        AND [C].[name] = N'Profile'
        AND [T].[name] = N'nvarchar'
        AND [C].[max_length] = -1
        AND [C].[is_nullable] = 1
)
BEGIN
    THROW 53344, 'dbo.Users.Profile is missing or incompatible.', 1;
END;

DECLARE @ExpectedColumns TABLE
(
    [TableName] sysname NOT NULL,
    [ColumnName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NOT NULL,
    [Precision] tinyint NOT NULL,
    [Scale] tinyint NOT NULL,
    [IsNullable] bit NOT NULL,
    [IsComputed] bit NOT NULL,
    PRIMARY KEY ([TableName], [ColumnName])
);

INSERT INTO @ExpectedColumns
(
    [TableName],
    [ColumnName],
    [TypeName],
    [MaxLength],
    [Precision],
    [Scale],
    [IsNullable],
    [IsComputed]
)
VALUES
    (N'SalesOrders', N'Id', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrders', N'OrderNumber', N'varchar', 20, 0, 0, 0, 0),
    (N'SalesOrders', N'ClientRequestId', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrders', N'PayloadHash', N'binary', 32, 0, 0, 0, 0),
    (N'SalesOrders', N'EmployeeId', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrders', N'CustomerCode', N'nvarchar', 100, 0, 0, 1, 0),
    (N'SalesOrders', N'CustomerName', N'nvarchar', 400, 0, 0, 0, 0),
    (N'SalesOrders', N'OrderDate', N'date', 3, 10, 0, 0, 0),
    (N'SalesOrders', N'Status', N'tinyint', 1, 3, 0, 0, 0),
    (N'SalesOrders', N'Notes', N'nvarchar', 2000, 0, 0, 1, 0),
    (N'SalesOrders', N'ItemCount', N'int', 4, 10, 0, 0, 0),
    (N'SalesOrders', N'TotalQuantity', N'decimal', 9, 18, 3, 0, 0),
    (N'SalesOrders', N'SubtotalAmount', N'decimal', 9, 19, 4, 0, 0),
    (N'SalesOrders', N'DiscountAmount', N'decimal', 9, 19, 4, 0, 0),
    (N'SalesOrders', N'TotalAmount', N'decimal', 9, 19, 4, 0, 0),
    (N'SalesOrders', N'CurrencyCode', N'char', 3, 0, 0, 0, 0),
    (N'SalesOrders', N'CreatedAt', N'datetime2', 8, 27, 7, 0, 0),
    (N'SalesOrders', N'CreatedByUserId', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrders', N'ApprovedAt', N'datetime2', 8, 27, 7, 1, 0),
    (N'SalesOrders', N'ApprovedByUserId', N'uniqueidentifier', 16, 0, 0, 1, 0),
    (N'SalesOrders', N'RejectedAt', N'datetime2', 8, 27, 7, 1, 0),
    (N'SalesOrders', N'RejectedByUserId', N'uniqueidentifier', 16, 0, 0, 1, 0),
    (N'SalesOrders', N'ReviewNote', N'nvarchar', 1000, 0, 0, 1, 0),
    (N'SalesOrders', N'RowVersion', N'timestamp', 8, 0, 0, 0, 0),
    (N'SalesOrderItems', N'Id', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrderItems', N'SalesOrderId', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrderItems', N'LineNumber', N'int', 4, 10, 0, 0, 0),
    (N'SalesOrderItems', N'ProductCode', N'nvarchar', 100, 0, 0, 0, 0),
    (N'SalesOrderItems', N'ProductName', N'nvarchar', 400, 0, 0, 0, 0),
    (N'SalesOrderItems', N'ProductCategory', N'nvarchar', 200, 0, 0, 1, 0),
    (N'SalesOrderItems', N'Quantity', N'decimal', 9, 18, 3, 0, 0),
    (N'SalesOrderItems', N'UnitPrice', N'decimal', 9, 19, 4, 0, 0),
    (N'SalesOrderItems', N'DiscountAmount', N'decimal', 9, 19, 4, 0, 0),
    (N'SalesOrderItems', N'LineAmount', N'decimal', 9, 19, 4, 1, 1),
    (N'SalesOrderItems', N'CreatedAt', N'datetime2', 8, 27, 7, 0, 0),
    (N'SalesOrderStatusHistory', N'Id', N'bigint', 8, 19, 0, 0, 0),
    (N'SalesOrderStatusHistory', N'SalesOrderId', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrderStatusHistory', N'FromStatus', N'tinyint', 1, 3, 0, 1, 0),
    (N'SalesOrderStatusHistory', N'ToStatus', N'tinyint', 1, 3, 0, 0, 0),
    (N'SalesOrderStatusHistory', N'ChangedAt', N'datetime2', 8, 27, 7, 0, 0),
    (N'SalesOrderStatusHistory', N'ChangedByUserId', N'uniqueidentifier', 16, 0, 0, 0, 0),
    (N'SalesOrderStatusHistory', N'Comment', N'nvarchar', 1000, 0, 0, 1, 0);

IF (SELECT COUNT_BIG(1) FROM @ExpectedColumns) <> 42
BEGIN
    THROW 53345, 'ERP-0004 expected-column inventory is incomplete.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM @ExpectedColumns AS [E]
    LEFT JOIN [sys].[columns] AS [C]
        ON [C].[object_id] = OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        AND [C].[name] = [E].[ColumnName]
    LEFT JOIN [sys].[types] AS [T]
        ON [T].[user_type_id] = [C].[user_type_id]
    WHERE
        [C].[object_id] IS NULL
        OR [T].[name] <> [E].[TypeName]
        OR [C].[max_length] <> [E].[MaxLength]
        OR
        (
            [E].[TypeName] IN (N'decimal', N'date', N'datetime2', N'int', N'bigint', N'tinyint')
            AND [C].[precision] <> [E].[Precision]
        )
        OR
        (
            [E].[TypeName] IN (N'decimal', N'datetime2')
            AND [C].[scale] <> [E].[Scale]
        )
        OR [C].[is_nullable] <> [E].[IsNullable]
        OR [C].[is_computed] <> [E].[IsComputed]
)
BEGIN
    SELECT
        [E].[TableName],
        [E].[ColumnName],
        [E].[TypeName] AS [ExpectedType],
        [T].[name] AS [ActualType],
        [E].[MaxLength] AS [ExpectedMaxLength],
        [C].[max_length] AS [ActualMaxLength],
        [E].[Precision] AS [ExpectedPrecision],
        [C].[precision] AS [ActualPrecision],
        [E].[Scale] AS [ExpectedScale],
        [C].[scale] AS [ActualScale],
        [E].[IsNullable] AS [ExpectedNullable],
        [C].[is_nullable] AS [ActualNullable],
        [E].[IsComputed] AS [ExpectedComputed],
        [C].[is_computed] AS [ActualComputed]
    FROM @ExpectedColumns AS [E]
    LEFT JOIN [sys].[columns] AS [C]
        ON [C].[object_id] = OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        AND [C].[name] = [E].[ColumnName]
    LEFT JOIN [sys].[types] AS [T]
        ON [T].[user_type_id] = [C].[user_type_id]
    ORDER BY [E].[TableName], [E].[ColumnName];

    THROW 53346, 'ERP-0004 table columns are missing or incompatible.', 1;
END;

IF (SELECT COUNT_BIG(1) FROM [sys].[columns] WHERE [object_id] = OBJECT_ID(N'dbo.SalesOrders')) <> 24
   OR (SELECT COUNT_BIG(1) FROM [sys].[columns] WHERE [object_id] = OBJECT_ID(N'dbo.SalesOrderItems')) <> 11
   OR (SELECT COUNT_BIG(1) FROM [sys].[columns] WHERE [object_id] = OBJECT_ID(N'dbo.SalesOrderStatusHistory')) <> 7
BEGIN
    THROW 53347, 'ERP-0004 tables contain unexpected columns.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[computed_columns]
    WHERE
        [object_id] = OBJECT_ID(N'dbo.SalesOrderItems', N'U')
        AND [name] = N'LineAmount'
        AND [is_persisted] = 1
)
BEGIN
    THROW 53348, 'SalesOrderItems.LineAmount must be a persisted computed column.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[identity_columns]
    WHERE
        [object_id] = OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U')
        AND [name] = N'Id'
        AND CONVERT(bigint, [seed_value]) = 1
        AND CONVERT(bigint, [increment_value]) = 1
)
BEGIN
    THROW 53349, 'SalesOrderStatusHistory.Id identity contract is incompatible.', 1;
END;

DECLARE @ExpectedForeignKeys TABLE ([Name] sysname NOT NULL PRIMARY KEY);

INSERT INTO @ExpectedForeignKeys ([Name])
VALUES
    (N'FK_SalesOrders_Employees_EmployeeId'),
    (N'FK_SalesOrders_Users_CreatedByUserId'),
    (N'FK_SalesOrders_Users_ApprovedByUserId'),
    (N'FK_SalesOrders_Users_RejectedByUserId'),
    (N'FK_SalesOrderItems_SalesOrders_SalesOrderId'),
    (N'FK_SalesOrderStatusHistory_SalesOrders_SalesOrderId'),
    (N'FK_SalesOrderStatusHistory_Users_ChangedByUserId');

IF EXISTS
(
    SELECT 1
    FROM @ExpectedForeignKeys AS [E]
    LEFT JOIN [sys].[foreign_keys] AS [F]
        ON [F].[name] = [E].[Name]
    WHERE
        [F].[object_id] IS NULL
        OR [F].[is_disabled] = 1
        OR [F].[is_not_trusted] = 1
        OR [F].[delete_referential_action] <> 0
        OR [F].[update_referential_action] <> 0
)
BEGIN
    THROW 53350, 'An ERP-0004 foreign key is missing, disabled, untrusted, or cascading.', 1;
END;

DECLARE @ExpectedChecks TABLE ([Name] sysname NOT NULL PRIMARY KEY);

INSERT INTO @ExpectedChecks ([Name])
VALUES
    (N'CK_SalesOrders_OrderNumber'),
    (N'CK_SalesOrders_CustomerName'),
    (N'CK_SalesOrders_Status'),
    (N'CK_SalesOrders_ItemCount'),
    (N'CK_SalesOrders_TotalQuantity'),
    (N'CK_SalesOrders_Amounts'),
    (N'CK_SalesOrders_Currency'),
    (N'CK_SalesOrders_Decision'),
    (N'CK_SalesOrderItems_LineNumber'),
    (N'CK_SalesOrderItems_ProductCode'),
    (N'CK_SalesOrderItems_ProductName'),
    (N'CK_SalesOrderItems_Quantity'),
    (N'CK_SalesOrderItems_UnitPrice'),
    (N'CK_SalesOrderItems_Discount'),
    (N'CK_SalesOrderStatusHistory_Transition');

IF EXISTS
(
    SELECT 1
    FROM @ExpectedChecks AS [E]
    LEFT JOIN [sys].[check_constraints] AS [C]
        ON [C].[name] = [E].[Name]
    WHERE
        [C].[object_id] IS NULL
        OR [C].[is_disabled] = 1
        OR [C].[is_not_trusted] = 1
)
BEGIN
    THROW 53351, 'An ERP-0004 check constraint is missing, disabled, or untrusted.', 1;
END;

DECLARE @HeaderAmountsCheck nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.CK_SalesOrders_Amounts', N'C'))), N'');

DECLARE @ItemUnitPriceCheck nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.CK_SalesOrderItems_UnitPrice', N'C'))), N'');

DECLARE @ItemDiscountCheck nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.CK_SalesOrderItems_Discount', N'C'))), N'');

IF CHARINDEX(N'[TOTALAMOUNT]>CONVERT([DECIMAL](19,4),(0))', @HeaderAmountsCheck) = 0
BEGIN
    THROW 53383, 'CK_SalesOrders_Amounts must require a positive TotalAmount.', 1;
END;

IF CHARINDEX(N'ROUND([SUBTOTALAMOUNT],(0))', @HeaderAmountsCheck) = 0
   OR CHARINDEX(N'ROUND([DISCOUNTAMOUNT],(0))', @HeaderAmountsCheck) = 0
   OR CHARINDEX(N'[TOTALAMOUNT]=([SUBTOTALAMOUNT]-[DISCOUNTAMOUNT])', @HeaderAmountsCheck) = 0
   OR CHARINDEX(N'ROUND([TOTALAMOUNT],(0))', @HeaderAmountsCheck) = 0
   OR CHARINDEX(N'[UNITPRICE]<=CONVERT([DECIMAL](19,4),(999999999))', @ItemUnitPriceCheck) = 0
   OR CHARINDEX(N'ROUND([UNITPRICE],(0))', @ItemUnitPriceCheck) = 0
   OR CHARINDEX(N'[DISCOUNTAMOUNT]<=CONVERT([DECIMAL](19,4),(999999999999999.))', @ItemDiscountCheck) = 0
   OR CHARINDEX(N'ROUND([DISCOUNTAMOUNT],(0))', @ItemDiscountCheck) = 0
   OR CHARINDEX(N'ROUND([QUANTITY]*[UNITPRICE],(0))', @ItemDiscountCheck) = 0
   OR CHARINDEX(N'[DISCOUNTAMOUNT]<=[QUANTITY]*[UNITPRICE]', @ItemDiscountCheck) = 0
BEGIN
    THROW 53384, 'ERP-0004 amount constraints lack a whole-VND or supported-range guard.', 1;
END;

DECLARE @ExpectedIndexes TABLE
(
    [TableName] sysname NOT NULL,
    [IndexName] sysname NOT NULL,
    [MustBeUnique] bit NOT NULL,
    PRIMARY KEY ([TableName], [IndexName])
);

INSERT INTO @ExpectedIndexes ([TableName], [IndexName], [MustBeUnique])
VALUES
    (N'Employees', N'UX_Employees_Active_UserId', 1),
    (N'SalesOrders', N'UX_SalesOrders_OrderNumber', 1),
    (N'SalesOrders', N'UX_SalesOrders_Employee_ClientRequest', 1),
    (N'SalesOrders', N'IX_SalesOrders_Employee_Status_ApprovedAt', 0),
    (N'SalesOrders', N'IX_SalesOrders_Status_CreatedAt_Employee', 0),
    (N'SalesOrderItems', N'UX_SalesOrderItems_Order_LineNumber', 1),
    (N'SalesOrderStatusHistory', N'UX_SalesOrderStatusHistory_Order_ToStatus', 1),
    (N'SalesOrderStatusHistory', N'IX_SalesOrderStatusHistory_Order_ChangedAt', 0);

IF EXISTS
(
    SELECT 1
    FROM @ExpectedIndexes AS [E]
    LEFT JOIN [sys].[indexes] AS [I]
        ON [I].[object_id] = OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        AND [I].[name] = [E].[IndexName]
    WHERE
        [I].[index_id] IS NULL
        OR [I].[is_disabled] = 1
        OR [I].[is_unique] <> [E].[MustBeUnique]
)
BEGIN
    THROW 53352, 'An ERP-0004 index is missing, disabled, or has the wrong uniqueness contract.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[indexes]
    WHERE
        [object_id] = OBJECT_ID(N'dbo.Employees', N'U')
        AND [name] = N'UX_Employees_Active_UserId'
        AND [is_unique] = 1
        AND [has_filter] = 1
        AND UPPER([filter_definition]) LIKE N'%USERID%IS NOT NULL%'
        AND UPPER([filter_definition]) LIKE N'%ISDELETED%0%'
)
BEGIN
    THROW 53353, 'UX_Employees_Active_UserId does not enforce the active-user filter.', 1;
END;

IF EXISTS
(
    SELECT [E].[UserId]
    FROM [dbo].[Employees] AS [E]
    WHERE
        [E].[UserId] IS NOT NULL
        AND [E].[IsDeleted] = CONVERT(bit, 0)
    GROUP BY [E].[UserId]
    HAVING COUNT_BIG(1) > 1
)
BEGIN
    THROW 53354, 'An active user is linked to more than one employee.', 1;
END;

IF TYPE_ID(N'dbo.SalesOrderLineInput') IS NULL
BEGIN
    THROW 53355, 'dbo.SalesOrderLineInput is missing.', 1;
END;

DECLARE @ExpectedTypeColumns TABLE
(
    [ColumnId] int NOT NULL PRIMARY KEY,
    [ColumnName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NOT NULL,
    [Precision] tinyint NOT NULL,
    [Scale] tinyint NOT NULL,
    [IsNullable] bit NOT NULL
);

INSERT INTO @ExpectedTypeColumns
    ([ColumnId], [ColumnName], [TypeName], [MaxLength], [Precision], [Scale], [IsNullable])
VALUES
    (1, N'LineNumber', N'int', 4, 10, 0, 0),
    (2, N'ProductCode', N'nvarchar', 100, 0, 0, 0),
    (3, N'ProductName', N'nvarchar', 400, 0, 0, 0),
    (4, N'ProductCategory', N'nvarchar', 200, 0, 0, 1),
    (5, N'Quantity', N'decimal', 9, 18, 3, 0),
    (6, N'UnitPrice', N'decimal', 9, 19, 4, 0),
    (7, N'DiscountAmount', N'decimal', 9, 19, 4, 0);

IF EXISTS
(
    SELECT 1
    FROM @ExpectedTypeColumns AS [E]
    LEFT JOIN [sys].[table_types] AS [TT]
        ON [TT].[user_type_id] = TYPE_ID(N'dbo.SalesOrderLineInput')
    LEFT JOIN [sys].[columns] AS [C]
        ON [C].[object_id] = [TT].[type_table_object_id]
        AND [C].[column_id] = [E].[ColumnId]
    LEFT JOIN [sys].[types] AS [T]
        ON [T].[user_type_id] = [C].[user_type_id]
    WHERE
        [C].[column_id] IS NULL
        OR [C].[name] <> [E].[ColumnName]
        OR [T].[name] <> [E].[TypeName]
        OR [C].[max_length] <> [E].[MaxLength]
        OR
        (
            [E].[TypeName] IN (N'decimal', N'int')
            AND [C].[precision] <> [E].[Precision]
        )
        OR
        (
            [E].[TypeName] = N'decimal'
            AND [C].[scale] <> [E].[Scale]
        )
        OR [C].[is_nullable] <> [E].[IsNullable]
)
OR
(
    SELECT COUNT_BIG(1)
    FROM [sys].[table_types] AS [TT]
    INNER JOIN [sys].[columns] AS [C]
        ON [C].[object_id] = [TT].[type_table_object_id]
    WHERE [TT].[user_type_id] = TYPE_ID(N'dbo.SalesOrderLineInput')
) <> 7
BEGIN
    THROW 53356, 'dbo.SalesOrderLineInput is incompatible.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[sequences]
    WHERE
        [object_id] = OBJECT_ID(N'dbo.SalesOrderNumberSequence', N'SO')
        AND [system_type_id] = TYPE_ID(N'bigint')
        AND CONVERT(bigint, [increment]) = 1
        AND [is_cycling] = 0
)
BEGIN
    THROW 53357, 'dbo.SalesOrderNumberSequence is missing or incompatible.', 1;
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
    WHERE OBJECT_ID(N'dbo.' + QUOTENAME([E].[Name]), N'P') IS NULL
)
BEGIN
    THROW 53358, 'An ERP-0004 stored procedure is missing.', 1;
END;

DECLARE @ExpectedParameters TABLE
(
    [ProcedureName] sysname NOT NULL,
    [ParameterId] int NOT NULL,
    [ParameterName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NULL,
    [Precision] tinyint NULL,
    [Scale] tinyint NULL,
    [IsReadOnly] bit NOT NULL,
    PRIMARY KEY ([ProcedureName], [ParameterId])
);

INSERT INTO @ExpectedParameters
    ([ProcedureName], [ParameterId], [ParameterName], [TypeName], [MaxLength], [Precision], [Scale], [IsReadOnly])
VALUES
    (N'GetListEmployee', 1, N'@Search', N'nvarchar', 512, NULL, NULL, 0),
    (N'GetListEmployee', 2, N'@PageNumber', N'int', 4, NULL, NULL, 0),
    (N'GetListEmployee', 3, N'@PageSize', N'int', 4, NULL, NULL, 0),
    (N'GetListEmployee', 4, N'@SortColumn', N'varchar', 30, NULL, NULL, 0),
    (N'GetListEmployee', 5, N'@SortDirection', N'varchar', 10, NULL, NULL, 0),
    (N'GetSessionPrincipal', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetEmployeeAccountCandidates', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetEmployeeAccountCandidates', 2, N'@EmployeeId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetEmployeeAccountCandidates', 3, N'@Search', N'nvarchar', 200, NULL, NULL, 0),
    (N'BindEmployeeAccount', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'BindEmployeeAccount', 2, N'@EmployeeId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'BindEmployeeAccount', 3, N'@UserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'BindEmployeeAccount', 4, N'@ExpectedEmployeeVersion', N'binary', 9, NULL, NULL, 0),
    (N'GetSalesOrderEmployeeOptions', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetSalesOrderEmployeeOptions', 2, N'@Search', N'nvarchar', 200, NULL, NULL, 0),
    (N'CreateSalesOrder', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'CreateSalesOrder', 2, N'@ClientRequestId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'CreateSalesOrder', 3, N'@PayloadHash', N'binary', 32, NULL, NULL, 0),
    (N'CreateSalesOrder', 4, N'@CustomerCode', N'nvarchar', 100, NULL, NULL, 0),
    (N'CreateSalesOrder', 5, N'@CustomerName', N'nvarchar', 400, NULL, NULL, 0),
    (N'CreateSalesOrder', 6, N'@OrderDate', N'date', 3, 10, 0, 0),
    (N'CreateSalesOrder', 7, N'@Notes', N'nvarchar', 2000, NULL, NULL, 0),
    (N'CreateSalesOrder', 8, N'@Lines', N'SalesOrderLineInput', NULL, NULL, NULL, 1),
    (N'ApproveSalesOrder', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'ApproveSalesOrder', 2, N'@OrderId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'ApproveSalesOrder', 3, N'@ExpectedRowVersion', N'binary', 8, NULL, NULL, 0),
    (N'ApproveSalesOrder', 4, N'@ReviewNote', N'nvarchar', 1000, NULL, NULL, 0),
    (N'RejectSalesOrder', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'RejectSalesOrder', 2, N'@OrderId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'RejectSalesOrder', 3, N'@ExpectedRowVersion', N'binary', 8, NULL, NULL, 0),
    (N'RejectSalesOrder', 4, N'@ReviewNote', N'nvarchar', 1000, NULL, NULL, 0),
    (N'GetListSalesOrder', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetListSalesOrder', 2, N'@Search', N'nvarchar', 200, NULL, NULL, 0),
    (N'GetListSalesOrder', 3, N'@Status', N'tinyint', 1, NULL, NULL, 0),
    (N'GetListSalesOrder', 4, N'@EmployeeId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetListSalesOrder', 5, N'@FromApprovedAt', N'datetime2', 8, 27, 7, 0),
    (N'GetListSalesOrder', 6, N'@ToApprovedAtExclusive', N'datetime2', 8, 27, 7, 0),
    (N'GetListSalesOrder', 7, N'@MinTotalAmount', N'decimal', 9, 19, 4, 0),
    (N'GetListSalesOrder', 8, N'@MaxTotalAmount', N'decimal', 9, 19, 4, 0),
    (N'GetListSalesOrder', 9, N'@PageNumber', N'int', 4, NULL, NULL, 0),
    (N'GetListSalesOrder', 10, N'@PageSize', N'int', 4, NULL, NULL, 0),
    (N'GetListSalesOrder', 11, N'@SortColumn', N'varchar', 30, NULL, NULL, 0),
    (N'GetListSalesOrder', 12, N'@SortDirection', N'varchar', 10, NULL, NULL, 0),
    (N'GetSalesOrderDetail', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetSalesOrderDetail', 2, N'@OrderId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 1, N'@ActorUserId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 2, N'@EmployeeId', N'uniqueidentifier', 16, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 3, N'@FromApprovedAt', N'datetime2', 8, 27, 7, 0),
    (N'GetEmployeeSalesReport', 4, N'@ToApprovedAtExclusive', N'datetime2', 8, 27, 7, 0),
    (N'GetEmployeeSalesReport', 5, N'@GroupBy', N'varchar', 10, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 6, N'@Search', N'nvarchar', 200, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 7, N'@ProductKeyword', N'nvarchar', 200, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 8, N'@MinTotalAmount', N'decimal', 9, 19, 4, 0),
    (N'GetEmployeeSalesReport', 9, N'@MaxTotalAmount', N'decimal', 9, 19, 4, 0),
    (N'GetEmployeeSalesReport', 10, N'@Mode', N'varchar', 10, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 11, N'@PageNumber', N'int', 4, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 12, N'@PageSize', N'int', 4, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 13, N'@SortColumn', N'varchar', 30, NULL, NULL, 0),
    (N'GetEmployeeSalesReport', 14, N'@SortDirection', N'varchar', 10, NULL, NULL, 0);

IF EXISTS
(
    SELECT 1
    FROM @ExpectedParameters AS [E]
    LEFT JOIN [sys].[parameters] AS [P]
        ON [P].[object_id] = OBJECT_ID(N'dbo.' + QUOTENAME([E].[ProcedureName]), N'P')
        AND [P].[parameter_id] = [E].[ParameterId]
    LEFT JOIN [sys].[types] AS [T]
        ON [T].[user_type_id] = [P].[user_type_id]
    WHERE
        [P].[parameter_id] IS NULL
        OR [P].[name] <> [E].[ParameterName]
        OR [T].[name] <> [E].[TypeName]
        OR ([E].[MaxLength] IS NOT NULL AND [P].[max_length] <> [E].[MaxLength])
        OR ([E].[Precision] IS NOT NULL AND [P].[precision] <> [E].[Precision])
        OR ([E].[Scale] IS NOT NULL AND [P].[scale] <> [E].[Scale])
        OR [P].[is_readonly] <> [E].[IsReadOnly]
)
OR EXISTS
(
    SELECT 1
    FROM @ExpectedProcedures AS [Procedure]
    INNER JOIN [sys].[parameters] AS [P]
        ON [P].[object_id] = OBJECT_ID(N'dbo.' + QUOTENAME([Procedure].[Name]), N'P')
    LEFT JOIN @ExpectedParameters AS [E]
        ON [E].[ProcedureName] = [Procedure].[Name]
        AND [E].[ParameterId] = [P].[parameter_id]
    WHERE [E].[ParameterId] IS NULL
)
BEGIN
    THROW 53359, 'An ERP-0004 stored-procedure parameter contract is incompatible.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM @ExpectedProcedures AS [P]
    CROSS APPLY
    (
        SELECT UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.' + QUOTENAME([P].[Name]), N'P')))
            AS [Definition]
    ) AS [D]
    WHERE
        [D].[Definition] LIKE N'%NOLOCK%'
        OR [D].[Definition] LIKE N'%SP_EXECUTESQL%'
        OR [D].[Definition] LIKE N'%EXEC(%'
)
BEGIN
    THROW 53360, 'An ERP-0004 stored procedure contains a forbidden query pattern.', 1;
END;

IF CHARINDEX(N'[PASSWORD]', COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.GetSessionPrincipal', N'P'))), N'')) > 0
   OR CHARINDEX(N'[PASSWORD]', COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.GetEmployeeAccountCandidates', N'P'))), N'')) > 0
   OR CHARINDEX(N'[PASSWORD]', COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.GetEmployeeSalesReport', N'P'))), N'')) > 0
BEGIN
    THROW 53361, 'A safe read procedure references the Password column.', 1;
END;

DECLARE @ApproveDefinition nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.ApproveSalesOrder', N'P'))), N'');

DECLARE @CreateDefinition nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.CreateSalesOrder', N'P'))), N'');

DECLARE @ListDefinition nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.GetListSalesOrder', N'P'))), N'');

DECLARE @BindDefinition nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.BindEmployeeAccount', N'P'))), N'');

DECLARE @RejectDefinition nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.RejectSalesOrder', N'P'))), N'');

IF @CreateDefinition NOT LIKE N'%CLIENTREQUESTID%'
   OR @CreateDefinition NOT LIKE N'%PAYLOADHASH%'
   OR @CreateDefinition NOT LIKE N'%WASALREADYCREATED%'
   OR @CreateDefinition NOT LIKE N'%UPDLOCK%'
   OR @CreateDefinition NOT LIKE N'%HOLDLOCK%'
BEGIN
    THROW 53362, 'CreateSalesOrder lacks its idempotency contract.', 1;
END;

IF @ApproveDefinition NOT LIKE N'%UPDLOCK%'
   OR @ApproveDefinition NOT LIKE N'%HOLDLOCK%'
   OR @ApproveDefinition NOT LIKE N'%WASALREADYAPPROVED%'
BEGIN
    THROW 53364, 'ApproveSalesOrder lacks its concurrency or idempotency contract.', 1;
END;

IF @BindDefinition NOT LIKE N'%IF @USERID IS NULL%'
   OR @BindDefinition NOT LIKE N'%@ACTUALEMPLOYEEVERSION <> @EXPECTEDEMPLOYEEVERSION%'
   OR CHARINDEX(N'DATEADD(NANOSECOND, 100, [LASTMODIFIEDAT])', @BindDefinition) = 0
   OR @BindDefinition NOT LIKE N'%THROW 53400%'
BEGIN
    THROW 53363, 'BindEmployeeAccount lacks its non-null or optimistic-concurrency guard.', 1;
END;

IF @RejectDefinition NOT LIKE N'%LEN(@NORMALIZEDREVIEWNOTE) < 3%'
   OR @RejectDefinition NOT LIKE N'%THROW 53400%'
BEGIN
    THROW 53366, 'RejectSalesOrder lacks its post-trim minimum-note guard.', 1;
END;

IF @CreateDefinition NOT LIKE N'%@TOTALAMOUNT <= CONVERT(DECIMAL(19, 4), 0)%'
   OR CHARINDEX(N'[L].[UNITPRICE] > CONVERT(DECIMAL(19, 4), 999999999)', @CreateDefinition) = 0
   OR CHARINDEX(N'[L].[UNITPRICE] <> ROUND([L].[UNITPRICE], 0)', @CreateDefinition) = 0
   OR CHARINDEX(N'[L].[DISCOUNTAMOUNT] > CONVERT(DECIMAL(19, 4), 999999999999999)', @CreateDefinition) = 0
   OR CHARINDEX(N'[L].[DISCOUNTAMOUNT] <> ROUND([L].[DISCOUNTAMOUNT], 0)', @CreateDefinition) = 0
   OR CHARINDEX(N'[L].[QUANTITY] * [L].[UNITPRICE] <> ROUND([L].[QUANTITY] * [L].[UNITPRICE], 0)', @CreateDefinition) = 0
   OR @CreateDefinition NOT LIKE N'%@SUBTOTALAMOUNT <> ROUND(@SUBTOTALAMOUNT, 0)%'
   OR @CreateDefinition NOT LIKE N'%@DISCOUNTAMOUNT <> ROUND(@DISCOUNTAMOUNT, 0)%'
   OR @CreateDefinition NOT LIKE N'%@TOTALAMOUNT <> ROUND(@TOTALAMOUNT, 0)%'
BEGIN
    THROW 53367, 'CreateSalesOrder lacks its positive-total or whole-VND guard.', 1;
END;

DECLARE @ReportDefinition nvarchar(max) =
    COALESCE(UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.GetEmployeeSalesReport', N'P'))), N'');

IF CHARINDEX(N'[O].[APPROVEDAT] >= @FROMAPPROVEDAT', @ReportDefinition) = 0
   OR CHARINDEX(N'DATEADD(HOUR, 7, [F].[APPROVEDAT])', @ReportDefinition) = 0
   OR CHARINDEX(N'@TOTALCOUNT > 10000', @ReportDefinition) = 0
   OR CHARINDEX(N'@APPROVEDSALESAMOUNT > CONVERT(DECIMAL(38, 4), 999999999999999)', @ReportDefinition) = 0
   OR CHARINDEX(N'@APPROVEDTOTALQUANTITY > CONVERT(DECIMAL(38, 3), 999999999999.999)', @ReportDefinition) = 0
   OR @ReportDefinition NOT LIKE N'%@MINTOTALAMOUNT <> ROUND(@MINTOTALAMOUNT, 0)%'
   OR @ReportDefinition NOT LIKE N'%@MAXTOTALAMOUNT <> ROUND(@MAXTOTALAMOUNT, 0)%'
   OR @ReportDefinition NOT LIKE N'%THROW 53413%'
BEGIN
    THROW 53365, 'GetEmployeeSalesReport lacks ApprovedAt UTC+07 recognition or its export cap.', 1;
END;

IF @ListDefinition NOT LIKE N'%999999999999999%'
   OR @ListDefinition NOT LIKE N'%@MINTOTALAMOUNT <> ROUND(@MINTOTALAMOUNT, 0)%'
   OR @ListDefinition NOT LIKE N'%@MAXTOTALAMOUNT <> ROUND(@MAXTOTALAMOUNT, 0)%'
BEGIN
    THROW 53388, 'GetListSalesOrder lacks its whole-VND filter guard.', 1;
END;

PRINT N'ERP-0004 sales-order module verification passed.';
GO
