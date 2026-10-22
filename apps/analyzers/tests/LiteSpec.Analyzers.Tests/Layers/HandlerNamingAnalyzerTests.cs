using LiteSpec.Analyzers.Rules.Layers;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Layers;

/// <summary>Tests for LS2005, handler command and query suffixes.</summary>
public sealed class HandlerNamingAnalyzerTests
{
    [Fact(DisplayName = "LS2005 reports a command handler without its suffix")]
    public Task ReportsACommandHandlerWithoutItsSuffix() =>
        Verify.AnalyzerAsync<HandlerNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface ICommandHandler<TCommand, TResult> { }

            public sealed record PlaceOrderCommand(int Quantity);

            internal sealed class {|LS2005:PlaceOrderUseCase|} : ICommandHandler<PlaceOrderCommand, int>
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2005 reports a query handler without its suffix")]
    public Task ReportsAQueryHandlerWithoutItsSuffix() =>
        Verify.AnalyzerAsync<HandlerNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface IQueryHandler<TQuery, TResult> { }

            public sealed record GetOrderQuery(int OrderId);

            internal sealed class {|LS2005:GetOrderReader|} : IQueryHandler<GetOrderQuery, int>
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2005 accepts handlers with their full suffixes")]
    public Task AcceptsHandlersWithFullSuffixes() =>
        Verify.AnalyzerAsync<HandlerNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface ICommandHandler<TCommand, TResult> { }

            public interface IQueryHandler<TQuery, TResult> { }

            public sealed record PlaceOrderCommand(int Quantity);

            public sealed record GetOrderQuery(int OrderId);

            internal sealed class PlaceOrderCommandHandler : ICommandHandler<PlaceOrderCommand, int>
            {
            }

            internal sealed class GetOrderQueryHandler : IQueryHandler<GetOrderQuery, int>
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2005 ignores a Handler name that implements neither contract")]
    public Task IgnoresABareHandlerName() =>
        Verify.AnalyzerAsync<HandlerNamingAnalyzer>("""
            namespace Shop.Orders;

            internal sealed class NotifySubscribersOnPostPublishedHandler
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2005 ignores an interface extending a handler contract")]
    public Task IgnoresAnInterface() =>
        Verify.AnalyzerAsync<HandlerNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface ICommandHandler<TCommand, TResult> { }

            public interface IPlaceOrder : ICommandHandler<int, int>
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2005 ignores a handler outside Application and Infrastructure")]
    public Task IgnoresHandlerOutsideItsLayers() =>
        Verify.AnalyzerAsync<HandlerNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface ICommandHandler<TCommand, TResult> { }

            public sealed record PlaceOrderCommand(int Quantity);

            public sealed class PlaceOrderUseCase : ICommandHandler<PlaceOrderCommand, int>
            {
            }
            """, assemblyName: "Shop.Domain");

    [Fact(DisplayName = "LS2005 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<HandlerNamingAnalyzer>("""
            namespace Shop.Core;

            public interface ICommandHandler<TCommand, TResult> { }

            public sealed record PlaceOrderCommand(int Quantity);

            internal sealed class {|LS2005:PlaceOrderUseCase|} : ICommandHandler<PlaceOrderCommand, int>
            {
            }
            """, assemblyName: "Shop.Core", layer: "Application");
}
