using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1005 and LS1006, Domain exceptions.</summary>
public sealed class DomainExceptionAnalyzerTests
{
    [Fact(DisplayName = "LS1005 reports a throw of a non-Domain exception")]
    public Task ReportsThrowOfNonDomainException() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class Order
            {
                public void Place()
                {
                    throw {|LS1005:new InvalidOperationException()|};
                }
            }
            """);

    [Fact(DisplayName = "LS1005 reports a throw expression in a coalescing expression")]
    public Task ReportsThrowExpressionInCoalescing() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class Order
            {
                public Order(string? name)
                {
                    Name = name ?? throw {|LS1005:new InvalidOperationException("A name is required.")|};
                }

                public string Name { get; }
            }
            """);

    [Fact(DisplayName = "LS1005 accepts a throw of a DomainException subclass")]
    public Task AcceptsThrowOfDomainException() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class DomainException(string message) : Exception(message);

            public sealed class OrderAlreadyPlacedException() : DomainException("The order is already placed.");

            public sealed class Order
            {
                public void Place(bool placed)
                {
                    if (placed)
                    {
                        throw new OrderAlreadyPlacedException();
                    }
                }
            }
            """);

    [Fact(DisplayName = "LS1005 accepts argument guards and unreachable throws")]
    public Task AcceptsArgumentGuards() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class Order
            {
                public Order(string name, int quantity)
                {
                    ArgumentNullException.ThrowIfNull(name);
                    if (quantity <= 0)
                    {
                        throw new ArgumentOutOfRangeException(nameof(quantity));
                    }

                    Name = name;
                }

                public string Name { get; }

                public int Reject()
                {
                    throw new System.Diagnostics.UnreachableException();
                }
            }
            """);

    [Fact(DisplayName = "LS1005 accepts a rethrow and a thrown caught variable")]
    public Task AcceptsRethrowAndCaughtVariable() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class Order
            {
                public void Place(Action action)
                {
                    try
                    {
                        action();
                    }
                    catch (InvalidOperationException)
                    {
                        throw;
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }
            """);

    [Fact(DisplayName = "LS1005 and LS1006 ignore breaches outside Domain")]
    public Task IgnoreBreachesOutsideDomain() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class DomainException(string message) : Exception(message);

            public class OrderRuleException : DomainException
            {
                public OrderRuleException() : base("Broken.") { }
            }

            public sealed class OrderEndpoint
            {
                public void Place()
                {
                    throw new InvalidOperationException();
                }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1006 reports an unsealed exception deriving indirectly")]
    public Task ReportsUnsealedIndirectException() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class DomainException(string message) : Exception(message);

            public abstract class OrderException(string message) : DomainException(message);

            public class {|LS1006:OrderRuleException|} : OrderException
            {
                public OrderRuleException() : base("Broken.") { }
            }
            """);

    [Fact(DisplayName = "LS1006 reports a sealed exception with a name lacking the suffix")]
    public Task ReportsMisnamedException() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class DomainException(string message) : Exception(message);

            public sealed class {|LS1006:OrderRuleFailure|} : DomainException
            {
                public OrderRuleFailure() : base("Broken.") { }
            }
            """);

    [Fact(DisplayName = "LS1006 accepts a sealed exception and an abstract intermediate")]
    public Task AcceptsSealedExceptionAndAbstractIntermediate() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class DomainException(string message) : Exception(message);

            public abstract class OrderException(string message) : DomainException(message);

            public sealed class OrderAlreadyPlacedException() : OrderException("The order is already placed.");
            """);

    [Fact(DisplayName = "LS1005 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Core;

            public sealed class Order
            {
                public void Place()
                {
                    throw {|LS1005:new InvalidOperationException()|};
                }
            }
            """, assemblyName: "Shop.Core", layer: "Domain");

    [Fact(DisplayName = "LS1006 reports an unsealed misnamed exception once")]
    public Task ReportsDoubleBreachOnce() =>
        Verify.AnalyzerAsync<DomainExceptionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public abstract class DomainException(string message) : Exception(message);

            public class {|LS1006:OrderRuleFailure|} : DomainException
            {
                public OrderRuleFailure() : base("Broken.") { }
            }
            """);
}
