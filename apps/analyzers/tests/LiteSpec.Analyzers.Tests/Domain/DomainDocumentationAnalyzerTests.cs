using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1011, documentation of public Domain contracts.</summary>
public sealed class DomainDocumentationAnalyzerTests
{
    [Fact(DisplayName = "LS1011 accepts a documented type and member")]
    public Task AcceptsDocumentedTypeAndMember() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            /// <summary>An order placed by a customer.</summary>
            public sealed class Order
            {
                /// <summary>Gets the number of lines.</summary>
                public int LineCount { get; set; }
            }
            """);

    [Fact(DisplayName = "LS1011 reads /// comments in a build without a documentation file")]
    public Task ReadsCommentsWithoutADocumentationFile() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            /// <summary>An order placed by a customer.</summary>
            public sealed class Order
            {
                /// <inheritdoc />
                public override string ToString() => "order";

                /// <summary>Gets the number of lines.</summary>
                public int LineCount { get; init; }

                /// <summary></summary>
                public int {|LS1011:Total|} { get; init; }

                public int {|LS1011:Weight|} { get; init; }
            }
            """, documentationFile: false);

    [Fact(DisplayName = "LS1011 reports an undocumented type")]
    public Task ReportsUndocumentedType() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            public sealed class {|LS1011:Order|}
            {
            }
            """);

    [Fact(DisplayName = "LS1011 reports an undocumented member")]
    public Task ReportsUndocumentedMember() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            /// <summary>An order placed by a customer.</summary>
            public sealed class Order
            {
                public void {|LS1011:Cancel|}()
                {
                }
            }
            """);

    [Fact(DisplayName = "LS1011 reports an empty summary")]
    public Task ReportsEmptySummary() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            /// <summary>An order placed by a customer.</summary>
            public sealed class Order
            {
                /// <summary></summary>
                public void {|LS1011:Cancel|}()
                {
                }

                /// <summary>   </summary>
                public void {|LS1011:Refund|}()
                {
                }
            }
            """);

    [Fact(DisplayName = "LS1011 accepts inherited and block documentation")]
    public Task AcceptsInheritedAndBlockDocumentation() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            /// <summary>An order placed by a customer.</summary>
            public sealed class Order
            {
                /// <inheritdoc/>
                public string Label() => "order";

                /** <summary>Gets the tag.</summary> */
                public string Tag() => "tag";
            }
            """);

    [Fact(DisplayName = "LS1011 ignores an internal class")]
    public Task IgnoresInternalClass() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            internal sealed class Order
            {
                public void Cancel()
                {
                }
            }
            """);

    [Fact(DisplayName = "LS1011 ignores an override and an explicit implementation")]
    public Task IgnoresOverrideAndExplicitImplementation() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            using System;

            namespace Shop.Orders;

            /// <summary>An order placed by a customer.</summary>
            public sealed class Order : IDisposable
            {
                public override string ToString() => "order";

                void IDisposable.Dispose()
                {
                }
            }
            """);

    [Fact(DisplayName = "LS1011 reports an undocumented field, property, event and constructor")]
    public Task ReportsUndocumentedFieldPropertyEventAndConstructor() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            using System;

            namespace Shop.Orders;

            /// <summary>An order placed by a customer.</summary>
            public class Order
            {
                public const int {|LS1011:MaxLines|} = 10;

                public int {|LS1011:LineCount|} = 0;

                public decimal {|LS1011:Total|} { get; set; }

                public event EventHandler? {|LS1011:Changed|};

                protected void {|LS1011:Validate|}()
                {
                }

                public {|LS1011:Order|}()
                {
                }
            }
            """);

    [Fact(DisplayName = "LS1011 reports an undocumented record with a primary constructor")]
    public Task ReportsUndocumentedRecordWithPrimaryConstructor() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed record {|LS1011:Order|}(Guid Id);
            """);

    [Fact(DisplayName = "LS1011 reports an undocumented interface member")]
    public Task ReportsUndocumentedInterfaceMember() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            /// <summary>Loads orders.</summary>
            public interface IOrderRepository
            {
                void {|LS1011:Store|}(Order order);
            }

            /// <summary>An order placed by a customer.</summary>
            public sealed class Order
            {
            }
            """);

    [Fact(DisplayName = "LS1011 ignores undocumented contracts outside Domain")]
    public Task IgnoresUndocumentedContractsOutsideDomain() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Orders;

            public sealed class Order
            {
                public void Cancel()
                {
                }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1011 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<DomainDocumentationAnalyzer>("""
            namespace Shop.Core;

            public sealed class {|LS1011:Order|}
            {
            }
            """, assemblyName: "Shop.Core", layer: "Domain");
}
