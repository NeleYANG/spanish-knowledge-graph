# -*- coding: utf-8 -*-
"""把 index.html 改造为西班牙语版本：圣家堂封面 + 西语文案 + 换数据源。"""

import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "index.html")


def tower(cx, base_y, top_y, wb, wt, tip=13):
    """一座尖塔：底部宽 wb，顶端收窄到 wt，顶点在 (cx, top_y)。"""
    shoulder = top_y + tip
    return (
        "M {x1:.1f} {by:.1f} "
        "L {x2:.1f} {sh:.1f} "
        "L {cx:.1f} {ty:.1f} "
        "L {x3:.1f} {sh:.1f} "
        "L {x4:.1f} {by:.1f} Z"
    ).format(x1=cx - wb, x2=cx - wt, x3=cx + wt, x4=cx + wb,
             cx=cx, by=base_y, sh=shoulder, ty=top_y)


def cross(cx, y, size=9, w=5.5):
    return (
        '<path d="M{cx} {y1} L{cx} {y2} M{cx1} {ym} L{cx2} {ym}" '
        'stroke="#F1BF00" stroke-opacity=".8" stroke-width="1.4" stroke-linecap="round"/>'
    ).format(cx=cx, y1=y - size, y2=y + 1, cx1=cx - w, cx2=cx + w, ym=y - size * 0.62)


def build_svg():
    base = 470.0
    # 左（诞生立面）4 塔、右（受难立面）4 塔，中间 1 座更高的十字塔
    left = [(168, 236, 30, 9), (208, 196, 30, 9), (248, 172, 30, 8.5), (288, 204, 30, 9)]
    right = [(352, 204, 30, 9), (392, 172, 30, 8.5), (432, 196, 30, 9), (472, 236, 30, 9)]

    parts = []
    # 远景中殿体块
    parts.append(
        '<path d="M120 470 L120 402 Q320 372 520 402 L520 470 Z" fill="url(#esStone)" opacity=".95"/>'
    )
    # 两翼低矮屋顶
    for x0, x1 in ((132, 300), (340, 508)):
        parts.append(
            '<path d="M{0} 470 L{0} 424 Q{2} 408 {1} 424 L{1} 470 Z" fill="url(#esStone)"/>'.format(x0, x1, (x0 + x1) / 2)
        )
    # 左右各 4 塔
    for cx, top, wb, wt in left + right:
        parts.append('<path d="{}" fill="url(#esSpire)" stroke="url(#esRim)" stroke-width=".9"/>'.format(
            tower(cx, base, top, wb, wt)))
        parts.append('<circle cx="{}" cy="{}" r="3.1" fill="#F1BF00" fill-opacity=".75"/>'.format(cx, top - 5))
        parts.append(cross(cx, top - 5))
    # 中央十字塔：更高更粗
    parts.append('<path d="{}" fill="url(#esSpire)" stroke="url(#esRim)" stroke-width="1.1"/>'.format(
        tower(320, base, 96, 42, 12, tip=22)))
    parts.append('<circle cx="320" cy="{}" r="5.4" fill="#F1BF00" fill-opacity=".85"/>'.format(96 - 8))
    parts.append(cross(320, 96 - 8, size=15, w=8))
    # 地面
    parts.append('<path d="M40 470 L600 470 L600 520 L40 520 Z" fill="#07050f" opacity=".9"/>')
    parts.append('<path d="M40 470 L600 470" stroke="#F1BF00" stroke-opacity=".35" stroke-width="1"/>')

    return (
        '<div class="cosmic-core">'
        '<div class="core-glow" aria-hidden="true"></div>'
        '<div class="core-halo" aria-hidden="true"></div>'
        '<div class="orbit orbit-2"></div>'
        '<svg class="basilica" viewBox="0 0 640 520" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'
        '<defs>'
        '<linearGradient id="esSpire" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0%" stop-color="#2a1a3d"/>'
        '<stop offset="46%" stop-color="#150f28"/>'
        '<stop offset="100%" stop-color="#08060f"/>'
        '</linearGradient>'
        '<linearGradient id="esStone" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0%" stop-color="#1d1430"/>'
        '<stop offset="100%" stop-color="#0a0716"/>'
        '</linearGradient>'
        '<linearGradient id="esRim" x1="0" y1="0" x2="1" y2="0">'
        '<stop offset="0%" stop-color="#F1BF00" stop-opacity=".60"/>'
        '<stop offset="48%" stop-color="#C60B1E" stop-opacity=".30"/>'
        '<stop offset="100%" stop-color="#F1BF00" stop-opacity=".60"/>'
        '</linearGradient>'
        '</defs>'
        + "".join(parts) +
        '</svg>'
        '</div>'
    )


