# -*- coding: utf-8 -*-
"""从《现代西班牙语》知识点源数据构建 taxonomy-data-spanish.js。

产出：
  taxonomy-data-spanish.js        前端数据（window.MARBLE_DATA_SPANISH）
  data/quality-report-spanish.json 质量与图健康报告
"""

import json
import os
import sys
from collections import defaultdict, deque

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data_syllabus_es import BOOKS, DOMAIN_TYPE, EXTRA_TOPICS, PREREQS  # noqa: E402
from data_modules_es import DOMAIN_OVERRIDE, DOMAIN_ORDER, MODULE_TREE, module_index  # noqa: E402

# 模块层：领域（8）› 模块（39）› 知识点（264）
MODULE_OF = module_index()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
SUBJECT = "西班牙语"
VERSION = "1.1.0"
LESSON_MINUTES = 90  # 精读课一次两课时

DESC_TPL = {
    "语音": "辨听并发出「{zh}」，掌握其拼读与重音位置。",
    "词汇": "在语境中理解并使用「{zh}」相关表达。",
    "语法": "理解「{zh}」的形式与用法，并能在句子中正确使用。",
    "功能": "在真实交际场景中完成「{zh}」。",
    "篇章": "读懂并写出「{zh}」这类语篇，符合其结构与语域要求。",
    "话题": "围绕「{zh}」组织内容并展开表达。",
    "策略": "主动运用「{zh}」并评估其效果。",
    "文化": "了解「{zh}」的关键事实并解释其背景。",
}

EV_TPL = {
    "语音": "能准确发出并辨认「{zh}」，含易混音对比。",
    "词汇": "能在自造句中使用「{zh}」，词形与搭配无误。",
    "语法": "能造出两个正确例句使用「{zh}」，并说明何时不适用。",
    "功能": "能在角色扮演中完成「{zh}」，回应得体。",
    "篇章": "能按「{zh}」的体裁规范写出一篇完整语篇，并说出它的组织方式。",
    "话题": "能用 5 句以上连贯话语谈论「{zh}」。",
    "策略": "能说出「{zh}」的操作步骤并在一次任务中实际使用。",
    "文化": "能说出「{zh}」的两个具体事实，并说明其对语言使用的影响。",
}


def node_id(key):
    return "es-" + key.replace("_", "-")


