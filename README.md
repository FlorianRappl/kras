# KAS

Efficient server proxying and mocking in Node.js. :muscle:

## FAQ

*What does KAS mean?*

KAS is the abbreviation for "kein API server" (German), indicating that KAS is actually not an API server, but just serving (or proxying) content from an arbitrary server (which could be an API server, of course).

*Is KAS useful for unit and / or integration tests?*

I think so, even though real end-to-end tests should be performed against the real backend. Nevertheless, using KAS we can rely on fixed contracts for our backend. Additionally, it allows us to run these tests even when no Internet connection is available. For unit tests the big advantage is that the mocking part is not / has not to be configured within our own code base, but in an external one. This is a little bit more robust against refactorings.

## License

KAS is released using the MIT license. For more information see the [LICENSE file](LICENSE).
