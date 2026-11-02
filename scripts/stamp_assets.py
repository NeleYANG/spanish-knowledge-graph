# -*- coding: utf-8 -*-
"""按文件内容哈希给 index.html 里的 ?v= 打版本号，避免浏览器读旧缓存。"""

import hashlib
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "index.html")


def digest(path):
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()[:8]


def main():
    html = io.open(HTML, encoding="utf-8").read()
    changed = []

    def repl(match):
        attr, name = match.group(1), match.group(2)
        target = os.path.join(ROOT, name)
        if not os.path.exists(target):
            return match.group(0)
        new = digest(target)
        changed.append((name, new))
        return '{}{}?v={}"'.format(attr, name, new)

    html = re.sub(r'(src="|href=")([\w.\-]+\.(?:js|css))\?v=[\w\d]+"', repl, html)
    io.open(HTML, "w", encoding="utf-8").write(html)
    for name, h in changed:
        print("  {} -> {}".format(name, h))


if __name__ == "__main__":
    main()
