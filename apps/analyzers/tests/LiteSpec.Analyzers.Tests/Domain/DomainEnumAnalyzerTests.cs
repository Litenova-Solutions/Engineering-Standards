using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1002, enums in Domain.</summary>
public sealed class DomainEnumAnalyzerTests
{
    [Fact(DisplayName = "LS1002 reports an enum declared in Domain")]
    public Task ReportsAnEnumInDomain() =>
        Verify.AnalyzerAsync<DomainEnumAnalyzer>("""
            namespace Shop.Orders;

            public enum {|LS1002:OrderStatus|} { Draft, Placed }
            """);

    [Fact(DisplayName = "LS1002 accepts a closed record hierarchy")]
    public Task AcceptsARecordHierarchy() =>
        Verify.AnalyzerAsync<DomainEnumAnalyzer>("""
            namespace Shop.Orders;

            public abstract record OrderStatus(string Code);

            public sealed record Draft() : OrderStatus("draft");
            """);

    [Fact(DisplayName = "LS1002 ignores an enum outside Domain")]
    public Task IgnoresAnEnumOutsideDomain() =>
        Verify.AnalyzerAsync<DomainEnumAnalyzer>("""
            namespace Shop.Orders;

            public enum ResponseShape { Full, Summary }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1002 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<DomainEnumAnalyzer>("""
            namespace Shop.Core;

            public enum {|LS1002:Priority|} { Low, High }
            """, assemblyName: "Shop.Core", layer: "Domain");
}
