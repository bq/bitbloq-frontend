#   bitbloq-frontend
This is the source code of the Bitbloq web frontend. 

Feel free to do pull request, ask any question on the [Bitbloq forum](http://bitbloq.bq.com/#/forum) and help us to make Bitbloq a better tool!


The website use node, grunt, bower, and angular 1.x.

To start you need to:

1 . Clone the repo

2 . Ensure to have Git installed and then execute this command to install all dependencies
```
npm install && bower install
```

3 . Then you need to add the enviroment files:

4 . Create a folder in app/res called config.

5 . Create a file in app/res/config called config.json with this content

```
{
    "env": "local",
    "defaultLang": "es-ES",
    "supportedLanguages": [
        "es-ES",
        "en-GB",
        "nl-NL",
        "ru-RU",
        "it-IT",
        "eu-ES",
        "ca-ES",
        "fr-FR",
        "de-DE",
        "pt-PT",
        "gl",
        "zh-CN"
    ],
    "saveTime": 2000,
    "serverUrl": "http://localhost:8000/bitbloq/v1/",
    "gCloudUrl": "",
    "compilerUrl": "http://localhost:3000/",
    "bucket": "",
    "chromeAppId": "nlndpbeidnfnjpfkmlcakphlbilpokho",
    "web2boardLinkWindows": "https://github.com/bq/web2board/releases/download/Latest/windows_web2board_installer.exe",
    "web2boardLinkMac": "https://github.com/bq/web2board/releases/download/Latest/mac_web2board_installer.pkg",
    "web2boardLinkLinux": "https://github.com/bq/web2board/releases/download/Latest/linux_64_web2board_installer.zip",
    "web2boardLinkLinux32": "https://github.com/bq/web2board/releases/download/Latest/linux_32_web2board_installer.zip",
    "version": "v3.3.6"
}
```

6 . Create a file in app/res/config called facebook.json with the oauth info of Facebook, you need to fill the clientId field.

```
{
    "clientId": "yourID",
    "scope": [
        "public_profile",
        "email"
    ],
    "status": false,
    "xfbml": false,
    "display": "popup",
    "popupOptions": {
        "width": 500,
        "height": 500
    }
}
```

7 . Create a file in app/res/config called google.json with the oauth info of Facebook, you need to fill the clientId and apikey fields

```
{
    "clientId": "Your clientId",
    "apikey": "Your Api Key",
    "scope": [
        "https://www.googleapis.com/auth/plus.login",
        "https://www.googleapis.com/auth/plus.me",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/urlshortener",
        "https://www.googleapis.com/auth/drive.file"
    ],
    "apis": [{
        "name": "plus",
        "version": "v1"
    }],
    "visibleActions": "http://schemas.google.com/AddActivity",
    "responseType": "token",
    "display": "popup",
    "popupOptions": {
        "width": 580,
        "height": 400
    }
}
```

8 . Execute the command 

```
grunt serve
```
