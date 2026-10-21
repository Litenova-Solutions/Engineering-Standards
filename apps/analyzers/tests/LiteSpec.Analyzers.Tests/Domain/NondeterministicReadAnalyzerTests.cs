using LiteSpec.Analyzers.Rules.Domain;
using LiteSpec.Analyzers.Tests.Support;

namespace LiteSpec.Analyzers.Tests.Domain;

/// <summary>Tests for LS1009, nondeterministic reads in Domain.</summary>
public sealed class NondeterministicReadAnalyzerTests
{
    [Fact(DisplayName = "LS1009 reports a clock read in a method body")]
    public Task ReportsAClockReadInAMethodBody() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public DateTime Stamp()
                {
                    return DateTime.{|LS1009:UtcNow|};
                }
            }
            """);

    [Fact(DisplayName = "LS1009 reports Guid.NewGuid and Random construction")]
    public Task ReportsNewGuidAndRandomConstruction() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public Guid NextId()
                {
                    return Guid.{|LS1009:NewGuid|}();
                }

                public int Roll()
                {
                    return new {|LS1009:Random|}().Next();
                }
            }
            """);

    [Fact(DisplayName = "LS1009 reports reads in initializers, expression bodies and lambdas")]
    public Task ReportsReadsInInitializersExpressionBodiesAndLambdas() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;
            using System.Diagnostics;

            namespace Shop.Orders;

            public sealed class OrderPolicy
            {
                private static readonly long Started = Environment.{|LS1009:TickCount64|};

                public DateTime CreatedAt { get; } = DateTime.{|LS1009:UtcNow|};

                public long Elapsed() => Stopwatch.{|LS1009:GetTimestamp|}();

                public Func<DateTime> Clock() => () => DateTime.{|LS1009:Now|};
            }
            """);

    [Fact(DisplayName = "LS1009 reports TimeProvider.System, Random.Shared and RandomNumberGenerator")]
    public Task ReportsSystemSharedAndRandomNumberGenerator() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;
            using System.Security.Cryptography;

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public TimeProvider Clock() => TimeProvider.{|LS1009:System|};

                public DateTime Stamp(TimeProvider clock)
                {
                    return clock.GetUtcNow().DateTime;
                }

                public int Roll()
                {
                    return Random.{|LS1009:Shared|}.Next();
                }

                public byte[] Nonce()
                {
                    var bytes = new byte[16];
                    RandomNumberGenerator.{|LS1009:Fill|}(bytes);
                    return bytes;
                }
            }
            """);

    [Fact(DisplayName = "LS1009 accepts injected values and deterministic members")]
    public Task AcceptsInjectedValuesAndDeterministicMembers() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public DateTime Stamp(DateTime utcNow)
                {
                    return utcNow;
                }

                public Guid Combine(Guid left)
                {
                    return left == Guid.Empty ? Guid.Parse("00000000-0000-0000-0000-000000000001") : left;
                }

                public DateTime Floor()
                {
                    return DateTime.MinValue;
                }
            }
            """);

    [Fact(DisplayName = "LS1009 ignores nameof")]
    public Task IgnoresNameof() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public string Name()
                {
                    return nameof(DateTime.UtcNow);
                }
            }
            """);

    [Fact(DisplayName = "LS1009 ignores nondeterministic reads outside Domain")]
    public Task IgnoresNondeterministicReadsOutsideDomain() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public DateTime Stamp()
                {
                    return DateTime.UtcNow;
                }
            }
            """, assemblyName: "Shop.WebApi");

    [Fact(DisplayName = "LS1009 follows the LiteSpecLayer property over the assembly name")]
    public Task FollowsTheDeclaredLayer() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;

            namespace Shop.Core;

            public sealed class OrderService
            {
                public Guid NextId()
                {
                    return Guid.{|LS1009:NewGuid|}();
                }
            }
            """, assemblyName: "Shop.Core", layer: "Domain");

    [Fact(DisplayName = "LS1009 reports the remaining clock and randomness members")]
    public Task ReportsTheRemainingClockAndRandomnessMembers() =>
        Verify.AnalyzerAsync<NondeterministicReadAnalyzer>("""
            using System;
            using System.Diagnostics;

            namespace Shop.Orders;

            public sealed class OrderService
            {
                public DateTimeOffset Stamp()
                {
                    return DateTimeOffset.{|LS1009:UtcNow|};
                }

                public DateTimeOffset LocalStamp()
                {
                    return DateTimeOffset.{|LS1009:Now|};
                }

                public DateTime Day()
                {
                    return DateTime.{|LS1009:Today|};
                }

                public Stopwatch Watch()
                {
                    return Stopwatch.{|LS1009:StartNew|}();
                }

                public int Ticks()
                {
                    return Environment.{|LS1009:TickCount|};
                }
            }
            """);
}
