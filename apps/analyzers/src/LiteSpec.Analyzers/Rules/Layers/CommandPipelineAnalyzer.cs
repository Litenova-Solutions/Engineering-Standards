using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Operations;

namespace LiteSpec.Analyzers.Rules.Layers;

/// <summary>LS2004: a command handler writes only through repositories.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class CommandPipelineAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS2004);

    private protected override bool AppliesTo(Layer layer) =>
        layer == Layer.Application || layer == Layer.Infrastructure;

    private protected override void Register(CompilationStartAnalysisContext context)
    {
        context.RegisterSymbolAction(AnalyzeField, SymbolKind.Field);
        context.RegisterSymbolAction(AnalyzeProperty, SymbolKind.Property);
        context.RegisterSymbolAction(AnalyzeParameter, SymbolKind.Parameter);
        context.RegisterOperationAction(AnalyzeInvocation, OperationKind.Invocation);
        context.RegisterOperationAction(AnalyzeDeclarator, OperationKind.VariableDeclarator);
    }

    private static void AnalyzeField(SymbolAnalysisContext context)
    {
        var field = (IFieldSymbol)context.Symbol;
        if (field.IsImplicitlyDeclared || !IsCommandHandler(field.ContainingType))
        {
            return;
        }

        var type = Unwrap(field.Type);
        if (!IsSessionOrContext(type))
        {
            return;
        }

        foreach (var declaration in field.DeclaringSyntaxReferences)
        {
            if (declaration.GetSyntax() is VariableDeclaratorSyntax declarator
                && declarator.Parent is VariableDeclarationSyntax list
                && IsFirst(list, declarator))
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    Descriptors.LS2004, list.Type.GetLocation(), field.ContainingType.Name, type.Name));
                return;
            }
        }
    }

    private static void AnalyzeProperty(SymbolAnalysisContext context)
    {
        var property = (IPropertySymbol)context.Symbol;
        if (property.IsImplicitlyDeclared || !IsCommandHandler(property.ContainingType))
        {
            return;
        }

        var type = Unwrap(property.Type);
        if (!IsSessionOrContext(type))
        {
            return;
        }

        foreach (var declaration in property.DeclaringSyntaxReferences)
        {
            if (declaration.GetSyntax() is BasePropertyDeclarationSyntax syntax)
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    Descriptors.LS2004, syntax.Type.GetLocation(), property.ContainingType.Name, type.Name));
                return;
            }
        }
    }

    private static void AnalyzeParameter(SymbolAnalysisContext context)
    {
        var parameter = (IParameterSymbol)context.Symbol;
        if (parameter.IsImplicitlyDeclared)
        {
            return;
        }

        if (!(parameter.ContainingSymbol is IMethodSymbol method) || method.MethodKind != MethodKind.Constructor)
        {
            return;
        }

        if (!IsCommandHandler(method.ContainingType))
        {
            return;
        }

        var type = Unwrap(parameter.Type);
        if (!IsSessionOrContext(type))
        {
            return;
        }

        foreach (var declaration in parameter.DeclaringSyntaxReferences)
        {
            if (declaration.GetSyntax() is ParameterSyntax syntax && syntax.Type != null)
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    Descriptors.LS2004, syntax.Type.GetLocation(), method.ContainingType.Name, type.Name));
                return;
            }
        }
    }

    private static void AnalyzeInvocation(OperationAnalysisContext context)
    {
        var invocation = (IInvocationOperation)context.Operation;
        var handler = InnermostType(context.ContainingSymbol);
        if (handler == null || !IsCommandHandler(handler))
        {
            return;
        }

        var receiver = invocation.Instance;
        if (receiver?.Type != null)
        {
            var type = Unwrap(receiver.Type);
            if (IsSessionOrContext(type))
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    Descriptors.LS2004, MemberLocation(invocation), handler.Name, type.Name));
            }
        }
    }

    private static void AnalyzeDeclarator(OperationAnalysisContext context)
    {
        var declarator = (IVariableDeclaratorOperation)context.Operation;
        var handler = InnermostType(context.ContainingSymbol);
        if (handler == null || !IsCommandHandler(handler))
        {
            return;
        }

        var type = Unwrap(declarator.Symbol.Type);
        if (!IsSessionOrContext(type))
        {
            return;
        }

        if (declarator.Syntax is VariableDeclaratorSyntax node
            && node.Parent is VariableDeclarationSyntax list
            && IsFirst(list, node))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                Descriptors.LS2004, list.Type.GetLocation(), handler.Name, type.Name));
        }
    }

    private static bool IsCommandHandler(INamedTypeSymbol type)
    {
        if (type.TypeKind != TypeKind.Class)
        {
            return false;
        }

        if (type.Name.EndsWith("CommandHandler", StringComparison.Ordinal))
        {
            return true;
        }

        foreach (var contract in type.AllInterfaces)
        {
            if (contract.Name == "ICommandHandler")
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsSessionOrContext(ITypeSymbol type)
    {
        if (type.Name == "IDocumentSession" || type.Name == "DbContext")
        {
            return true;
        }

        for (var current = type.BaseType; current != null; current = current.BaseType)
        {
            if (current.Name == "DbContext")
            {
                return true;
            }
        }

        return false;
    }

    private static ITypeSymbol Unwrap(ITypeSymbol type)
    {
        if (type is INamedTypeSymbol named
            && named.OriginalDefinition.SpecialType == SpecialType.System_Nullable_T
            && named.TypeArguments.Length == 1)
        {
            return named.TypeArguments[0];
        }

        return type;
    }

    private static INamedTypeSymbol? InnermostType(ISymbol symbol)
    {
        for (var current = symbol; current != null; current = current.ContainingSymbol)
        {
            if (current is INamedTypeSymbol type)
            {
                return type;
            }
        }

        return null;
    }

    private static Location MemberLocation(IInvocationOperation invocation)
    {
        if (invocation.Syntax is InvocationExpressionSyntax syntax)
        {
            if (syntax.Expression is MemberAccessExpressionSyntax access)
            {
                return access.Name.GetLocation();
            }

            if (syntax.Expression is MemberBindingExpressionSyntax binding)
            {
                return binding.Name.GetLocation();
            }

            return syntax.Expression.GetLocation();
        }

        return invocation.Syntax.GetLocation();
    }

    private static bool IsFirst(VariableDeclarationSyntax list, VariableDeclaratorSyntax declarator) =>
        list.Variables.Count == 0 || list.Variables[0].SpanStart == declarator.SpanStart;
}
