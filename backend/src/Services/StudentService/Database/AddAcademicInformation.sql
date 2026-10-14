BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013112052_AddAcademicInformation'
)
BEGIN
    CREATE TABLE [AcademicInformation] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [StudentId] nvarchar(20) NOT NULL,
        [TenthBoard] nvarchar(100) NOT NULL,
        [TenthSchool] nvarchar(200) NOT NULL,
        [TenthYear] int NOT NULL,
        [TenthPercentage] decimal(5,2) NOT NULL,
        [TwelfthBoard] nvarchar(100) NULL,
        [TwelfthCollege] nvarchar(200) NULL,
        [TwelfthYear] int NULL,
        [TwelfthPercentage] decimal(5,2) NULL,
        [DiplomaCollege] nvarchar(200) NULL,
        [DiplomaBranch] nvarchar(100) NULL,
        [DiplomaYear] int NULL,
        [DiplomaPercentage] decimal(5,2) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_AcademicInformation] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013112052_AddAcademicInformation'
)
BEGIN
    CREATE UNIQUE INDEX [IX_AcademicInformation_StudentId] ON [AcademicInformation] ([StudentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013112052_AddAcademicInformation'
)
BEGIN
    CREATE UNIQUE INDEX [IX_AcademicInformation_UserId] ON [AcademicInformation] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013112052_AddAcademicInformation'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013112052_AddAcademicInformation', N'8.0.11');
END;
GO

COMMIT;
GO

