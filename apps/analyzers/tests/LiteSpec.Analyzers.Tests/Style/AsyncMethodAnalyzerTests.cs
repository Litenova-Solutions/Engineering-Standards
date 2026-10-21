using LiteSpec.Analyzers.Rules.Style;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Style;

/// <summary>Tests for LS3001 and LS3002, asynchronous method names and the token last.</summary>
public sealed class AsyncMethodAnalyzerTests
{
    [Fact(DisplayName = "LS3001 reports Task and ValueTask methods without Async")]
    public Task ReportsTaskMethodsWithoutAsync() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Worker
            {
                public Task {|LS3001:Place|}() => Task.CompletedTask;

                public ValueTask<int> {|LS3001:Count|}() => new ValueTask<int>(0);
            }
            """);

    [Fact(DisplayName = "LS3001 reports the same breach in WebApi")]
    public Task ReportsTheSameBreachInWebApi() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading.Tasks;

            namespace Shop.Api;

            public sealed class Worker
            {
                public Task {|LS3001:Place|}() => Task.CompletedTask;
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS3001 and LS3002 accept a complete asynchronous signature")]
    public Task AcceptsACompleteSignature() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Worker
            {
                public Task PlaceAsync(CancellationToken cancellationToken) => Task.CompletedTask;

                public int Count() => 0;
            }
            """);

    [Fact(DisplayName = "LS3001 ignores an override and reports its base")]
    public Task IgnoresAnOverrideAndReportsItsBase() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public class Recorder
            {
                public virtual Task {|LS3001:Save|}() => Task.CompletedTask;
            }

            public sealed class OrderRecorder : Recorder
            {
                public override Task Save() => Task.CompletedTask;
            }
            """);

    [Fact(DisplayName = "LS3001 ignores the Main entry point")]
    public Task IgnoresTheMainEntryPoint() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Program
            {
                public static Task Main() => Task.CompletedTask;
            }
            """);

    [Fact(DisplayName = "LS3001 reports a local function but not a lambda")]
    public Task ReportsALocalFunctionButNotALambda() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Worker
            {
                public async Task RunAsync()
                {
                    async Task {|LS3001:Place|}()
                    {
                        await Task.Delay(1);
                    }

                    Func<Task> work = async () =>
                    {
                        await Task.Delay(1);
                    };

                    await Place();
                    await work();
                }
            }
            """);

    [Fact(DisplayName = "LS3001 ignores a framework contract implementation")]
    public Task IgnoresAFrameworkContractImplementation() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Worker : IAsyncDisposable
            {
                public ValueTask DisposeAsync() => ValueTask.CompletedTask;
            }
            """);

    [Fact(DisplayName = "LS3001 reports a controller action")]
    public Task ReportsAControllerAction() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading.Tasks;
            using Microsoft.AspNetCore.Mvc;

            namespace Microsoft.AspNetCore.Mvc
            {
                public class Controller { }
            }

            namespace Shop.Api
            {
                public sealed class OrdersController : Controller
                {
                    public Task {|LS3001:Index|}() => Task.CompletedTask;
                }
            }
            """);

    [Fact(DisplayName = "LS3002 reports a misnamed token and a token in the middle")]
    public Task ReportsAMisnamedTokenAndATokenInTheMiddle() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Worker
            {
                public Task SaveAsync(CancellationToken {|LS3002:ct|}) => Task.CompletedTask;

                public Task LoadAsync(CancellationToken {|LS3002:cancellationToken|}, string name) => Task.CompletedTask;
            }
            """);

    [Fact(DisplayName = "LS3002 accepts the token last with a trailing params array")]
    public Task AcceptsTheTokenLastWithATrailingParamsArray() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading;
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Worker
            {
                public Task SaveAsync(CancellationToken cancellationToken, params string[] names) => Task.CompletedTask;

                public void Ping(CancellationToken cancellationToken) { }
            }
            """);

    [Fact(DisplayName = "LS3002 ignores an override and reports its base")]
    public Task IgnoresATokenOverrideAndReportsItsBase() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading;

            namespace Shop.Orders;

            public class Recorder
            {
                public virtual void Save(CancellationToken {|LS3002:cancellationToken|}, string name) { }
            }

            public sealed class OrderRecorder : Recorder
            {
                public override void Save(CancellationToken cancellationToken, string name) { }
            }
            """);

    [Fact(DisplayName = "LS3001 ignores a breach outside the five projects")]
    public Task IgnoresABreachOutsideTheFiveProjects() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading.Tasks;

            namespace Shop.Orders;

            public sealed class Worker
            {
                public Task Place() => Task.CompletedTask;
            }
            """, assemblyName: "Shop.Unknown");

    [Fact(DisplayName = "LS3001 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<AsyncMethodAnalyzer>("""
            using System.Threading.Tasks;

            namespace Shop.Core;

            public sealed class Worker
            {
                public Task {|LS3001:Place|}() => Task.CompletedTask;
            }
            """, assemblyName: "Shop.Core", layer: "Domain");
}
