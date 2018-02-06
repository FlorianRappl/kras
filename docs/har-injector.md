# HAR Injector

The HAR injector works against standard HAR files. Be sure to validate the file beforehand, as there is, e.g., a bug in Chrome that sometimes produces broken HAR files. Also make sure that the recorded network activity contains the full input and output, otherwise the responses may be incomplete from the HAR injector.

The format of an HAR file is specified [at the W3C](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html). Every evergreen browser allows saving the recorded network activity into an HAR file. This makes the format ideal as source for mocking requests.

The injector specific options are defined to be:

```ts
interface HarInjectorConfiguration {
  active?: boolean;
  directory?: string;
  delay?: boolean;
}
```

The `delay` option can artifically delay the response to requests. This is particularly useful to simulate something with exactly the same timing as the HAR file proposed.
