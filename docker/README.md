# Desktop Avatar as Docker

## Quickstart

To run use:

```sh
$> docker run -it --rm \
    -e "SALESBOX_USERNAME=$uname" \
    -e "SALESBOX_PASSWORD=$passw" \
    -e "INDOCKER=1" \
    salesboxai/desktop-avatar:latest
```

You must set up a SalesBox Avatar with Desktop enabled for this to work.

## Configuration

We can set configuration settings in `settings.json` OR by passing
environment variables:

```sh
$> docker run -it --rm \
    -e "SALESBOX_USERNAME=$uname" \
    -e "SALESBOX_PASSWORD=$passw" \
    -e "SERVER_URL=$server-url" \
    -e "TIMEOUT=$default-timeout" \
    -e "MAXBROWERS=$maximum-browsers-open" \
    -e "USERIPS=$comma-separated-userips" \
    -e "USERLIST=$user-list"\
    -e "INDOCKER=1" \
    salesboxai/desktop-avatar:latest
```

## Persisting data and settings

To persist the settings and data locally share your volume

```sh
$> docker run -it --rm \
    -v $(pwd)/desktop-avatar-docker-db:/root/desktop-avatar \
    -e "SALESBOX_USERNAME=$uname" \
    -e "SALESBOX_PASSWORD=$passw" \
    -e "INDOCKER=1" \
    salesboxai/desktop-avatar:latest
```