def replace_block(html, start_marker, end_marker, new):
    i = html.index(start_marker)
    j = html.index(end_marker, i) + len(end_marker)
    return html[:i] + new + html[j:]


def main():
    html = io.open(HTML, encoding="utf-8").read()

    # 1) 封面：星球 → 圣家堂
    html = replace_block(
        html,
        '      <div class="cosmic-stage" aria-hidden="true">',
        '      </div>\n      <div class="cosmic-copy">',
        '      <div class="cosmic-stage" aria-hidden="true">\n'
        '        <div class="cosmic-mist"></div>\n'
        '        <div class="cosmic-starfield" id="cosmicStarfield"></div>\n'
        '        ' + build_svg() + '\n'
        '      </div>\n      <div class="cosmic-copy">',
    )

    # 2) 文案与数据源
    swaps = [
        ('<title>学科知识图谱</title>', '<title>西班牙语知识图谱</title>'),
        ('content="学科知识图谱。英语、数学与德语三个学科，可按年级/等级与领域自由探索知识脉络。"',
         'content="西班牙语知识图谱。以《现代西班牙语》1–6 册为骨架，把 96 个课时拆成原子知识点，按 A1–C1 等级与知识领域探索先修脉络。"'),
        ('<meta name="theme-color" content="#05070d" />', '<meta name="theme-color" content="#0b0714" />'),
        ('<span id="introKicker">THE KNOWLEDGE COSMOS</span>',
         '<span id="introKicker">EL COSMOS DEL ESPAÑOL</span>'),
        ('<span class="line-a">每一颗知识，</span>', '<span class="line-a">每一个西语知识点，</span>'),
        ('<span class="line-b">都有它的<em>轨道</em>。</span>', '<span class="line-b">都有它的<em>来处</em>。</span>'),
        ('A1 → C2 · 3-12 年级 · 跨学科 · 时序生长',
         'A1.1 → C1.2 · 《现代西班牙语》1–6 册 · 96 课时 · 先修时序'),
        ('3D FORCE GRAPH · DIRECTED KNOWLEDGE GRAPH · v2.0',
         'SAGRADA FAMÍLIA · 3D FORCE GRAPH · v1.0'),
        ('<span class="brand-name">知识图谱</span>', '<span class="brand-name">西语知识图谱</span>'),
        ('<button type="button" data-subject="german" class="on" role="tab" aria-selected="true"><i aria-hidden="true"></i>德语</button>',
         '<button type="button" data-subject="spanish" class="on" role="tab" aria-selected="true"><i aria-hidden="true"></i>西班牙语</button>'),
        ('placeholder="搜索一个德语知识点…"', 'placeholder="搜索一个西班牙语知识点…"'),
        ('<span id="eyebrowText">学科知识图谱</span>', '<span id="eyebrowText">A1–C1 西班牙语 · 知识图谱</span>'),
        ('<span id="timelineLabel">知识成长年级</span>', '<span id="timelineLabel">知识成长等级</span>'),
        ('<strong><b id="ageValue">9</b><span id="gradeUnit"> 年级</span></strong>',
         '<strong><b id="ageValue">10</b><span id="gradeUnit"></span></strong>'),
        ('min="3"\n            max="9"', 'min="1"\n            max="10"'),
        ('value="9"\n            aria-label="选择年级"', 'value="10"\n            aria-label="选择 CEFR 等级"'),
        ('href="data/quality-report.json"', 'href="data/quality-report-spanish.json"'),
        ('<script src="taxonomy-data-german.js?v=1"></script>',
         '<script src="taxonomy-data-spanish.js?v=1"></script>'),
        ('<span id="footerNote">学科知识图谱</span>',
         '<span id="footerNote">西班牙语知识图谱 · 依欧标 CEFR 与《现代西班牙语》1–6 册结构梳理</span>'),
    ]
    for old, new in swaps:
        if old not in html:
            raise SystemExit("未命中替换: " + old[:60])
        html = html.replace(old, new)

    io.open(HTML, "w", encoding="utf-8").write(html)
    print("index.html 已改造，圣家堂 SVG 节点数:", html.count("<path"))


if __name__ == "__main__":
    main()
