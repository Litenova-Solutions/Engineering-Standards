using LiteSpec.Analyzers.Rules.Tests;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Tests;

/// <summary>Tests for LS4001, assertion presence in tests.</summary>
public sealed class TestAssertionAnalyzerTests
{
    [Fact(DisplayName = "LS4001 reports a test without an assertion")]
    public Task ReportsATestWithoutAnAssertion() =>
        Verify.AnalyzerAsync<TestAssertionAnalyzer>("""
            using System;

            namespace Shop.Orders.Tests;

            public sealed class FactAttribute : Attribute;

            public sealed class Order
            {
                public void Place() { }
            }

            public sealed class OrderTests
            {
                [Fact]
                public void {|LS4001:Place_WhenDraft_MarksPlaced|}()
                {
                    var order = new Order();
                    order.Place();
                }
            }
            """, assemblyName: "Shop.Domain.Tests");

    [Fact(DisplayName = "LS4001 accepts a test that asserts")]
    public Task AcceptsATestThatAsserts() =>
        Verify.AnalyzerAsync<TestAssertionAnalyzer>("""
            using System;

            namespace Shop.Orders.Tests;

            public sealed class FactAttribute : Attribute;

            public static class Assert
            {
                public static void True(bool condition) { }
            }

            public sealed class Order
            {
                public bool Placed { get; private set; }

                public void Place() => Placed = true;
            }

            public sealed class OrderTests
            {
                [Fact]
                public void Place_WhenDraft_MarksPlaced()
                {
                    var order = new Order();
                    order.Place();
                    Assert.True(order.Placed);
                }
            }
            """, assemblyName: "Shop.Domain.Tests");

    [Fact(DisplayName = "LS4001 accepts a test calling a custom Assert helper")]
    public Task AcceptsACustomAssertHelper() =>
        Verify.AnalyzerAsync<TestAssertionAnalyzer>("""
            using System;

            namespace Shop.Orders.Tests;

            public sealed class FactAttribute : Attribute;

            public sealed class Order
            {
                public void Place() { }
            }

            public sealed class OrderTests
            {
                [Fact]
                public void Place_WhenDraft_MarksPlaced()
                {
                    var order = new Order();
                    order.Place();
                    AssertOrderPlaced(order);
                }

                private static void AssertOrderPlaced(Order order) { }
            }
            """, assemblyName: "Shop.Domain.Tests");

    [Fact(DisplayName = "LS4001 accepts a theory that asserts")]
    public Task AcceptsATheoryThatAsserts() =>
        Verify.AnalyzerAsync<TestAssertionAnalyzer>("""
            using System;

            namespace Shop.Orders.Tests;

            public sealed class TheoryAttribute : Attribute;

            public static class Assert
            {
                public static void True(bool condition) { }
            }

            public sealed class OrderTests
            {
                [Theory]
                public void Place_WhenDraft_MarksPlaced()
                {
                    Assert.True(true);
                }
            }
            """, assemblyName: "Shop.Integration.Tests");

    [Fact(DisplayName = "LS4001 ignores a helper without a test attribute")]
    public Task IgnoresAHelperWithoutAnAttribute() =>
        Verify.AnalyzerAsync<TestAssertionAnalyzer>("""
            namespace Shop.Orders.Tests;

            public sealed class Order
            {
                public void Place() { }
            }

            public sealed class OrderTests
            {
                public void Place_WhenDraft_MarksPlaced()
                {
                    var order = new Order();
                    order.Place();
                }
            }
            """, assemblyName: "Shop.Domain.Tests");

    [Fact(DisplayName = "LS4001 ignores a test outside test projects")]
    public Task IgnoresATestOutsideTestProjects() =>
        Verify.AnalyzerAsync<TestAssertionAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class FactAttribute : Attribute;

            public sealed class Order
            {
                public void Place() { }
            }

            public sealed class OrderTests
            {
                [Fact]
                public void Place_WhenDraft_MarksPlaced()
                {
                    var order = new Order();
                    order.Place();
                }
            }
            """, assemblyName: "Shop.Domain");

    [Fact(DisplayName = "LS4001 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<TestAssertionAnalyzer>("""
            using System;

            namespace Shop.Core;

            public sealed class FactAttribute : Attribute;

            public sealed class Order
            {
                public void Place() { }
            }

            public sealed class OrderTests
            {
                [Fact]
                public void {|LS4001:Place_WhenDraft_MarksPlaced|}()
                {
                    var order = new Order();
                    order.Place();
                }
            }
            """, assemblyName: "Shop.Core", layer: "Test");
}
