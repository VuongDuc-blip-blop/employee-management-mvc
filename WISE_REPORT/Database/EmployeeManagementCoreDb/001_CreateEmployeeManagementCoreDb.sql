SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51000, 'Bootstrap is allowed only on SQL Server LocalDB.', 1;
END;

DECLARE @DatabaseWasCreated bit = 0;

IF DB_ID(N'EmployeeManagementCoreDb') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE [EmployeeManagementCoreDb];');
    SET @DatabaseWasCreated = 1;
END;

IF @DatabaseWasCreated = 1
BEGIN
    EXEC(N'USE [EmployeeManagementCoreDb];
        EXEC [sys].[sp_addextendedproperty]
            @name = N''ERPBaselineOwner'',
            @value = N''employee-management-mvc/ERP-0000/v1'';');
END;

IF NOT EXISTS
(
    SELECT 1
    FROM [EmployeeManagementCoreDb].[sys].[extended_properties]
    WHERE
        [class] = 0
        AND [major_id] = 0
        AND [minor_id] = 0
        AND [name] = N'ERPBaselineOwner'
        AND CONVERT(nvarchar(4000), [value]) =
            N'employee-management-mvc/ERP-0000/v1'
)
BEGIN
    THROW 51005, 'Target database is not owned by ERP-0000 baseline.', 1;
END;
GO

USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[__EFMigrationsHistory]
        (
            [MigrationId] nvarchar(150) NOT NULL,
            [ProductVersion] nvarchar(32) NOT NULL,
            CONSTRAINT [PK_dbo.__EFMigrationsHistory]
                PRIMARY KEY CLUSTERED ([MigrationId] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[Users]
        (
            [Id] uniqueidentifier NOT NULL,
            [UserName] nvarchar(max) NOT NULL,
            [Password] nvarchar(max) NOT NULL,
            [CreatedAt] datetime2(7) NOT NULL,
            [LastModifiedAt] datetime2(7) NOT NULL,
            [CreatedBy] uniqueidentifier NOT NULL,
            [LastModifiedBy] uniqueidentifier NOT NULL,
            [IsDeleted] bit NOT NULL,
            [DeletedAt] datetime2(7) NULL,
            [ModerationStatus] int NOT NULL,
            CONSTRAINT [PK_dbo.Users]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.Employees', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[Employees]
        (
            [Id] uniqueidentifier NOT NULL,
            [EmployeeCode] nvarchar(max) NOT NULL,
            [FullName] nvarchar(max) NOT NULL,
            [Email] nvarchar(max) NOT NULL,
            [PhoneNumber] nvarchar(max) NOT NULL,
            [Address] nvarchar(max) NOT NULL,
            [Gender] int NOT NULL,
            [UserId] uniqueidentifier NULL,
            [CreatedAt] datetime2(7) NOT NULL,
            [LastModifiedAt] datetime2(7) NOT NULL,
            [CreatedBy] uniqueidentifier NOT NULL,
            [LastModifiedBy] uniqueidentifier NOT NULL,
            [IsDeleted] bit NOT NULL,
            [DeletedAt] datetime2(7) NULL,
            [ModerationStatus] int NOT NULL,
            CONSTRAINT [PK_dbo.Employees]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.EmployeeUnits', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[EmployeeUnits]
        (
            [Id] uniqueidentifier NOT NULL,
            [EmployeeId] uniqueidentifier NOT NULL,
            [UnitId] uniqueidentifier NOT NULL,
            CONSTRAINT [PK_dbo.EmployeeUnits]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.Units', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[Units]
        (
            [Id] uniqueidentifier NOT NULL,
            [UnitCode] nvarchar(max) NOT NULL,
            [UnitName] nvarchar(max) NOT NULL,
            [ParentUnitId] uniqueidentifier NOT NULL,
            [CreatedAt] datetime2(7) NOT NULL,
            [LastModifiedAt] datetime2(7) NOT NULL,
            [CreatedBy] uniqueidentifier NOT NULL,
            [LastModifiedBy] uniqueidentifier NOT NULL,
            [IsDeleted] bit NOT NULL,
            [DeletedAt] datetime2(7) NULL,
            [ModerationStatus] int NOT NULL,
            CONSTRAINT [PK_dbo.Units]
                PRIMARY KEY CLUSTERED ([Id] ASC)
        );
    END;

    IF OBJECT_ID(N'dbo.FK_Employees_Users_UserId', N'F') IS NULL
    BEGIN
        ALTER TABLE [dbo].[Employees] WITH CHECK
        ADD CONSTRAINT [FK_Employees_Users_UserId]
            FOREIGN KEY ([UserId])
            REFERENCES [dbo].[Users] ([Id]);

        ALTER TABLE [dbo].[Employees]
        CHECK CONSTRAINT [FK_Employees_Users_UserId];
    END;

    IF OBJECT_ID(N'dbo.FK_Units_Units_ParentUnitId', N'F') IS NULL
    BEGIN
        ALTER TABLE [dbo].[Units] WITH CHECK
        ADD CONSTRAINT [FK_Units_Units_ParentUnitId]
            FOREIGN KEY ([ParentUnitId])
            REFERENCES [dbo].[Units] ([Id]);

        ALTER TABLE [dbo].[Units]
        CHECK CONSTRAINT [FK_Units_Units_ParentUnitId];
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

PRINT N'EmployeeManagementCoreDb schema bootstrap completed.';
GO
