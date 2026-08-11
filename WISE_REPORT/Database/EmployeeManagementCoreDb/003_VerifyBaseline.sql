USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51100, 'Verification is allowed only on SQL Server LocalDB.', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN
    THROW 51101, 'Verification is connected to the wrong database.', 1;
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
    THROW 51102, 'ERP-0000 database ownership token is missing or wrong.', 1;
END;

IF
(
    SELECT [compatibility_level]
    FROM [sys].[databases]
    WHERE [name] = DB_NAME()
) < 110
BEGIN
    THROW 51103, 'Database compatibility level must be at least 110.', 1;
END;

DECLARE @ExpectedColumns TABLE
(
    [TableName] sysname NOT NULL,
    [ColumnName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NULL,
    [Scale] tinyint NULL,
    [IsNullable] bit NOT NULL,
    PRIMARY KEY ([TableName], [ColumnName])
);

INSERT INTO @ExpectedColumns
    ([TableName], [ColumnName], [TypeName], [MaxLength], [Scale], [IsNullable])
VALUES
    (N'__EFMigrationsHistory', N'MigrationId', N'nvarchar', 300, NULL, 0),
    (N'__EFMigrationsHistory', N'ProductVersion', N'nvarchar', 64, NULL, 0),
    (N'Employees', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'Employees', N'EmployeeCode', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'FullName', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'Email', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'PhoneNumber', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'Address', N'nvarchar', -1, NULL, 0),
    (N'Employees', N'Gender', N'int', NULL, NULL, 0),
    (N'Employees', N'UserId', N'uniqueidentifier', NULL, NULL, 1),
    (N'Employees', N'CreatedAt', N'datetime2', NULL, 7, 0),
    (N'Employees', N'LastModifiedAt', N'datetime2', NULL, 7, 0),
    (N'Employees', N'CreatedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Employees', N'LastModifiedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Employees', N'IsDeleted', N'bit', NULL, NULL, 0),
    (N'Employees', N'DeletedAt', N'datetime2', NULL, 7, 1),
    (N'Employees', N'ModerationStatus', N'int', NULL, NULL, 0),
    (N'EmployeeUnits', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'EmployeeUnits', N'EmployeeId', N'uniqueidentifier', NULL, NULL, 0),
    (N'EmployeeUnits', N'UnitId', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'UnitCode', N'nvarchar', -1, NULL, 0),
    (N'Units', N'UnitName', N'nvarchar', -1, NULL, 0),
    (N'Units', N'ParentUnitId', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'CreatedAt', N'datetime2', NULL, 7, 0),
    (N'Units', N'LastModifiedAt', N'datetime2', NULL, 7, 0),
    (N'Units', N'CreatedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'LastModifiedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Units', N'IsDeleted', N'bit', NULL, NULL, 0),
    (N'Units', N'DeletedAt', N'datetime2', NULL, 7, 1),
    (N'Units', N'ModerationStatus', N'int', NULL, NULL, 0),
    (N'Users', N'Id', N'uniqueidentifier', NULL, NULL, 0),
    (N'Users', N'UserName', N'nvarchar', -1, NULL, 0),
    (N'Users', N'Password', N'nvarchar', -1, NULL, 0),
    (N'Users', N'CreatedAt', N'datetime2', NULL, 7, 0),
    (N'Users', N'LastModifiedAt', N'datetime2', NULL, 7, 0),
    (N'Users', N'CreatedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Users', N'LastModifiedBy', N'uniqueidentifier', NULL, NULL, 0),
    (N'Users', N'IsDeleted', N'bit', NULL, NULL, 0),
    (N'Users', N'DeletedAt', N'datetime2', NULL, 7, 1),
    (N'Users', N'ModerationStatus', N'int', NULL, NULL, 0);

IF (SELECT COUNT_BIG(1) FROM @ExpectedColumns) <> 41
BEGIN
    THROW 51104, 'Verifier expected-column inventory is incomplete.', 1;
END;

IF
(
    SELECT COUNT_BIG(1)
    FROM [sys].[tables]
    WHERE [object_id] IN
    (
        OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U'),
        OBJECT_ID(N'dbo.Employees', N'U'),
        OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
        OBJECT_ID(N'dbo.Units', N'U'),
        OBJECT_ID(N'dbo.Users', N'U')
    )
) <> 5
BEGIN
    THROW 51105, 'Exactly five required baseline tables must exist.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM @ExpectedColumns AS [E]
    LEFT JOIN [sys].[columns] AS [C]
        ON [C].[object_id] =
            OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        AND [C].[name] = [E].[ColumnName]
    LEFT JOIN [sys].[types] AS [TY]
        ON [TY].[user_type_id] = [C].[user_type_id]
    WHERE
        [C].[object_id] IS NULL
        OR [TY].[name] <> [E].[TypeName]
        OR ([E].[MaxLength] IS NOT NULL AND [C].[max_length] <> [E].[MaxLength])
        OR ([E].[Scale] IS NOT NULL AND [C].[scale] <> [E].[Scale])
        OR [C].[is_nullable] <> [E].[IsNullable]
)
BEGIN
    SELECT
        [E].[TableName],
        [E].[ColumnName],
        [E].[TypeName] AS [ExpectedType],
        [TY].[name] AS [ActualType],
        [E].[MaxLength] AS [ExpectedMaxLength],
        [C].[max_length] AS [ActualMaxLength],
        [E].[Scale] AS [ExpectedScale],
        [C].[scale] AS [ActualScale],
        [E].[IsNullable] AS [ExpectedNullable],
        [C].[is_nullable] AS [ActualNullable]
    FROM @ExpectedColumns AS [E]
    LEFT JOIN [sys].[columns] AS [C]
        ON [C].[object_id] =
            OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        AND [C].[name] = [E].[ColumnName]
    LEFT JOIN [sys].[types] AS [TY]
        ON [TY].[user_type_id] = [C].[user_type_id]
    WHERE
        [C].[object_id] IS NULL
        OR [TY].[name] <> [E].[TypeName]
        OR ([E].[MaxLength] IS NOT NULL AND [C].[max_length] <> [E].[MaxLength])
        OR ([E].[Scale] IS NOT NULL AND [C].[scale] <> [E].[Scale])
        OR [C].[is_nullable] <> [E].[IsNullable];

    THROW 51106, 'Baseline column metadata does not match Database.edmx.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM [sys].[columns] AS [C]
    INNER JOIN [sys].[tables] AS [T]
        ON [T].[object_id] = [C].[object_id]
    WHERE
        [T].[object_id] IN
        (
            OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U'),
            OBJECT_ID(N'dbo.Employees', N'U'),
            OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
            OBJECT_ID(N'dbo.Units', N'U'),
            OBJECT_ID(N'dbo.Users', N'U')
        )
        AND NOT EXISTS
        (
            SELECT 1
            FROM @ExpectedColumns AS [E]
            WHERE [E].[TableName] = [T].[name]
              AND [E].[ColumnName] = [C].[name]
        )
)
BEGIN
    THROW 51107, 'A baseline table has an unexpected column.', 1;
