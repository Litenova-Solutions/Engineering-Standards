# Runbook: Rotate a JWT Signing Secret

This runbook covers rotating the JWT signing secret without terminating active user sessions abruptly. It uses a brief dual-validation window to allow tokens signed with the old secret to expire naturally.

---

## When to Rotate

Rotate the JWT signing secret when:

- The secret has been leaked or is suspected to have been exposed.
- The secret is older than the organization's key rotation policy.
- A team member who had access to the secret has left.
- A security audit requires rotation.

If the secret is confirmed compromised, follow `docs/runbooks/handle-leaked-secret.md` instead of this runbook — immediate revocation takes priority over session continuity.

---

## Understanding the Risk

A JWT signing secret rotation immediately invalidates all existing tokens signed with the old secret. Users with active sessions will receive 401 responses and will need to log in again. This is an acceptable user impact for a scheduled rotation but a significant impact for a surprise rotation.

The dual-key window below reduces session disruption by accepting both the old and new secrets for a short overlap period (recommended: 15 to 60 minutes, depending on your token expiration time).

---

## Steps (Gradual Rotation With Dual-Key Window)

### 1. Generate a new secret

```bash
# Generate a cryptographically random secret (minimum 32 bytes)
openssl rand -base64 48
```

Store the new secret in the secret manager (Key Vault, AWS Secrets Manager, GitHub Secrets).

### 2. Configure dual-key validation (temporary)

Update the JWT bearer configuration to validate tokens with both the old and new secret:

```csharp
// Temporary: accept both secrets during the transition window
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuerSigningKey = true,
    IssuerSigningKeys = new[]
    {
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(newSecret)),
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(oldSecret))
    },
    ValidateIssuer = true,
    ValidIssuer = jwtSettings.Issuer,
    ValidateAudience = true,
    ValidAudience = jwtSettings.Audience,
    ValidateLifetime = true,
    ClockSkew = TimeSpan.FromSeconds(30)
};
```

Deploy this change to production. Tokens signed with either the old or new secret are now valid.

### 3. Update token issuance to use the new secret

Deploy the auth service (or the token minting path) to issue new tokens signed with the new secret. Existing tokens signed with the old secret continue to work.

### 4. Wait for old tokens to expire

Wait for the duration of the access token lifetime (configured in `JwtSettings.AccessTokenExpirationMinutes`, default 60 minutes) plus a small buffer.

### 5. Remove the old secret from validation

Remove the old secret from `IssuerSigningKeys`. Tokens signed with the old secret will now return 401.

```csharp
// Final: single key validation
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(newSecret)),
    // ... other parameters unchanged ...
};
```

Deploy this change to production.

### 6. Remove the old secret from storage

Delete the old secret from the secret manager. Confirm it is no longer referenced anywhere in the codebase or configuration.

---

## Steps (Immediate Revocation — Compromised Secret)

For a confirmed compromise, immediate revocation is required regardless of session disruption:

1. Generate a new secret (step 1 above).
2. Deploy the new secret as the single signing key — skip the dual-key window.
3. All active sessions are immediately invalidated.
4. Users must log in again.
5. Remove the old secret from storage.
6. Audit all recent API activity for unauthorized access using the compromised secret.
7. Follow `docs/runbooks/handle-leaked-secret.md` for the full incident response.

---

## Verification

After completing the rotation:

```bash
# Confirm old tokens return 401
OLD_TOKEN="<a token signed with the old secret>"
curl -f -H "Authorization: Bearer $OLD_TOKEN" https://api.yourdomain.com/health/ready
# Expected: 401

# Confirm new tokens work
NEW_TOKEN="<a freshly issued token>"
curl -f -H "Authorization: Bearer $NEW_TOKEN" https://api.yourdomain.com/health/ready
# Expected: 200
```
