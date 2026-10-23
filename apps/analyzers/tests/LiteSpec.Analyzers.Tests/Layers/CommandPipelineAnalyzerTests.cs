using LiteSpec.Analyzers.Rules.Layers;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Layers;

/// <summary>Tests for LS2004, the repository write rule.</summary>
public sealed class CommandPipelineAnalyzerTests
{
    [Fact(DisplayName = "LS2004 accepts a handler calling a repository")]
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

    [Fact(DisplayName = "No rule reports a command handler dispatching through the mediator")]
    public Task AcceptsADispatchThroughTheMediator() =>
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

    [Fact(DisplayName = "LS2004 stays silent in WebApi")]
    public Task StaysSilentInWebApi() =>
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

    [Fact(DisplayName = "LS2004 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<CommandPipelineAnalyzer>("""
            using Marten;

            namespace Marten
            {
                public interface IDocumentSession { }
            }

            namespace Shop.Core
            {
                internal sealed class PlaceOrderCommandHandler
                {
                    private readonly {|LS2004:IDocumentSession|} _session = null!;
                }
            }
            """, assemblyName: "Shop.Core", layer: "Infrastructure");
}
