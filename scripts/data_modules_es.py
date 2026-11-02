# -*- coding: utf-8 -*-
"""西班牙语知识图谱 · 二级知识模块（模块层）

为什么需要这一层
----------------
第一版只有「语音 / 词汇 / 语法 / 功能 / 话题 / 策略 / 文化」七个领域。
语法一个领域就装了 165 个知识点——对学习者来说，这跟「自己翻目录」没有区别，
既看不出「时态是一条线」也看不出「从句是另一条线」。

这一层按**一条可教、可学、可测的线索**切模块：
  · 一个模块 = 一个教学板块（通常对应教材 2–4 课的核心语法/功能块）
  · 模块内部的点有先后关系，模块之间有真实先修边
  · 模块名用中文 + 西语，直接对得上教材目录的说法

三层结构：领域（8）› 模块（32）› 知识点（264）

领域调整（相较第一版）
----------------------
「功能」原来把「打电话、问诊」和「议论文结构、文学细读、翻译取舍」混在一起，
两者的学习方式完全不同：前者靠情景操练，后者靠篇章分析。
因此拆出**篇章**领域，并从「语法」中把语篇/语用/文体类条目一并迁入。
"""

# 领域覆盖：把原属领域 A 的条目改判到领域 B（key -> 新领域）
DOMAIN_OVERRIDE = {
    # 「功能」里其实是读写/学术/翻译的条目 → 篇章
    "g_carta_formal": "篇章",
    "g_texto_narrativo": "篇章",
    "g_texto_argumentativo": "篇章",
    "g_texto_expositivo": "篇章",
    "g_texto_argumentativo_c1": "篇章",
    "g_resumen_academico": "篇章",
    "g_cita_fuente": "篇章",
    "g_estado_cuestion": "篇章",
    "g_lectura_academica": "篇章",
    "g_escritura_argumentativa": "篇章",
    "g_escritura_expositiva": "篇章",
    "g_argumentacion_ensayo": "篇章",
    "g_tesis_argumentacion": "篇章",
    "g_definicion": "篇章",
    "g_cohesion_c1": "篇章",
    "g_presentacion_oral": "篇章",
    "g_debate_c1": "篇章",
    "g_detectar_sesgos": "篇章",
    "g_analisis_texto_literario": "篇章",
    "g_analisis_personaje": "篇章",
    "g_traduccion_estructuras": "篇章",
    "g_traduccion_literaria": "篇章",
    "g_ponencia": "篇章",
    # 「语法」里其实是语篇/语用/文体的条目 → 篇章
    "g_figuras_retoricas": "篇章",
    "g_estilo_narrativo": "篇章",
    "g_registro": "篇章",
    "g_registro_c1": "篇章",
    "g_tema_motivo": "篇章",
    "g_equivalencia": "篇章",
    "g_ironia": "篇章",
    "g_pragmatica": "篇章",
    "g_coherencia": "篇章",
    "g_progresion_tematica": "篇章",
    # 阶段自测清单本质是「复习策略」，不是语法条目 → 策略
    "g_revision_a2": "策略",
    "g_revision_b1": "策略",
    "g_revision_b2": "策略",
    "g_revision_c1": "策略",
    "g_revision_final": "策略",
}

