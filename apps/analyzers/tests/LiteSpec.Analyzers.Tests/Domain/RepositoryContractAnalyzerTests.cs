using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1010, repository contracts in Domain.</summary>
public sealed class RepositoryContractAnalyzerTests
{
    [Fact(DisplayName = "LS1010 accepts a find returning a nullable aggregate")]
    public Task AcceptsFindReturningNullableAggregate() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Order
            {
            }

            public readonly record struct OrderId
            {
            }

            public interface IOrderRepository
            {
                Task<Order?> FindAsync(OrderId id, CancellationToken cancellationToken);
            }
            """);

    [Fact(DisplayName = "LS1010 reports a queryable return")]
    public Task ReportsQueryableReturn() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System.Linq;

            namespace Shop.Orders;

            public sealed class Order
            {
            }

            public interface IOrderRepository
            {
                {|LS1010:IQueryable<Order>|} Query();
            }
            """);

    [Fact(DisplayName = "LS1010 reports an expression filter parameter")]
    public Task ReportsExpressionFilterParameter() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System;
            using System.Collections.Generic;
            using System.Linq.Expressions;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Order
            {
            }

            public interface IOrderRepository
            {
                Task<IReadOnlyList<Order>> ListAsync({|LS1010:Expression<Func<Order, bool>>|} filter);
            }
            """);

    [Fact(DisplayName = "LS1010 reports a session property")]
    public Task ReportsSessionProperty() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            namespace Shop.Orders;

            public interface IDocumentSession
            {
            }

            public sealed class Order
            {
            }

            public interface IOrderRepository
            {
                {|LS1010:IDocumentSession|} Session { get; }
            }
            """);

    [Fact(DisplayName = "LS1010 reports a set property")]
    public Task ReportsSetProperty() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            namespace Shop.Orders;

            public sealed class Order
            {
            }

            public sealed class DbSet<T>
            {
            }

            public interface IOrderRepository
            {
                {|LS1010:DbSet<Order>|} Orders { get; }
            }
            """);

    [Fact(DisplayName = "LS1010 reports a derived queryable return")]
    public Task ReportsDerivedQueryableReturn() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System.Linq;

            namespace Shop.Orders;

            public sealed class Order
            {
            }

            public interface ISorted<T> : IQueryable<T>
            {
            }

            public interface IOrderRepository
            {
                {|LS1010:ISorted<Order>|} Sorted();
            }
            """);

    [Fact(DisplayName = "LS1010 reports a generic repository")]
    public Task ReportsGenericRepository() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System;
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public interface {|LS1010:IRepository|}<T>
            {
                Task<T> GetAsync(Guid id, CancellationToken cancellationToken);
            }
            """);

    [Fact(DisplayName = "LS1010 ignores an interface not named Repository")]
    public Task IgnoresInterfaceNotNamedRepository() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System.Linq;

            namespace Shop.Orders;

            public sealed class Order
            {
            }

            public interface IOrderQueries
            {
                IQueryable<Order> Query();
            }
            """);

    [Fact(DisplayName = "LS1010 ignores a repository outside Domain")]
    public Task IgnoresRepositoryOutsideDomain() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System.Linq;

            namespace Shop.Orders;

            public sealed class Order
            {
            }

            public interface IOrderRepository
            {
                IQueryable<Order> Query();
            }
            """, assemblyName: "Shop.Infrastructure");

    [Fact(DisplayName = "LS1010 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<RepositoryContractAnalyzer>("""
            using System.Linq;

            namespace Shop.Core;

            public sealed class Order
            {
            }

            public interface IOrderRepository
            {
                {|LS1010:IQueryable<Order>|} Query();
            }
            """, assemblyName: "Shop.Core", layer: "Domain");
}