def build():
    topics, metadata, lessons, links, curriculum = [], [], [], [], []
    concepts = []
    order_index = 0
    lesson_seq = 0

    for book in BOOKS:
        cefr_a, cefr_b = book["cefr"]
        for unit, title_zh, title_es, nodes in book["lessons"]:
            nodes = list(nodes) + EXTRA_TOPICS.get((book["n"], unit), [])
            lesson_seq += 1
            lesson_id = "lr_es_b{}u{:02d}".format(book["n"], unit)
            grade = cefr_a if unit <= 8 else cefr_b
            # 册5/6 全册同一等级时 cefr_a == cefr_b，无需分段
            lesson = {
                "id": lesson_id,
                "stage": book["stage"],
                "grade": grade,
                "semester": book["semester"],
                "lessonCode": "B{}-U{:02d}".format(book["n"], unit),
                "chapter": "第{}册 · Unidad {}".format(book["n"], unit),
                "section": title_zh,
                "lessonTitle": "{}（{}）".format(title_zh, title_es),
                "summary": "第{}册 Unidad {} · {} · {}".format(book["n"], unit, title_zh, book["theme"]),
                "detailMarkdown": "",
                "source": {
                    "file": "现代西班牙语 学生用书 1–6 册",
                    "sheet": book["label"],
                    "row": unit,
                },
                "sequence": lesson_seq,
                "bookSlug": book["label"],
                "curriculumKey": "es:{}:u{:02d}".format(book["label"], unit),
                "topicIds": [],
            }
            concept_key = "es:concept:{}".format(lesson_id)
            concept_topics = []

            for local, spec in enumerate(nodes, start=1):
                key, zh, es = spec[0], spec[1], spec[2]
                # 领域可被模块表改判（如把「议论文结构」从功能移到篇章）
                domain = DOMAIN_OVERRIDE.get(key, spec[3])
                forced_type = spec[4] if len(spec) > 4 else None
                ntype = forced_type or DOMAIN_TYPE[domain]
                order_index += 1
                tid = node_id(key)
                mod = MODULE_OF.get(key)
                if mod is None:
                    raise KeyError("知识点未归入任何模块: " + key)
                if mod[0] != domain:
                    raise ValueError(
                        "模块领域与节点领域不一致: {} {} != {}".format(key, mod[0], domain))
                topics.append({
                    "id": tid,
                    "type": ntype,
                    "subject": SUBJECT,
                    "domain": domain,
                    "module": mod[1],
                    "moduleLabel": mod[2],
                    "moduleLabelEs": mod[3],
                    "name": zh,
                    "nameEs": es,
                    "description": DESC_TPL[domain].format(zh=zh) + "（西语：{}）".format(es),
                    "ageRangeStart": 18 + book["n"] - 1,
                    "ageRangeEnd": 19 + book["n"] - 1,
                    "evidence": [
                        zh,
                        EV_TPL[domain].format(zh=zh),
                    ],
                    "assessmentPrompt": "请学习者用西班牙语演示「{}」，并给出一个例子。".format(zh),
                    "standards": ["欧标 CEFR {}".format(grade)],
                    "centrality": 0.0,
                })
                metadata.append({
                    "topicId": tid,
                    "lessonId": lesson_id,
                    "grade": grade,
                    "conceptKey": concept_key,
                    "conceptLabel": title_zh,
                    "localOrder": local,
                    "globalOrder": order_index,
                    "domain": domain,
                    "module": mod[1],
                    "moduleLabel": mod[2],
                })
                links.append({"lessonId": lesson_id, "topicId": tid, "localOrder": local})
                lesson["topicIds"].append(tid)
                concept_topics.append(tid)

            lessons.append(lesson)
            concepts.append({
                "id": concept_key,
                "label": title_zh,
                "labelEs": title_es,
                "lessonId": lesson_id,
                "grade": grade,
                "topicIds": concept_topics,
            })

    # 教材顺序边：相邻课时
    for i in range(len(lessons) - 1):
        curriculum.append({
            "source": lessons[i]["id"],
            "target": lessons[i + 1]["id"],
            "kind": "curriculum",
        })

    return topics, metadata, lessons, links, curriculum, concepts


def build_modules(topics):
    """模块层清单：领域 › 模块 › 知识点，供前端配色与「知识结构」面板使用。"""
    by_id = {t["id"]: t for t in topics}
    out = []
    for domain, mods in MODULE_TREE:
        for order, (key, label, label_es, hint, items) in enumerate(mods):
            ids = [node_id(k) for k in items]
            ids = [i for i in ids if i in by_id]
            grades = sorted({by_id[i]["standards"][0].replace("欧标 CEFR ", "") for i in ids})
            out.append({
                "id": "{}.{}".format(domain, key),
                "key": key,
                "domain": domain,
                "label": label,
                "labelEs": label_es,
                "hint": hint,
                "order": order,
                "count": len(ids),
                "gradeStart": grades[0] if grades else "",
                "gradeEnd": grades[-1] if grades else "",
                "topicIds": ids,
            })
    assigned = sum(m["count"] for m in out)
    if assigned != len(topics):
        raise ValueError("模块覆盖知识点 {} != {}".format(assigned, len(topics)))
    return out


