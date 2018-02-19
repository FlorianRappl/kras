# Generate Certificate

The certificate that comes with kras is naturally a self-signed certificate. While you may appreciate being able to use HTTPS out-of-the-box you potentially do not want to trust the certificate we provide. One of the many reasons being this certificate is spread, i.e., anyone could run it on his server, which would naturally compromise any security on your system if you elevate the kras certificate to a trusted certificate.

## Using OpenSSL

The following script uses OpenSSL to create a certificate with a private key using RSA.

```bash
openssl genrsa -des3 -out server.enc.key 1024
openssl req -new -key server.enc.key -out server.csr
openssl rsa -in server.enc.key -out server.key
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

Finally, we may remove the temporary files. Only the key and certificate will be kept.

```bash
rm server.enc.key server.csr
```

## Integration

These two files may be specified in the *.krasrc* file - either globally (in the home directory) or in the project's directory. Alternatively, the associated command line arguments (namely `--key` and `--cert`) can be used.