END;

DECLARE @ExpectedPrimaryKeys TABLE
(
    [TableName] sysname NOT NULL PRIMARY KEY,
    [ColumnName] sysname NOT NULL
);

INSERT INTO @ExpectedPrimaryKeys ([TableName], [ColumnName])
VALUES
    (N'__EFMigrationsHistory', N'MigrationId'),
    (N'Employees', N'Id'),
    (N'EmployeeUnits', N'Id'),
    (N'Units', N'Id'),
    (N'Users', N'Id');

IF EXISTS
(
    SELECT 1
    FROM @ExpectedPrimaryKeys AS [E]
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM [sys].[key_constraints] AS [KC]
        INNER JOIN [sys].[index_columns] AS [IC]
            ON [IC].[object_id] = [KC].[parent_object_id]
            AND [IC].[index_id] = [KC].[unique_index_id]
        INNER JOIN [sys].[columns] AS [C]
            ON [C].[object_id] = [IC].[object_id]
            AND [C].[column_id] = [IC].[column_id]
        WHERE
            [KC].[type] = N'PK'
            AND [KC].[parent_object_id] =
                OBJECT_ID(N'dbo.' + QUOTENAME([E].[TableName]), N'U')
        GROUP BY [KC].[object_id]
        HAVING COUNT_BIG(1) = 1
           AND MAX([C].[name]) = [E].[ColumnName]
    )
)
BEGIN
    THROW 51108, 'A baseline primary key is missing or incompatible.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[foreign_keys] AS [FK]
    INNER JOIN [sys].[foreign_key_columns] AS [FKC]
        ON [FKC].[constraint_object_id] = [FK].[object_id]
    WHERE
        [FK].[name] = N'FK_Employees_Users_UserId'
        AND [FK].[parent_object_id] = OBJECT_ID(N'dbo.Employees', N'U')
        AND [FK].[referenced_object_id] = OBJECT_ID(N'dbo.Users', N'U')
        AND COL_NAME([FKC].[parent_object_id], [FKC].[parent_column_id]) = N'UserId'
        AND COL_NAME([FKC].[referenced_object_id], [FKC].[referenced_column_id]) = N'Id'
        AND [FK].[is_disabled] = 0
        AND [FK].[is_not_trusted] = 0
        AND [FK].[delete_referential_action] = 0
        AND [FK].[update_referential_action] = 0
)
BEGIN
    THROW 51109, 'FK_Employees_Users_UserId is missing or incompatible.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [sys].[foreign_keys] AS [FK]
    INNER JOIN [sys].[foreign_key_columns] AS [FKC]
        ON [FKC].[constraint_object_id] = [FK].[object_id]
    WHERE
        [FK].[name] = N'FK_Units_Units_ParentUnitId'
        AND [FK].[parent_object_id] = OBJECT_ID(N'dbo.Units', N'U')
        AND [FK].[referenced_object_id] = OBJECT_ID(N'dbo.Units', N'U')
        AND COL_NAME([FKC].[parent_object_id], [FKC].[parent_column_id]) = N'ParentUnitId'
        AND COL_NAME([FKC].[referenced_object_id], [FKC].[referenced_column_id]) = N'Id'
        AND [FK].[is_disabled] = 0
        AND [FK].[is_not_trusted] = 0
        AND [FK].[delete_referential_action] = 0
        AND [FK].[update_referential_action] = 0
)
BEGIN
    THROW 51110, 'FK_Units_Units_ParentUnitId is missing or incompatible.', 1;
