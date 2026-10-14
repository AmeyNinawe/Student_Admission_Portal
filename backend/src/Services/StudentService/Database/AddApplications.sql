BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013154308_AddApplications'
)
BEGIN
    CREATE TABLE [Applications] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [StudentId] nvarchar(20) NOT NULL,
        [ApplicationNumber] nvarchar(20) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [SubmittedAt] datetime2 NOT NULL,
        [ReviewedAt] datetime2 NULL,
        [ReviewedBy] nvarchar(100) NULL,
        [Remarks] nvarchar(500) NULL,
        CONSTRAINT [PK_Applications] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013154308_AddApplications'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Applications_ApplicationNumber] ON [Applications] ([ApplicationNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013154308_AddApplications'
)
BEGIN
    CREATE INDEX [IX_Applications_Status] ON [Applications] ([Status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013154308_AddApplications'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Applications_UserId] ON [Applications] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013154308_AddApplications'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013154308_AddApplications', N'8.0.11');
END;
GO

COMMIT;
GO

