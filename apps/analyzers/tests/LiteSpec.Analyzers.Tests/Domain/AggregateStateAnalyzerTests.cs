using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1003 and LS1004, aggregate state records.</summary>
public sealed class AggregateStateAnalyzerTests
{
    [Fact(DisplayName = "LS1003 reports an aggregate with no State property")]
    public Task ReportsAnAggregateWithNoState() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class {|LS1003:Order|} : AggregateRoot<OrderId>
            {
                public Order(OrderId id) : base(id) { }
            }
            """);

    [Fact(DisplayName = "LS1003 reports an aggregate whose State is a string")]
    public Task ReportsAnAggregateWithAStringState() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class {|LS1003:Order|} : AggregateRoot<OrderId>
            {
                public Order(OrderId id, string state) : base(id) { State = state; }
                public string State { get; }
            }
            """);

    [Fact(DisplayName = "LS1003 reports an aggregate whose State is not abstract")]
    public Task ReportsAnAggregateWithAConcreteRecordState() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class {|LS1003:Order|} : AggregateRoot<OrderId>
            {
                public Order(OrderId id, OrderState state) : base(id) { State = state; }
                public OrderState State { get; }
            }

            public record OrderState;
            """);

    [Fact(DisplayName = "LS1003 and LS1004 accept an aggregate with sealed state cases")]
    public Task AcceptsAnAggregateWithSealedCases() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class Order : AggregateRoot<OrderId>
            {
                public Order(OrderId id, OrderState state) : base(id) { State = state; }
                public OrderState State { get; }
            }

            public abstract record OrderState;

            public sealed record OrderDraftState : OrderState;

            public sealed record OrderPlacedState(DateTimeOffset PlacedAt) : OrderState;
            """);

    [Fact(DisplayName = "LS1004 reports an unsealed state case")]
    public Task ReportsAnUnsealedCase() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class Order : AggregateRoot<OrderId>
            {
                public Order(OrderId id, OrderState state) : base(id) { State = state; }
                public OrderState State { get; }
            }

            public abstract record OrderState;

            public record {|LS1004:OrderDraftState|} : OrderState;

            public sealed record OrderPlacedState : OrderState;
            """);

    [Fact(DisplayName = "LS1004 accepts an abstract intermediate case")]
    public Task AcceptsAnAbstractIntermediateCase() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class Order : AggregateRoot<OrderId>
            {
                public Order(OrderId id, OrderState state) : base(id) { State = state; }
                public OrderState State { get; }
            }

            public abstract record OrderState;

            public abstract record OrderOpenState : OrderState;

            public sealed record OrderDraftState : OrderOpenState;

            public sealed record OrderPlacedState : OrderState;
            """);

    [Fact(DisplayName = "LS1004 reports a nested unsealed case")]
    public Task ReportsANestedUnsealedCase() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class Order : AggregateRoot<OrderId>
            {
                public Order(OrderId id, OrderState state) : base(id) { State = state; }
                public OrderState State { get; }
                public record {|LS1004:OrderDraftState|} : OrderState;
            }

            public abstract record OrderState;

            public sealed record OrderPlacedState : OrderState;
            """);

    [Fact(DisplayName = "LS1003 reports only the aggregate without a State")]
    public Task ReportsOneOfTwoAggregates() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public readonly record struct CustomerId(Guid Value);

            public sealed class Order : AggregateRoot<OrderId>
            {
                public Order(OrderId id, OrderState state) : base(id) { State = state; }
                public OrderState State { get; }
            }

            public sealed class {|LS1003:Customer|} : AggregateRoot<CustomerId>
            {
                public Customer(CustomerId id) : base(id) { }
            }

            public abstract record OrderState;

            public sealed record OrderActiveState : OrderState;
            """);

    [Fact(DisplayName = "LS1003 accepts a State inherited from an abstract base")]
    public Task AcceptsAnInheritedState() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public abstract class AuditedOrder : AggregateRoot<OrderId>
            {
                protected AuditedOrder(OrderId id, OrderState state) : base(id) { State = state; }
                public OrderState State { get; }
            }

            public sealed class Order : AuditedOrder
            {
                public Order(OrderId id, OrderState state) : base(id, state) { }
            }

            public abstract record OrderState;

            public sealed record OrderActiveState : OrderState;
            """);

    [Fact(DisplayName = "LS1003 and LS1004 ignore aggregates outside Domain")]
    public Task IgnoresAggregatesOutsideDomain() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class Order : AggregateRoot<OrderId>
            {
                public Order(OrderId id) : base(id) { }
            }

            public abstract record OrderState;

            public record OrderDraftState : OrderState;
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1003 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderId(Guid Value);

            public sealed class {|LS1003:Order|} : AggregateRoot<OrderId>
            {
                public Order(OrderId id) : base(id) { }
            }
            """, assemblyName: "Shop.Core", layer: "Domain");

    [Fact(DisplayName = "LS1003 matches AggregateRoot in any namespace")]
    public Task MatchesAggregateRootInAnyNamespace() =>
        Verify.AnalyzerAsync<AggregateStateAnalyzer>("""
            using System;

            namespace Shop.SharedKernel
            {
                public abstract class AggregateRoot<TId>
                {
                    protected AggregateRoot(TId id) { Id = id; }
                    public TId Id { get; }
                }
            }

            namespace Shop.Orders
            {
                public readonly record struct OrderId(Guid Value);

                public sealed class {|LS1003:Order|} : SharedKernel.AggregateRoot<OrderId>
                {
                    public Order(OrderId id) : base(id) { }
                }
            }
            """);
}
