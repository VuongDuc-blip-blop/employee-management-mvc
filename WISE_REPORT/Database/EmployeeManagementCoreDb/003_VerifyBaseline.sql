USE [EmployeeManagementCoreDb]
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY('IsLocalDB')), 0) <> 1
BEGIN
  THROW 51100, 'Verification is allowed only on SQL Server LocalDB', 1;
END;

IF DB_NAME() <> N'EmployeeManagementCoreDb'
BEGIN 
  THROW 51101, 'Verification is connected to the wrong database.',1;
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
    AND CONVERT(nvarchar(4000),[value]) = N'employee-management-mvc/ERP-0000/v1'
)
BEGIN
  THROW 51102, 'ERP-0000 database ownership token is missing or wrong.',1;
END;

IF
(
  SELECT [compatibility_level]
  FROM [sys].[databases]
  WHERE [name] = DB_NAME()
) < 110
BEGIN
  THROW 51103, 'Database compatibility level must be at least 110.',1;
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
    
  )
)

