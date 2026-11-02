# -*- coding: utf-8 -*-
"""重建封面：圣家堂剪影（纯剪影画法）。

【已废弃】纸墨版封面已改为活字排版（见 index.html 开场区），本脚本依赖的
`cosmic-core` 容器已从页面移除，直接运行会抛 ValueError。保留此文件只为
留下封面演进过程（线稿 → 剪影 → 活字）的判断记录。

设计判断
--------
一版版试下来，手绘线稿（描边 + 横向肋线 + 球饰）永远难看——细节密度
超过了手绘几何能撑住的精度，看起来像栅栏。纯剪影才是对的路子。

剪影能不能被认出是圣家堂，只取决于四件事：
  1. 塔必须细长（宽高比约 1:8），粗了就是柱子
  2. 塔必须成组——组内四塔几乎相切，组与组之间留大空隙。等距密排
     会让整排看起来像管风琴
  3. 塔身中段要有一道凸台（腰线），上半段再收细，塔才从「管子」变成「建筑」
  4. 塔顶必须是球冠 + 四臂十字，这是圣家堂最强的识别符号

几何约定
--------
  BASE_Y    地平线，塔群坐在这条线上
  top       塔顶球冠的顶点（不是塔身顶端）
  塔身从 BASE_Y 起，收到 yc = top + 球冠高
  球冠盖在塔身顶端，十字从球顶往上

配色：墨黑暖褐底 + 暖金 + 石榴红，三者同属暖色温。旧版用深蓝底配暖金
再叠红，三个色温互斥，红叠进深蓝就成了脏酒红。

可重复执行：每次都用新几何替换 index.html 的 .cosmic-core 区块。
"""

import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "index.html")

BASE_Y = 470.0

# 4 + 4 塔位：组内间距 32（塔宽 26，几乎相切 → 四联柱），组间留大空隙
SIDE_TOWERS = [
    (152, 158), (188, 158), (224, 158), (260, 158),
    (380, 158), (416, 158), (452, 158), (488, 158),
]
CENTER_X, CENTER_TOP = 320, 44

# 剪影三级明度：越靠上越接近光源
C_NAVE = "#130C0C"
C_BODY = "url(#esTower)"
C_CAP = "#3E2920"


def tower(cx, top, wb=13.0, wt=6.5, spire_h=30.0):
    """单座塔：下段直柱 → 腰线凸台 → 上段收分 → 针尖塔顶。

    塔顶不用圆球（球一大就成了火柴头），收成一根细锥再顶十字，
    才是哥特尖塔该有的样子。
    """
    yc = top + spire_h                # 塔身顶端 = 尖锥底
    y1 = BASE_Y - (BASE_Y - yc) * 0.46
    w_mid = wb * 0.60
    flare = 1.4

    body = (
        '<path d="M {x0:.1f} {by:.0f} '
        'L {xm0:.1f} {y1:.1f} L {xf0:.1f} {y1:.1f} '
        'Q {qa0:.1f} {qm:.1f} {xt:.1f} {yc:.1f} '
        'L {xr:.1f} {yc:.1f} '
        'Q {qa1:.1f} {qm:.1f} {xf1:.1f} {y1:.1f} '
        'L {xm1:.1f} {y1:.1f} L {x1:.1f} {by:.0f} Z" fill="{c}"/>'
    ).format(
        x0=cx - wb, x1=cx + wb,
        xm0=cx - w_mid, xm1=cx + w_mid,
        xf0=cx - w_mid - flare, xf1=cx + w_mid + flare,
        xt=cx - wt, xr=cx + wt,
        qa0=cx - wt * 1.2, qa1=cx + wt * 1.2,
        qm=(y1 + yc) / 2.0, yc=yc, y1=y1, by=BASE_Y, c=C_BODY,
    )
    # 塔顶细锥：底宽略大于塔身上端，收到一点，顶部略鼓
    cone = (
        '<path d="M {x0:.1f} {yc:.1f} Q {xq0:.1f} {qm:.1f} {cx:.1f} {top:.1f} '
        'Q {xq1:.1f} {qm:.1f} {x1:.1f} {yc:.1f} Z" fill="{c}"/>'
    ).format(
        cx=cx, top=top, yc=yc,
        x0=cx - wt * 1.05, x1=cx + wt * 1.05,
        xq0=cx - wt * 0.9, xq1=cx + wt * 0.9,
        qm=(yc + top) / 2.0, c=C_CAP,
    )
    return body + cone


def nave():
    """中殿：低矮基座，把塔群接住，建筑才不会悬空。
    屋脊中央微微隆起对准主塔，两侧缓坡收下，接近哥特山墙轮廓。"""
    return (
        '<path d="M 104 {by:.0f} L 104 446 L 148 428 L 268 428 '
        'L 320 410 L 372 428 L 492 428 L 536 446 L 536 {by:.0f} Z" '
        'fill="{c}"/>'
        # 屋脊受光：光从建筑背后打来，脊线是唯一被照亮的结构线
        '<path d="M 104 446 L 148 428 L 268 428 L 320 410 L 372 428 '
        'L 492 428 L 536 446" fill="none" stroke="#F0B429" '
        'stroke-opacity=".26" stroke-width="1.2"/>'
    ).format(by=BASE_Y, c=C_NAVE)


