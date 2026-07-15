namespace __PROJECT__.Application.Shared;

public sealed record ValidationError(string Field, string Code, string Message);

