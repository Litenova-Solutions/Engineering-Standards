using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1013, domain event placement in the Events folder.</summary>
public sealed class DomainEventLocationAnalyzerTests
{
    [Fact(DisplayName = "LS1013 accepts an event under the Events folder")]
    public Task AcceptsAnEventUnderTheEventsFolder() =>
        Verify.AnalyzerAsync<DomainEventLocationAnalyzer>(
            [("Posts/Events/OrderPlacedEvent.cs", """
                namespace Shop.Orders;

                public interface IDomainEvent;

                public sealed record OrderPlacedEvent(int OrderId) : IDomainEvent;
                """)]);

    [Fact(DisplayName = "LS1013 reports an event outside the Events folder")]
    public Task ReportsAnEventOutsideTheEventsFolder() =>
        Verify.AnalyzerAsync<DomainEventLocationAnalyzer>(
            [("Posts/OrderPlacedEvent.cs", """
                namespace Shop.Orders;

                public interface IDomainEvent;

                public sealed record {|LS1013:OrderPlacedEvent|}(int OrderId) : IDomainEvent;
                """)]);

    [Fact(DisplayName = "LS1013 ignores an interface deriving IDomainEvent")]
    public Task IgnoresDerivedInterface() =>
        Verify.AnalyzerAsync<DomainEventLocationAnalyzer>(
            [("Posts/IOrderEvent.cs", """
                namespace Shop.Orders;

                public interface IDomainEvent;

                public interface IOrderEvent : IDomainEvent;
                """)]);

    [Fact(DisplayName = "LS1013 ignores a type that is not an event")]
    public Task IgnoresANonEvent() =>
        Verify.AnalyzerAsync<DomainEventLocationAnalyzer>(
            [("Posts/Order.cs", """
                namespace Shop.Orders;

                public sealed class Order
                {
                }
                """)]);

    [Fact(DisplayName = "LS1013 ignores an event outside Domain")]
    public Task IgnoresEventOutsideDomain() =>
        Verify.AnalyzerAsync<DomainEventLocationAnalyzer>(
            [("Posts/OrderPlacedEvent.cs", """
                namespace Shop.Orders;

                public interface IDomainEvent;

                public sealed record OrderPlacedEvent(int OrderId) : IDomainEvent;
                """)],
            assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1013 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<DomainEventLocationAnalyzer>(
            [("Posts/OrderPlacedEvent.cs", """
                namespace Shop.Core;

                public interface IDomainEvent;

                public sealed record {|LS1013:OrderPlacedEvent|}(int OrderId) : IDomainEvent;
                """)],
            assemblyName: "Shop.Core",
            layer: "Domain");
}
