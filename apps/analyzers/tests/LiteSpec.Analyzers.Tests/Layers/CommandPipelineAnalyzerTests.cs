using LiteSpec.Analyzers.Rules.Layers;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Layers;

/// <summary>Tests for LS2002 and LS2004, the command pipeline rules.</summary>
public sealed class CommandPipelineAnalyzerTests
{
    [Fact(DisplayName = "LS2002 reports a command handler dispatching through ICommandMediator")]
    public Task ReportsMediatorDispatch() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public interface ICommandMediator
            {
                Task SendAsync(object command, CancellationToken cancellationToken);
            }

            public sealed record PlaceOrderCommand(int Quantity);

            internal sealed class PlaceOrderCommandHandler(ICommandMediator mediator)
            {
                public Task HandleAsync(PlaceOrderCommand command, CancellationToken cancellationToken) =>
                    mediator.{|LS2002:SendAsync|}(command, cancellationToken);
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2002 accepts a handler calling a repository")]
    public Task AcceptsAHandlerCallingARepository() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            namespace Shop.Orders;

            public interface IOrderRepository
            {
                void Store(object order);
            }

            public sealed record PlaceOrderCommand(int Quantity);

            internal sealed class PlaceOrderCommandHandler(IOrderRepository orders)
            {
                public void Handle(PlaceOrderCommand command) => orders.Store(command);
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2002 follows ICommandHandler when the name has no suffix")]
    public Task FollowsTheHandlerInterface() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public interface ICommandMediator
            {
                Task SendAsync(object command, CancellationToken cancellationToken);
            }

            public interface ICommandHandler<TCommand, TResult> { }

            public sealed record PlaceOrderCommand(int Quantity);

            internal sealed class PlaceOrderUseCase(ICommandMediator mediator)
                : ICommandHandler<PlaceOrderCommand, int>
            {
                public async Task<int> HandleAsync(PlaceOrderCommand command, CancellationToken cancellationToken)
                {
                    await mediator.{|LS2002:SendAsync|}(command, cancellationToken);
                    return 0;
                }
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2004 reports an IDocumentSession field")]
    public Task ReportsASessionField() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using Marten;

            namespace Marten
            {
                public interface IDocumentSession { }
            }

            namespace Shop.Orders
            {
                internal sealed class PlaceOrderCommandHandler
                {
                    private readonly {|LS2004:IDocumentSession|} _session = null!;
                }
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2004 reports a DbContext subclass parameter")]
    public Task ReportsADbContextSubclassParameter() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            namespace Microsoft.EntityFrameworkCore
            {
                public class DbContext { }
            }

            namespace Shop.Orders
            {
                public sealed class ShopDb : Microsoft.EntityFrameworkCore.DbContext { }

                internal sealed class PlaceOrderCommandHandler
                {
                    public PlaceOrderCommandHandler({|LS2004:ShopDb|} db) { }
                }
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2004 reports a session property")]
    public Task ReportsASessionProperty() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using Marten;

            namespace Marten
            {
                public interface IDocumentSession { }
            }

            namespace Shop.Orders
            {
                internal sealed class PlaceOrderCommandHandler
                {
                    public {|LS2004:IDocumentSession|} Session { get; } = null!;
                }
            }
            """, assemblyName: "Shop.Infrastructure");

    [Fact(DisplayName = "LS2004 reports a session local")]
    public Task ReportsASessionLocal() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using Marten;

            namespace Marten
            {
                public interface IDocumentSession { }
            }

            namespace Shop.Orders
            {
                public sealed record PlaceOrderCommand(int Quantity);

                internal sealed class PlaceOrderCommandHandler
                {
                    public void Handle(PlaceOrderCommand command)
                    {
                        {|LS2004:IDocumentSession|} session = null!;
                    }
                }
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2004 reports an invocation through a session receiver")]
    public Task ReportsASessionReceiverInvocation() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using Marten;

            namespace Marten
            {
                public interface IDocumentSession
                {
                    void Store(object entity);
                }
            }

            namespace Shop.Orders
            {
                public sealed record PlaceOrderCommand(int Quantity);

                internal sealed class PlaceOrderCommandHandler
                {
                    private IDocumentSession GetSession() => null!;

                    public void Handle(PlaceOrderCommand command) => GetSession().{|LS2004:Store|}(command);
                }
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2004 accepts a query handler using IDocumentSession")]
    public Task AcceptsAQueryHandlerUsingTheSession() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using Marten;

            namespace Marten
            {
                public interface IDocumentSession { }
            }

            namespace Shop.Orders
            {
                internal sealed class GetOrderQueryHandler
                {
                    private readonly IDocumentSession _session = null!;
                }
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2002 stays silent in WebApi")]
    public Task StaysSilentInWebApi() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public interface ICommandMediator
            {
                Task SendAsync(object command, CancellationToken cancellationToken);
            }

            public sealed record PlaceOrderCommand(int Quantity);

            internal sealed class PlaceOrderCommandHandler(ICommandMediator mediator)
            {
                public Task HandleAsync(PlaceOrderCommand command, CancellationToken cancellationToken) =>
                    mediator.SendAsync(command, cancellationToken);
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS2004 stays silent in Domain")]
    public Task StaysSilentInDomain() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using Marten;

            namespace Marten
            {
                public interface IDocumentSession { }
            }

            namespace Shop.Orders
            {
                internal sealed class PlaceOrderCommandHandler
                {
                    private readonly IDocumentSession _session = null!;
                }
            }
            """);

    [Fact(DisplayName = "LS2002 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Core;

            public interface ICommandMediator
            {
                Task SendAsync(object command, CancellationToken cancellationToken);
            }

            public sealed record PlaceOrderCommand(int Quantity);

            internal sealed class PlaceOrderCommandHandler(ICommandMediator mediator)
            {
                public Task HandleAsync(PlaceOrderCommand command, CancellationToken cancellationToken) =>
                    mediator.{|LS2002:SendAsync|}(command, cancellationToken);
            }
            """, assemblyName: "Shop.Core", layer: "Infrastructure");
}
