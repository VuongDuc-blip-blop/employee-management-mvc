SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 53300, 'ERP-0004 schema deployment is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_ID(N'EmployeeManagementCoreDb') IS NULL
BEGIN
    THROW 53301, 'EmployeeManagementCoreDb does not exist. Run scripts 001 through 004 first.', 1;
END;
GO

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

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 53302, 'ERP-0004 schema deployment is connected to the wrong database.', 1;
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
    THROW 53303, 'ERP-0000 database ownership token is missing or wrong.', 1;
END;

DECLARE @ModuleOwner nvarchar(200) =
    N'employee-management-mvc/ERP-0004/v1';

DECLARE @ExistingModuleOwner nvarchar(4000) =
(
    SELECT CONVERT(nvarchar(4000), [value])
    FROM [sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPSalesOrderModuleOwner'
);

IF @ExistingModuleOwner IS NOT NULL
   AND @ExistingModuleOwner <> @ModuleOwner
BEGIN
    THROW 53304, 'ERPSalesOrderModuleOwner exists with an unexpected value.', 1;
END;

IF @ExistingModuleOwner IS NULL
   AND
   (
       OBJECT_ID(N'dbo.SalesOrders', N'U') IS NOT NULL
       OR OBJECT_ID(N'dbo.SalesOrderItems', N'U') IS NOT NULL
       OR OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U') IS NOT NULL
       OR TYPE_ID(N'dbo.SalesOrderLineInput') IS NOT NULL
       OR OBJECT_ID(N'dbo.SalesOrderNumberSequence', N'SO') IS NOT NULL
       OR EXISTS
          (
              SELECT 1
              FROM [sys].[indexes]
              WHERE
                  [object_id] = OBJECT_ID(N'dbo.Employees', N'U')
                  AND [name] = N'UX_Employees_Active_UserId'
          )
       OR EXISTS
          (
              SELECT 1
              FROM [sys].[procedures] AS [P]
              WHERE
                  [P].[schema_id] = SCHEMA_ID(N'dbo')
                  AND [P].[name] IN
                      (
                          N'GetListEmployee',
                          N'GetSessionPrincipal',
                          N'GetEmployeeAccountCandidates',
                          N'BindEmployeeAccount',
                          N'GetSalesOrderEmployeeOptions',
                          N'CreateSalesOrder',
                          N'ApproveSalesOrder',
                          N'RejectSalesOrder',
                          N'GetListSalesOrder',
                          N'GetSalesOrderDetail',
                          N'GetEmployeeSalesReport'
                      )
          )
   )
BEGIN
    THROW 53305, 'An unowned ERP-0004 object name already exists. Review it manually.', 1;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH(N'dbo.Users', N'Profile') IS NULL
    BEGIN
        THROW 53306, 'dbo.Users.Profile is missing. Run the updated script 001 first.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM [sys].[columns] AS [C]
        INNER JOIN [sys].[types] AS [T]
            ON [T].[user_type_id] = [C].[user_type_id]
        WHERE
            [C].[object_id] = OBJECT_ID(N'dbo.Users', N'U')
            AND [C].[name] = N'Profile'
            AND
            (
                [T].[name] <> N'nvarchar'
                OR [C].[max_length] <> -1
                OR [C].[is_nullable] <> 1
            )
    )
    BEGIN
        THROW 53306, 'dbo.Users.Profile exists with an incompatible shape.', 1;
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
        THROW 53307, 'An active user is linked to more than one employee. Resolve the duplicate before deployment.', 1;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM [sys].[indexes]
        WHERE
            [object_id] = OBJECT_ID(N'dbo.Employees', N'U')
            AND [name] = N'UX_Employees_Active_UserId'
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX [UX_Employees_Active_UserId]
            ON [dbo].[Employees] ([UserId] ASC)
            WHERE [UserId] IS NOT NULL AND [IsDeleted] = 0;
    END;

    IF OBJECT_ID(N'dbo.SalesOrders', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[SalesOrders]
        (
            [Id] uniqueidentifier NOT NULL
                CONSTRAINT [DF_SalesOrders_Id]
                DEFAULT (NEWSEQUENTIALID()),
            [OrderNumber] varchar(20) NOT NULL,
            [ClientRequestId] uniqueidentifier NOT NULL,
            [PayloadHash] binary(32) NOT NULL,
            [EmployeeId] uniqueidentifier NOT NULL,
            [CustomerCode] nvarchar(50) NULL,
            [CustomerName] nvarchar(200) NOT NULL,
            [OrderDate] date NOT NULL,
            [Status] tinyint NOT NULL,
            [Notes] nvarchar(1000) NULL,
            [ItemCount] int NOT NULL,
            [TotalQuantity] decimal(18, 3) NOT NULL,
            [SubtotalAmount] decimal(19, 4) NOT NULL,
            [DiscountAmount] decimal(19, 4) NOT NULL,
            [TotalAmount] decimal(19, 4) NOT NULL,
            [CurrencyCode] char(3) NOT NULL,
            [CreatedAt] datetime2(7) NOT NULL,
            [CreatedByUserId] uniqueidentifier NOT NULL,
            [ApprovedAt] datetime2(7) NULL,
            [ApprovedByUserId] uniqueidentifier NULL,
            [RejectedAt] datetime2(7) NULL,
            [RejectedByUserId] uniqueidentifier NULL,
            [ReviewNote] nvarchar(500) NULL,
            [RowVersion] rowversion NOT NULL,
            CONSTRAINT [PK_SalesOrders]
                PRIMARY KEY CLUSTERED ([Id] ASC),
            CONSTRAINT [CK_SalesOrders_OrderNumber]
                CHECK ([OrderNumber] LIKE 'SO-%'),
            CONSTRAINT [CK_SalesOrders_CustomerName]
                CHECK (LEN(LTRIM(RTRIM([CustomerName]))) BETWEEN 1 AND 200),
            CONSTRAINT [CK_SalesOrders_Status]
                CHECK ([Status] IN (0, 1, 2)),
            CONSTRAINT [CK_SalesOrders_ItemCount]
                CHECK ([ItemCount] BETWEEN 1 AND 100),
            CONSTRAINT [CK_SalesOrders_TotalQuantity]
                CHECK ([TotalQuantity] > CONVERT(decimal(18, 3), 0)),
            CONSTRAINT [CK_SalesOrders_Amounts]
                CHECK
                (
                    [SubtotalAmount] >= CONVERT(decimal(19, 4), 0)
                    AND [SubtotalAmount] = ROUND([SubtotalAmount], 0)
                    AND [DiscountAmount] >= CONVERT(decimal(19, 4), 0)
                    AND [DiscountAmount] = ROUND([DiscountAmount], 0)
                    AND [DiscountAmount] <= [SubtotalAmount]
                    AND [TotalAmount] = [SubtotalAmount] - [DiscountAmount]
                    AND [TotalAmount] = ROUND([TotalAmount], 0)
                    AND [TotalAmount] > CONVERT(decimal(19, 4), 0)
                ),
            CONSTRAINT [CK_SalesOrders_Currency]
                CHECK ([CurrencyCode] = 'VND'),
            CONSTRAINT [CK_SalesOrders_Decision]
                CHECK
                (
                    (
                        [Status] = 0
                        AND [ApprovedAt] IS NULL
                        AND [ApprovedByUserId] IS NULL
                        AND [RejectedAt] IS NULL
                        AND [RejectedByUserId] IS NULL
                    )
                    OR
                    (
                        [Status] = 1
                        AND [ApprovedAt] IS NOT NULL
                        AND [ApprovedByUserId] IS NOT NULL
                        AND [RejectedAt] IS NULL
                        AND [RejectedByUserId] IS NULL
                    )
                    OR
                    (
                        [Status] = 2
                        AND [ApprovedAt] IS NULL
                        AND [ApprovedByUserId] IS NULL
                        AND [RejectedAt] IS NOT NULL
                        AND [RejectedByUserId] IS NOT NULL
                        AND NULLIF(LTRIM(RTRIM([ReviewNote])), N'') IS NOT NULL
                    )
                )
        );

        ALTER TABLE [dbo].[SalesOrders] WITH CHECK
        ADD CONSTRAINT [FK_SalesOrders_Employees_EmployeeId]
            FOREIGN KEY ([EmployeeId])
            REFERENCES [dbo].[Employees] ([Id]);

        ALTER TABLE [dbo].[SalesOrders] WITH CHECK
        ADD CONSTRAINT [FK_SalesOrders_Users_CreatedByUserId]
            FOREIGN KEY ([CreatedByUserId])
            REFERENCES [dbo].[Users] ([Id]);

        ALTER TABLE [dbo].[SalesOrders] WITH CHECK
        ADD CONSTRAINT [FK_SalesOrders_Users_ApprovedByUserId]
            FOREIGN KEY ([ApprovedByUserId])
            REFERENCES [dbo].[Users] ([Id]);

        ALTER TABLE [dbo].[SalesOrders] WITH CHECK
        ADD CONSTRAINT [FK_SalesOrders_Users_RejectedByUserId]
            FOREIGN KEY ([RejectedByUserId])
            REFERENCES [dbo].[Users] ([Id]);

        CREATE UNIQUE NONCLUSTERED INDEX [UX_SalesOrders_OrderNumber]
            ON [dbo].[SalesOrders] ([OrderNumber] ASC);

        CREATE UNIQUE NONCLUSTERED INDEX [UX_SalesOrders_Employee_ClientRequest]
            ON [dbo].[SalesOrders]
            (
                [EmployeeId] ASC,
                [ClientRequestId] ASC
            )
            INCLUDE ([PayloadHash], [Status], [OrderNumber]);

        CREATE NONCLUSTERED INDEX [IX_SalesOrders_Employee_Status_ApprovedAt]
            ON [dbo].[SalesOrders]
            (
                [EmployeeId] ASC,
                [Status] ASC,
                [ApprovedAt] ASC
            )
            INCLUDE
            (
                [OrderNumber],
                [CustomerCode],
                [CustomerName],
                [OrderDate],
                [ItemCount],
                [TotalQuantity],
                [TotalAmount],
                [CreatedAt]
            );

        CREATE NONCLUSTERED INDEX [IX_SalesOrders_Status_CreatedAt_Employee]
            ON [dbo].[SalesOrders]
            (
                [Status] ASC,
                [CreatedAt] DESC,
                [EmployeeId] ASC
            )
            INCLUDE
            (
                [OrderNumber],
                [CustomerName],
                [OrderDate],
                [TotalAmount],
                [ApprovedAt],
                [RejectedAt]
            );
    END;

    IF OBJECT_ID(N'dbo.SalesOrderItems', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[SalesOrderItems]
        (
            [Id] uniqueidentifier NOT NULL
                CONSTRAINT [DF_SalesOrderItems_Id]
                DEFAULT (NEWSEQUENTIALID()),
            [SalesOrderId] uniqueidentifier NOT NULL,
            [LineNumber] int NOT NULL,
            [ProductCode] nvarchar(50) NOT NULL,
            [ProductName] nvarchar(200) NOT NULL,
            [ProductCategory] nvarchar(100) NULL,
            [Quantity] decimal(18, 3) NOT NULL,
            [UnitPrice] decimal(19, 4) NOT NULL,
            [DiscountAmount] decimal(19, 4) NOT NULL,
            [LineAmount] AS
            (
                CONVERT
                (
                    decimal(19, 4),
                    ROUND(([Quantity] * [UnitPrice]) - [DiscountAmount], 4)
                )
            ) PERSISTED,
            [CreatedAt] datetime2(7) NOT NULL,
            CONSTRAINT [PK_SalesOrderItems]
                PRIMARY KEY CLUSTERED ([Id] ASC),
            CONSTRAINT [CK_SalesOrderItems_LineNumber]
                CHECK ([LineNumber] BETWEEN 1 AND 100),
            CONSTRAINT [CK_SalesOrderItems_ProductCode]
                CHECK (LEN(LTRIM(RTRIM([ProductCode]))) BETWEEN 1 AND 50),
            CONSTRAINT [CK_SalesOrderItems_ProductName]
                CHECK (LEN(LTRIM(RTRIM([ProductName]))) BETWEEN 1 AND 200),
            CONSTRAINT [CK_SalesOrderItems_Quantity]
                CHECK
                (
                    [Quantity] >= CONVERT(decimal(18, 3), 0.001)
                    AND [Quantity] <= CONVERT(decimal(18, 3), 999999.999)
                ),
            CONSTRAINT [CK_SalesOrderItems_UnitPrice]
                CHECK
                (
                    [UnitPrice] >= CONVERT(decimal(19, 4), 0)
                    AND [UnitPrice] <= CONVERT(decimal(19, 4), 999999999)
                    AND [UnitPrice] = ROUND([UnitPrice], 0)
                ),
            CONSTRAINT [CK_SalesOrderItems_Discount]
                CHECK
                (
                    [DiscountAmount] >= CONVERT(decimal(19, 4), 0)
                    AND [DiscountAmount] <= CONVERT(decimal(19, 4), 999999999999999)
                    AND [DiscountAmount] = ROUND([DiscountAmount], 0)
                    AND [Quantity] * [UnitPrice] = ROUND([Quantity] * [UnitPrice], 0)
                    AND [DiscountAmount] <= [Quantity] * [UnitPrice]
                )
        );

        ALTER TABLE [dbo].[SalesOrderItems] WITH CHECK
        ADD CONSTRAINT [FK_SalesOrderItems_SalesOrders_SalesOrderId]
            FOREIGN KEY ([SalesOrderId])
            REFERENCES [dbo].[SalesOrders] ([Id]);

        CREATE UNIQUE NONCLUSTERED INDEX [UX_SalesOrderItems_Order_LineNumber]
            ON [dbo].[SalesOrderItems]
            (
                [SalesOrderId] ASC,
                [LineNumber] ASC
            )
            INCLUDE
            (
                [ProductCode],
                [ProductName],
                [ProductCategory],
                [Quantity],
                [UnitPrice],
                [DiscountAmount],
                [LineAmount]
            );
    END;

    IF OBJECT_ID(N'dbo.SalesOrderStatusHistory', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[SalesOrderStatusHistory]
        (
            [Id] bigint IDENTITY(1, 1) NOT NULL,
            [SalesOrderId] uniqueidentifier NOT NULL,
            [FromStatus] tinyint NULL,
            [ToStatus] tinyint NOT NULL,
            [ChangedAt] datetime2(7) NOT NULL,
            [ChangedByUserId] uniqueidentifier NOT NULL,
            [Comment] nvarchar(500) NULL,
            CONSTRAINT [PK_SalesOrderStatusHistory]
                PRIMARY KEY CLUSTERED ([Id] ASC),
            CONSTRAINT [CK_SalesOrderStatusHistory_Transition]
                CHECK
                (
                    ([FromStatus] IS NULL AND [ToStatus] = 0)
                    OR ([FromStatus] = 0 AND [ToStatus] IN (1, 2))
                )
        );

        ALTER TABLE [dbo].[SalesOrderStatusHistory] WITH CHECK
        ADD CONSTRAINT [FK_SalesOrderStatusHistory_SalesOrders_SalesOrderId]
            FOREIGN KEY ([SalesOrderId])
            REFERENCES [dbo].[SalesOrders] ([Id]);

        ALTER TABLE [dbo].[SalesOrderStatusHistory] WITH CHECK
        ADD CONSTRAINT [FK_SalesOrderStatusHistory_Users_ChangedByUserId]
            FOREIGN KEY ([ChangedByUserId])
            REFERENCES [dbo].[Users] ([Id]);

        CREATE UNIQUE NONCLUSTERED INDEX [UX_SalesOrderStatusHistory_Order_ToStatus]
            ON [dbo].[SalesOrderStatusHistory]
            (
                [SalesOrderId] ASC,
                [ToStatus] ASC
            );

        CREATE NONCLUSTERED INDEX [IX_SalesOrderStatusHistory_Order_ChangedAt]
            ON [dbo].[SalesOrderStatusHistory]
            (
                [SalesOrderId] ASC,
                [ChangedAt] DESC
            )
            INCLUDE
            (
                [FromStatus],
                [ToStatus],
                [ChangedByUserId],
                [Comment]
            );
    END;

    IF @ExistingModuleOwner IS NULL
    BEGIN
        EXEC [sys].[sp_addextendedproperty]
            @name = N'ERPSalesOrderModuleOwner',
            @value = @ModuleOwner;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;
GO

PRINT N'ERP-0004 sales-order schema deployment completed.';
GO
