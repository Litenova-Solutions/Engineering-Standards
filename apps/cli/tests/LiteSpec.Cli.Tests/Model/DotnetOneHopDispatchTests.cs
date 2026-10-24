using LiteSpec.Model;
using LiteSpec.Model.Readers.Dotnet;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves a receiver passed to a helper attributes the helper's dispatches one hop deep.</summary>
public sealed class DotnetOneHopDispatchTests
{
    [Fact]
    public void Helper_Taking_The_Mediator_Attributes_Its_Dispatch_To_The_Handler()
    {
        using var temp = Cli.Temp("onehop");
        WriteProject(temp.Path);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "BorrowCopyCommandHandler.cs"), MediatorHandler);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "LoanFanout.cs"), MediatorHelper);

        var handler = Assert.Single(
            new DotnetBackendReader().Read(ConsumerConfig.Load(temp.Path)).Handlers,
            found => found.UseCaseId == "use-case/lending.borrow-copy");
        var dispatch = Assert.Single(handler.Dispatches!);

        Assert.Equal("issues", dispatch.Verb);
        Assert.Equal("PurgeLoansCommand", dispatch.Target);
        Assert.Equal("LoanFanout.RetryAsync", dispatch.Via);
        Assert.EndsWith("BorrowCopyCommandHandler.cs", dispatch.File);
    }

    [Fact]
    public void Helper_Taking_A_Publisher_Attributes_Only_The_Passed_Receiver()
    {
        using var temp = Cli.Temp("onehop");
        WriteProject(temp.Path);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "NotifyOnBorrowReaction.cs"), PublisherReaction);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "LoanEventRelay.cs"), PublisherHelper);

        var reaction = Assert.Single(
            new DotnetBackendReader().Read(ConsumerConfig.Load(temp.Path)).Reactions,
            found => found.Class == "NotifyOnBorrowReaction");
        var dispatch = Assert.Single(reaction.Dispatches!);

        Assert.Equal("publishes", dispatch.Verb);
        Assert.Equal("LoanBorrowedEvent", dispatch.Target);
        Assert.Equal("LoanEventRelay.RelayAsync", dispatch.Via);
    }

    [Fact]
    public void Helper_Called_Without_A_Receiver_Attributes_Nothing()
    {
        using var temp = Cli.Temp("onehop");
        WriteProject(temp.Path);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "BorrowCopyCommandHandler.cs"), SilentHandler);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "LoanFanout.cs"), MediatorHelper);

        var handler = Assert.Single(
            new DotnetBackendReader().Read(ConsumerConfig.Load(temp.Path)).Handlers,
            found => found.UseCaseId == "use-case/lending.borrow-copy");

        Assert.Empty(handler.Dispatches!);
    }

    [Fact]
    public void Helper_Dispatch_Through_An_Unpassed_Receiver_Is_Not_Attributed()
    {
        using var temp = Cli.Temp("onehop");
        WriteProject(temp.Path);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "BorrowCopyCommandHandler.cs"), MediatorOnlyHandler);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "LoanFanout.cs"), TwoReceiverHelper);

        var handler = Assert.Single(
            new DotnetBackendReader().Read(ConsumerConfig.Load(temp.Path)).Handlers,
            found => found.UseCaseId == "use-case/lending.borrow-copy");
        var dispatch = Assert.Single(handler.Dispatches!);

        Assert.Equal("issues", dispatch.Verb);
        Assert.Equal("PurgeLoansCommand", dispatch.Target);
    }

    [Fact]
    public void Attribution_Stops_After_One_Hop()
    {
        using var temp = Cli.Temp("onehop");
        WriteProject(temp.Path);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "BorrowCopyCommandHandler.cs"), ChainedHandler);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "FirstHop.cs"), FirstHop);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "SecondHop.cs"), SecondHop);

        var handler = Assert.Single(
            new DotnetBackendReader().Read(ConsumerConfig.Load(temp.Path)).Handlers,
            found => found.UseCaseId == "use-case/lending.borrow-copy");
        var dispatch = Assert.Single(handler.Dispatches!);

        Assert.Equal("PurgeLoansCommand", dispatch.Target);
        Assert.Equal("FirstHop.RunAsync", dispatch.Via);
    }

    [Fact]
    public void Instance_Helper_Through_A_Held_Interface_Attributes_Its_Send()
    {
        using var temp = Cli.Temp("onehop");
        WriteProject(temp.Path);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "BorrowCopyCommandHandler.cs"), InstanceHandler);
        WriteApp(temp.Path, Path.Combine("Lending", "Loans", "BorrowCopy", "LoanFanout.cs"), InstanceHelper);

        var handler = Assert.Single(
            new DotnetBackendReader().Read(ConsumerConfig.Load(temp.Path)).Handlers,
            found => found.UseCaseId == "use-case/lending.borrow-copy");
        var dispatch = Assert.Single(handler.Dispatches!);

        Assert.Equal("sends", dispatch.Verb);
        Assert.Equal("MemberInvitedNotification", dispatch.Target);
        Assert.Equal("LoanFanout.NotifyAsync", dispatch.Via);
    }

    static void WriteProject(string root) =>
        File.WriteAllText(
            Path.Combine(root, "litespec.project.json"),
            """
            {"stacks": ["dotnet"], "stackConfig": {"dotnet": {
              "application": "src/App", "domain": "src/Domain",
              "webapi": "src/WebApi", "infrastructure": "src/Infra"}}}
            """);

    static void WriteApp(string root, string relative, string text)
    {
        var path = Path.Combine(root, "src", "App", relative);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, text);
    }

    const string MediatorHandler = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        public sealed class BorrowCopyCommandHandler(ICommandMediator commands)
        {
            public Task Handle(BorrowCopyCommand command, CancellationToken cancellationToken)
            {
                return LoanFanout.RetryAsync(command.CopyId, commands, cancellationToken);
            }
        }
        """;

    const string MediatorHelper = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        internal static class LoanFanout
        {
            public static async Task RetryAsync(Guid copyId, ICommandMediator commands, CancellationToken cancellationToken)
            {
                await commands.SendAsync(new PurgeLoansCommand(), cancellationToken);
            }
        }
        """;

    const string PublisherReaction = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        public sealed class NotifyOnBorrowReaction(IEventPublisher events) : IDomainEventReaction
        {
            public Task HandleAsync(LoanBorrowedEvent message, IOrderMessenger messenger)
            {
                return LoanEventRelay.RelayAsync(message, events);
            }
        }
        """;

    const string PublisherHelper = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        internal static class LoanEventRelay
        {
            public static async Task RelayAsync(LoanBorrowedEvent message, IEventPublisher events, IOrderMessenger messenger)
            {
                await events.PublishAsync(new LoanBorrowedEvent());
                await messenger.SendAsync(new MemberInvitedNotification());
            }
        }
        """;

    const string SilentHandler = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        public sealed class BorrowCopyCommandHandler(ICommandMediator commands)
        {
            public Task Handle(BorrowCopyCommand command)
            {
                return LoanFanout.RetryAsync(command.CopyId);
            }
        }
        """;

    const string MediatorOnlyHandler = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        public sealed class BorrowCopyCommandHandler(ICommandMediator commands)
        {
            public Task Handle(BorrowCopyCommand command)
            {
                return LoanFanout.RetryAsync(command.CopyId, commands);
            }
        }
        """;

    const string TwoReceiverHelper = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        internal static class LoanFanout
        {
            public static async Task RetryAsync(Guid copyId, ICommandMediator commands, IEventPublisher events)
            {
                await commands.SendAsync(new PurgeLoansCommand());
                await events.PublishAsync(new LoanBorrowedEvent());
            }
        }
        """;

    const string ChainedHandler = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        public sealed class BorrowCopyCommandHandler(ICommandMediator commands)
        {
            public Task Handle(BorrowCopyCommand command)
            {
                return FirstHop.RunAsync(command.CopyId, commands);
            }
        }
        """;

    const string FirstHop = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        internal static class FirstHop
        {
            public static async Task RunAsync(Guid copyId, ICommandMediator commands)
            {
                await commands.SendAsync(new PurgeLoansCommand());
                await SecondHop.RunAsync(copyId, commands);
            }
        }
        """;

    const string SecondHop = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        internal static class SecondHop
        {
            public static async Task RunAsync(Guid copyId, ICommandMediator commands)
            {
                await commands.SendAsync(new RetireCopyCommand());
                await FirstHop.RunAsync(copyId, commands);
            }
        }
        """;

    const string InstanceHandler = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        public sealed class BorrowCopyCommandHandler(IOrderMessenger messenger, ILoanFanout fanout)
        {
            public Task Handle(BorrowCopyCommand command)
            {
                return fanout.NotifyAsync(command.CopyId, messenger);
            }
        }
        """;

    const string InstanceHelper = """
        namespace Library.Application.Lending.Loans.BorrowCopy;

        public interface ILoanFanout
        {
            Task NotifyAsync(Guid copyId, IOrderMessenger messenger);
        }

        internal sealed class LoanFanout : ILoanFanout
        {
            public async Task NotifyAsync(Guid copyId, IOrderMessenger messenger)
            {
                await messenger.SendAsync(new MemberInvitedNotification());
            }
        }
        """;
}
