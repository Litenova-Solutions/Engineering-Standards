using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1012, strongly typed identifiers.</summary>
public sealed class TypedIdentifierAnalyzerTests
{
    [Fact(DisplayName = "LS1012 accepts a readonly record struct wrapping one Guid")]
    public Task AcceptsAReadonlyRecordStruct() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
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
            """);

    [Fact(DisplayName = "LS1012 reports a record class identifier")]
    public Task ReportsARecordClass() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public record {|LS1012:OrderId|}(Guid Value);

            public sealed class Order : AggregateRoot<OrderId>
            {
                public Order(OrderId id) : base(id) { }
            }
            """);

    [Fact(DisplayName = "LS1012 reports a record struct without readonly")]
    public Task ReportsARecordStructWithoutReadonly() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public record struct {|LS1012:OrderId|}(Guid Value);
            """);

    [Fact(DisplayName = "LS1012 reports an identifier wrapping two values")]
    public Task ReportsAnIdentifierWithTwoValues() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public readonly record struct {|LS1012:OrderId|}(Guid First, Guid Second);
            """);

    [Fact(DisplayName = "LS1012 reports an identifier wrapping a string")]
    public Task ReportsAnIdentifierWithAStringValue() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            namespace Shop.Orders;

            public readonly record struct {|LS1012:OrderId|}(string Value);
            """);

    [Fact(DisplayName = "LS1012 reports an identifier with an implicit conversion")]
    public Task ReportsAnIdentifierWithAnImplicitConversion() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public readonly record struct {|LS1012:OrderId|}(Guid Value)
            {
                public static implicit operator Guid(OrderId id) => id.Value;
            }
            """);

    [Fact(DisplayName = "LS1012 accepts an identifier with an explicit conversion")]
    public Task AcceptsAnIdentifierWithAnExplicitConversion() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public readonly record struct OrderId(Guid Value)
            {
                public static explicit operator Guid(OrderId id) => id.Value;
            }
            """);

    [Fact(DisplayName = "LS1012 reports a Guid used directly as the identity")]
    public Task ReportsAGuidUsedDirectlyAsTheIdentity() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public sealed class Order : {|LS1012:AggregateRoot<Guid>|}
            {
                public Order(Guid id) : base(id) { }
            }
            """);

    [Fact(DisplayName = "LS1012 accepts a child entity with a typed identity")]
    public Task AcceptsAChildEntityWithATypedIdentity() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class Entity<TId>
            {
                protected Entity(TId id) { Id = id; }
                public TId Id { get; }
            }

            public readonly record struct OrderLineId(Guid Value);

            public sealed class OrderLine : Entity<OrderLineId>
            {
                public OrderLine(OrderLineId id) : base(id) { }
            }
            """);

    [Fact(DisplayName = "LS1012 reports a Guid used directly as a child entity identity")]
    public Task ReportsAGuidUsedDirectlyAsAChildEntityIdentity() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class Entity<TId>
            {
                protected Entity(TId id) { Id = id; }
                public TId Id { get; }
            }

            public sealed class OrderLine : {|LS1012:Entity<Guid>|}
            {
                public OrderLine(Guid id) : base(id) { }
            }
            """);

    [Fact(DisplayName = "LS1012 ignores identifiers outside Domain")]
    public Task IgnoresIdentifiersOutsideDomain() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class AggregateRoot<TId>
            {
                protected AggregateRoot(TId id) { Id = id; }
                public TId Id { get; }
            }

            public record struct OrderId(Guid Value);

            public sealed class Order : AggregateRoot<Guid>
            {
                public Order(Guid id) : base(id) { }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1012 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<TypedIdentifierAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public record struct {|LS1012:OrderId|}(Guid Value);
            """, assemblyName: "Shop.Core", layer: "Domain");
}
