BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013113930_AddStudentDocuments'
)
BEGIN
    CREATE TABLE [StudentDocuments] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [StudentId] nvarchar(20) NOT NULL,
        [DocumentType] nvarchar(30) NOT NULL,
        [FileName] nvarchar(255) NOT NULL,
        [ContentType] nvarchar(50) NOT NULL,
        [Size] int NOT NULL,
        [Content] varbinary(max) NOT NULL,
        [UploadedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_StudentDocuments] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013113930_AddStudentDocuments'
)
BEGIN
    CREATE UNIQUE INDEX [IX_StudentDocuments_UserId_DocumentType] ON [StudentDocuments] ([UserId], [DocumentType]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013113930_AddStudentDocuments'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013113930_AddStudentDocuments', N'8.0.11');
END;
GO

COMMIT;
GO