END;

IF
(
    SELECT COUNT_BIG(1)
    FROM [sys].[foreign_keys]
    WHERE [parent_object_id] IN
    (
        OBJECT_ID(N'dbo.Employees', N'U'),
        OBJECT_ID(N'dbo.EmployeeUnits', N'U'),
        OBJECT_ID(N'dbo.Units', N'U'),
        OBJECT_ID(N'dbo.Users', N'U')
    )
) <> 2
BEGIN
    THROW 51111, 'Baseline foreign-key count does not match Database.edmx.', 1;
END;

IF OBJECT_ID(N'dbo.GetListUser', N'P') IS NULL
BEGIN
    THROW 51112, 'dbo.GetListUser is missing.', 1;
END;

DECLARE @ExpectedParameters TABLE
(
    [ParameterId] int NOT NULL PRIMARY KEY,
    [ParameterName] sysname NOT NULL,
    [TypeName] sysname NOT NULL,
    [MaxLength] smallint NOT NULL,
    [IsOutput] bit NOT NULL
);

INSERT INTO @ExpectedParameters
    ([ParameterId], [ParameterName], [TypeName], [MaxLength], [IsOutput])
VALUES
    (1, N'@Search', N'nvarchar', -1, 0),
    (2, N'@PageNumber', N'int', 4, 0),
    (3, N'@PageSize', N'int', 4, 0),
    (4, N'@SortColumn', N'nvarchar', 100, 0),
    (5, N'@SortDirection', N'varchar', 10, 0),
    (6, N'@TotalCount', N'bigint', 8, 1);

