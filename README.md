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

## Usage with Google App Script

```
function fetchAndByPassISA(url, auth) {
  return UrlFetchApp.fetch("https://isaserver-proxy.cleverapps.io/?url="+encodeURIComponent(url)+"&auth="+encodeURIComponent(auth));
}

function main(){
  var res = fetchAndByPassISA("https://protected.resource.com/projects/my-awesome-project/issues.json?subproject_id=345,347,348,351,352&status_id=*&limit=100&tracker_id=1&offset=0", "LOGIN:PASSWORD");
  Logger.log(res.getContentText());
}
```