def cross(cx, top, size=13.0, arm=6.0, sw=1.5, op=".72"):
    """塔顶四臂十字 —— 剪影里唯一的亮色，也是识别符号。"""
    return (
        '<path d="M {cx:.1f} {y0:.1f} L {cx:.1f} {y1:.1f} '
        'M {a0:.1f} {ay:.1f} L {a1:.1f} {ay:.1f}" '
        'stroke="#F0B429" stroke-opacity="{op}" stroke-width="{sw}" '
        'stroke-linecap="round" fill="none"/>'
    ).format(
        cx=cx, y0=top - 1.0, y1=top - size,
        a0=cx - arm, a1=cx + arm,
        ay=top - size * 0.58, sw=sw, op=op,
    )


def defs():
    return (
        '<defs>'
        # 塔身：底部沉进地面，越往上越被背后的光提亮
        '<linearGradient id="esTower" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0%" stop-color="#412C22"/>'
        '<stop offset="42%" stop-color="#2C1C16"/>'
        '<stop offset="100%" stop-color="#140D0A"/>'
        '</linearGradient>'
        # 建筑背后的一轮暖光
        '<radialGradient id="esSun" cx="50%" cy="54%" r="52%">'
        '<stop offset="0%" stop-color="#FFE2A6" stop-opacity=".66"/>'
        '<stop offset="28%" stop-color="#EDA93F" stop-opacity=".36"/>'
        '<stop offset="60%" stop-color="#B5453A" stop-opacity=".15"/>'
        '<stop offset="100%" stop-color="#B5453A" stop-opacity="0"/>'
        '</radialGradient>'
        # 地平线光：中间亮、两端淡出
        '<linearGradient id="esHorizon" x1="0" y1="0" x2="1" y2="0">'
        '<stop offset="0%" stop-color="#F0B429" stop-opacity="0"/>'
        '<stop offset="24%" stop-color="#F7CE6E" stop-opacity=".42"/>'
        '<stop offset="50%" stop-color="#FFE9BE" stop-opacity=".76"/>'
        '<stop offset="76%" stop-color="#F7CE6E" stop-opacity=".42"/>'
        '<stop offset="100%" stop-color="#F0B429" stop-opacity="0"/>'
        '</linearGradient>'
        '</defs>'
    )


def build_svg():
    parts = [defs()]

    # 1) 背后的暖光（先画，压在建筑下面）
    parts.append(
        '<ellipse cx="320" cy="292" rx="228" ry="216" fill="url(#esSun)"/>'
    )

    # 2) 中殿基座
    parts.append(nave())

    # 3) 两侧 4+4 塔群
    for cx, top in SIDE_TOWERS:
        parts.append(tower(cx, top))
    # 4) 中央主塔：更高更宽，球冠也更大
    parts.append(tower(CENTER_X, CENTER_TOP, wb=16.0, wt=8.0, spire_h=44.0))

    # 5) 塔顶十字
    for cx, top in SIDE_TOWERS:
        # 离中央越远，塔顶十字越小——一排等大十字会显得呆板
        near = 1 - abs(cx - CENTER_X) / 180.0
        parts.append(cross(
            cx, top + 1,
            size=9.5 + near * 5.0,
            arm=4.2 + near * 2.2,
            sw=1.3 + near * 0.5,
            op=".52" if near < 0.6 else ".78",
        ))
    parts.append(cross(CENTER_X, CENTER_TOP + 1, size=20.0, arm=10.5, sw=2.4, op="1"))

    # 6) 地平线（压在建筑脚下，让建筑坐实）
    parts.append(
        '<path d="M 116 {y:.0f} L 524 {y:.0f}" stroke="url(#esHorizon)" '
        'stroke-width="1.8" fill="none"/>'.format(y=BASE_Y)
    )
    # 地面反光：地平线下方一层极淡的暖雾
    parts.append(
        '<rect x="150" y="{y:.0f}" width="340" height="22" fill="url(#esHorizon)" '
        'opacity=".18"/>'.format(y=BASE_Y)
    )

    return (
        '<div class="cosmic-core">'
        '<div class="core-glow" aria-hidden="true"></div>'
        '<div class="core-halo" aria-hidden="true"></div>'
        '<div class="orbit orbit-2"></div>'
        '<svg class="basilica" viewBox="110 0 420 492" '
        'preserveAspectRatio="xMidYMax meet" aria-hidden="true">{body}</svg>'
        '</div>'
    ).format(body="".join(parts))


def main():
    html = io.open(HTML, encoding="utf-8").read()
    start = html.index('<div class="cosmic-core">')
    end_marker = '</div>\n      </div>\n      <div class="cosmic-copy">'
    end = html.index(end_marker, start) + len('</div>')
    svg = build_svg()
    html = html[:start] + svg + html[end:]
    io.open(HTML, "w", encoding="utf-8").write(html)
    print("封面已重建：纯剪影，塔 9 座，path 数 {}".format(svg.count("<path")))


if __name__ == "__main__":
    main()