# 模块表：领域 → [(模块 key, 中文名, Español, 一句话说明, [知识点 key...])]
MODULE_TREE = [
    ("语音", [
        ("fonemas", "音素与拼读", "Fonemas y lectura",
         "元音、辅音、清浊对立——把字读对的第一步",
         ["p_vocales", "p_consonantes2", "p_consonantes3", "p_consonantes4", "p_consonantes5"]),
        ("prosodia", "音节·重音·语调", "Sílaba, acento y entonación",
         "怎么分音节、重音落在哪、句子怎么起伏",
         ["p_silaba1", "p_diptongo1", "p_triptongo", "p_tilde", "p_acento2", "p_escritura", "p_entonacion"]),
    ]),
    ("词汇", [
        ("campo", "主题词场", "Campos léxicos",
         "按场景成组记词：数字、服饰、外貌性格",
         ["g_num_21_50", "g_ropa_lexico", "g_persona_lexico"]),
        ("formacion", "构词与词义辨析", "Formación y matices",
         "前缀后缀怎么造词，固定搭配与假朋友怎么分辨",
         ["g_formacion_palabras", "g_colocaciones", "g_falsos_amigos", "g_variedades_latam"]),
    ]),
    ("语法", [
        ("nom", "名词与限定词", "Sustantivo y determinantes",
         "性数、冠词、指示词、物主词、数量词——名词这一侧的配套系统",
         ["g_nombre", "g_articulo_def", "g_articulo_indef", "g_articulo_def_usos",
          "g_articulo_avanzado", "g_demostrativos", "g_demostrativo_grado",
          "g_posesivo_adj", "g_posesivo_pronombre", "g_cualquiera", "g_algun_ningun",
          "g_cuantificadores", "g_lo_neutro"]),
        ("adj", "形容词与副词", "Adjetivo y adverbio",
         "一致关系、比较级最高级、程度副词的分工",
         ["g_adj_concordancia", "g_comparativo", "g_comparativo_adj2", "g_comparativo_adv",
          "g_superlativo", "g_muy_mucho", "g_tan_tanto", "g_correlacion_tanto"]),
        ("pron", "代词系统", "Pronombres",
         "主格、宾格、与格、自复四套代词与它们在句中的位置",
         ["g_pron_sujeto", "g_od_pronombre", "g_od_oi", "g_reflexivo", "g_gustar",
          "g_pronombre_sistema"]),
        ("verbo_pres", "动词·现在时体系", "Presente de indicativo",
         "三类规则变位 + 词干变化 + 不规则 + ser/estar 的分工",
         ["g_v1_pres", "g_v2_pres", "g_v3_pres", "g_ser_pres",
          "g_ser_estar_pres", "g_ser_estar_usos", "g_ser_estar_revision", "g_ir_pres",
          "g_irreg_pres1", "g_irreg_pres2", "g_irreg_pres3", "g_producir"]),
        ("verbo_pasado", "动词·过去时体系", "Pasado",
         "简单过去、过去未完成、现在完成、过去完成——叙事的时间底盘",
         ["g_preterito_regular", "g_pret_indef_1", "g_pret_indef_2", "g_imperfecto",
          "g_imperfecto_descriptivo", "g_pret_vs_imperf", "g_perfecto", "g_participio_irreg",
          "g_marcadores_pasado", "g_hace_tiempo", "g_desde_hace", "g_soleria",
          "g_tiempos_pasados", "g_correlacion_verbal_errores"]),
        ("verbo_futuro", "动词·将来与情态", "Futuro, condicional y modalidad",
         "将来时、条件式、perífrasis 与推测表达",
         ["g_futuro_prox", "g_futuro_simple", "g_futuro_usos", "g_condicional_simple",
          "g_condicional_cortesia", "g_perifrasis_inf", "g_perifrasis_modales",
          "g_deber_de", "g_modalidad"]),
        ("subjuntivo", "虚拟式与命令式", "Subjuntivo e imperativo",
         "西语最大的门槛：语气怎么选、命令怎么下",
         ["g_subj_presente", "g_subj_voluntad", "g_subj_duda", "g_subj_valoracion",
          "g_subj_emocion", "g_subj_vs_indic", "g_subj_imperfecto", "g_subj_pluscuamperfecto",
          "g_subj_en_pasado", "g_concordancia_tiempos", "g_como_si",
          "g_imperativo_afirm", "g_imperativo_irreg", "g_imperativo_neg",
          "g_imperativo_pronombre"]),
        ("no_personal", "非人称动词形式", "Formas no personales",
         "不定式、分词、副动词——不按人称变的那三套",
         ["g_gerundio", "g_gerundio_usos", "g_estar_gerundio_contraste",
          "g_infinitivo_sustantivo", "g_participio_concordancia", "g_participio_absoluto",
          "g_participio_adjetivo", "g_nominalizacion"]),
        ("prep", "介词与动词搭配", "Preposiciones y régimen",
         "a/de/con/para/por 的分工，以及动词固定带哪个介词",
         ["g_prep_de_en", "g_prep_a", "g_prep_sistema1", "g_prep_medio", "g_regimen_prep"]),
        ("conector", "连接与衔接手段", "Conectores y cohesión",
         "因果转折、语篇连接、指代与省略",
         ["g_conectores1", "g_conectores2", "g_conectores3", "g_conectores_formales",
          "g_conectores_c1", "g_sino_sino_que", "g_referencia"]),
        ("simple", "简单句·被动·强调", "Oración simple, voz y énfasis",
         "疑问否定、无人称、被动 se、语序与分裂句",
         ["g_que_cual", "g_tampoco", "g_haber_estar", "g_haber_impersonal",
          "g_impersonal_3p", "g_pasiva_se", "g_pasiva_ser", "g_pasiva_agente",
          "g_pasiva_vs_se", "g_se_valores", "g_enfasis_hendido", "g_orden_marcado"]),
        ("medida", "钟点与日期", "La hora y la fecha",
         "报时、日期、月份与年份的固定说法",
         ["g_hora", "g_fecha"]),
        ("estructura", "情景结构与固定说法", "Estructuras léxicas",
         "合身、试穿、疼痛、身体状态与 no...más que 这类半固定句式",
         ["g_quedar_sentar", "g_probarse", "g_doler", "g_estado_fisico", "g_no_mas_que"]),
        ("relativa", "关系从句", "Oraciones de relativo",
         "que / quien / cuyo / el que / donde 的选择",
         ["g_donde_relativo", "g_relativo_que", "g_relativo_quien", "g_relativo_donde",
          "g_relativo_cuyo", "g_relativo_el_que", "g_relativo_prep",
          "g_relativa_especificativa"]),
        ("sustantiva", "名词从句与引语", "Subordinadas sustantivas y estilo indirecto",
         "decir que / creo que 以及间接引语的时态后移",
         ["g_que_declarativo", "g_opinion_creo", "g_valorar", "g_estilo_indirecto_1",
          "g_estilo_indirecto_2", "g_deicticos_tiempo", "g_estilo_indirecto_total",
          "g_verbo_introductor"]),
        ("adverbial", "状语从句与长难句", "Subordinadas adverbiales",
         "时间、原因、结果、让步、目的、条件六大类，以及多层主从的拆解",
         ["g_cuando", "g_aunque_concesivo", "g_temporal_cuando", "g_temporal_antes_despues",
          "g_causal_porque", "g_consecutiva", "g_concesiva_aunque", "g_concesiva_por_mas",
          "g_concesiva_avanzada", "g_final_para_que", "g_final_infinitivo", "g_final_avanzada",
          "g_condicional_real", "g_condicional_irreal1", "g_condicional_irreal2",
          "g_condicional_mixto", "g_consecutiva_avanzada", "g_oracion_compuesta"]),
    ]),
    ("功能", [
        ("social", "社交应对", "Relaciones sociales",
         "打招呼、介绍、邀请、道贺、接电话",
         ["f_nacionalidad", "f_recibir", "f_invitar", "f_sugerir", "f_pertenencia",
          "f_exclamacion", "f_telefono"]),
        ("describir", "描述与叙述", "Describir y narrar",
         "说人、说一天、说过去发生的事、说流程",
         ["f_rutina", "f_describir_persona", "f_narrar_pasado", "f_narrar_hechos", "f_procesos"]),
        ("gestion", "事务办理", "Gestiones prácticas",
         "指路、购物、出行、看病",
         ["f_instruccion", "f_comprar", "f_viaje", "f_medico", "f_consulta_medica"]),
        ("opinion", "观点与讨论", "Opinión y debate",
         "同意反对、计划预测、课堂讨论",
         ["f_opinion", "f_planificar", "f_debate_simple"]),
    ]),
    ("篇章", [
        ("escritura", "写作体裁", "Géneros escritos",
         "记叙、说明、议论三类文本各自的结构",
         ["g_texto_narrativo", "g_texto_argumentativo", "g_texto_expositivo",
          "g_texto_argumentativo_c1", "g_escritura_argumentativa", "g_escritura_expositiva",
          "g_argumentacion_ensayo", "g_tesis_argumentacion", "g_carta_formal"]),
        ("academico", "学术写作", "Escritura académica",
         "摘要、综述、引证、定义与分类",
         ["g_resumen_academico", "g_cita_fuente", "g_estado_cuestion", "g_lectura_academica",
          "g_definicion", "g_ponencia"]),
        ("literario", "文学与文体", "Literatura y estilo",
         "细读、人物、叙事视角、修辞与反讽",
         ["g_analisis_texto_literario", "g_analisis_personaje", "g_figuras_retoricas",
          "g_estilo_narrativo", "g_tema_motivo", "g_ironia", "g_registro"]),
        ("traduccion", "翻译", "Traducción",
         "结构转换、文学取舍、等值与不可译",
         ["g_traduccion_estructuras", "g_traduccion_literaria", "g_equivalencia"]),
        ("cohesion", "衔接与连贯", "Cohesión y coherencia",
         "段内段间怎么接、主位怎么推进、语用怎么读",
         ["g_coherencia", "g_cohesion_c1", "g_progresion_tematica", "g_pragmatica",
          "g_registro_c1"]),
        ("oral", "演讲与论辩", "Discurso oral",
         "主题演讲、辩论反驳、识别立场",
         ["g_presentacion_oral", "g_debate_c1", "g_detectar_sesgos"]),
    ]),
    ("话题", [
        ("vida", "生活与社会", "Vida y sociedad",
         "家庭、旅行、健康、工作、教育五个高频主题",
         ["t_familia", "t_viaje", "t_salud", "t_trabajo", "t_educacion"]),
        ("mundo", "文化与学术议题", "Cultura y academia",
         "文学历史、拉美社会、幽默反讽、学术研究",
         ["t_literatura", "t_latam", "t_humor", "t_academico"]),
    ]),
    ("策略", [
        ("repaso", "复习与自测", "Repaso y autoevaluación",
         "错题本、一页纸清单、思维导图，以及各等级的自测清单",
         ["s_autoevaluacion", "s_resumen", "s_esquema", "g_revision_a2", "g_revision_b1",
          "g_revision_b2", "g_revision_c1", "g_revision_final"]),
        ("lectura", "阅读与笔记", "Lectura y apuntes",
         "泛读积累、术语表、批判性阅读",
         ["s_lectura_extensiva", "s_glosario", "s_lectura_critica"]),
        ("examen", "考试与研讨", "Examen y seminario",
         "DELE 题型策略、研讨课准备",
         ["s_examen_b2", "s_seminario"]),
    ]),
    ("文化", [
        ("panorama", "西语世界与生活", "El mundo hispano",
         "版图、礼仪、地域变体、居住与城市",
         ["c_es_paises", "c_cortesia", "c_variedades", "c_vivienda", "c_ciudad", "c_geografia"]),
        ("sociedad", "历史与社会", "Historia y sociedad",
         "历史脉络、医疗体系、当代议题、语言政策",
         ["c_salud", "c_historia_es", "c_historia_latam", "c_espana_contemporanea",
          "c_latam_contemporanea", "c_sociolinguistica", "c_politica_linguistica"]),
        ("literatura", "文学史与流派", "Historia literaria",
         "从中世纪到 20 世纪的小说、诗歌、戏剧、随笔",
         ["c_literatura_es", "c_narrativa_hispana", "c_novela_siglo20", "c_poesia_hispana",
          "c_poesia_analisis", "c_teatro_hispano", "c_ensayo_hispano"]),
    ]),
]

# 模块顺序（同领域内按学习先后）
DOMAIN_ORDER = ["语音", "词汇", "语法", "功能", "篇章", "话题", "策略", "文化"]


def module_index():
    """key -> (domain, module_key, 中文名, Español, 说明)"""
    out = {}
    for domain, modules in MODULE_TREE:
        for key, label, label_es, hint, items in modules:
            for item in items:
                if item in out:
                    raise ValueError("知识点重复归入模块: {} -> {} / {}".format(item, out[item][1], key))
                out[item] = (domain, key, label, label_es, hint)
    return out
