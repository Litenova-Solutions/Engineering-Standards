using LiteSpec.Analyzers.Rules.Style;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Style;

/// <summary>Tests for LS3003, one primary top-level type per file.</summary>
public sealed class FileTypeNameAnalyzerTests
{
    [Fact(DisplayName = "LS3003 accepts a file named after its type")]
    public Task AcceptsAFileNamedAfterItsType() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("OrderId.cs", """
                using System;

                namespace Shop.Orders;

                public readonly record struct OrderId(Guid Value);
                """)]);

    [Fact(DisplayName = "LS3003 reports a type that differs from its file")]
    public Task ReportsATypeThatDiffersFromItsFile() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Order.cs", """
                namespace Shop.Orders;

                public sealed class {|LS3003:Customer|} { }
                """)]);

    [Fact(DisplayName = "LS3003 reports the second and later types")]
    public Task ReportsTheSecondAndLaterTypes() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Order.cs", """
                namespace Shop.Orders
                {
                    public sealed class Order { }

                    public sealed class {|LS3003:AuditEntry|} { }

                    public sealed class {|LS3003:OrderHelper|} { }
                }
                """)]);

    [Fact(DisplayName = "LS3003 accepts a partial class in a dotted file")]
    public Task AcceptsAPartialClassInADottedFile() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Order.Validation.cs", """
                namespace Shop.Orders;

                public sealed partial class Order
                {
                    public void Validate() { }
                }
                """)]);

    [Fact(DisplayName = "LS3003 ignores nested types")]
    public Task IgnoresNestedTypes() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Order.cs", """
                namespace Shop.Orders;

                public sealed class Order
                {
                    private sealed class Validator { }
                }
                """)]);

    [Fact(DisplayName = "LS3003 ignores a file with no types")]
    public Task IgnoresAFileWithNoTypes() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Usings.cs", """
                global using System;
                global using System.Threading.Tasks;
                """)]);

    [Fact(DisplayName = "LS3003 ignores generic arity in the type name")]
    public Task IgnoresGenericArityInTheTypeName() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Cache.cs", """
                namespace Shop.Orders;

                public sealed class Cache<T> { }
                """)]);

    [Fact(DisplayName = "LS3003 accepts one matching type per file")]
    public Task AcceptsOneMatchingTypePerFile() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [
                ("Order.cs", """
                    namespace Shop.Orders;

                    public sealed class Order { }
                    """),
                ("Customer.cs", """
                    namespace Shop.Orders;

                    public sealed class Customer { }
                    """),
            ]);

    [Fact(DisplayName = "LS3003 ignores a breach outside the five projects")]
    public Task IgnoresABreachOutsideTheFiveProjects() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Order.cs", """
                namespace Shop.Orders;

                public sealed class Customer { }
                """)], assemblyName: "Shop.Unknown");

    [Fact(DisplayName = "LS3003 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<FileTypeNameAnalyzer>(
            [("Order.cs", """
                namespace Shop.Core;

                public sealed class {|LS3003:Customer|} { }
                """)], assemblyName: "Shop.Core", layer: "WebApi");
}
