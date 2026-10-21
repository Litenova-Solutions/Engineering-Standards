using LiteSpec.Analyzers.Rules.Layers;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Layers;

/// <summary>Tests for LS2003, no MVC controllers in WebApi.</summary>
public sealed class ControllerAnalyzerTests
{
    [Fact(DisplayName = "LS2003 reports a class deriving from ControllerBase")]
    public Task ReportsAControllerBaseSubclass() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                public abstract class ControllerBase { }
            }

            namespace Shop.Api
            {
                public sealed class {|LS2003:OrdersController|} : ControllerBase { }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS2003 reports an indirect subclass and its abstract base")]
    public Task ReportsAnIndirectSubclassAndItsBase() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                public abstract class ControllerBase { }
            }

            namespace Shop.Api
            {
                public abstract class {|LS2003:ShopControllerBase|} : ControllerBase { }

                public sealed class {|LS2003:OrdersController|} : ShopControllerBase { }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS2003 reports a class deriving from Controller")]
    public Task ReportsAControllerSubclass() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                public abstract class ControllerBase { }

                public class {|LS2003:Controller|} : ControllerBase { }
            }

            namespace Shop.Api
            {
                public sealed class {|LS2003:LegacyOrders|} : Controller { }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS2003 reports ApiController alone")]
    public Task ReportsApiControllerAlone() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            using System;
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                [AttributeUsage(AttributeTargets.Class)]
                public sealed class ApiControllerAttribute : Attribute { }
            }

            namespace Shop.Api
            {
                [ApiController]
                public sealed class {|LS2003:OrdersApi|} { }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS2003 reports a controller with ApiController once")]
    public Task ReportsABaseAndAttributeBreachOnce() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            using System;
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                public abstract class ControllerBase { }

                [AttributeUsage(AttributeTargets.Class)]
                public sealed class ApiControllerAttribute : Attribute { }
            }

            namespace Shop.Api
            {
                [ApiController]
                public sealed class {|LS2003:OrdersController|} : ControllerBase { }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS2003 accepts a minimal API endpoint class")]
    public Task AcceptsAMinimalApiEndpoint() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            namespace Shop.Api;

            public interface IEndpoint
            {
                void Map();
            }

            internal sealed class GetOrderEndpoint : IEndpoint
            {
                public void Map() { }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS2003 ignores a controller in Application")]
    public Task IgnoresAControllerInApplication() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                public abstract class ControllerBase { }
            }

            namespace Shop.Api
            {
                public sealed class OrdersController : ControllerBase { }
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2003 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<ControllerAnalyzer>("""
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                public abstract class ControllerBase { }
            }

            namespace Shop.Core
            {
                public sealed class {|LS2003:OrdersController|} : ControllerBase { }
            }
            """, assemblyName: "Shop.Core", layer: "WebApi");
}
