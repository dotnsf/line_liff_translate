# line_liff_translate

## Overview

Sample Application for LIFF(LIne Front-end Framework), which can send translated text message with your LINE account.


## Pre-requisite

- LINE account

- LINE Developer account

    - https://developers.line.biz/ja/

- LINE Channel ( as Messaging API )

    - Application size need to be **tall** or **full**.

    - LIFF URL

- Public application server for Node.js

    - I would describe followings as you use IBM Cloud for this environment.


## Pre-requisite for IBM Cloud user

- Node.js runtime


## Install

- Download source from github.com

    - https://github.com/dotnsf/line_liff_translate.git

- Create IBM Watson Language Translator instance in IBM Cloud dashboard, and check you apikey.

- Edit settings.js with your apikey and endpoint URL.

- Deploy application into IBM Cloud

- Set endpoint URL in you LIFF application setting, and get LIFF URL(line://app/XXXXXX..)

- Paste LIFF URL as your LINE message, and click that URL.



## Links

- LIFF

    - https://developers.line.me/ja/docs/liff/overview/

- LIFF API References

    - https://developers.line.biz/ja/reference/liff/


## Copyright

2019 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
