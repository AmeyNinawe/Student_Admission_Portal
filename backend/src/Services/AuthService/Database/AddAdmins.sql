BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AuthTokens]') AND [c].[name] = N'StudentId');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [AuthTokens] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [AuthTokens] ALTER COLUMN [StudentId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    ALTER TABLE [AuthTokens] ADD [AdminId] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    CREATE TABLE [Admins] (
        [Id] int NOT NULL IDENTITY,
        [Username] nvarchar(50) NOT NULL,
        [FullName] nvarchar(100) NOT NULL,
        [Email] nvarchar(150) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [LastLoginAt] datetime2 NULL,
        CONSTRAINT [PK_Admins] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    CREATE INDEX [IX_AuthTokens_AdminId] ON [AuthTokens] ([AdminId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    EXEC(N'ALTER TABLE [AuthTokens] ADD CONSTRAINT [CK_AuthTokens_Owner] CHECK (([StudentId] IS NULL AND [AdminId] IS NOT NULL) OR ([StudentId] IS NOT NULL AND [AdminId] IS NULL))');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Admins_Email] ON [Admins] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Admins_Username] ON [Admins] ([Username]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    ALTER TABLE [AuthTokens] ADD CONSTRAINT [FK_AuthTokens_Admins_AdminId] FOREIGN KEY ([AdminId]) REFERENCES [Admins] ([Id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013153747_AddAdmins'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013153747_AddAdmins', N'8.0.11');
END;
GO

COMMIT;
GO

