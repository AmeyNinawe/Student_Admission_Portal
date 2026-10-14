BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013104427_AddAuthTokens'
)
BEGIN
    CREATE TABLE [AuthTokens] (
        [Id] int NOT NULL IDENTITY,
        [StudentId] int NOT NULL,
        [Jti] nvarchar(36) NOT NULL,
        [AccessToken] nvarchar(max) NOT NULL,
        [AccessTokenExpiresAt] datetime2 NOT NULL,
        [RefreshTokenHash] nvarchar(64) NOT NULL,
        [RefreshTokenExpiresAt] datetime2 NOT NULL,
        [RememberMe] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [RevokedAt] datetime2 NULL,
        [ReplacedByTokenHash] nvarchar(64) NULL,
        CONSTRAINT [PK_AuthTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AuthTokens_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013104427_AddAuthTokens'
)
BEGIN
    CREATE UNIQUE INDEX [IX_AuthTokens_Jti] ON [AuthTokens] ([Jti]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013104427_AddAuthTokens'
)
BEGIN
    CREATE UNIQUE INDEX [IX_AuthTokens_RefreshTokenHash] ON [AuthTokens] ([RefreshTokenHash]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013104427_AddAuthTokens'
)
BEGIN
    CREATE INDEX [IX_AuthTokens_StudentId] ON [AuthTokens] ([StudentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013104427_AddAuthTokens'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013104427_AddAuthTokens', N'8.0.11');
END;
GO

COMMIT;
GO

