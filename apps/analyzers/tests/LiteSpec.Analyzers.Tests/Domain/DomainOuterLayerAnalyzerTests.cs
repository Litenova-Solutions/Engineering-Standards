using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1001, outer-layer references in Domain.</summary>
public sealed class DomainOuterLayerAnalyzerTests
{
    [Fact(DisplayName = "LS1001 reports a using directive that imports an outer-layer namespace")]
    public Task ReportsAUsingOfAnOuterLayerNamespace() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    using {|LS1001:Microsoft.Extensions.Logging|};

                    namespace Shop.Orders;

                    public sealed class Order
                    {
                    }
                    """),
                ("Stubs.cs", """
                    namespace Microsoft.Extensions.Logging
                    {
                        public interface ILogger
                        {
                        }
                    }
                    """),
            ]);

    [Fact(DisplayName = "LS1001 reports a base type from an outer-layer namespace")]
    public Task ReportsABaseTypeFromAnOuterLayerNamespace() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    namespace Shop.Orders;

                    public sealed class Order : Microsoft.EntityFrameworkCore.{|LS1001:DbContext|}
                    {
                    }
                    """),
                ("Stubs.cs", """
                    namespace Microsoft.EntityFrameworkCore
                    {
                        public class DbContext
                        {
                        }
                    }
                    """),
            ]);

    [Fact(DisplayName = "LS1001 reports an attribute from an outer-layer namespace")]
    public Task ReportsAnAttributeFromAnOuterLayerNamespace() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>("""
            namespace Shop.Orders;

            public sealed class Order
            {
                [System.Text.Json.Serialization.{|LS1001:JsonPropertyName|}("id")]
                public string Id { get; }
            }
            """);

    [Fact(DisplayName = "LS1001 reports a generic argument and a nested outer-layer namespace")]
    public Task ReportsAGenericArgumentAndANestedNamespace() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    using System.Collections.Generic;

                    namespace Shop.Orders;

                    public sealed class OrderLog
                    {
                        public List<Microsoft.Extensions.Logging.{|LS1001:ILogger|}> Loggers { get; } = new();

                        public Microsoft.Extensions.Logging.Abstractions.{|LS1001:NullLogger|}? Logger { get; set; }
                    }
                    """),
                ("Stubs.cs", """
                    namespace Microsoft.Extensions.Logging
                    {
                        public interface ILogger
                        {
                        }
                    }

                    namespace Microsoft.Extensions.Logging.Abstractions
                    {
                        public sealed class NullLogger
                        {
                        }
                    }
                    """),
            ]);

    [Fact(DisplayName = "LS1001 reports a global using of an outer-layer namespace")]
    public Task ReportsAGlobalUsingOfAnOuterLayerNamespace() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    global using {|LS1001:Marten|};

                    namespace Shop.Orders;

                    public sealed class Order
                    {
                    }
                    """),
                ("Stubs.cs", """
                    namespace Marten
                    {
                        public interface IDocumentStore
                        {
                        }
                    }
                    """),
            ]);

    [Fact(DisplayName = "LS1001 accepts base class library and project types")]
    public Task AcceptsBaseClassLibraryAndProjectTypes() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>("""
            using System;
            using System.Collections.Generic;
            using System.Linq;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Order
            {
                public List<string> Tags { get; } = new();

                public DateTime PlacedAt { get; init; }

                public Task<int> CountAsync()
                {
                    return Task.FromResult(Tags.Count);
                }
            }
            """);

    [Fact(DisplayName = "LS1001 ignores a namespace that only shares a prefix")]
    public Task IgnoresANamespaceThatOnlySharesAPrefix() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    namespace Shop.Orders;

                    public sealed class OrderService
                    {
                        public MartenStore.Store? Store { get; set; }
                    }
                    """),
                ("Stubs.cs", """
                    namespace MartenStore
                    {
                        public sealed class Store
                        {
                        }
                    }
                    """),
            ]);

    [Fact(DisplayName = "LS1001 reports a parameter and a member access on an outer-layer type")]
    public Task ReportsAParameterAndAMemberAccess() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    namespace Shop.Orders;

                    public sealed class OrderService
                    {
                        public void Save(Marten.{|LS1001:IDocumentSession|} session)
                        {
                            session.{|LS1001:Store|}(new object());
                        }
                    }
                    """),
                ("Stubs.cs", """
                    namespace Marten
                    {
                        public interface IDocumentSession
                        {
                            void Store(object entity);
                        }
                    }
                    """),
            ]);

    [Fact(DisplayName = "LS1001 reports object creation and typeof of an outer-layer type")]
    public Task ReportsObjectCreationAndTypeof() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    namespace Shop.Orders;

                    public sealed class OrderService
                    {
                        public string Describe()
                        {
                            var factory = new Microsoft.Extensions.Logging.{|LS1001:LoggerFactory|}();
                            return factory.ToString() + typeof(Microsoft.Extensions.Logging.{|LS1001:LoggerFactory|}).FullName;
                        }
                    }
                    """),
                ("Stubs.cs", """
                    namespace Microsoft.Extensions.Logging
                    {
                        public sealed class LoggerFactory
                        {
                        }
                    }
                    """),
            ]);

    [Fact(DisplayName = "LS1001 reports a using static and an unqualified member call")]
    public Task ReportsAUsingStaticAndAnUnqualifiedCall() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>("""
            using static {|LS1001:System.Text.Json.JsonSerializer|};

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public string Describe(object value)
                {
                    return {|LS1001:Serialize|}(value);
                }
            }
            """);

    [Fact(DisplayName = "LS1001 ignores outer-layer types outside Domain")]
    public Task IgnoresOuterLayerTypesOutsideDomain() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    using Microsoft.Extensions.Logging;

                    namespace Shop.Orders;

                    public sealed class OrderService
                    {
                        public void Record(ILogger logger)
                        {
                        }
                    }
                    """),
                ("Stubs.cs", """
                    namespace Microsoft.Extensions.Logging
                    {
                        public interface ILogger
                        {
                        }
                    }
                    """),
            ], assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1001 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<DomainOuterLayerAnalyzer>(
            [
                ("Source.cs", """
                    using {|LS1001:Microsoft.Extensions.Logging|};

                    namespace Shop.Core;

                    public sealed class Order
                    {
                        public {|LS1001:ILogger|}? Logger { get; set; }
                    }
                    """),
                ("Stubs.cs", """
                    namespace Microsoft.Extensions.Logging
                    {
                        public interface ILogger
                        {
                        }
                    }
                    """),
            ], assemblyName: "Shop.Core", layer: "Domain");
}