def build_dependencies(topics, metadata):
    """按 PREREQS 生成先修边，并补齐 reason。"""
    known = {t["id"] for t in topics}
    by_meta = {m["topicId"]: m for m in metadata}
    name = {t["id"]: t["name"] for t in topics}

    deps, seen, problems = [], set(), []
    for src_key, dst_key, strength in PREREQS:
        src, dst = node_id(src_key), node_id(dst_key)
        if src not in known or dst not in known:
            problems.append("未知端点: {} -> {}".format(src_key, dst_key))
            continue
        if src == dst:
            problems.append("自环: {}".format(src_key))
            continue
        if (src, dst) in seen:
            problems.append("重边: {} -> {}".format(src_key, dst_key))
            continue
        seen.add((src, dst))
        if by_meta[src]["globalOrder"] > by_meta[dst]["globalOrder"]:
            problems.append(
                "逆序边: {} ({}) -> {} ({})".format(
                    src_key, by_meta[src]["globalOrder"], dst_key, by_meta[dst]["globalOrder"])
            )
        if strength == "hard":
            reason = "概念前置：不掌握「{}」，就无法正确完成「{}」。".format(name[src], name[dst])
        else:
            reason = "进阶关联：先有「{}」，学「{}」时会更省力。".format(name[src], name[dst])
        deps.append({
            "topicId": dst,
            "prerequisiteId": src,
            "strength": strength,
            "reason": reason,
        })
    return deps, problems


def compute_centrality(topics, deps):
    """可达性计数：从节点出发沿先修方向能到达的节点数 / 最大值。"""
    adj = defaultdict(list)
    for d in deps:
        adj[d["prerequisiteId"]].append(d["topicId"])
    reach = {}
    for t in topics:
        start = t["id"]
        seen = {start}
        q = deque([start])
        while q:
            cur = q.popleft()
            for nxt in adj.get(cur, ()):
                if nxt not in seen:
                    seen.add(nxt)
                    q.append(nxt)
        reach[start] = len(seen) - 1
    peak = max(reach.values()) or 1
    for t in topics:
        t["centrality"] = round(reach[t["id"]] / peak, 6)
    return reach


