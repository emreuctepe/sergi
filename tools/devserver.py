"""Prototip için minik statik sunucu.

`python3 -m http.server` ile aynı iş, iki farkla:

  1. Hiçbir şeyi önbelleğe aldırmaz.
  2. index.html'i sunarken yerel css/js bağlantılarına dosyanın değişiklik
     damgasını ekler (`css/tokens.css?v=1786...`). Bazı tarayıcılar
     `Cache-Control: no-store` başlığını da yok sayıyor; adres değişince
     yok sayacak bir şey kalmıyor.

Bu yalnızca geliştirme kolaylığı. `prototype/index.html` dosyanın kendisi
dokunulmadan kalır — çift tıklayıp `file://` üzerinden açmak hâlâ çalışır.

    python3 tools/devserver.py [port] [dizin]
"""

import functools
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO

ASSET = re.compile(rb'(?:href|src)="((?:css|js)/[^"?]+)"')


class DevHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if not path.endswith("index.html") or not os.path.isfile(path):
            return super().send_head()

        with open(path, "rb") as f:
            body = ASSET.sub(self._stamp, f.read())

        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        return BytesIO(body)

    def _stamp(self, match):
        whole, asset = match.group(0), match.group(1).decode()
        target = os.path.join(self.directory, asset)
        if not os.path.isfile(target):
            return whole
        stamp = str(int(os.path.getmtime(target))).encode()
        return whole[:-1] + b"?v=" + stamp + b'"'


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    directory = sys.argv[2] if len(sys.argv) > 2 else "prototype"
    handler = functools.partial(DevHandler, directory=directory)
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print("prototip → http://localhost:%d  (%s)" % (port, directory), flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
