# Site Hits Counter Setup

This site has a small retro page-view counter wired into blog posts, the Pro Blog list, and the Trip Tracker page. The visible site code is already committed, but the counter needs the Cloudflare Worker and D1 database to be deployed with the `page_views` table.

## Create the Cloudflare API token

In Cloudflare, create an API token named:

```text
mtntheman-site-hits
```

Use the narrowest permissions that allow this Worker and D1 database to be updated:

```text
Workers Scripts: Edit
D1: Edit
```

Scope it to the account that owns:

```text
mtntheman-trip-tracker
```

Do not commit the token. Do not paste it into source files.

## Deploy the counter

From the repository root, run:

```powershell
.\worker\scripts\deploy-site-hit-counter.ps1
```

The script will prompt for `CLOUDFLARE_API_TOKEN`, keep it only in that PowerShell process, apply remote D1 migrations, deploy the Worker, and test the counter endpoint.

If you already set the token in the terminal, run:

```powershell
$env:CLOUDFLARE_API_TOKEN = "paste-token-here"
.\worker\scripts\deploy-site-hit-counter.ps1 -UseExistingToken
```

## Useful options

Skip the database migration:

```powershell
.\worker\scripts\deploy-site-hit-counter.ps1 -SkipMigration
```

Skip the Worker deploy:

```powershell
.\worker\scripts\deploy-site-hit-counter.ps1 -SkipDeploy
```

Only test the endpoint after everything is deployed:

```powershell
.\worker\scripts\deploy-site-hit-counter.ps1 -SkipMigration -SkipDeploy
```

## What the counter records

The counter stores only:

```text
path
title
view count
created/updated timestamps
```

It does not store IP addresses, user agents, cookies, or visitor identity.
