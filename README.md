# dns-web-blocklist

create dnsmasq friendly records to block websites that track or serve malware. source of blocklist data is scrapped from <https://firebog.net/>

## Setup

```code
npm install
```

## Generate hostnames.txt

```code
node index.js > hostnames.txt
```

## Todo

currently the code serves my purpose but the following features would be what I would add next when I revisit this repository. Feel free to MR.

- generate domains.txt. some of the records generated to hostnames should be domain wide blocks
- give user a choice of generating an lmhosts file instead of dnsmasq
- generate ipv6 records optionally