IF EXISTS
(
    SELECT 1
    FROM @ExpectedParameters AS [E]
    LEFT JOIN [sys].[parameters] AS [P]
        ON [P].[object_id] = OBJECT_ID(N'dbo.GetListUser', N'P')
        AND [P].[parameter_id] = [E].[ParameterId]
    LEFT JOIN [sys].[types] AS [TY]
        ON [TY].[user_type_id] = [P].[user_type_id]
    WHERE
        [P].[parameter_id] IS NULL
        OR [P].[name] <> [E].[ParameterName]
        OR [TY].[name] <> [E].[TypeName]
        OR [P].[max_length] <> [E].[MaxLength]
        OR [P].[is_output] <> [E].[IsOutput]
)
OR
(
    SELECT COUNT_BIG(1)
    FROM [sys].[parameters]
    WHERE [object_id] = OBJECT_ID(N'dbo.GetListUser', N'P')
) <> 6
BEGIN
    THROW 51113, 'dbo.GetListUser parameters are incompatible.', 1;
END;


DECLARE @ActualResult TABLE
(
    [ColumnOrdinal] int NULL,
    [ColumnName] sysname NULL,
    [SystemTypeName] nvarchar(256) NULL,
    [ErrorNumber] int NULL
);

INSERT INTO @ActualResult
    ([ColumnOrdinal], [ColumnName], [SystemTypeName], [ErrorNumber])
SELECT
    [column_ordinal],
    [name],
    [system_type_name],
    [error_number]
FROM [sys].[dm_exec_describe_first_result_set_for_object]
(
    OBJECT_ID(N'dbo.GetListUser', N'P'),
    0
);

IF EXISTS (SELECT 1 FROM @ActualResult WHERE [ErrorNumber] IS NOT NULL)
BEGIN
    THROW 51114, 'dbo.GetListUser result metadata cannot be described.', 1;
END;

DECLARE @ExpectedResult TABLE
(
    [ColumnOrdinal] int NOT NULL PRIMARY KEY,
    [ColumnName] sysname NOT NULL,
    [SystemTypeName] nvarchar(256) NOT NULL
);

INSERT INTO @ExpectedResult
    ([ColumnOrdinal], [ColumnName], [SystemTypeName])
VALUES
    (1, N'Id', N'uniqueidentifier'),
    (2, N'UserName', N'nvarchar(max)'),
    (3, N'CreatedAt', N'datetime2(7)'),
    (4, N'ModerationStatus', N'int'),
    (5, N'TotalCount', N'bigint');

IF EXISTS
(
    SELECT 1
    FROM @ExpectedResult AS [E]
    LEFT JOIN @ActualResult AS [A]
        ON [A].[ColumnOrdinal] = [E].[ColumnOrdinal]
    WHERE
        [A].[ColumnOrdinal] IS NULL
        OR [A].[ColumnName] <> [E].[ColumnName]
        OR [A].[SystemTypeName] <> [E].[SystemTypeName]
)
OR EXISTS
(
    SELECT 1
    FROM @ActualResult AS [A]
    WHERE [A].[ColumnOrdinal] IS NOT NULL
      AND NOT EXISTS
      (
          SELECT 1
          FROM @ExpectedResult AS [E]
          WHERE [E].[ColumnOrdinal] = [A].[ColumnOrdinal]
      )
)
BEGIN
    SELECT [ColumnOrdinal], [ColumnName], [SystemTypeName]
    FROM @ActualResult
    ORDER BY [ColumnOrdinal];

    THROW 51115, 'dbo.GetListUser first-result contract is incompatible.', 1;
END;

DECLARE @ProcedureDefinition nvarchar(max) =
    UPPER(OBJECT_DEFINITION(OBJECT_ID(N'dbo.GetListUser', N'P')));

IF @ProcedureDefinition LIKE N'%NOLOCK%'
   OR @ProcedureDefinition LIKE N'%SP_EXECUTESQL%'
   OR @ProcedureDefinition LIKE N'%EXEC(%'
BEGIN
    THROW 51116, 'dbo.GetListUser contains a forbidden query pattern.', 1;
END;

IF EXISTS
(
    SELECT 1
    FROM @ActualResult
    WHERE UPPER([ColumnName]) = N'PASSWORD'
)
BEGIN
    THROW 51117, 'dbo.GetListUser must not return Password.', 1;
END;

PRINT N'EmployeeManagementCoreDb baseline verification passed.';
GO
