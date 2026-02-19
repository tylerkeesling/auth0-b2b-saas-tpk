# Reference

## factors

<details><summary><code>client.factors.<a href="/src/api/resources/factors/client/Client.ts">list</a>() -> MyAccount.ListFactorsResponseContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List of factors enabled for the Auth0 tenant and available for enrollment by this user.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.factors.list();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Factors.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## AuthenticationMethods

<details><summary><code>client.authenticationMethods.<a href="/src/api/resources/authenticationMethods/client/Client.ts">list</a>() -> MyAccount.ListAuthenticationMethodsResponseContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve detailed list of authentication methods belonging to the authenticated user.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authenticationMethods.list();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `AuthenticationMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authenticationMethods.<a href="/src/api/resources/authenticationMethods/client/Client.ts">create</a>({ ...params }) -> MyAccount.CreateAuthenticationMethodResponseContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Start the enrollment of a supported authentication method.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authenticationMethods.create({
    type: "passkey",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `MyAccount.CreateAuthenticationMethodRequestContent`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthenticationMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authenticationMethods.<a href="/src/api/resources/authenticationMethods/client/Client.ts">get</a>(authenticationMethodId) -> MyAccount.GetAuthenticationMethodResponseContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a single authentication method belonging to the authenticated user.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authenticationMethods.get("authentication_method_id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**authenticationMethodId:** `MyAccount.PathAuthenticationMethodId` — Authentication Method ID. This value is part of the Location header returned when creating an authentication method. It should be used as it is, without any modifications.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthenticationMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authenticationMethods.<a href="/src/api/resources/authenticationMethods/client/Client.ts">delete</a>(authenticationMethodId) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a single authentication method belonging to the authenticated user.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authenticationMethods.delete("authentication_method_id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**authenticationMethodId:** `MyAccount.PathAuthenticationMethodId` — Authentication Method ID. This value is part of the Location header returned when creating an authentication method. It should be used as it is, without any modifications.

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthenticationMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authenticationMethods.<a href="/src/api/resources/authenticationMethods/client/Client.ts">update</a>(authenticationMethodId, { ...params }) -> MyAccount.UpdateAuthenticationMethodResponseContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a single authentication method

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authenticationMethods.update("authentication_method_id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**authenticationMethodId:** `MyAccount.PathAuthenticationMethodId` — Authentication Method ID. This value is part of the Location header returned when creating an authentication method. It should be used as it is, without any modifications.

</dd>
</dl>

<dl>
<dd>

**request:** `MyAccount.UpdateAuthenticationMethodRequestContent`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthenticationMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authenticationMethods.<a href="/src/api/resources/authenticationMethods/client/Client.ts">verify</a>(authenticationMethodId, { ...params }) -> MyAccount.VerifyAuthenticationMethodResponseContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Confirm the enrollment of a supported authentication method.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authenticationMethods.verify("authentication_method_id", {
    auth_session: "auth_session",
    authn_response: {
        id: "id",
        rawId: "rawId",
        response: {
            attestationObject: "attestationObject",
            clientDataJSON: "clientDataJSON",
        },
        type: "public-key",
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**authenticationMethodId:** `MyAccount.PathAuthenticationMethodId` — Authentication Method ID. This value is part of the Location header returned when creating an authentication method. It should be used as it is, without any modifications.

</dd>
</dl>

<dl>
<dd>

**request:** `MyAccount.VerifyAuthenticationMethodRequestContent`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthenticationMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

