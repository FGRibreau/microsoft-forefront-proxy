# Microsoft ISA-server proxy / Microsoft Forefront proxy

Quick and dirty proxy for Microsoft ISA-server / Microsoft Forefront.

## Install

```
npm install microsoft-forefront-proxy --global
```

## Usage

```
PORT=8080 microsoft-forefront-proxy &
curl http://localhost:8080/?url=https%3A//protected.ressource.com/activity.atom&auth=LOGIN:PASSWORD
```

Note: you should deploy microsoft-forefront-proxy over https.
