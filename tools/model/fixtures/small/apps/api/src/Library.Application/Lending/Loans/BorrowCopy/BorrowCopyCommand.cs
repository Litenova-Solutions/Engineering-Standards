namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed record BorrowCopyCommand(Guid CopyId, Guid ReaderId);
