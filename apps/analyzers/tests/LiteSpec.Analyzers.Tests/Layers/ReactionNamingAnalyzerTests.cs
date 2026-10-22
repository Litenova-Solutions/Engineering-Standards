using LiteSpec.Analyzers.Rules.Layers;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Layers;

/// <summary>Tests for LS2007, reaction and job names.</summary>
public sealed class ReactionNamingAnalyzerTests
{
    [Fact(DisplayName = "LS2007 reports a reaction without a reaction name")]
    public Task ReportsAReactionWithoutAReactionName() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface IEventHandler<TEvent> { }

            public sealed record OrderPlacedEvent(int OrderId);

            internal sealed class {|LS2007:SubscriberNotifier|} : IEventHandler<OrderPlacedEvent>
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2007 accepts the On fact handler shape")]
    public Task AcceptsTheOnFactHandlerShape() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface IEventHandler<TEvent> { }

            public sealed record OrderPlacedEvent(int OrderId);

            internal sealed class NotifySubscribersOnOrderPlacedHandler : IEventHandler<OrderPlacedEvent>
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2007 accepts a Reaction suffix")]
    public Task AcceptsAReactionSuffix() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface IDomainEventReaction { }

            internal sealed class OrderPlacedReaction : IDomainEventReaction
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2007 reports a job without a job name")]
    public Task ReportsAJobWithoutAJobName() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            public abstract class BackgroundService { }

            internal sealed class {|LS2007:ReminderLoop|} : BackgroundService
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2007 reports a hosted service without a job name")]
    public Task ReportsAHostedServiceWithoutAJobName() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface IHostedService { }

            internal sealed class {|LS2007:ReminderLoop|} : IHostedService
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2007 accepts Job, Worker, and Recurring names")]
    public Task AcceptsJobWorkerAndRecurringNames() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            public abstract class BackgroundService { }

            public interface IHostedService { }

            internal sealed class ReminderJob : BackgroundService
            {
            }

            internal sealed class ReminderWorker : BackgroundService
            {
            }

            internal sealed class RecurringReminderSender : IHostedService
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2007 ignores a class that is neither reaction nor job")]
    public Task IgnoresAnOrdinaryClass() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            internal sealed class ReminderLoop
            {
            }
            """, assemblyName: "Shop.Application");

    [Fact(DisplayName = "LS2007 ignores a reaction outside Application and Infrastructure")]
    public Task IgnoresReactionOutsideItsLayers() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Orders;

            public interface IEventHandler<TEvent> { }

            public sealed record OrderPlacedEvent(int OrderId);

            public sealed class SubscriberNotifier : IEventHandler<OrderPlacedEvent>
            {
            }
            """, assemblyName: "Shop.Domain");

    [Fact(DisplayName = "LS2007 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<ReactionNamingAnalyzer>("""
            namespace Shop.Core;

            public interface IEventHandler<TEvent> { }

            public sealed record OrderPlacedEvent(int OrderId);

            internal sealed class {|LS2007:SubscriberNotifier|} : IEventHandler<OrderPlacedEvent>
            {
            }
            """, assemblyName: "Shop.Core", layer: "Application");
}