def graph_report(topics, deps, lessons, links, curriculum):
    ids = [t["id"] for t in topics]
    idset = set(ids)
    out_deg = defaultdict(int)
    in_deg = defaultdict(int)
    adj = defaultdict(list)
    radj = defaultdict(list)
    pairs = set()
    dup = 0
    self_loop = 0
    dangling = 0

    for d in deps:
        s, t = d["prerequisiteId"], d["topicId"]
        if s not in idset or t not in idset:
            dangling += 1
            continue
        if s == t:
            self_loop += 1
            continue
        if (s, t) in pairs:
            dup += 1
            continue
        pairs.add((s, t))
        adj[s].append(t)
        radj[t].append(s)
        out_deg[s] += 1
        in_deg[t] += 1

    # 拓扑排序判环
    indeg = {i: 0 for i in ids}
    for s, t in pairs:
        indeg[t] += 1
    q = deque([i for i in ids if indeg[i] == 0])
    visited = 0
    while q:
        cur = q.popleft()
        visited += 1
        for nxt in adj[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    acyclic = visited == len(ids)

    def components(edge_pairs, node_ids):
        parent = {i: i for i in node_ids}

        def find(a):
            while parent[a] != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a

        for s, t in edge_pairs:
            ra, rb = find(s), find(t)
            if ra != rb:
                parent[ra] = rb
        groups = defaultdict(set)
        for i in node_ids:
            groups[find(i)].add(i)
        return list(groups.values())

    prereq_comps = components(pairs, ids)

    # 渲染图 = 先修 + 课时关联 + 教材顺序（前端实际连出的边）
    lesson_by_id = {l["id"]: l for l in lessons}
    render_pairs = set(pairs)
    for lesson_id, bucket in _group(links, "lessonId"):
        seq = sorted(bucket, key=lambda x: x["localOrder"])
        for prev, nxt in zip(seq, seq[1:]):
            render_pairs.add((prev["topicId"], nxt["topicId"]))
    for e in curriculum:
        cur_len = len(lesson_by_id[e["source"]]["topicIds"])
        nxt_len = len(lesson_by_id[e["target"]]["topicIds"])
        if cur_len and nxt_len:
            render_pairs.add((lesson_by_id[e["source"]]["topicIds"][-1],
                              lesson_by_id[e["target"]]["topicIds"][0]))
    render_comps = components(render_pairs, ids)
    render_deg = defaultdict(int)
    for s, t in render_pairs:
        render_deg[s] += 1
        render_deg[t] += 1
    isolated_render = [i for i in ids if render_deg[i] == 0]

    roots = [i for i in ids if in_deg[i] == 0]
    leaves = [i for i in ids if out_deg[i] == 0]
    order_regression = sum(
        1 for s, t in pairs
        if _order(s, topics) > _order(t, topics)
    )

    return {
        "nodeCount": len(ids),
        "edgeCount": len(pairs),
        "hardEdges": sum(1 for d in deps if d["strength"] == "hard"),
        "softEdges": sum(1 for d in deps if d["strength"] == "soft"),
        "danglingEndpoints": dangling,
        "selfLoops": self_loop,
        "duplicatePairs": dup,
        "acyclic": acyclic,
        "components": len(prereq_comps),
        "roots": len(roots),
        "leaves": len(leaves),
        "isolated": sum(1 for i in ids if out_deg[i] + in_deg[i] == 0),
        "maxHardOutdegree": max(
            [sum(1 for d in deps if d["prerequisiteId"] == i and d["strength"] == "hard") for i in ids] or [0]
        ),
        "maxOutdegree": max(out_deg.values() or [0]),
        "orderRegressionEdges": order_regression,
        "renderEdgeCount": len(render_pairs),
        "renderComponents": len(render_comps),
        "renderIsolated": len(isolated_render),
    }


def _order(node_id, topics):
    for idx, t in enumerate(topics):
        if t["id"] == node_id:
            return idx
    return -1


def _group(items, key):
    buckets = defaultdict(list)
    for it in items:
        buckets[it[key]].append(it)
    return list(buckets.items())


def main():
    topics, metadata, lessons, links, curriculum, concepts = build()
    deps, problems = build_dependencies(topics, metadata)
    reach = compute_centrality(topics, deps)
    report = graph_report(topics, deps, lessons, links, curriculum)
    modules = build_modules(topics)

    domain_count = defaultdict(int)
    type_count = defaultdict(int)
    for t in topics:
        domain_count[t["domain"]] += 1
        type_count[t["type"]] += 1
    module_count = defaultdict(int)
    for t in topics:
        module_count[t["moduleLabel"]] += 1
    grade_count = defaultdict(int)
    for l in lessons:
        grade_count[l["grade"]] += sum(1 for _ in l["topicIds"])

    payload = {
        "topics": {
            "version": VERSION,
            "topicCount": len(topics),
            "topics": topics,
        },
        "dependencies": {
            "version": VERSION,
            "note": "strength: hard=概念必要先修；soft=进阶建议先修",
            "edgeCount": len(deps),
            "dependencies": deps,
        },
        "lessonRecords": {
            "version": VERSION,
            "definition": "课时 = 教材一个 Unidad（精读课约 2 学时）",
            "lessonCount": len(lessons),
            "lessons": lessons,
        },
        "topicMetadata": {
            "version": VERSION,
            "topicCount": len(metadata),
            "topics": metadata,
        },
        "lessonTopicLinks": {
            "version": VERSION,
            "definition": "课时与知识点的归属关系，用于生成课时关联边",
            "linkCount": len(links),
            "links": links,
        },
        "curriculumSequence": {
            "version": VERSION,
            "definition": "教材课时编排顺序（非知识先修）",
            "edgeCount": len(curriculum),
            "edges": curriculum,
        },
        "concepts": {
            "version": VERSION,
            "definition": "按课时主题聚合的概念组",
            "conceptCount": len(concepts),
            "concepts": concepts,
            "topicConcepts": [{"topicId": t, "conceptId": c["id"]}
                              for c in concepts for t in c["topicIds"]],
        },
        "modules": {
            "version": VERSION,
            "definition": "二级知识模块：领域（8）› 模块 › 知识点，一条可教可学可测的线索",
            "domainOrder": DOMAIN_ORDER,
            "moduleCount": len(modules),
            "modules": modules,
        },
        "quality": {
            "version": VERSION,
            "source": "现代西班牙语 学生用书 1–6 册（每册 16 课）",
            "bookCount": len(BOOKS),
            "lessonCount": len(lessons),
            "topics": len(topics),
            "dependencies": len(deps),
            "domainBreakdown": dict(domain_count),
            "moduleCount": len(modules),
            "moduleBreakdown": dict(module_count),
            "typeBreakdown": dict(type_count),
            "gradeBreakdown": dict(sorted(grade_count.items())),
            "graph": report,
        },
    }

    out_js = os.path.join(ROOT, "taxonomy-data-spanish.js")
    with open(out_js, "w", encoding="utf-8") as fh:
        fh.write("window.MARBLE_DATA_SPANISH = ")
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")

    os.makedirs(DATA_DIR, exist_ok=True)
    quality = {
        "version": VERSION,
        "subject": SUBJECT,
        "source": "现代西班牙语（董燕生、刘建）学生用书 1–6 册",
        "structure": {
            "books": len(BOOKS),
            "lessonsPerBook": 16,
            "lessons": len(lessons),
            "cefrCoverage": ["A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B2.1", "B2.2", "C1.1", "C1.2"],
        },
        "verification": {
            "vol1Toc": "已核对（UNIDAD 1–7 五节结构完整，UNIDAD 8/9/16 语法条目已确认）",
            "vol2Toc": "已核对（UNIDAD 1–4 语法条目完整）",
            "vol3Vol4LessonCount": "已核对（图书馆元数据：第3册共16课、第4册共16课）",
            "vol5Vol6": "已核对（学生用书5 共16课；第6册目录 16 Lecciones）",
            "lessonMapping": "语法条目到课时的逐条对位需对照实体教材复核",
        },
        "dataQuality": {
            "nodesWithEvidenceAtLeast2": sum(1 for t in topics if len(t["evidence"]) >= 2),
            "nodesMissingReason": 0,
            "lessonsWithOneTopic": sum(1 for l in lessons if len(l["topicIds"]) == 1),
            "lessonsWithMultipleTopics": sum(1 for l in lessons if len(l["topicIds"]) > 1),
            "averageTopicsPerLesson": round(len(topics) / len(lessons), 2),
            "maxTopicsPerLesson": max(len(l["topicIds"]) for l in lessons),
        },
        "graph": report,
        "problems": problems,
        "centralityTop": [
            {"id": t["id"], "name": t["name"], "domain": t["domain"],
             "reachable": reach[t["id"]], "centrality": t["centrality"]}
            for t in sorted(topics, key=lambda x: -x["centrality"])[:12]
        ],
    }
    with open(os.path.join(DATA_DIR, "quality-report-spanish.json"), "w", encoding="utf-8") as fh:
        json.dump(quality, fh, ensure_ascii=False, indent=2)

    print("节点 {} / 边 {}（hard {} / soft {}）".format(
        report["nodeCount"], report["edgeCount"], report["hardEdges"], report["softEdges"]))
    print("课时 {} / 概念组 {}".format(len(lessons), len(concepts)))
    print("图健康:", json.dumps(report, ensure_ascii=False))
    if problems:
        print("!! 问题 {} 条:".format(len(problems)))
        for p in problems[:20]:
            print("   -", p)
    else:
        print("问题 0 条")


if __name__ == "__main__":
    main()
