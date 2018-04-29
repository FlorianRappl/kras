# Authentication

kras is mainly developer for a single developer use case, i.e., one person locally running the mock server. Nevertheless, the potential use cases and applications go far beyond that and may require that access to the management API / client is still available, however, restricted to certain persons.

The configuration of kras allows protecting the full API. The client is then still accessible, but will show a login initially.

The following snippet shows the simplest configuration. In the example we would allow only a single user access with `foo` being the corresponding user name.

```json
{
  "auth": {
    "provider": "simple",
    "accounts": [{
      "username": "foo",
      "password": "bar"
    }]
  }
}
```

By default, kras comes with a single identity provider only. The provider is called `simple` and has only one configuration option; `accounts`, which define the accounts to be allowed access. Usernames and passwords are directly stored in the configuration.

Since the `simple` provider may be far too simple (and insecure) you may want to roll your own provider. This could be done via a middleware that provides the provider.
