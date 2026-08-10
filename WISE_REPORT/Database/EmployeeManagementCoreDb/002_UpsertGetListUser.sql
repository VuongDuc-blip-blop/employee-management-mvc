USE [EmployeeManagementCoreDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF COALESCE(CONVERT(int, SERVERPROPERTY(N'IsLocalDB')), 0) <> 1
BEGIN
    THROW 51000, 'Deployment is allowed only on SQL Server LocalDB.', 1;
END;
GO

IF OBJECT_ID(N'dbo.GetListUser', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE [dbo].[GetListUser] AS
    BEGIN
        SET NOCOUNT ON;
    END;');
END;
GO

ALTER PROCEDURE [dbo].[GetListUser]
    @Search nvarchar(max),
    @PageNumber int,
    @PageSize int,
    @SortColumn nvarchar(50),
    @SortDirection varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber IS NULL OR @PageNumber < 1
    BEGIN
        THROW 51001, 'PageNumber must be greater than or equal to 1.', 1;
    END;

    IF @PageSize IS NULL OR @PageSize < 1 OR @PageSize > 200
    BEGIN
        THROW 51002, 'PageSize must be between 1 and 200.', 1;
    END;

    SET @SortColumn =
        UPPER(LTRIM(RTRIM(COALESCE(@SortColumn, N''))));

    IF @SortColumn <> N'USERNAME'
    BEGIN
        THROW 51003, 'SortColumn is not allowed.', 1;
    END;

    SET @SortDirection =
        UPPER(LTRIM(RTRIM(COALESCE(@SortDirection, ''))));

    IF @SortDirection NOT IN ('ASCENDING', 'DESCENDING')
    BEGIN
        THROW 51004, 'SortDirection must be ASCENDING or DESCENDING.', 1;
    END;

    DECLARE @Offset bigint =
        (CONVERT(bigint, @PageNumber) - CONVERT(bigint, 1))
        * CONVERT(bigint, @PageSize);

    DECLARE @NormalizedSearch nvarchar(max) =
        NULLIF(LTRIM(RTRIM(@Search)), N'');

    DECLARE @SearchPattern nvarchar(max) = NULL;

    IF @NormalizedSearch IS NOT NULL
    BEGIN
        SET @SearchPattern =
            N'%'
            + REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(@NormalizedSearch, N'~', N'~~'),
                        N'%', N'~%'),
                    N'_', N'~_'),
                N'[', N'~[')
            + N'%';
    END;

    SELECT
        [U].[Id],
        [U].[UserName],
        [U].[CreatedAt],
        [U].[ModerationStatus],
        COUNT_BIG(1) OVER () AS [TotalCount]
    FROM [dbo].[Users] AS [U]
    WHERE
        [U].[IsDeleted] = CONVERT(bit, 0)
        AND
        (
            @SearchPattern IS NULL
            OR [U].[UserName] LIKE @SearchPattern ESCAPE N'~'
        )
    ORDER BY
        CASE WHEN @SortDirection = 'ASCENDING'
            THEN [U].[UserName] END ASC,
        CASE WHEN @SortDirection = 'DESCENDING'
            THEN [U].[UserName] END DESC,
        [U].[Id] ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

PRINT N'dbo.GetListUser deployment completed.';
GO
