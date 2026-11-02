(() => {
  /**
   * 有机云锥：年龄是软约束；连线在三维织网；半径软区间。
   * 离线算完再上屏，避免黑屏。
   */
  const DATA = "data";

  // 验收/截图模式：跳过入场揭幕与开场动画，直接呈现落定状态
  const SHOT = location.hash.indexOf("shot") >= 0;

  // 英语知识领域配色（课标2022：语音/词汇/语法/功能/话题/策略/文化） — 珠宝色调，高饱和+高亮度
  const EN_COLORS = {
    "语音": "#FFB547",  // 琥珀金 — 发声、拼读、韵律
    "词汇": "#FF7A8C",  // 珊瑚红 — 词义、词形
    "语法": "#5BC9FF",  // 青天蓝 — 时态、从句、结构
    "功能": "#4BE5B8",  // 薄荷翠 — 交际功能、对话
    "话题": "#C87CFF",  // 紫罗兰 — 主题、跨学科
    "策略": "#FF9359",  // 暖橙橘 — 学习策略、元认知
    "文化": "#9FE85A",  // 鲜嫩绿 — 文化、价值观
  };

  // 数学知识领域配色（义务教育数学课程标准）
  const MATH_COLORS = {
    "数与运算": "#6f91e8",
    "代数与方程": "#b686d9",
    "图形与几何": "#68e2cd",
    "测量": "#f0c988",
    "数据与概率": "#e98fb4",
    "数学建模与应用": "#ff9278",
    "综合与实践": "#9bd28f",
  };

  // 德语知识领域配色 — 与英语共用七领域，色调微调以示区分
  const DE_COLORS = {
    "语音": "#FFCB5E",
    "词汇": "#FF8E9D",
    "语法": "#5BD4FF",
    "功能": "#5AEBC4",
    "话题": "#D088FF",
    "策略": "#FF9F6E",
    "文化": "#A8ED6B",
  };

  // 西班牙语领域标识色 —— 只作为数据里的「领域标签」，不再上色。
  //
  // 纸墨版早期给八个领域各配一种墨（棕 / 青 / 紫），结果整个图是一团深浅相近的暗点，
  // 看不出层次。现在颜色的职责交给 CEFR 等级（见下方 CEFR_COLORS），
  // 领域改由侧栏索引、结构目录和面板文字来区分——颜色只有一个通道，
  // 给最有用的那个维度（考级阶段），不要同时编码两件事。
  const ES_COLORS = {
    "语音": "#9A7A4A",  // 浅棕墨 — 发音与韵律（入口最轻）
    "词汇": "#7C5A31",  // 棕墨 — 词义与搭配
    "语法": "#513A20",  // 深棕墨 — 时态、语气、从句（主干，最沉）
    "功能": "#4A7079",  // 浅青墨 — 交际功能
    "话题": "#33565F",  // 青墨 — 主题与文本类型
    "篇章": "#1F3A44",  // 深青墨 — 读写、文体、翻译（书面一侧）
    "策略": "#7B4A54",  // 浅紫墨 — 学习策略
    "文化": "#5A3038",  // 深紫墨 — 文学与社会文化
  };

  /** 在保持色相的前提下调整明度。
   *  t > 0 混向暖白（更亮），t < 0 混向墨底（更暗）。 */
  function tintHex(hex, t) {
    const h = String(hex).replace("#", "");
    const rgb = [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
    const target = t >= 0 ? [255, 233, 196] : [12, 7, 16];
    const k = Math.min(Math.abs(t), 1);
    return (
      "#" +
      rgb
        .map((c, i) =>
          Math.round(c + (target[i] - c) * k)
            .toString(16)
            .padStart(2, "0")
        )
        .join("")
    );
  }

  // 西语三个知识家族：图例按此分组，让「同族＝相邻色相」这件事看得见
  const ES_FAMILIES = [
    { label: "形式", hint: "语言本身的材料：发音、词、结构", domains: ["语音", "词汇", "语法"] },
    { label: "运用", hint: "把语言拿去办事：交际功能、主题与篇章", domains: ["功能", "话题", "篇章"] },
    { label: "语境", hint: "学习方法与文化背景", domains: ["策略", "文化"] },
  ];

  // CEFR 等级标签（内部 level 1–10 → 显示标签）
  const CEFR_LABELS = ["A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B2.1", "B2.2", "C1.1", "C1.2"];

  /** CEFR 十级色阶——颜色编码的是「考级阶段」，不是领域。
   *  A 段取自教材纸页的暖色（赭黄 → 砖红），B 段转冷（松绿 → 群青），C 段收进紫（紫罗兰 → 酒紫）。
   *  三段色相跳变，是为了让「初级／独立／精通」隔着屏幕也能一眼分开；
   *  段内明度递减，让 A1.1 与 A2.2 不靠文字也分得出来。 */
  const CEFR_COLORS = [
    "#C08A2E", // A1.1 姜黄
    "#B87326", // A1.2 琥珀
    "#AE5A28", // A2.1 陶橙
    "#A0472E", // A2.2 砖红
    "#357D68", // B1.1 松绿
    "#2A7078", // B1.2 孔雀蓝
    "#2A5B84", // B2.1 靛蓝
    "#33467F", // B2.2 群青
    "#5A3A79", // C1.1 紫罗兰
    "#75304C", // C1.2 酒紫
  ];

  // 学科配置：切换时重绑下面的 let 变量
  const SUBJECT_CONFIG = {
    english: {
      label: "英语",
      data: () => window.MARBLE_TAXONOMY_DATA,
      colors: EN_COLORS,
      subjectOrder: Object.keys(EN_COLORS),
      ageMin: 8,
      ageMax: 15,
      gradeMin: 3,
      gradeMax: 9,
      gradeParse: (s) => Number.parseInt(s, 10) || 3,
      gradeLabel: (n) => String(n),
      gradeUnit: "年级",
      gradeAxisLabel: "知识成长年级",
      gradeFilterLabel: "知识年级筛选",
      gradeSliderLabel: "选择年级",
      title: "中小学英语知识图谱",
      eyebrow: "3–9 年级 英语 · 知识图谱",
      searchPlaceholder: "搜索一个英语知识点…",
      heroCopy: (n, d, l) =>
        `${l} 个课时被拆解为 ${n} 个原子知识点。<br />让教材中的知识脉络，从此清晰可见。`,
      footer: "中小学英语知识图谱 · 依 2022 版英语课标与人教版/新目标教材结构梳理",
    },
    math: {
      label: "数学",
      data: () => window.MARBLE_DATA_MATH,
      colors: MATH_COLORS,
      subjectOrder: Object.keys(MATH_COLORS),
      ageMin: 6,
      ageMax: 15,
      gradeMin: 1,
      gradeMax: 9,
      gradeParse: (s) => Number.parseInt(s, 10) || 1,
      gradeLabel: (n) => String(n),
      gradeUnit: "年级",
      gradeAxisLabel: "知识成长年级",
      gradeFilterLabel: "知识年级筛选",
      gradeSliderLabel: "选择年级",
      title: "中小学数学知识图谱",
      eyebrow: "1–9 年级 数学 · 知识图谱",
      searchPlaceholder: "搜索一个数学知识点…",
      heroCopy: (n, d, l) =>
        `${l} 个课时被拆解为 ${n} 个原子知识点。<br />让教材中的知识脉络，从此清晰可见。`,
      footer: "中小学数学知识图谱 · 依义务教育数学课标与人教版教材结构梳理",
    },
    german: {
      label: "德语",
      data: () => window.MARBLE_DATA_GERMAN,
      colors: DE_COLORS,
      subjectOrder: Object.keys(DE_COLORS),
      ageMin: 16,
      ageMax: 25,
      gradeMin: 1,
      gradeMax: 10,
      gradeParse: (s) => {
        const i = CEFR_LABELS.indexOf(s);
        return i >= 0 ? i + 1 : 1;
      },
      gradeLabel: (n) => CEFR_LABELS[n - 1] || String(n),
      gradeUnit: "",
      gradeAxisLabel: "CEFR 等级",
      gradeFilterLabel: "CEFR 等级",
      gradeSliderLabel: "选择 CEFR 等级",
      title: "德语学习知识图谱",
      eyebrow: "A1–C1 德语 · 知识图谱",
      searchPlaceholder: "搜索一个德语知识点…",
      heroCopy: (n, d, l) =>
        `${l} 个课时被拆解为 ${n} 个原子知识点。<br />让新求精中的知识脉络，从此清晰可见。`,
      footer: "德语学习知识图谱 · 依欧标 CEFR 与《新求精德语强化教程》结构梳理",
    },
    spanish: {
      label: "西班牙语",
      data: () => window.MARBLE_DATA_SPANISH,
      colors: ES_COLORS,
      subjectOrder: Object.keys(ES_COLORS),
      families: ES_FAMILIES,
      ageMin: 18,
      ageMax: 23,
      gradeMin: 1,
      gradeMax: 10,
      gradeParse: (s) => {
        const i = CEFR_LABELS.indexOf(s);
        return i >= 0 ? i + 1 : 1;
      },
      gradeLabel: (n) => CEFR_LABELS[n - 1] || String(n),
      gradeUnit: "",
      gradeAxisLabel: "CEFR 等级",
      gradeFilterLabel: "CEFR 等级",
      gradeSliderLabel: "选择 CEFR 等级",
      title: "西班牙语知识图谱",
      eyebrow: "欧标 CEFR A1.1–C1.2，配《现代西班牙语》1–6 册",
      searchPlaceholder: "输入一个知识点，比如「虚拟式过去未完成时」",
      heroCopy: (n, d, l) =>
        `${l} 个课时拆成 ${n} 个知识点，编成 ${d} 条先修关系。<br />点开任意一个，看它从哪来，又能解锁什么。`,
      footer: "西班牙语知识图谱。依欧标 CEFR 与《现代西班牙语》1–6 册梳理",
    },
  };

  let currentSubject = "spanish";
  let COLORS = EN_COLORS;

  function blendWithBackground(hex, amount = 0.42) {
    const value = hex.replace("#", "");
    const source = Number.parseInt(value, 16);
    const background = 0xe9e9e2;  // 与纸底色一致，淡化后是浅浅的灰印
    const channel = (shift) => {
      const sourceValue = (source >> shift) & 0xff;
      const backgroundValue = (background >> shift) & 0xff;
      return Math.round(backgroundValue + (sourceValue - backgroundValue) * amount);
    };
    return `#${[channel(16), channel(8), channel(0)]
      .map((part) => part.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  let FAMILIES = null;

  // 未聚焦节点的淡出色：统一成接近纸色的浅灰墨。
  // 颜色从此只表示等级，淡出就不该再带任何色相。
  const DIM_INK = "#B7B5A4";

  let SUBJECT_ORDER = Object.keys(EN_COLORS);

  let SUBJECT_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));

  let DOMAIN_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));

  let AGE_MIN = 8;
  let AGE_MAX = 15;
  let GRADE_MIN = 3;
  let GRADE_MAX = 9;
  let GRADE_PARSE = SUBJECT_CONFIG.english.gradeParse;
  let GRADE_LABEL = SUBJECT_CONFIG.english.gradeLabel;
  let GRADE_UNIT = SUBJECT_CONFIG.english.gradeUnit;
  const HEIGHT = 430;
  const R_BOTTOM = 48;
  const R_TOP = 308;
  const BRANCH_COUNT = 12;
  const LAYOUT_ITERS = 100;
  const FOCUS_MAX_DEPTH = 3;
  const TRAIL_MAX = 8;          // 知识链最多记住 8 站，再多就把最早的一站挤掉
  const FOCUS_MAX_NODES = 90;

  const $ = (id) => document.getElementById(id);
  const status = $("status");
  const subjectsEl = $("subjects");
  const panel = $("panel");
  const panelEmpty = $("panelEmpty");
  const panelBody = $("panelBody");

  let store = null;
  let Graph = null;
  let active = new Set(SUBJECT_ORDER);
  // 二级知识模块：MODULES 为当前学科的模块清单，activeModule 为当前筛选的模块 key
  let MODULES = [];
  let MODULE_BY_KEY = new Map();
  let activeModule = null;
  let gradeLimit = GRADE_MAX;
  let gradePlaying = false;
  let gradeTimer = 0;
  let gradeRefreshTimer = 0;
  let focus = new Set();
  let focusLinks = new Set();
  let revealedFocus = new Set();
  let revealedFocusLinks = new Set();
  // 知识链：从最初选中的点，一路沿「先修 / 解锁」走下去的节点顺序。
  // 有了它才知道「我是从哪儿来的」，也才能在图上把走过的那一段一直亮着。
  let trail = [];
  let trailSet = new Set();
  let trailPairs = new Set();
  let focusHold = false;   // 沿链走时把镜头按住不动，避免每点一次就重新取景
  let prereqLinks = new Set();
  let unlockLinks = new Set();
  let selected = null;
  let focusDimmed = false;
  let focusTransitionTimer = 0;
  let spinning = true;
  let spinAng = Math.atan2(520, 420);
  let spinRadius = Math.hypot(420, 520);
  let spinY = 80;
  let lastFitInfo = null;   // #diag 用：最近一次取景的取景框 / 距离 / 填充率
  // 自转不再整圈转：这个扇形从侧面（窄）转到正面（宽），屏幕宽度差 20%，
  // 看上去就是「一会儿变大一变小」。改成一个来回摆动的窗口，立体感还在，
  // 但轮廓尺寸基本不动。spinBase 是摆动的中心，spinPhase 是当前相位。
  let spinBase = spinAng;
  let spinPhase = 0;
  let spinLastTs = 0;
  let lookAt = { x: 0, y: 0, z: 0 };
  // 入场那段 2.5s 的相机巡航无法取消（库把 TWEEN 内联了），
  // 它会持续写 camera.position，把用户点开节点时的取景拽回去。
  // 这里记一份「取景参数」，选中期间每帧重算机位——图谱布局还在冷却，
  // 节点会继续漂移，只钉死一次机位的话点会越飘越偏、最后躲到面板下面。
  let focusCam = null;          // { dir: Vector3, dist: number }
  let focusOffset = null;       // { x, y } 屏幕像素级闭环修正量（单位：世界）
  let focusFrames = 0;          // 取景已执行帧数（首帧不做闭环修正）
  const RING_RADIUS_PX = 34;    // 焦点环半径（屏幕像素）：必须大于节点半径（约 22px）才圈得住
  let refreshFrame = 0;
  let revealToken = 0;
  let focusMarker = null;
  let nodeAura = null;
  let starField = null;
  let entryRevealPoints = null;
  let entryRevealLines = null;
  let entryRevealActive = !SHOT;
  let entryRevealStarted = false;
  let entryRevealAnimating = false;
  let entryRevealStartedAt = 0;
  let entryRevealFadeAt = 0;
  let entryStatusAt = 0;
  let ambientLinks = new Set();
  let introStarted = false;
  let introFinished = false;
  let demoActive = false;
  let demoRoute = [];
  let demoIndex = 0;
  let demoTimer = 0;
  const SPIN_SWAY = 0.62;         // 摆动幅度（弧度）≈ ±35°
  const FRAME_SPREAD = 1.05;      // 取景扫描的方位半宽，比摆动幅度宽，留出余量
  const SPIN_PERIOD = 34000;      // 一次完整往返 34 秒
  const PATH_STAGE_DELAY = 230;
  const DEMO_STEP_TIME = 6800;
  const FOCUS_ORIENT_DURATION = 980;
  const FOCUS_DIM_DELAY = 680;
  const EMPTY_LINKS = new Set();
  const pointer = { x: 0, y: 0 };

  function scheduleRefresh() {
    if (!Graph || refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      syncNodeAuraVisibility();
      // 必须每次传「新的函数」：3d-force-graph 用引用比较判断 accessor 是否变化，
      // 传同一个函数引用时它认为没变，不重建节点/连线对象——于是选中不变红、
      // 未选中的点也不淡出，看起来就是「点了没反应」。
      Graph
        .nodeColor((node) => colorOf(node))
        .nodeVisibility((node) => nodeIsVisible(node))
        .linkColor((link) => pathColor(link))
        .linkVisibility((link) => graphLinkIsVisible(link))
        .refresh();
    });
  }

  function glowTexture() {
    if (glowTexture._texture) return glowTexture._texture;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.08, "rgba(187,255,244,.95)");
    g.addColorStop(0.25, "rgba(113,229,209,.42)");
    g.addColorStop(0.58, "rgba(116,93,226,.14)");
    g.addColorStop(1, "rgba(70,50,170,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    glowTexture._texture = texture;
    return glowTexture._texture;
  }

  /** 名字标签贴图：纸底 + 红框 + 红字。
   *  按 2 倍分辨率绘制、再用 width/height 折回 CSS 像素，
   *  这样字号是 13px 的正文尺寸，同时不会糊。 */
  function buildFocusLabel(text) {
    const DPR = 2;
    const fs = 13;
    const padX = 8;
    const padY = 5;
    const font = `500 ${fs * DPR}px "Noto Sans SC", "PingFang SC", "IBM Plex Sans", sans-serif`;
    const canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    ctx.font = font;
    const w = Math.max(40, Math.ceil(ctx.measureText(text).width) + padX * 2 * DPR);
    const h = (fs + padY * 2) * DPR;
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
    ctx.font = font;
    ctx.fillStyle = "#f7f7f0";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#b32e2a";
    ctx.lineWidth = 1.5 * DPR;
    ctx.strokeRect(0.75 * DPR, 0.75 * DPR, w - 1.5 * DPR, h - 1.5 * DPR);
    ctx.fillStyle = "#b32e2a";
    ctx.textBaseline = "middle";
    ctx.fillText(text, padX * DPR, h / 2 + DPR * 0.5);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return { texture, width: w / DPR, height: h / DPR };
  }

  /** 定位标记：红环 + 名字标签，都画在 3D 里。
   *  原因：DOM 覆盖层要自己算屏幕投影，canvas 尺寸与元素尺寸稍有出入
   *  就会圈偏几十像素；放在同一个 3D 坐标系里则永远严丝合缝。 */
  function initFocusMarker() {
    focusMarker = new THREE.Group();
    focusMarker.visible = false;

    // 环用墨色而不是校对红：节点本身按 CEFR 上色，B1.x 正好是砖红，
    // 红环压在红点上等于隐形。墨线在十级配色上都读得出来。
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.93, 1, 64),
      new THREE.MeshBasicMaterial({
        color: 0x141a20,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      })
    );
    ring.name = "ring";
    ring.renderOrder = 998;
    focusMarker.add(ring);

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    label.name = "label";
    label.renderOrder = 999;
    focusMarker.add(label);

    Graph.scene().add(focusMarker);
  }

  /** 把知识点名写进标签贴图。 */
  function drawFocusLabel(text) {
    const label = focusMarker?.getObjectByName("label");
    if (!label) return;
    const built = buildFocusLabel(text);
    if (label.material.map) label.material.map.dispose();
    label.material.map = built.texture;
    label.material.needsUpdate = true;
    label.userData.size = built;
  }

  function showFocusMarker(node) {
    if (!focusMarker || !node) return;
    focusMarker.position.set(node.x || 0, node.y || 0, node.z || 0);
    focusMarker.visible = true;
    if (node.name) drawFocusLabel(node.name);
  }

  function hideFocusMarker() {
    if (focusMarker) focusMarker.visible = false;
  }

  function animateFocusMarker(now) {
    if (!focusMarker || !focusMarker.visible || !Graph) return;
    const cam = Graph.camera();

    // 每帧跟住渲染位置（布局冷却时节点会小幅漂移）
    if (selected) {
      const node = Graph.graphData().nodes.find((item) => item.id === selected);
      const obj = node && node.__threeObj;
      if (obj) focusMarker.position.copy(obj.position);
      else if (node) focusMarker.position.set(node.x || 0, node.y || 0, node.z || 0);
    }
    // 整组朝向相机，环才是正圆、标签才正对观众
    focusMarker.quaternion.copy(cam.quaternion);

    // 1 屏幕像素 = 多少世界单位：据此把环和标签钉成固定像素大小
    // （基准是画布高度，#graph 只有 728px 而画布 900px，用错会整体放大 1.24 倍）
    const height = Math.max(1, canvasBox().height);
    const vFov = THREE.MathUtils.degToRad(cam.fov || 75);
    const dist = cam.position.distanceTo(focusMarker.position) || 1;
    const worldPerPx = (2 * dist * Math.tan(vFov / 2)) / height;
    const radiusPx = RING_RADIUS_PX * (1 + Math.sin(now * 0.0035) * 0.04);

    const ring = focusMarker.getObjectByName("ring");
    if (ring) {
      const r = radiusPx * worldPerPx;
      ring.scale.set(r, r, 1);
    }
    const label = focusMarker.getObjectByName("label");
    const size = label && label.userData.size;
    if (label && size) {
      label.scale.set(size.width * worldPerPx, size.height * worldPerPx, 1);
      label.position.set(0, (RING_RADIUS_PX + 9 + size.height / 2) * worldPerPx, 0);
    }
  }

  function initCosmicScene() {
    // 纸墨版：不放星海。留空函数以保持调用点不变。
    starField = null;
  }

  function rebuildNodeAura(nodes) {
    if (nodeAura) {
      Graph.scene().remove(nodeAura);
      nodeAura.geometry.dispose();
      nodeAura.material.dispose();
    }
    const positions = new Float32Array(nodes.length * 3);
    const colors = new Float32Array(nodes.length * 3);
    const ids = [];
    const grades = [];
    nodes.forEach((node, index) => {
      positions[index * 3] = node.x || 0;
      positions[index * 3 + 1] = node.y || 0;
      positions[index * 3 + 2] = node.z || 0;
      const color = new THREE.Color(gradeColor(node));
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      ids.push(node.id);
      grades.push(node.gradeLevel);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    nodeAura = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 15,
        map: glowTexture(),
        transparent: true,
        opacity: 0,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        sizeAttenuation: true,
      })
    );
    nodeAura.frustumCulled = false;
    nodeAura.userData.ids = ids;
    nodeAura.userData.grades = grades;
    nodeAura.userData.basePositions = positions;
    Graph.scene().add(nodeAura);
    syncNodeAuraVisibility();
  }

  function syncNodeAuraVisibility() {
    if (!nodeAura) return;
    const positions = nodeAura.geometry.getAttribute("position");
    const base = nodeAura.userData.basePositions;
    const ids = nodeAura.userData.ids;
    const grades = nodeAura.userData.grades;
    for (let i = 0; i < ids.length; i++) {
      const visible = selected
        ? (!focusDimmed || revealedFocus.has(ids[i])) && grades[i] <= gradeLimit
        : !entryRevealActive && grades[i] <= gradeLimit;
      const offset = i * 3;
      positions.array[offset] = visible ? base[offset] : 100000;
      positions.array[offset + 1] = visible ? base[offset + 1] : 100000;
      positions.array[offset + 2] = visible ? base[offset + 2] : 100000;
    }
    positions.needsUpdate = true;
  }

  function disposeEntryRevealObject(object) {
    if (!object) return;
    Graph.scene().remove(object);
    object.geometry.dispose();
    object.material.dispose();
  }

  function rebuildEntryRevealLayer(nodes, links) {
    disposeEntryRevealObject(entryRevealPoints);
    disposeEntryRevealObject(entryRevealLines);

    const nodePositions = new Float32Array(nodes.length * 3);
    const nodeColors = new Float32Array(nodes.length * 3);
    const nodeById = new Map();
    nodes.forEach((node, index) => {
      nodePositions[index * 3] = node.x || 0;
      nodePositions[index * 3 + 1] = node.y || 0;
      nodePositions[index * 3 + 2] = node.z || 0;
      const color = new THREE.Color(gradeColor(node));
      nodeColors[index * 3] = color.r;
      nodeColors[index * 3 + 1] = color.g;
      nodeColors[index * 3 + 2] = color.b;
      nodeById.set(node.id, node);
    });

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    pointGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    const pointUniforms = {
      uRevealY: { value: -HEIGHT / 2 - 80 },
      uOpacity: { value: 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uTexture: { value: glowTexture() },
    };
    entryRevealPoints = new THREE.Points(
      pointGeometry,
      new THREE.ShaderMaterial({
        uniforms: pointUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: `
          attribute vec3 color;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vWave;
          uniform float uRevealY;
          uniform float uPixelRatio;
          void main() {
            float delta = uRevealY - position.y;
            float revealed = smoothstep(-14.0, 5.0, delta);
            float wave = exp(-abs(delta) * 0.038);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = clamp((7.0 + wave * 28.0) * uPixelRatio * (270.0 / max(90.0, -mvPosition.z)), 3.0, 44.0);
            vColor = color;
            vAlpha = revealed * (0.34 + wave * 0.95);
            vWave = wave;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          varying float vWave;
          uniform float uOpacity;
          uniform sampler2D uTexture;
          void main() {
            vec4 glow = texture2D(uTexture, gl_PointCoord);
            float alpha = glow.a * vAlpha * uOpacity;
            if (alpha < 0.012) discard;
            gl_FragColor = vec4(vColor * (1.0 + vWave * 1.45), alpha);
          }
        `,
      })
    );
    entryRevealPoints.frustumCulled = false;
    entryRevealPoints.visible = entryRevealActive;
    Graph.scene().add(entryRevealPoints);

    const linePositions = [];
    const lineColors = [];
    for (const link of links) {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      const source = nodeById.get(sourceId);
      const target = nodeById.get(targetId);
      if (!source || !target) continue;
      linePositions.push(source.x, source.y, source.z, target.x, target.y, target.z);
      const sourceColor = new THREE.Color("#141A20");
      const targetColor = new THREE.Color("#141A20");
      lineColors.push(
        sourceColor.r, sourceColor.g, sourceColor.b,
        targetColor.r, targetColor.g, targetColor.b
      );
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));
    entryRevealLines = new THREE.LineSegments(
      lineGeometry,
      new THREE.ShaderMaterial({
        uniforms: {
          uRevealY: pointUniforms.uRevealY,
          uOpacity: pointUniforms.uOpacity,
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: `
          attribute vec3 color;
          varying vec3 vColor;
          varying float vY;
          void main() {
            vColor = color;
            vY = position.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vY;
          uniform float uRevealY;
          uniform float uOpacity;
          void main() {
            float delta = uRevealY - vY;
            float revealed = smoothstep(-10.0, 7.0, delta);
            float wave = exp(-abs(delta) * 0.045);
            float alpha = revealed * (0.045 + wave * 0.78) * uOpacity;
            if (alpha < 0.008) discard;
            gl_FragColor = vec4(vColor * (0.82 + wave * 1.35), alpha);
          }
        `,
      })
    );
    entryRevealLines.frustumCulled = false;
    entryRevealLines.visible = entryRevealActive;
    Graph.scene().add(entryRevealLines);
  }

  function nodeIsVisible(node) {
    // 选中后不再把其余 260 多个点整块藏掉。
    // 藏掉之后屏幕上只剩孤零零一个点，看的人会以为「图被放大到只剩局部、全貌没了」——
    // 这正是那条反馈的来源。改成全体保留，非焦点只做颜色变淡 + 点变小（见 colorOf / nodeValue），
    // 既看得见整张图，又能一眼认出被选中的那一个。
    return !entryRevealActive && node.gradeLevel <= gradeLimit;
  }

  function entryLinkIsVisible(link) {
    if (entryRevealActive) return false;
    const source = typeof link.source === "object" ? link.source : store.byId.get(link.source);
    const target = typeof link.target === "object" ? link.target : store.byId.get(link.target);
    return Boolean(
      source &&
        target &&
        source.gradeLevel <= gradeLimit &&
        target.gradeLevel <= gradeLimit
    );
  }

  function graphLinkIsVisible(link) {
    if (!entryLinkIsVisible(link)) return false;
    // 选中态不再把非焦点连线整条藏掉：pathColor 已经把它压到 7% 墨色，
    // 既保住了「这张网」的整体形状，又不会跟高亮链路抢注意力。
    // 整块藏掉的话，屏幕上只剩几个点飘在空白里，看起来就像图被吃掉了。
    return true;
  }

  function animateCosmicScene(now) {
    if (starField) {
      starField.rotation.y = now * 0.000006;
      starField.rotation.x = Math.sin(now * 0.00008) * 0.025;
      starField.material.opacity = selected ? 0.12 : 0.24 + Math.sin(now * 0.001) * 0.04;
    }
    if (nodeAura) {
      // 纸墨版不要光晕：这层是按「入场时的坐标」快照画的，布局继续冷却后
      // 会和真正的节点错位，屏幕上看起来凭空多出一倍的点。
      nodeAura.visible = false;
    }
    animateEntryReveal(now);
  }

  function playEntryReveal() {
    if (entryRevealStarted || !Graph) return;
    entryRevealStarted = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      finishEntryReveal(true);
      return;
    }

    entryRevealActive = true;
    entryRevealAnimating = true;
    entryRevealStartedAt = performance.now();
    entryRevealFadeAt = 0;
    if (entryRevealPoints) {
      entryRevealPoints.visible = true;
      entryRevealPoints.material.uniforms.uRevealY.value = -HEIGHT / 2 - 80;
      entryRevealPoints.material.uniforms.uOpacity.value = 1;
    }
    if (entryRevealLines) {
      entryRevealLines.visible = true;
      entryRevealLines.material.uniforms.uRevealY.value = -HEIGHT / 2 - 80;
      entryRevealLines.material.uniforms.uOpacity.value = 1;
    }
    pauseSpin();

    Graph.cameraPosition(orbitCameraPosition(1.13), lookAt);
    requestAnimationFrame(() => {
      if (entryRevealAnimating) {
        Graph.cameraPosition(orbitCameraPosition(), lookAt, 1200);
      }
    });
  }

  function animateEntryReveal(now) {
    if (entryRevealAnimating && entryRevealPoints) {
      const duration = 3200;
      const progress = Math.min(1, (now - entryRevealStartedAt) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      const revealY = -HEIGHT / 2 - 55 + eased * (HEIGHT + 110);
      entryRevealPoints.material.uniforms.uRevealY.value = revealY;
      if (entryRevealLines) {
        entryRevealLines.material.uniforms.uRevealY.value = revealY;
      }
      if (now - entryStatusAt > 220) {
        entryStatusAt = now;
        status.textContent = `正在载入知识点 · ${Math.round(progress * 100)}%`;
      }
      if (progress >= 1) finishEntryReveal(false);
    }

    if (entryRevealFadeAt && entryRevealPoints) {
      const fade = Math.min(1, (now - entryRevealFadeAt) / 620);
      entryRevealPoints.material.uniforms.uOpacity.value = 1 - fade;
      if (entryRevealLines) {
        entryRevealLines.material.uniforms.uOpacity.value = 1 - fade;
      }
      if (fade >= 1) {
        entryRevealFadeAt = 0;
        entryRevealPoints.visible = false;
        if (entryRevealLines) entryRevealLines.visible = false;
      }
    }
  }

  function finishEntryReveal(instant = false) {
    entryRevealAnimating = false;
    entryRevealActive = false;
    scheduleRefresh();
    if (entryRevealPoints) {
      if (instant) {
        entryRevealPoints.material.uniforms.uOpacity.value = 0;
        entryRevealPoints.visible = false;
        if (entryRevealLines) {
          entryRevealLines.material.uniforms.uOpacity.value = 0;
          entryRevealLines.visible = false;
        }
      } else {
        entryRevealFadeAt = performance.now();
      }
    }
    status.textContent = `${Graph.graphData().nodes.length} 个知识点已就位`;
    if (!selected) resumeSpin(instant ? 160 : 720);
  }

  function updateGradeUi(updateStatus = true) {
    const progress = (gradeLimit - GRADE_MIN) / (GRADE_MAX - GRADE_MIN);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const gradeText = GRADE_LABEL(gradeLimit);
    $("ageValue").textContent = gradeText;
    $("ageAxisValue").textContent = gradeText;
    $("ageSlider").value = gradeLimit;
    $("timelineDock").style.setProperty("--age-progress", clampedProgress);

    if (!Graph) return;
    const graphData = Graph.graphData();
    const visibleNodes = graphData.nodes.filter((node) => node.gradeLevel <= gradeLimit);
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    const visibleLinks = graphData.links.filter((link) => {
      const source = typeof link.source === "object" ? link.source.id : link.source;
      const target = typeof link.target === "object" ? link.target.id : link.target;
      return visibleIds.has(source) && visibleIds.has(target);
    });
    const visibleLearningLinks = visibleLinks.filter(
      (link) => link.kind === "prerequisite"
    );
    $("ageNodeCount").textContent = visibleNodes.length.toLocaleString("zh-CN");
    $("ageLinkCount").textContent = visibleLearningLinks.length.toLocaleString("zh-CN");
    if (updateStatus && !entryRevealActive) {
      status.textContent = `${gradeText}${GRADE_UNIT ? " " + GRADE_UNIT : ""}　${visibleNodes.length} 个知识点，${visibleLearningLinks.length} 条先修关系`;
    }
  }

  function scheduleGradeRefresh() {
    if (gradeRefreshTimer) return;
    gradeRefreshTimer = window.setTimeout(() => {
      gradeRefreshTimer = 0;
      scheduleRefresh();
    }, 55);
  }

  function setGradeLimit(value, source = "manual") {
    const nextGrade = Math.max(GRADE_MIN, Math.min(GRADE_MAX, Number(value)));
    if (source === "manual") {
      if (entryRevealActive) finishEntryReveal(true);
      if (demoActive) stopDemo(true);
      if (selected) closePanel();
    }
    gradeLimit = nextGrade;
    updateGradeUi(true);
    scheduleGradeRefresh();
  }

  function stopGradePlayback() {
    if (!gradePlaying) return;
    gradePlaying = false;
    window.clearInterval(gradeTimer);
    $("agePlay").classList.remove("on");
    $("agePlay").innerHTML = '<i aria-hidden="true">▶</i> 自动生长';
    $("agePlay").setAttribute("aria-label", `自动播放${GRADE_UNIT || "等级"}成长路径`);
  }

  function startGradePlayback() {
    if (gradePlaying) return;
    if (entryRevealActive) finishEntryReveal(true);
    if (demoActive) stopDemo(true);
    if (selected) closePanel();
    gradePlaying = true;
    $("agePlay").classList.add("on");
    $("agePlay").innerHTML = '<i aria-hidden="true">■</i> 停止生长';
    $("agePlay").setAttribute("aria-label", `停止播放${GRADE_UNIT || "等级"}成长路径`);
    if (gradeLimit >= GRADE_MAX) setGradeLimit(GRADE_MIN, "playback");
    else setGradeLimit(Math.floor(gradeLimit), "playback");
    gradeTimer = window.setInterval(() => {
      if (gradeLimit >= GRADE_MAX) {
        stopGradePlayback();
        return;
      }
      const nextGrade = Math.min(GRADE_MAX, gradeLimit + 1);
      setGradeLimit(nextGrade, "playback");
      if (nextGrade >= GRADE_MAX) stopGradePlayback();
    }, 760);
  }

  function normalize(
    topics,
    deps,
    lessonRecords,
    topicMetadata,
    lessonTopicLinks,
    curriculumSequence,
    moduleData
  ) {
    const lessonsById = new Map(
      (lessonRecords?.lessons || []).map((lesson) => [lesson.id, lesson])
    );
    const metadataById = new Map(
      (topicMetadata?.topics || []).map((item) => [item.topicId, item])
    );
    const lessonTopicsByLesson = new Map();
    for (const link of lessonTopicLinks?.links || []) {
      if (!lessonTopicsByLesson.has(link.lessonId)) {
        lessonTopicsByLesson.set(link.lessonId, []);
      }
      lessonTopicsByLesson.get(link.lessonId).push(link);
    }
    for (const links of lessonTopicsByLesson.values()) {
      links.sort((a, b) => a.localOrder - b.localOrder);
    }
    const nodes = topics.topics.map((t) => {
      const meta = metadataById.get(t.id) || {};
      const lesson = lessonsById.get(meta.lessonId) || null;
      return {
        id: t.id,
        name: t.name,
        nameEn: t.name,
        subject: t.domain,
        domain: t.domain,
        ageStart: t.ageRangeStart,
        ageEnd: t.ageRangeEnd,
        ageMid: (t.ageRangeStart + t.ageRangeEnd) / 2,
        description: t.description,
        evidence: t.evidence || [],
        centrality: t.centrality || 0,
        type: t.type,
        lessonId: meta.lessonId || null,
        lesson,
        curriculumT: null,
        grade: meta.grade || "",
        gradeLevel: GRADE_PARSE(meta.grade) || GRADE_MIN,
        conceptKey: meta.conceptKey || "",
        conceptLabel: meta.conceptLabel || "",
        module: t.module || meta.module || "",
        moduleLabel: t.moduleLabel || meta.moduleLabel || t.domain,
        moduleLabelEs: t.moduleLabelEs || "",
        localOrder: meta.localOrder || 1,
      };
    });

    // 按所有微节点而非课时均匀分配课程进度，避免多节点课时在底部堆积。
    const orderedNodes = [...nodes].sort((a, b) => {
      const aSequence = Number(a.lesson?.sequence);
      const bSequence = Number(b.lesson?.sequence);
      const sequenceDelta =
        (Number.isFinite(aSequence) ? aSequence : Number.MAX_SAFE_INTEGER) -
        (Number.isFinite(bSequence) ? bSequence : Number.MAX_SAFE_INTEGER);
      return sequenceDelta || a.localOrder - b.localOrder || a.id.localeCompare(b.id);
    });
    const progressDenominator = Math.max(1, orderedNodes.length - 1);
    orderedNodes.forEach((node, index) => {
      node.curriculumT = index / progressDenominator;
      node.layoutOrder = index;
    });

    // 先按概念成组，再把大组优先分配到当前负载较低的分支。
    // 保留少量分支容量差异，让整体有疏密呼吸，但避免局部极端拥挤或空洞。
    const conceptGroups = new Map();
    for (const node of nodes) {
      const key = node.conceptKey || node.subject || node.id;
      if (!conceptGroups.has(key)) conceptGroups.set(key, []);
      conceptGroups.get(key).push(node);
    }
    const branchLoads = Array.from({ length: BRANCH_COUNT }, () => 0);
    const sortedConceptGroups = [...conceptGroups.entries()].sort(
      (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
    );
    for (const [key, group] of sortedConceptGroups) {
      const startLane = Math.floor(hash01(key + ":lane") * BRANCH_COUNT);
      let bestLane = startLane;
      let bestScore = Infinity;
      for (let offset = 0; offset < BRANCH_COUNT; offset++) {
        const lane = (startLane + offset) % BRANCH_COUNT;
        const capacity = 0.94 + hash01("branch-capacity:" + lane) * 0.12;
        const score = branchLoads[lane] / capacity;
        if (score < bestScore) {
          bestScore = score;
          bestLane = lane;
        }
      }
      group.sort((a, b) => a.curriculumT - b.curriculumT || a.id.localeCompare(b.id));
      group.forEach((node, index) => {
        node.branchLane = bestLane;
        node.conceptRank = index;
        node.conceptCount = group.length;
      });
      branchLoads[bestLane] += group.length;
    }

    const byId = new Map(nodes.map((n) => [n.id, n]));
    const prereqOf = new Map();
    const unlocks = new Map();
    const links = [];
    const edgeKeys = new Set();

    for (const d of deps.dependencies) {
      if (!byId.has(d.topicId) || !byId.has(d.prerequisiteId)) continue;
      edgeKeys.add(`${d.prerequisiteId}→${d.topicId}`);
      links.push({
        source: d.prerequisiteId,
        target: d.topicId,
        strength: d.strength,
        kind: "prerequisite",
        reason: d.reason,
      });
      if (!prereqOf.has(d.topicId)) prereqOf.set(d.topicId, []);
      prereqOf.get(d.topicId).push(d.prerequisiteId);
      if (!unlocks.has(d.prerequisiteId)) unlocks.set(d.prerequisiteId, []);
      unlocks.get(d.prerequisiteId).push(d.topicId);
    }
    const dependencyLinkCount = links.length;

    // 同一课时只连接相邻微节点，保留教学语境，同时避免关系过密。
    for (const [lessonId, lessonLinks] of lessonTopicsByLesson) {
      for (let index = 1; index < lessonLinks.length; index++) {
        const source = lessonLinks[index - 1]?.topicId;
        const target = lessonLinks[index]?.topicId;
        if (!source || !target || source === target) continue;
        if (!byId.has(source) || !byId.has(target)) continue;
        const key = `${source}→${target}`;
        if (edgeKeys.has(key)) continue;
        edgeKeys.add(key);
        links.push({
          source,
          target,
          strength: "association",
          kind: "association",
          scope: "lesson",
          lessonId,
          reason: "同一课时内相邻微节点的教学语境关联",
        });
      }
    }

    for (const edge of curriculumSequence?.edges || []) {
      const fromTopics = lessonTopicsByLesson.get(edge.fromLessonId) || [];
      const toTopics = lessonTopicsByLesson.get(edge.toLessonId) || [];
      const source = fromTopics[fromTopics.length - 1]?.topicId;
      const target = toTopics[0]?.topicId;
      if (!source || !target || source === target) continue;
      if (!byId.has(source) || !byId.has(target)) continue;
      const key = `${source}→${target}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      links.push({
        source,
        target,
        strength: "sequence",
        kind: "sequence",
        scope: edge.scope,
        reason: edge.reason,
      });
    }
    return {
      nodes,
      links,
      dependencyLinkCount,
      associationLinkCount: links.filter((link) => link.kind === "association").length,
      sequenceLinkCount: links.filter((link) => link.kind === "sequence").length,
      byId,
      prereqOf,
      unlocks,
      lessonsById,
      metadataById,
      lessonTopicsByLesson,
      modules: moduleData?.modules || [],
    };
  }

  function hash01(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  function ageT(n) {
    return Math.min(1, Math.max(0, (n.ageMid - AGE_MIN) / (AGE_MAX - AGE_MIN)));
  }

  function growthT(n) {
    const curriculum = Number.isFinite(n.curriculumT) ? n.curriculumT : ageT(n);
    return Math.min(1, Math.max(0, curriculum * 0.9 + ageT(n) * 0.1));
  }

  function ageY(n) {
    return growthT(n) * HEIGHT - HEIGHT / 2;
  }

  function targetRadius(n) {
    const t = growthT(n);
    const ease = t * 0.82 + Math.sqrt(t) * 0.18;
    return R_BOTTOM + (R_TOP - R_BOTTOM) * ease;
  }

  function seedPoint(n) {
    const y0 = ageY(n);
    const ringR = targetRadius(n);
    const w = hash01(n.id + ":y");
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const conceptSeed = n.conceptKey || n.subject || n.id;
    const t = growthT(n);
    const branchLane = Number.isFinite(n.branchLane)
      ? n.branchLane
      : Math.floor(hash01(conceptSeed + ":lane") * BRANCH_COUNT);
    const laneWarp = (hash01("branch-lane:" + branchLane) - 0.5) * 0.46;
    const laneAngle = (branchLane / BRANCH_COUNT) * Math.PI * 2 + laneWarp;
    const conceptDrift = (hash01(conceptSeed + ":drift") - 0.5) * 0.34;
    const branchTwist =
      (t - 0.5) * (hash01(conceptSeed + ":twist") - 0.5) * 1.25;
    const wobbleRate = 1.5 + hash01(conceptSeed + ":rate") * 1.8;
    const wobblePhase = hash01(conceptSeed + ":phase") * Math.PI * 2;
    const wobble = Math.sin(t * Math.PI * wobbleRate + wobblePhase) * 0.14;
    const localJitter = (hash01(n.id + ":angle") - 0.5) * 0.22;
    const rankUnit = ((n.conceptRank || 0) * 0.61803398875) % 1;
    const groupSpread = 0.12 + Math.min(0.32, Math.log2((n.conceptCount || 1) + 1) * 0.055);
    const rankSpread = (rankUnit - 0.5) * groupSpread * 2;
    const scatterAngle = (n.layoutOrder || 0) * goldenAngle + localJitter;
    const branchAngle = laneAngle + conceptDrift + branchTwist + wobble + rankSpread;
    const branchWeight = 0.8;
    const angle = Math.atan2(
      Math.sin(scatterAngle) * (1 - branchWeight) + Math.sin(branchAngle) * branchWeight,
      Math.cos(scatterAngle) * (1 - branchWeight) + Math.cos(branchAngle) * branchWeight
    );
    const depthSeed = hash01(n.id + ":depth");
    const radiusSeed = hash01(n.id + ":radius");
    const centralityNorm = Math.min(
      1,
      Math.max(0, ((n.centrality || 0.08) - 0.08) / 0.12)
    );
    const innerShare = 0.11 + centralityNorm * 0.1;
    let radiusFactor;
    if (depthSeed < 0.025 && centralityNorm < 0.72) {
      // 极少数低连接叶节点游离于主轮廓之外，保留参考图中的自然毛边。
      radiusFactor = 1.04 + radiusSeed * 0.15;
    } else if (depthSeed < 0.025 + innerShare) {
      // 连接重要性越高，进入内部参与跨区域织网的概率越大。
      radiusFactor = 0.18 + 0.56 * Math.sqrt(radiusSeed);
    } else {
      // 外壁由不规则枝状簇构成：同一概念共享大致半径，节点只作局部扰动。
      const shellBand = 0.84 + hash01(conceptSeed + ":shell") * 0.1;
      radiusFactor = Math.min(
        1.03,
        Math.max(0.74, shellBand + (radiusSeed - 0.5) * 0.17)
      );
    }
    const r = ringR * radiusFactor;
    return {
      x: Math.cos(angle) * r,
      y: y0 + (w - 0.5) * 12,
      z: Math.sin(angle) * r,
    };
  }

  function weaveLayout(nodes, links) {
    const byId = new Map();
    const pts = nodes.map((n) => {
      const s = seedPoint(n);
      const p = {
        id: n.id,
        subject: n.subject,
        ageMid: n.ageMid,
        centrality: n.centrality || 0,
        x: s.x,
        y: s.y,
        z: s.z,
        vx: 0,
        vy: 0,
        vz: 0,
        yTarget: ageY(n) + (hash01(n.id + ":flow") - 0.5) * 14,
        rTarget: Math.hypot(s.x, s.z),
        xTarget: s.x,
        zTarget: s.z,
      };
      byId.set(n.id, p);
      return p;
    });

    const edges = [];
    for (const l of links) {
      const a = byId.get(l.source);
      const b = byId.get(l.target);
      if (!a || !b) continue;
      edges.push({
        a,
        b,
        w:
          l.strength === "hard"
            ? 0.027
            : l.kind === "association"
              ? 0.012
              : l.kind === "sequence"
                ? 0.007
                : 0.014,
        ideal:
          l.strength === "hard"
            ? 40
            : l.kind === "association"
              ? 38
              : l.kind === "sequence"
                ? 52
                : 48,
      });
    }

    for (let iter = 0; iter < LAYOUT_ITERS; iter++) {
      const cool = Math.pow(1 - iter / LAYOUT_ITERS, 0.7);

      for (const e of edges) {
        const dx = e.b.x - e.a.x;
        const dy = e.b.y - e.a.y;
        const dz = e.b.z - e.a.z;
        const dist = Math.hypot(dx, dy, dz) || 0.01;
        const f = ((dist - e.ideal) / dist) * e.w * cool;
        e.a.vx += dx * f;
        e.a.vy += dy * f * 0.55;
        e.a.vz += dz * f;
        e.b.vx -= dx * f;
        e.b.vy -= dy * f * 0.55;
        e.b.vz -= dz * f;
      }

      const n = pts.length;
      const step = Math.max(1, Math.floor(n / 420));
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        for (let j = i + step; j < n; j += step) {
          const b = pts[j];
          if (Math.abs(a.y - b.y) > 70) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const dist = Math.hypot(dx, dy, dz) || 0.01;
          const minD = 15.5;
          if (dist >= minD) continue;
          const push = ((minD - dist) / dist) * 0.07 * cool;
          a.vx -= dx * push;
          a.vy -= dy * push * 0.35;
          a.vz -= dz * push;
          b.vx += dx * push;
          b.vy += dy * push * 0.35;
          b.vz += dz * push;
        }
      }

      for (const p of pts) {
        // 年龄保持连续生长；领域脉络锚点让关系形成可追踪的知识流线。
        p.vy += (p.yTarget - p.y) * (0.018 + 0.018 * cool);
        p.vx += (p.xTarget - p.x) * (0.003 + 0.005 * cool);
        p.vz += (p.zTarget - p.z) * (0.003 + 0.005 * cool);

        // 保留上宽下窄轮廓，但每个节点拥有不同半径，不再形成整齐圆环。
        const r = Math.hypot(p.x, p.z) || 0.01;
        const prefer = p.rTarget;
        const radial = (prefer - r) * (0.009 + 0.019 * cool);
        p.vx += (p.x / r) * radial;
        p.vz += (p.z / r) * radial;

        // 若太贴轴心，额外强推开
        if (r < p.rTarget * 0.24) {
          const kick = (p.rTarget * 0.24 - r) * 0.06;
          p.vx += (p.x / r) * kick;
          p.vz += (p.z / r) * kick;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vx *= 0.75;
        p.vy *= 0.75;
        p.vz *= 0.75;

        const yLo = -HEIGHT / 2 - 40;
        const yHi = HEIGHT / 2 + 40;
        if (p.y < yLo) p.y = yLo;
        if (p.y > yHi) p.y = yHi;

        if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
          const s = seedPoint(p);
          p.x = s.x;
          p.y = s.y;
          p.z = s.z;
          p.vx = p.vy = p.vz = 0;
        }
      }
    }

    return pts;
  }

  function filtered() {
    const nodes = store.nodes.filter(
      (n) => active.has(n.subject) && (!activeModule || n.module === activeModule)
    );
    const ids = new Set(nodes.map((n) => n.id));
    const links = store.links.filter(
      (l) => ids.has(l.source) && ids.has(l.target)
    );
    return { nodes, links };
  }

  /** 模块清单就位（切换学科/首屏各调一次） */
  function syncModules() {
    MODULES = store.modules || [];
    MODULE_BY_KEY = new Map(MODULES.map((m) => [m.key, m]));
    if (activeModule && !MODULE_BY_KEY.has(activeModule)) activeModule = null;
  }

  function modulesOfDomain(domain) {
    return MODULES.filter((m) => m.domain === domain);
  }

  /** 模块色带：这个模块覆盖的 CEFR 等级区间做成渐变。
   *  窄带＝集中在一个级别，宽带＝横跨好几个级别，看图例就知道该不该先学。 */
  function moduleColor(moduleKey, domain) {
    const mod = MODULE_BY_KEY.get(moduleKey);
    if (mod) {
      const list = moduleNodes(mod);
      if (list.length) return gradeGradient(list);
    }
    return domainGradient(domain);
  }

  /** 画布尺寸对齐容器。
   *  3d-force-graph 不传 width/height 时默认铺满整个窗口，而 #graph 只是
   *  右半区的一块（left: var(--margin)）。于是投影中心落在窗口中心，
   *  比可见区中心偏右一整个左栏宽——这是「整张图太靠右」的根因，
   *  也是窗口尺寸一变就放大到屏幕外、取景怎么调都对不上的原因。 */
  function syncGraphSize() {
    if (!Graph) return;
    const el = $("graph");
    if (!el) return;
    const w = Math.max(1, el.clientWidth);
    const h = Math.max(1, el.clientHeight);
    if (Graph.width() === w && Graph.height() === h) return;
    Graph.width(w).height(h);
    const cam = Graph.camera();
    if (cam) {
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
  }

  /** 根据图谱边界与界面浮层占位，自适应完整取景。 */
  function frameGraph(gNodes, duration = 0) {
    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const n of gNodes) {
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.z < minZ) minZ = n.z;
      if (n.z > maxZ) maxZ = n.z;
    }
    if (!Number.isFinite(minY)) {
      lookAt = { x: 0, y: 0, z: 0 };
      return;
    }

    const center = new THREE.Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    );
    const graphRect = $("graph").getBoundingClientRect();
    const viewportWidth = Math.max(1, graphRect.width || window.innerWidth);
    const viewportHeight = Math.max(1, graphRect.height || window.innerHeight);
    const desktop = viewportWidth >= 760;
    let leftReserve = 16;
    let rightReserve = 16;
    let topReserve = 12;
    let bottomReserve = 12;

    const topbarRect = document.querySelector(".topbar")?.getBoundingClientRect();
    const footerRect = document.querySelector("footer")?.getBoundingClientRect();
    // 底部挡视野的不止页脚：CEFR 时间轴浮在图面上，图不能钻到它下面去
    const timelineRect = document.querySelector("#timelineDock")?.getBoundingClientRect();
    if (topbarRect) topReserve = Math.max(topReserve, topbarRect.bottom - graphRect.top + 12);
    if (footerRect) bottomReserve = Math.max(bottomReserve, graphRect.bottom - footerRect.top + 8);
    if (timelineRect && timelineRect.height > 0 && timelineRect.top > graphRect.top) {
      bottomReserve = Math.max(bottomReserve, graphRect.bottom - timelineRect.top + 8);
    }

    if (desktop) {
      const heroRect = document.querySelector(".hero")?.getBoundingClientRect();
      const dockRect = document.querySelector(".subject-dock")?.getBoundingClientRect();
      if (heroRect && heroRect.width > 0) {
        leftReserve = Math.max(leftReserve, heroRect.right - graphRect.left + 24);
      }
      if (dockRect && dockRect.width > 0) {
        leftReserve = Math.max(leftReserve, dockRect.right - graphRect.left + 24);
      }
    }

    const padding = 10;
    const camera = Graph.camera();
    const tanHalfVertical = Math.tan(THREE.MathUtils.degToRad(camera.fov || 75) / 2);
    spinAng = Math.atan2(0.78, 0.62);
    spinBase = spinAng;
    spinPhase = 0;
    const fitted = fitCamera(gNodes, {
      center,
      tanHalfVertical,
      rect: {
        left: leftReserve + padding,
        top: topReserve + padding,
        right: viewportWidth - rightReserve - padding,
        bottom: viewportHeight - bottomReserve - padding,
      },
    });
    const position = fitted.position;
    const target = fitted.target;

    lookAt = { x: target.x, y: target.y, z: target.z };
    spinRadius = Math.hypot(position.x - target.x, position.z - target.z);
    spinY = position.y;
    // 缩放也要有限度：把滚轮能到的最近距离钉在点云外面
    const lim = cameraLimits();
    const ctl = Graph.controls ? Graph.controls() : null;
    if (ctl) {
      ctl.minDistance = lim.min;
      ctl.maxDistance = lim.max;
    }
    Graph.cameraPosition(
      { x: position.x, y: position.y, z: position.z },
      lookAt,
      duration
    );
  }

  /** 相机的安全区：自转、拖拽、缩放、聚焦都夹在这个范围里。
   *  下限必须大于点云半径——只要相机进到点云内部，身后的点就是负深度，
   *  投影坐标会整体翻号，画面看起来就是「图倒过来了」，同时近处的点被放得极大。 */
  function cameraLimits() {
    const overview = (lastFitInfo && lastFitInfo.distance) || 600;
    const radius = (lastFitInfo && lastFitInfo.radius) || 0;
    return {
      overview,
      min: Math.max(overview * 0.55, radius * 1.25),
      max: overview * 2.4,
    };
  }

  /** 取景：全部用真实相机矩阵投影，不再手写透视公式。
   *  早先手写投影时，「uv 朝上」与「画布 y 朝下」两套约定在居中项上互相抵消，
   *  量出来的包围盒和真正画出来的像素差一个负号——图会整体偏高约 50px，
   *  越靠近边缘越明显，而且窗口一变比例就跟着漂。改用 three 的 project() 之后，
   *  量的和画的是同一套坐标，居中直接按像素读数去修。
   *
   *  距离与居中分开解，各解两次：
   *    1) 距离：包围球给安全起点，再双向收敛到目标填充率（既不许撑出画面，也不许缩在角落）。
   *    2) 居中：12 个自转方位取包围盒中心的均值，让转起来时画面重心不横跳。
   *    3) 复核：居中后若有方位越界，退一点再居中，最多三轮。 */
  function fitCamera(nodes, opts) {
    const rect = opts.rect;
    const center = opts.center;
    const cam0 = Graph.camera();
    const el = $("graph");
    const canvasW = Math.max(1, el.clientWidth || window.innerWidth);
    const canvasH = Math.max(1, el.clientHeight || window.innerHeight);
    const fov = cam0.fov || 75;
    const tanV = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
    const aspect = canvasW / canvasH;

    // 节点是固定像素大小的精灵，先从取景框里扣掉它的视觉半径。
    // 窄屏上不放标签、点也更小，留 26px 会把图白缩一圈，按画布宽度分档。
    const NODE_R = canvasW < 620 ? 13 : 26;
    const spanW = Math.max(120, rect.right - rect.left - NODE_R * 2);
    const spanH = Math.max(120, rect.bottom - rect.top - NODE_R * 2);
    const wantX = (rect.left + rect.right) / 2;
    const wantY = (rect.top + rect.bottom) / 2;

    let radius = 1;
    for (const n of nodes) {
      const d = Math.hypot(n.x - center.x, n.y - center.y, n.z - center.z);
      if (d > radius) radius = d;
    }
    const halfH = Math.atan((tanV * spanW) / canvasH);
    const halfV = Math.atan((tanV * spanH) / canvasH);
    const safe = radius / Math.sin(Math.min(halfH, halfV));

    const probe = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1e7);
    const probeVec = new THREE.Vector3();
    const axis = { right: new THREE.Vector3(), up: new THREE.Vector3() };

    const basisAt = (az) =>
      new THREE.Vector3(Math.cos(az), 0.13, Math.sin(az)).normalize();

    // 取景只扫「摆动窗口 + 一点余量」这一小段方位，而不是扫满一圈。
    // 扫满圈等于按最窄的那个侧面来定距离，图会白白小一圈；
    // 只扫实际会路过的角度，才敢把它撑到贴边。余量给到 ±1.05rad，比 ±0.62 的摆动宽六成，
    // 用户手动转过去一点也不至于撞出画面。
    const scanAzimuths = [];
    for (let i = 0; i <= 10; i++) {
      scanAzimuths.push(spinBase - FRAME_SPREAD + (i / 10) * FRAME_SPREAD * 2);
    }

    /** 在目标点 target、方位 az、距离 dist 下，把所有节点投到画布像素坐标。 */
    const boxAt = (target, az, dist) => {
      probe.position.copy(target).addScaledVector(basisAt(az), dist);
      probe.up.set(0, 1, 0);
      probe.lookAt(target);
      probe.updateMatrixWorld(true);
      probe.updateProjectionMatrix();
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const n of nodes) {
        probeVec.set(n.x, n.y, n.z).project(probe);
        if (!Number.isFinite(probeVec.x) || !Number.isFinite(probeVec.y)) continue;
        const px = (probeVec.x * 0.5 + 0.5) * canvasW;
        const py = (0.5 - probeVec.y * 0.5) * canvasH;   // 画布 y 朝下
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
      axis.right.setFromMatrixColumn(probe.matrixWorld, 0).normalize();
      axis.up.setFromMatrixColumn(probe.matrixWorld, 1).normalize();
      return {
        minX, maxX, minY, maxY,
        wpp: (2 * dist * tanV) / canvasH,   // 这个深度上 1 像素等于多少世界单位
      };
    };

    // 12 个方位一起量：自转一圈里最宽的那个方位决定距离，
    // 这样转到任何角度都不会顶出画面。
    const sizeAt = (target, dist) => {
      let sw = 0;
      let sh = 0;
      for (const az of scanAzimuths) {
        const bx = boxAt(target, az, dist);
        if (!Number.isFinite(bx.minX)) continue;
        sw = Math.max(sw, bx.maxX - bx.minX);
        sh = Math.max(sh, bx.maxY - bx.minY);
      }
      return { sw, sh, ratio: Math.max(sw / spanW, sh / spanH) };
    };

    const FILL = 0.95;   // 目标填充率：最宽的那个方位占到取景框的 95%
    let distance = Math.max(radius * 1.15, safe * 0.45);
    let target = center.clone();

    /** 12 方位包围盒中心取均值，整体平移到取景框中心。
     *  取均值而不是只看当前方位，是为了转起来时画面重心不横跳。 */
    const recenter = (rounds) => {
      for (let k = 0; k < rounds; k++) {
        let sumX = 0;
        let sumY = 0;
        let count = 0;
        let wpp = (2 * distance * tanV) / canvasH;
        for (const az of scanAzimuths) {
          const bx = boxAt(target, az, distance);
          if (!Number.isFinite(bx.minX)) continue;
          sumX += (bx.minX + bx.maxX) / 2;
          sumY += (bx.minY + bx.maxY) / 2;
          count += 1;
          wpp = bx.wpp;
        }
        if (!count) break;
        const dx = wantX - sumX / count;   // 内容需要向右移多少像素
        const dy = wantY - sumY / count;   // 内容需要向下移多少像素
        if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) break;
        // 相机沿 right 移 +1，画面内容向左移 1；沿 up 移 +1，画面内容向下移 1。
        // 所以水平取反、竖直同号——手写版正是在这一步把符号弄反，图才整体偏高。
        target.addScaledVector(axis.right, -dx * wpp);
        target.addScaledVector(axis.up, dy * wpp);
      }
    };

    for (let pass = 0; pass < 3; pass++) {
      // —— 第一步：只解距离，双向收敛（只往外退的话，从保守起点永远退不到贴边）——
      for (let i = 0; i < 10; i++) {
        const m = sizeAt(target, distance);
        if (!Number.isFinite(m.ratio) || m.ratio <= 0) break;
        if (Math.abs(m.ratio - FILL) < 0.01) break;
        distance *= Math.min(1.5, Math.max(0.66, Math.pow(m.ratio / FILL, 0.9)));
        distance = Math.min(safe * 2.6, Math.max(radius * 1.15, distance));
      }

      recenter(4);

      // —— 第二步：复核。居中后透视会把某一侧再放大一点，真越界就退一步重来 ——
      const check = sizeAt(target, distance);
      if (!Number.isFinite(check.ratio) || check.ratio <= 1.01) break;
      distance *= Math.pow(check.ratio / 0.97, 0.9);
      distance = Math.min(safe * 2.6, Math.max(radius * 1.15, distance));
    }
    recenter(2);   // 最后一轮退距离之后补一次居中，别把偏移留在画面上

    const position = target.clone().addScaledVector(basisAt(spinAng), distance);
    lastFitInfo = {
      canvas: [canvasW, canvasH],
      span: [Math.round(spanW), Math.round(spanH)],
      rect: [rect.left, rect.top, rect.right, rect.bottom].map(Math.round),
      distance: Math.round(distance),
      radius: Math.round(radius),
      ratio: +sizeAt(target, distance).ratio.toFixed(3),
    };
    return { position, target };
  }

  function orbitCameraPosition(distanceScale = 1) {
    return {
      x: lookAt.x + Math.cos(spinAng) * spinRadius * distanceScale,
      y: lookAt.y + (spinY - lookAt.y) * distanceScale,
      z: lookAt.z + Math.sin(spinAng) * spinRadius * distanceScale,
    };
  }

  function runIntro() {
    if (introStarted || !Graph || !Graph.graphData().nodes.length) return;
    if (SHOT) {
      introStarted = true;
      introFinished = true;
      $("intro").classList.add("hide");
      $("intro").hidden = true;
      return;
    }
    introStarted = true;
    const intro = $("intro");
    intro.classList.add("ready");
    pauseSpin();
    Graph.cameraPosition(orbitCameraPosition(2.15), lookAt);
    runIntro._cameraTimer = window.setTimeout(() => {
      if (introFinished) return;
      Graph.cameraPosition(orbitCameraPosition(), lookAt, 1200);
    }, 420);
    runIntro._finishTimer = window.setTimeout(() => finishIntro(false), 5000);
  }

  function finishIntro(skipped = true) {
    if (introFinished) return;
    introFinished = true;
    window.clearTimeout(runIntro._cameraTimer);
    window.clearTimeout(runIntro._finishTimer);
    const intro = $("intro");
    intro.classList.add("hide");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.add("scene-ready");
    document.body.classList.add("interface-ready");
    if (skipped && Graph) Graph.cameraPosition(orbitCameraPosition(), lookAt, 720);
    window.setTimeout(() => playEntryReveal(), 520);
    window.setTimeout(() => {
      intro.hidden = true;
    }, 900);
  }

  function apply(onReady) {
    status.textContent = "正在排布…";
    const { nodes, links } = filtered();

    requestAnimationFrame(() => {
      const woven = weaveLayout(nodes, links);
      const byPos = new Map(woven.map((p) => [p.id, p]));

      const gNodes = nodes.map((n) => {
        const p = byPos.get(n.id);
        const x = p ? p.x : 0;
        const y = p ? p.y : ageY(n);
        const z = p ? p.z : 0;
        return { ...n, x, y, z, fx: x, fy: y, fz: z };
      });

      Graph.graphData({
        nodes: gNodes,
        links: links.map((l) => ({ ...l })),
      });
      rebuildNodeAura(gNodes);
      rebuildEntryRevealLayer(gNodes, links);
      ambientLinks = new Set(
        links
          .filter((link) => link.kind === "prerequisite")
          .map((link) => {
            const source = store.byId.get(link.source);
            const target = store.byId.get(link.target);
            const score =
              ((source?.centrality || 0) + (target?.centrality || 0)) * 100 +
              hash01(linkKey(link.source, link.target));
            return { key: linkKey(link.source, link.target), score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 72)
          .map((entry) => entry.key)
      );
      Graph.cooldownTicks(0);
      Graph.d3AlphaDecay(1);
      frameGraph(gNodes);
      spinning = true;
      if (typeof Graph.resumeAnimation === "function") Graph.resumeAnimation();
      const learningLinkCount = links.filter(
        (link) => link.kind === "prerequisite"
      ).length;
      const mod = activeModule ? MODULE_BY_KEY.get(activeModule) : null;
      status.textContent = mod
        ? `${mod.domain} › ${mod.label} · ${gNodes.length} 个知识点 · ${learningLinkCount} 条先修关系`
        : `${gNodes.length} 个知识点，${learningLinkCount} 条先修关系`;
      updateGradeUi(false);
      syncModuleFilter();
      if (!introStarted) window.setTimeout(runIntro, 80);
      if (typeof onReady === "function") onReady();
    });
  }

  /** 节点等级在十档色阶里的下标；不在 CEFR 十级内的回退到 gradeLevel。 */
  function gradeIndex(n) {
    const i = CEFR_LABELS.indexOf(n.grade);
    if (i >= 0) return i;
    const lvl = (n.gradeLevel || 1) - 1;
    return Math.min(CEFR_COLORS.length - 1, Math.max(0, lvl));
  }

  /** 节点色 = 它所在的 CEFR 等级色。 */
  function gradeColor(n) {
    return CEFR_COLORS[gradeIndex(n)];
  }

  /** 一组知识点的等级跨度，做成交叉渐变的色带。
   *  窄色带＝这一块集中在同一级别，宽色带＝它横跨了好几个级别。 */
  function gradeGradient(list) {
    if (!list || !list.length) return "#C7C6BA";
    let lo = CEFR_COLORS.length - 1;
    let hi = 0;
    for (const n of list) {
      const i = gradeIndex(n);
      if (i < lo) lo = i;
      if (i > hi) hi = i;
    }
    if (hi <= lo) return CEFR_COLORS[lo];
    const span = hi - lo;
    const stops = [];
    for (let i = 0; i <= span; i += 1) {
      const pct = Math.round((i / span) * 100);
      stops.push(`${CEFR_COLORS[lo + i]} ${pct}%`);
    }
    return `linear-gradient(90deg, ${stops.join(", ")})`;
  }

  /** 某个领域下全部知识点的等级色带。 */
  function domainGradient(domain) {
    return gradeGradient(store.nodes.filter((n) => n.subject === domain));
  }

  function colorOf(n) {
    if (selected === n.id) return "#B32E2A";
    // 走过的每一站都留着原色：这样「我是一路从那儿走过来的」在图上看得见，
    // 而不是每点一次就把上一站一起按进背景里。
    if (trailSet.has(n.id)) return gradeColor(n);
    if (selected && focusDimmed && !revealedFocus.has(n.id)) {
      // 淡出用「等级色兑纸色」，不是统一涂灰：
      // 统一灰会把整张图的颜色信息抹掉，看起来像图被禁用了；
      // 兑成浅色调则仍能读出 A1 到 C1 的走向，只是退到背景里去。
      return blendWithBackground(gradeColor(n), 0.42);
    }
    return gradeColor(n);
  }

  function nodeValue(n) {
    const base = 0.65 + (n.centrality || 0) * 9.5;
    if (trailSet.has(n.id)) return base;
    if (selected && focusDimmed && !revealedFocus.has(n.id)) return base * 0.7;
    return base;
  }

  function activePathLinks() {
    if (!selected) return focusLinks;
    return focusDimmed ? revealedFocusLinks : EMPTY_LINKS;
  }

  function linkId(l) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    return linkKey(s, t);
  }

  function pathColor(l) {
    const s = typeof l.source === "object" ? l.source : store.byId.get(l.source);
    const t = typeof l.target === "object" ? l.target : store.byId.get(l.target);
    const sid = s ? s.id : null;
    const tid = t ? t.id : null;
    const k = linkKey(sid, tid);
    const paths = activePathLinks();
    // 选中态：聚焦链路用青/粉高亮，其余淡化
    if (selected && focusDimmed) {
      // 沿链接走出来的那几段，用最实的红：它应该读起来是「一条线」，
      // 而不是每次换点就重新亮一批互不相干的边。
      if (sid && tid && trailPairs.has(pairKey(sid, tid))) return "rgba(179,46,42,0.95)";
      if (!paths.has(k)) return "rgba(20,26,32,0.07)";
      if (prereqLinks.has(k)) return "rgba(179,46,42,0.88)";
      if (unlockLinks.has(k)) return "rgba(31,58,68,0.82)";
      return "rgba(179,46,42,0.88)";
    }
    // 非选中态：统一用墨色，只靠深浅区分强弱。
    // 颜色这个通道已经整块交给 CEFR 等级了，线再上色就成了彩色蛛网，
    // 反而把「谁接谁」这件正事压下去。
    let alpha;
    if (l.kind === "association") alpha = 0.1;
    else if (l.kind === "sequence") alpha = 0.13;
    else if (l.strength === "soft") alpha = 0.22;
    else alpha = 0.34;
    return `rgba(20,26,32,${alpha})`;
  }

  function linkKey(a, b) {
    return `${a}→${b}`;
  }

  function openPanel() {
    panel.classList.remove("closed");
  }

  function closePanel() {
    if (demoActive) stopDemo(false);
    window.clearTimeout(focusTransitionTimer);
    focusDimmed = false;
    panel.classList.add("closed");
    document.body.classList.remove("focus-mode");
    revealToken += 1;
    selected = null;
    focus = new Set();
    focusLinks = new Set();
    revealedFocus = new Set();
    revealedFocusLinks = new Set();
    prereqLinks = new Set();
    unlockLinks = new Set();
    hideFocusMarker();
    focusCam = null;
    focusOffset = null;
    focusHold = false;
    trail = [];
    trailSet = new Set();
    trailPairs = new Set();
    renderChainBar();
    panelBody.hidden = true;
    panelEmpty.hidden = false;
    scheduleRefresh();
    const overviewNodes = Graph?.graphData().nodes || [];
    if (overviewNodes.length) {
      pauseSpin();
      frameGraph(overviewNodes, 820);
      resumeSpin(920);
    } else {
      resumeSpin(400);
    }
  }

  function playRevealStages(stages) {
    const token = ++revealToken;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stages.forEach((stage, index) => {
      const reveal = () => {
        if (token !== revealToken || !selected) return;
        for (const id of stage.nodes) revealedFocus.add(id);
        for (const id of stage.links) revealedFocusLinks.add(id);
        scheduleRefresh();
      };
      if (reducedMotion) reveal();
      else window.setTimeout(reveal, 170 + index * PATH_STAGE_DELAY);
    });
  }

  /** 立刻进入「其余变淡、链路高亮」的状态，不播放逐级揭示动画。
   *  一站一站沿知识链走的时候用：每站都重放一遍揭示动画，整块画面会闪一下重来。 */
  function enterFocusDimNow() {
    focusDimmed = true;
    revealedFocus = new Set(focus);
    revealedFocusLinks = new Set(focusLinks);
    scheduleRefresh();
  }

  /** 两个知识点之间有没有一条直接的先修边（任意方向）。 */
  function isAdjacent(a, b) {
    if (!a || !b || a === b) return false;
    if ((store.prereqOf.get(a) || []).includes(b)) return true;
    if ((store.prereqOf.get(b) || []).includes(a)) return true;
    return false;
  }

  /** 连线没有方向的键：先修 / 解锁两个方向共用同一条边。 */
  function pairKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  /** 顶部那条「知识链」：把走过的把路径摆出来，点任一站可以回退。 */
  function renderChainBar() {
    const bar = $("chainBar");
    const track = $("chainTrack");
    if (!bar || !track) return;
    const ids = trail.filter((id) => store.byId.has(id));
    if (ids.length < 2) {
      bar.hidden = true;
      track.innerHTML = "";
      return;
    }
    bar.hidden = false;
    track.innerHTML = "";
    ids.forEach((id, index) => {
      const n = store.byId.get(id);
      if (index > 0) {
        const sep = document.createElement("span");
        sep.className = "chain-sep";
        sep.textContent = "›";
        sep.setAttribute("aria-hidden", "true");
        track.appendChild(sep);
      }
      const isCurrent = index === ids.length - 1;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `chain-crumb${isCurrent ? " is-current" : ""}`;
      chip.title = isCurrent ? n.name : `回到「${n.name}」`;
      const dot = document.createElement("i");
      dot.style.background = gradeColor(n);
      const label = document.createElement("span");
      label.textContent = n.name;
      chip.append(dot, label);
      if (!isCurrent) {
        chip.onclick = () => showNode(id, false, { via: "trail" });
      } else {
        chip.setAttribute("aria-current", "true");
      }
      track.appendChild(chip);
    });
  }

  /** 把相机推到「选中的那一个点」前面。
   *  早先两版都不对：一版只沿原方向后退（视野没变），一版去框整条先修链
   *  （链本身横跨大半张图，框住它等于没拉近）。定位要的是那一个点。 */
  function frameFocusView(ids, duration = 900) {
    if (!Graph) return;
    const graphNodes = Graph.graphData().nodes;
    const anchor =
      graphNodes.find((node) => node.id === selected) ||
      (ids?.size ? graphNodes.find((node) => ids.has(node.id)) : null);
    if (!anchor) return;

    const graphRect = $("graph").getBoundingClientRect();
    const viewportWidth = Math.max(1, graphRect.width || window.innerWidth);
    const viewportHeight = Math.max(1, graphRect.height || window.innerHeight);

    const camera = Graph.camera();
    const vFov = THREE.MathUtils.degToRad(camera.fov || 75);

    // 聚焦距离按「选中的点 + 它的一圈邻居」来算，不再用固定 260。
    // 固定值在稀疏的边角上会把相机塞进点云内部（点云半径 300+，260 已经在线团里），
    // 身后的点投出天文数字，画面上就只剩孤零零一个点、边线乱飞。
    const members = [];
    const allNodes = Graph.graphData().nodes;
    if (ids && ids.size) {
      for (const nd of allNodes) if (ids.has(nd.id)) members.push(nd);
    }
    if (!members.includes(anchor)) members.push(anchor);
    let gx = 0;
    let gy = 0;
    let gz = 0;
    for (const nd of members) {
      gx += nd.x || 0;
      gy += nd.y || 0;
      gz += nd.z || 0;
    }
    gx /= members.length;
    gy /= members.length;
    gz /= members.length;
    let groupR = 46;
    for (const nd of members) {
      groupR = Math.max(groupR, Math.hypot((nd.x || 0) - gx, (nd.y || 0) - gy, (nd.z || 0) - gz));
    }
    const lim = cameraLimits();

    // 全图包围盒中心与半径
    let cminX = Infinity, cmaxX = -Infinity;
    let cminY = Infinity, cmaxY = -Infinity;
    let cminZ = Infinity, cmaxZ = -Infinity;
    for (const nd of allNodes) {
      const nx = nd.x || 0, ny = nd.y || 0, nz = nd.z || 0;
      if (nx < cminX) cminX = nx;
      if (nx > cmaxX) cmaxX = nx;
      if (ny < cminY) cminY = ny;
      if (ny > cmaxY) cmaxY = ny;
      if (nz < cminZ) cminZ = nz;
      if (nz > cmaxZ) cmaxZ = nz;
    }
    const cloudCenter = {
      x: (cminX + cmaxX) / 2 || 0,
      y: (cminY + cmaxY) / 2 || 0,
      z: (cminZ + cmaxZ) / 2 || 0,
    };
    let cloudR = 1;
    for (const nd of allNodes) {
      cloudR = Math.max(cloudR, Math.hypot((nd.x || 0) - cloudCenter.x, (nd.y || 0) - cloudCenter.y, (nd.z || 0) - cloudCenter.z));
    }

    // 视线落点取「全图中心 → 该点」走 35% 的位置：直接把节点怼到正中，
    // 整张图会有一半被推出画面，反而「看不到全貌」。
    const BLEND = 0.12;
    const goalOff = {
      x: ((anchor.x || 0) - cloudCenter.x) * BLEND,
      y: ((anchor.y || 0) - cloudCenter.y) * BLEND,
      z: ((anchor.z || 0) - cloudCenter.z) * BLEND,
    };
    const goal = {
      x: cloudCenter.x + goalOff.x,
      y: cloudCenter.y + goalOff.y,
      z: cloudCenter.z + goalOff.z,
    };

    // 相机一定要落在点云外面。落点本身已经偏出去 |goalOff|，
    // 所以这个下限要把那一段加回来，否则镜头又会钻进线团里（身后的点投出反向坐标）。
    const outside = cloudR * 1.2 + Math.hypot(goalOff.x, goalOff.z);
    // 选中不推进镜头，直接用全图取景的距离。
    // 只要比全图距离近一点，就一定有节点被挤出画面——「看不到全貌」就是这么来的。
    // 定位交给焦点环、标签、以及其余节点暗化，不做「怼到脸上」的大特写。
    const distance = Math.max(lim.min, outside, lim.overview);

    const dir = new THREE.Vector3(
      camera.position.x - goal.x,
      0,
      camera.position.z - goal.z
    );
    if (dir.lengthSq() < 1) dir.set(0.62, 0, 0.78);
    dir.normalize();

    // 相机每帧重算（见 updateFocusCamera）：这里只定「从哪个方向、多远」看过去。
    // 水平偏移交给闭环修正，不在这里算投影——手算的误差会让点偏出可视区。
    focusCam = {
      dir: dir.clone(),
      dist: distance,
      goalOff,          // 视线落点相对选中点的固定偏移，节点漂移时跟着一起走
    };
    focusOffset = { x: 0, y: 0 };
    focusFrames = 0;
    lookAt = { x: goal.x, y: goal.y, z: goal.z };

    updateFocusCamera();
  }

  /** 选中期间每帧对齐相机：
   *  1) 机位跟着节点当前坐标走，布局漂移不会把点带出画面；
   *  2) 用 graph2ScreenCoords 量出实际落点与目标落点的差，反向平移视线闭环修正，
   *     直到点稳定落在「面板左侧可视区」的正中。 */
  function updateFocusCamera() {
    if (!focusCam || !selected || !Graph) return;
    // 沿知识链走时镜头不许自己挪：这个闭环每帧都会把画面拉到选中点上，
    // 一站一站走下去就会一路平移，看起来像整张图在往别处跑。
    if (focusHold) return;
    const graphNodes = Graph.graphData().nodes;
    const node = graphNodes.find((n) => n.id === selected);
    if (!node) return;

    const cam = Graph.camera();
    // 关键：three 的画布是整窗尺寸并被 #graph 裁切（#graph 只占右边一块），
    // 所以像素换算一律用画布坐标，不能用 #graph 的盒子尺寸——差 360px 起步。
    const canvasRect = canvasBox();
    const height = Math.max(1, canvasRect.height);
    const spread = visibleBox(canvasRect);

    const vFov = THREE.MathUtils.degToRad(cam.fov || 75);
    // 视线落点 = 选中点 + 固定偏移（见 frameFocusView）。闭环对齐的是这个落点，
    // 不是节点本身——把节点硬怼到正中，整张图就会有一半被推出画面。
    const off = focusCam.goalOff || { x: 0, y: 0, z: 0 };
    const nodeX = (node.x || 0) + off.x;
    const nodeY = (node.y || 0) + off.y;
    const nodeZ = (node.z || 0) + off.z;
    const dx = cam.position.x - nodeX;
    const dy = cam.position.y - nodeY;
    const dz = cam.position.z - nodeZ;
    const dist = Math.hypot(dx, dy, dz) || focusCam.dist;
    const worldPerPx = (2 * dist * Math.tan(vFov / 2)) / height;

    // 闭环：量出当前落点，差多少补多少（阻尼 0.6，两帧内收敛，不震荡）。
    // 首帧的投影矩阵还没跟上新机位，量出来的落点可能是 1e168 这种垃圾值，
    // 一帧就能把机位打成 NaN——所以第一帧只定机位、不修正；误差离谱也直接丢弃。
    focusFrames += 1;
    if (focusFrames > 1 && focusOffset) {
      const p = Graph.graph2ScreenCoords(nodeX, nodeY, nodeZ);
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        const errX = p.x - spread.cx;
        const errY = p.y - spread.cy;
        const sane = Math.abs(errX) < spread.width * 4 && Math.abs(errY) < spread.height * 4;
        if (sane && (Math.abs(errX) > 0.5 || Math.abs(errY) > 0.5)) {
          // X 与 Y 的符号相反：把视线往右推，画面内容向左走；
          // 把视线往上推，画面内容在屏幕上向下走（屏幕 Y 轴朝下）。
          focusOffset.x += errX * worldPerPx * 0.6;
          focusOffset.y -= errY * worldPerPx * 0.6;
        }
      }
    }

    // 相机的右/上方向直接从世界矩阵取第一、二列，不跨 THREE 实例造向量
    const m = cam.matrixWorld.elements;
    const offX = focusOffset ? focusOffset.x : 0;
    const offY = focusOffset ? focusOffset.y : 0;
    const cx = nodeX + m[0] * offX + m[4] * offY;
    const cy = nodeY + m[1] * offX + m[5] * offY;
    const cz = nodeZ + m[2] * offX + m[6] * offY;

    const position = {
      x: cx + focusCam.dir.x * focusCam.dist,
      y: cy + focusCam.dist * 0.18,
      z: cz + focusCam.dir.z * focusCam.dist,
    };
    const target = { x: cx, y: cy, z: cz };

    // 机位与 target 一起写，OrbitControls 下一帧 update() 算出的球坐标就是当前值，
    // 不会把镜头拽回去。这里全用数字传参，避免跨 THREE 实例造向量。
    const orbit = Graph.controls ? Graph.controls() : null;
    cam.position.set(position.x, position.y, position.z);
    if (orbit && orbit.target) orbit.target.set(target.x, target.y, target.z);
    cam.lookAt(target.x, target.y, target.z);
    cam.updateMatrixWorld();
    // 同步一次逆矩阵：下一帧 graph2ScreenCoords 用的就是这份，否则量出来是脏值
    if (cam.matrixWorldInverse) cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
    lookAt = target;
  }

  /** 画布盒子（画布坐标系的尺寸基准）。 */
  function canvasBox() {
    const cv = Graph && Graph.renderer && Graph.renderer().domElement;
    if (!cv) return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const r = cv.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      width: r.width || window.innerWidth,
      height: r.height || window.innerHeight,
    };
  }

  /** 画布上「真正能看见图」的那块矩形：左边被 #graph 裁，右边被详情面板挡。
   *  定位的目标落点就是这块矩形的中心。 */
  function visibleBox(canvasRect) {
    const div = $("graph").getBoundingClientRect();
    const panel = $("panel").getBoundingClientRect();
    const panelOpen =
      document.body.classList.contains("focus-mode") &&
      panel.width > 1 &&
      !$("panel").classList.contains("closed");
    // 宽屏面板贴右边 → 裁右侧；窄屏是底部抽屉 → 裁下方
    const sidePanel = panelOpen && window.innerWidth >= 860 && panel.left > 1;
    const sheetPanel = panelOpen && !sidePanel && panel.top > 1;
    const left = Math.max(0, div.left - canvasRect.left);
    const right = sidePanel
      ? Math.max(left + 80, panel.left - canvasRect.left)
      : Math.max(left + 80, div.right - canvasRect.left);
    const top = Math.max(0, div.top - canvasRect.top);
    const bottom = Math.min(
      canvasRect.height,
      sheetPanel ? Math.min(div.bottom, panel.top) - canvasRect.top : div.bottom - canvasRect.top
    );
    return {
      left,
      right,
      top,
      bottom,
      cx: (left + right) / 2,
      cy: (top + bottom) / 2,
      width: right - left,
      height: bottom - top,
    };
  }

  function showNode(id, fromDemo = false, opts = {}) {
    const n = store.byId.get(id);
    if (!n) return;
    if (entryRevealActive) finishEntryReveal(true);
    if (demoActive && !fromDemo) stopDemo(false);
    window.clearTimeout(focusTransitionTimer);
    revealToken += 1;
    focusDimmed = false;
    selected = id;

    // 「沿知识链走一步」和「重新选一个点」是两件事，之前被当成同一件处理了：
    // 在面板里点先修，镜头重新取景、高亮从上往下重放一遍，
    // 看上去就像突然跳到了另一个知识点。这里把两者分开。
    const alongChain = opts.via === "link" || opts.via === "trail";
    if (alongChain) {
      const at = trail.indexOf(id);
      if (at >= 0) trail = trail.slice(0, at + 1);   // 点回更早的一站 = 沿链回退
      else trail = trail.concat(id);
      if (trail.length > TRAIL_MAX) trail = trail.slice(trail.length - TRAIL_MAX);
    } else {
      trail = [id];
    }
    trailSet = new Set(trail);
    trailPairs = new Set();
    for (let i = 1; i < trail.length; i += 1) {
      trailPairs.add(pairKey(trail[i - 1], trail[i]));
    }
    // 沿链走到一个被等级滑条挡住的点时，把滑条顺手推到那一级，
    // 否则面板换了内容、图上却没有这个点，等于「跳到了一个看不见的地方」。
    if (alongChain && n.gradeLevel > gradeLimit) setGradeLimit(n.gradeLevel, "navigate");
    // 沿链走之后，搜索框里那句旧查询已经和当前节点对不上了。
    // 留着它，看着就像「我搜的是一个，点开的却是另一个」。
    if (alongChain) {
      const searchInput = $("search");
      if (searchInput) searchInput.value = "";
    }

    const prereqsDirect = store.prereqOf.get(id) || [];
    const unlocksDirect = store.unlocks.get(id) || [];
    const ancestors = new Set([id]);
    const revealStages = Array.from({ length: FOCUS_MAX_DEPTH + 2 }, () => ({
      nodes: new Set(),
      links: new Set(),
    }));
    const queue = prereqsDirect.map((nodeId) => ({
      nodeId,
      depth: 1,
      via: linkKey(nodeId, id),
    }));
    let queueIndex = 0;
    focusLinks = new Set();
    prereqLinks = new Set();
    unlockLinks = new Set();
    for (const p of prereqsDirect) {
      const key = linkKey(p, id);
      focusLinks.add(key);
      prereqLinks.add(key);
    }

    while (queueIndex < queue.length && ancestors.size < FOCUS_MAX_NODES) {
      const { nodeId: cur, depth, via } = queue[queueIndex++];
      if (ancestors.has(cur)) continue;
      ancestors.add(cur);
      revealStages[depth].nodes.add(cur);
      if (via) {
        focusLinks.add(via);
        revealStages[depth].links.add(via);
      }
      if (depth >= FOCUS_MAX_DEPTH) continue;
      for (const p of store.prereqOf.get(cur) || []) {
        if (!ancestors.has(p)) {
          queue.push({
            nodeId: p,
            depth: depth + 1,
            via: linkKey(p, cur),
          });
        }
      }
    }
    focus = new Set([...ancestors, ...unlocksDirect]);
    for (const u of unlocksDirect) {
      const key = linkKey(id, u);
      focusLinks.add(key);
      unlockLinks.add(key);
      revealStages[FOCUS_MAX_DEPTH + 1].nodes.add(u);
      revealStages[FOCUS_MAX_DEPTH + 1].links.add(key);
    }
    revealedFocus = new Set([id]);
    revealedFocusLinks = new Set();

    panelEmpty.hidden = true;
    panelBody.hidden = false;
    openPanel();
    panel.scrollTop = 0;
    document.body.classList.add("focus-mode");
    panel.style.setProperty("--panel-color", gradeColor(n));
    $("meta").textContent = [n.grade, n.domain].filter(Boolean).join("／");
    $("name").textContent = n.name;
    const tag = document.getElementById("focusTag");
    if (tag) tag.textContent = n.name;
    $("desc").textContent = n.description || "";
    hideHoverCard();
    fillModuleContext(n);
    fillLessonContext(n);
    fillList($("prereqs"), prereqsDirect);
    fillList($("unlocks"), unlocksDirect);
    const ev = $("evidence");
    ev.innerHTML = "";
    for (const e of n.evidence) {
      const li = document.createElement("li");
      li.textContent = e;
      ev.appendChild(li);
    }
    scheduleRefresh();
    renderChainBar();

    const node = Graph.graphData().nodes.find((x) => x.id === id);
    if (node) {
      pauseSpin();
      showFocusMarker(node);
      if (alongChain) {
        // 沿链走：镜头一动不动，也不重放揭示动画，只把高亮换到新的一站。
        // 每点一次都重新取景 + 重放动画，正是「怎么又变成别的知识点了」的来源。
        focusHold = true;
        enterFocusDimNow();
        return;
      }
      focusHold = false;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      frameFocusView(focus, reducedMotion ? 0 : FOCUS_ORIENT_DURATION);
      const enterFocus = () => {
        if (selected !== id) return;
        focusDimmed = true;
        scheduleRefresh();
        playRevealStages(revealStages.filter((stage) => stage.nodes.size || stage.links.size));
      };
      if (reducedMotion) enterFocus();
      else focusTransitionTimer = window.setTimeout(enterFocus, FOCUS_DIM_DELAY);
    }
  }

  function syncSpinFromCamera() {
    const cam = Graph.camera();
    const dx = cam.position.x - lookAt.x;
    const dz = cam.position.z - lookAt.z;
    const dy = cam.position.y - lookAt.y;
    const lim = cameraLimits();

    // 拖拽能把相机拖到线团下面、也能拖进线团内部：
    // 进到内部时身后的点是负深度，投影翻号——整张图看起来就「倒过来」了，
    // 同时近处的点被放大到糊屏。这里把「距离」和「仰角」都锁进安全区。
    const dist = Math.max(lim.min, Math.min(lim.max, Math.hypot(dx, dy, dz) || lim.overview));
    const elev = Math.max(0.10, Math.min(0.55, Math.atan2(dy, Math.hypot(dx, dz) || 1)));
    spinRadius = Math.cos(elev) * dist;
    spinY = lookAt.y + Math.sin(elev) * dist;
    spinAng = Math.atan2(dz, dx);
    spinBase = spinAng;
    spinPhase = 0;
  }

  function pauseSpin() {
    spinning = false;
    window.clearTimeout(resumeSpin._t);
  }

  function resumeSpin(delayMs = 0) {
    window.clearTimeout(resumeSpin._t);
    resumeSpin._t = window.setTimeout(() => {
      if (!Graph || selected) return;
      syncSpinFromCamera();
      spinning = true;
      if (typeof Graph.resumeAnimation === "function") Graph.resumeAnimation();
    }, delayMs);
  }

  /** 定位标记已经全部放回 3D（见 initFocusMarker），
   *  DOM 覆盖层只留作历史痕迹，直接隐藏，避免出现两个红圈。 */
  let focusOverlayEl = null;

  function updateFocusOverlay() {
    if (!focusOverlayEl) focusOverlayEl = document.getElementById("focusOverlay");
    if (focusOverlayEl && !focusOverlayEl.hidden) focusOverlayEl.hidden = true;
  }

  function startSpinLoop() {
    const tick = (now = 0) => {
      requestAnimationFrame(tick);
      const dt = spinLastTs ? Math.min(80, now - spinLastTs) : 16;
      spinLastTs = now;
      animateFocusMarker(now);
      animateCosmicScene(now);
      updateFocusOverlay();
      if (focusCam && selected) updateFocusCamera();
      if (!Graph || !spinning || selected) return;
      spinAng = spinBase + SPIN_SWAY * Math.sin(spinPhase);
      spinPhase += (dt / SPIN_PERIOD) * Math.PI * 2;
      Graph.cameraPosition(
        {
          x: lookAt.x + Math.cos(spinAng) * spinRadius,
          y: spinY,
          z: lookAt.z + Math.sin(spinAng) * spinRadius,
        },
        lookAt
      );
    };
    requestAnimationFrame(tick);
  }

  function fillList(ul, ids) {
    ul.innerHTML = "";
    if (!ids.length) {
      const li = document.createElement("li");
      li.textContent = "无";
      li.style.color = "var(--mute)";
      ul.appendChild(li);
      return;
    }
    for (const id of ids) {
      const t = store.byId.get(id);
      if (!t) continue;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = t.name;
      a.href = "#";
      // 标出「刚从哪一站走过来的」：沿链走的时候，列表里也要看得出这条链的上一环
      if (trail.length > 1 && id === trail[trail.length - 2]) {
        a.className = "is-origin";
        a.title = `上一站：${t.name}`;
      }
      a.onclick = (e) => {
        e.preventDefault();
        if (!active.has(t.subject)) {
          active.add(t.subject);
          syncSubjectButtons();
          apply(() => showNode(id, false, { via: "link" }));
          return;
        }
        showNode(id, false, { via: "link" });
      };
      li.appendChild(a);
      ul.appendChild(li);
    }
  }

  /** 所属知识模块：让学习者知道「这个点属于哪一块、这一块还差几个点」。 */
  function fillModuleContext(node) {
    const mod = node.module ? MODULE_BY_KEY.get(node.module) : null;
    const swatch = $("moduleSwatch");
    const title = $("moduleTitle");
    const titleEs = $("moduleTitleEs");
    const count = $("moduleCount");
    const hint = $("moduleHint");
    const peers = $("modulePeers");

    if (!mod) {
      title.textContent = node.domain;
      titleEs.textContent = "";
      count.textContent = "";
      hint.textContent = "";
      peers.innerHTML = "";
      swatch.style.background = domainGradient(node.domain);
      return;
    }

    swatch.style.background = moduleColor(mod.key, mod.domain);
    title.textContent = mod.label;
    titleEs.textContent = mod.labelEs || "";
    count.textContent = `${moduleCount(mod)} 点`;
    hint.textContent = mod.hint || "";

    peers.innerHTML = "";
    const list = moduleNodes(mod);
    for (const peer of list) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "peer-chip";
      chip.textContent = peer.name;
      chip.title = `${peer.name} · ${peer.grade}`;
      if (peer.id === node.id) chip.classList.add("current");
      chip.onclick = () => {
        if (peer.id !== selected) showNode(peer.id);
      };
      peers.appendChild(chip);
    }
  }

  function fillLessonContext(node) {
    const lesson = node.lesson;
    const title = $("lessonTitle");
    const path = $("lessonPath");
    const topics = $("lessonTopics");

    topics.innerHTML = "";
    if (!lesson) {
      title.textContent = "未找到所属课时";
      path.textContent = "";
      return;
    }

    title.textContent = lesson.lessonTitle || lesson.section || "未命名课时";
    path.textContent = [
      [lesson.grade, lesson.semester].filter(Boolean).join("　"),
      lesson.chapter,
      lesson.section,
    ]
      .filter(Boolean)
      .join(" / ");

    const links = store.lessonTopicsByLesson.get(node.lessonId) || [];
    for (const link of links) {
      const topic = store.byId.get(link.topicId);
      if (!topic) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = topic.name;
      button.classList.toggle("current", topic.id === node.id);
      if (topic.id === node.id) {
        button.setAttribute("aria-current", "true");
      } else {
        button.onclick = () => showNode(topic.id);
      }
      topics.appendChild(button);
    }
  }

  function syncSubjectButtons() {
    subjectsEl.querySelectorAll("button[data-subject]").forEach((b) => {
      b.classList.toggle("on", active.has(b.dataset.subject));
    });
  }

  function subjectButton(s) {
    const count = store.nodes.filter((n) => n.subject === s).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.subject = s;
    btn.style.setProperty("--c", domainGradient(s));
    btn.classList.toggle("on", active.has(s));
    btn.innerHTML = `<span class="dot"></span>${short(s)} <em>${count}</em>`;
    btn.onclick = () => {
      if (selected) closePanel();
      if (activeModule) {
        // 手动点领域 = 重新从领域层看，模块筛选让位
        activeModule = null;
        syncModuleFilter();
      }
      if (active.has(s)) {
        if (active.size === 1) return;
        active.delete(s);
      } else {
        active.add(s);
      }
      btn.classList.toggle("on", active.has(s));
      apply();
    };
    return btn;
  }

  /** 图例：有空族配置时按族分行，族内并排。
   *  这排按钮本身就是「配色规则说明书」——同族挨着、同色相，一眼能对上。 */
  function buildSubjects() {
    subjectsEl.innerHTML = "";
    const groups = FAMILIES
      ? FAMILIES.map((f) => ({
          ...f,
          members: f.domains.filter((d) => SUBJECT_ORDER.includes(d)),
        })).filter((f) => f.members.length)
      : [{ label: "", members: SUBJECT_ORDER }];

    for (const group of groups) {
      const row = document.createElement("div");
      row.className = "dock-family-row";
      if (group.label) {
        const cap = document.createElement("div");
        cap.className = "dock-family";
        cap.textContent = group.label;
        if (group.hint) cap.title = group.hint;
        row.appendChild(cap);
      }
      for (const s of group.members) row.appendChild(subjectButton(s));
      subjectsEl.appendChild(row);
    }
  }

  function short(s) {
    return SUBJECT_ZH[s] || s;
  }

  // ─────────────────────────────────────────────────────────────
  // 二级知识模块：知识结构面板 / 模块筛选 / 悬浮卡片
  // ─────────────────────────────────────────────────────────────

  function moduleNodes(mod) {
    return (mod.topicIds || [])
      .map((id) => store.byId.get(id))
      .filter(Boolean)
      .sort((a, b) => a.layoutOrder - b.layoutOrder);
  }

  function moduleCount(mod) {
    return (mod.topicIds || []).length;
  }

  function syncModuleFilter() {
    const bar = $("moduleFilter");
    if (!bar) return;
    const mod = activeModule ? MODULE_BY_KEY.get(activeModule) : null;
    bar.hidden = !mod;
    if (!mod) return;
    $("moduleFilterText").textContent = `${mod.domain} › ${mod.label}`;
    const level = mod.gradeStart === mod.gradeEnd
      ? mod.gradeStart
      : `${mod.gradeStart}–${mod.gradeEnd}`;
    $("moduleFilterCount").textContent = `${moduleCount(mod)} 点 · ${level}`;
    bar.style.setProperty("--c", moduleColor(mod.key, mod.domain));
  }

  function clearModule(apply2 = true) {
    if (!activeModule) return;
    activeModule = null;
    syncModuleFilter();
    if (apply2) apply();
  }

  function pickModule(mod) {
    if (!mod) return;
    if (selected) closePanel();
    activeModule = mod.key;
    if (!active.has(mod.domain)) {
      active.add(mod.domain);
      syncSubjectButtons();
    }
    syncModuleFilter();
    closeStructure();
    hideHoverCard();
    apply();
  }

  /** 知识结构面板：领域 › 模块 › 知识点数量，一条可扫读的目录 */
  function buildStructure() {
    const host = $("structureList");
    if (!host) return;
    host.innerHTML = "";
    const domains = SUBJECT_ORDER.filter((d) => MODULES.some((m) => m.domain === d));
    const meta = $("structureMeta");
    if (meta) {
      meta.textContent = `${domains.length} 个领域、${MODULES.length} 个知识模块、${store.nodes.length} 个知识点`;
    }
    for (const domain of domains) {
      const mods = modulesOfDomain(domain);
      const total = mods.reduce((sum, m) => sum + moduleCount(m), 0);
      const group = document.createElement("section");
      group.className = "st-domain";
      group.style.setProperty("--c", domainGradient(domain));

      const head = document.createElement("button");
      head.type = "button";
      head.className = "st-domain-head";
      head.setAttribute("aria-expanded", "false");
      head.innerHTML =
        `<i class="st-dot"></i>` +
        `<span class="st-domain-name">${domain}</span>` +
        `<span class="st-domain-meta">${mods.length} 个模块／${total} 个知识点</span>` +
        `<span class="st-caret">›</span>`;
      head.onclick = () => {
        const open = group.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      };

      const list = document.createElement("div");
      list.className = "st-modules";
      for (const mod of mods) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "st-module";
        row.style.setProperty("--m", moduleColor(mod.key, mod.domain));
        row.innerHTML =
          `<span class="st-bar"></span>` +
          `<span class="st-module-body">` +
          `<strong>${mod.label}</strong>` +
          `<em>${mod.labelEs || ""}</em>` +
          `<small>${mod.hint || ""}</small>` +
          `</span>` +
          `<span class="st-module-count">${moduleCount(mod)} 点</span>`;
        row.title = `${mod.label} · ${mod.gradeStart}–${mod.gradeEnd}`;
        row.onclick = () => pickModule(mod);
        list.appendChild(row);
      }
      group.appendChild(head);
      group.appendChild(list);
      host.appendChild(group);
    }
  }

  function openStructure() {
    const el = $("structure");
    if (!el) return;
    hideHoverCard();
    buildStructure();
    const first = el.querySelector(".st-domain");
    if (first && !el.querySelector(".st-domain.open")) {
      first.classList.add("open");
      first.querySelector(".st-domain-head")?.setAttribute("aria-expanded", "true");
    }
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    document.body.classList.add("structure-open");
  }

  function closeStructure() {
    const el = $("structure");
    if (!el || el.hidden) return;
    el.classList.remove("open");
    document.body.classList.remove("structure-open");
    window.setTimeout(() => {
      if (!el.classList.contains("open")) el.hidden = true;
    }, 260);
  }

  // ── 悬浮卡片：替代 3d-force-graph 自带的黑色 tooltip ──
  function hoverCardEl() {
    return $("hoverCard");
  }

  function showHoverCard(n, x, y) {
    const el = hoverCardEl();
    if (!el || !n || selected) return;
    const mod = n.module ? MODULE_BY_KEY.get(n.module) : null;
    el.style.setProperty("--c", gradeColor(n));
    el.innerHTML =
      `<strong>${n.name}</strong>` +
      `<span class="hc-path">${n.subject}${mod ? " › " + mod.label : ""}</span>` +
      `<span class="hc-meta"><b>${n.grade}</b>${mod ? `<i>${moduleCount(mod)} 点</i>` : ""}</span>`;
    el.classList.add("show");
    moveHoverCard(x, y);
  }

  function moveHoverCard(x, y) {
    const el = hoverCardEl();
    if (!el || !el.classList.contains("show")) return;
    const pad = 16;
    const rect = el.getBoundingClientRect();
    let left = x + 18;
    let top = y + 14;
    if (left + rect.width > window.innerWidth - pad) left = x - rect.width - 18;
    if (top + rect.height > window.innerHeight - pad) top = y - rect.height - 14;
    el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
  }

  function hideHoverCard() {
    const el = hoverCardEl();
    if (el) el.classList.remove("show");
  }

  function initGraph() {
    Graph = ForceGraph3D()(document.getElementById("graph"))
      .backgroundColor("rgba(0,0,0,0)")
      .showNavInfo(false)
      // 库自带的 tooltip 是薰衣草色 15px 白字，专为深底设计，纸上完全看不清。
      // 关掉它，悬停信息改由 .hover-card 承担（纸片 + 等级色条）。
      .nodeLabel(() => "")
      .nodeRelSize(3.4)
      .nodeVal(nodeValue)
      .nodeResolution(10)
      .nodeColor(colorOf)
      .nodeVisibility(nodeIsVisible)
      .nodeOpacity(0.96)
      .linkColor(pathColor)
      .linkVisibility(graphLinkIsVisible)
      .linkWidth((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        if (s && t && trailPairs.has(pairKey(s, t))) return 1.5;
        if (activePathLinks().has(linkKey(s, t))) return 0.82;
        if (l.kind === "association") return 0.22;
        if (l.kind === "sequence") return 0.18;
        return l.strength === "soft" ? 0.33 : 0.68;
      })
      .linkOpacity(1)
      .linkDirectionalParticles(0)
      .linkDirectionalParticleWidth(0)
      .linkDirectionalParticleSpeed(0)
      .enableNodeDrag(false)
      .onNodeClick((n) => {
        // 直接在画布上点「已经连着的一环」，和点面板里的先修是同一种动作：
        // 应该算沿链走一步。之前一律当重新选点，镜头一重取景，看着就像跳到了别处。
        const step = selected && isAdjacent(selected, n.id);
        showNode(n.id, false, step ? { via: "link" } : {});
      })
      .onNodeHover((n) => {
        const canvas = Graph.renderer().domElement;
        canvas.style.cursor = n ? "pointer" : "grab";
        document.body.classList.toggle("node-hover", Boolean(n));
        if (n) {
          pauseSpin();
          showHoverCard(n, pointer.x, pointer.y);
        } else {
          hideHoverCard();
          if (!selected) resumeSpin(650);
        }
      })
      .onBackgroundClick(closePanel);

    syncGraphSize();
    initFocusMarker();
    initCosmicScene();
    const controls = Graph.controls();
    // up 一旦被改成朝下，整张图会上下颠倒；这里钉死一次，后面任何相机写入都不会翻
    Graph.camera().up.set(0, 1, 0);
    controls.autoRotate = false; // 改用手动绕轴，不依赖引擎闲置后的 OrbitControls
    controls.enablePan = false; // 保留旋转和缩放，防止整张图被平移到界面浮层下方
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.64;
    // 用户一旦自己拖拽/缩放，就放弃「跟着选中点取景」，把手交回去
    controls.addEventListener("start", () => {
      focusCam = null;
      focusOffset = null;
    });
    const canvas = Graph.renderer().domElement;
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      moveHoverCard(pointer.x, pointer.y);
    });
    canvas.addEventListener("pointerleave", hideHoverCard);
    canvas.addEventListener("pointerdown", () => {
      if (demoActive) stopDemo(false);
      pauseSpin();
      syncSpinFromCamera();
    });
    canvas.addEventListener("pointerup", () => {
      resumeSpin(1600);
    });
    canvas.addEventListener(
      "wheel",
      () => {
        pauseSpin();
        syncSpinFromCamera();
        resumeSpin(1600);
      },
      { passive: true }
    );
    startSpinLoop();
  }

  function buildDemoRoute() {
    const ageTargets = [6, 7, 8, 9, 11, 13, 14];
    return SUBJECT_ORDER.map((subject, index) => {
      const targetAge = ageTargets[index];
      const candidates = store.nodes.filter((node) => {
        if (node.subject !== subject) return false;
        const degree =
          (store.prereqOf.get(node.id) || []).length +
          (store.unlocks.get(node.id) || []).length;
        return degree > 0;
      });
      candidates.sort((a, b) => {
        const degreeA =
          (store.prereqOf.get(a.id) || []).length +
          (store.unlocks.get(a.id) || []).length;
        const degreeB =
          (store.prereqOf.get(b.id) || []).length +
          (store.unlocks.get(b.id) || []).length;
        const scoreA = degreeA * 7 + (a.centrality || 0) * 120 - Math.abs(a.ageMid - targetAge) * 2;
        const scoreB = degreeB * 7 + (b.centrality || 0) * 120 - Math.abs(b.ageMid - targetAge) * 2;
        return scoreB - scoreA;
      });
      return candidates[0]?.id;
    }).filter(Boolean);
  }

  function showDemoStep() {
    if (!demoActive || !demoRoute.length) return;
    const id = demoRoute[demoIndex % demoRoute.length];
    const node = store.byId.get(id);
    if (!node) return;
    showNode(id, true);
    $("demoStep").textContent = `自动演示 ${demoIndex + 1}/${demoRoute.length}`;
    $("demoTitle").textContent = node.name;
    $("demoMeta").textContent = `${node.grade} · ${node.domain} › ${node.moduleLabel}`;
    $("demoCaption").classList.add("show");
    demoTimer = window.setTimeout(() => {
      demoIndex = (demoIndex + 1) % demoRoute.length;
      showDemoStep();
    }, DEMO_STEP_TIME);
  }

  function startDemo() {
    if (demoActive || !store) return;
    finishIntro(true);
    if (entryRevealActive) finishEntryReveal(true);
    stopGradePlayback();
    setGradeLimit(GRADE_MAX, "demo");
    const needsAllSubjects = active.size !== SUBJECT_ORDER.length;
    if (selected) closePanel();
    if (needsAllSubjects) {
      active = new Set(SUBJECT_ORDER);
      syncSubjectButtons();
    }

    demoActive = true;
    demoIndex = 0;
    demoRoute = buildDemoRoute();
    document.body.classList.add("demo-mode");
    $("demoBtn").classList.add("on");
    $("demoBtn").innerHTML = '<span aria-hidden="true">■</span> 结束演示';
    $("demoBtn").setAttribute("aria-label", "结束自动演示");

    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    window.clearTimeout(demoTimer);
    if (needsAllSubjects) {
      apply(() => {
        if (demoActive) demoTimer = window.setTimeout(showDemoStep, 180);
      });
    } else {
      demoTimer = window.setTimeout(showDemoStep, 180);
    }
  }

  function stopDemo(closeFocus = true) {
    if (!demoActive) return;
    demoActive = false;
    window.clearTimeout(demoTimer);
    document.body.classList.remove("demo-mode");
    $("demoCaption").classList.remove("show");
    $("demoBtn").classList.remove("on");
    $("demoBtn").innerHTML = '<span aria-hidden="true">▶</span> 自动演示';
    $("demoBtn").setAttribute("aria-label", "开始自动演示");
    if (closeFocus) closePanel();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          status.textContent = "无法进入全屏模式";
        });
      } else {
        status.textContent = "当前浏览器不支持全屏";
      }
    } else {
      document.exitFullscreen?.();
    }
  }

  function syncFullscreenButton() {
    const button = $("fullscreenBtn");
    const isFullscreen = Boolean(document.fullscreenElement);
    button.textContent = isFullscreen ? "⊙" : "⛶";
    button.title = isFullscreen ? "退出全屏" : "进入全屏";
    button.setAttribute("aria-label", button.title);
  }

  function search(q) {
    if (!q) return;
    const lower = q.toLowerCase();
    // 西语数据只有 name / nameEs，没有 nameEn——旧写法直接 .nameEn.toLowerCase()
    // 会抛 TypeError，导致回车搜索静默失效。这里统一按「可能缺失」处理。
    const hit =
      store.nodes.find((n) => n.id === q) ||
      store.nodes.find((n) => {
        const fields = [n.name, n.nameEn, n.nameEs];
        return fields.some((v) => v && String(v).toLowerCase().includes(lower));
      });
    if (!hit) {
      status.textContent = `未找到「${q}」`;
      return;
    }
    ensureGradeVisible(hit);
    if (!active.has(hit.subject)) {
      active.add(hit.subject);
      syncSubjectButtons();
      apply(() => showNode(hit.id));
      return;
    }
    showNode(hit.id);
  }

  /** 命中的知识点若高于当前等级上限，先把标尺抬到那一级。
   *  否则 nodeIsVisible 会把它藏起来，用户看到的就是「搜到了但定位不到」。 */
  function ensureGradeVisible(n) {
    if (!n || !Number.isFinite(n.gradeLevel)) return;
    if (n.gradeLevel <= gradeLimit) return;
    setGradeLimit(n.gradeLevel, "search");
  }

  /** 把学科相关文案（标题/简介/统计/footer/搜索占位等）按 cfg 填充到 DOM。 */
  function applySubjectCopy(cfg, nodeCount, depCount, lessonCount) {
    document.title = cfg.title;
    $("eyebrowText").textContent = cfg.eyebrow;
    // introKicker 保持通用 — 开场页不应该学科特定
    $("search").placeholder = cfg.searchPlaceholder;
    $("footerNote").textContent = cfg.footer;
    $("heroCopy").innerHTML = cfg.heroCopy(nodeCount, depCount, lessonCount);
    $("heroStats").innerHTML =
      `<div><strong>${nodeCount}</strong><span>原子知识点</span></div>` +
      `<div><strong>${depCount}</strong><span>先修关系</span></div>` +
      `<div><strong>${lessonCount}</strong><span>课时数</span></div>` +
      (MODULES.length
        ? `<div><strong>${MODULES.length}</strong><span>知识模块</span></div>`
        : "");
    $("introCounts").innerHTML =
      `<div class="stat-tile">` +
        `<span class="stat-key">ATOM NODES</span>` +
        `<strong class="stat-num v-gold">${nodeCount}</strong>` +
        `<span class="stat-zh">原子知识点</span>` +
      `</div>` +
      `<div class="stat-tile">` +
        `<span class="stat-key">PREREQ EDGES</span>` +
        `<strong class="stat-num v-teal">${depCount}</strong>` +
        `<span class="stat-zh">先修关系</span>` +
      `</div>` +
      (MODULES.length
        ? `<div class="stat-tile">` +
            `<span class="stat-key">MODULES</span>` +
            `<strong class="stat-num v-gold">${MODULES.length}</strong>` +
            `<span class="stat-zh">知识模块</span>` +
          `</div>`
        : "");
    // 等级轴动态文案
    $("timelineLabel").textContent = cfg.gradeAxisLabel;
    $("gradeUnit").textContent = cfg.gradeUnit ? " " + cfg.gradeUnit : "";
    $("timelineDock").setAttribute("aria-label", cfg.gradeFilterLabel);
    $("ageSlider").setAttribute("aria-label", cfg.gradeSliderLabel);
  }

  /** 把学科配置绑定到模块级可变状态上。
   *  首次加载与学科切换共用，避免首屏等级轴沿用默认区间（曾导致 C1.2 被截断）。 */
  function bindSubjectConfig(cfg) {
    COLORS = cfg.colors;
    FAMILIES = cfg.families || null;
    SUBJECT_ORDER = cfg.subjectOrder;
    SUBJECT_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));
    DOMAIN_ZH = Object.fromEntries(SUBJECT_ORDER.map((s) => [s, s]));
    AGE_MIN = cfg.ageMin;
    AGE_MAX = cfg.ageMax;
    GRADE_MIN = cfg.gradeMin;
    GRADE_MAX = cfg.gradeMax;
    GRADE_PARSE = cfg.gradeParse;
    GRADE_LABEL = cfg.gradeLabel;
    GRADE_UNIT = cfg.gradeUnit;
    // gradeLimit 在模块初始化时按默认学科取值，这里必须同步，否则首屏停在 C1.1
    gradeLimit = GRADE_MAX;
    // active 也是按默认学科（英语七领域）初始化的，不重建就会漏掉新增领域——
    // 曾导致「篇章」33 个知识点一个都不渲染。
    active = new Set(SUBJECT_ORDER);
  }

  function switchSubject(subject) {
    if (subject === currentSubject) return;

    // 清理当前状态
    if (selected) closePanel();
    if (demoActive) stopDemo(true);
    if (gradePlaying) stopGradePlayback();
    if (entryRevealActive) finishEntryReveal(true);
    if (introStarted && !introFinished) finishIntro(true);

    currentSubject = subject;
    const cfg = SUBJECT_CONFIG[subject];

    // 重绑学科配置
    bindSubjectConfig(cfg);

    // 重置图谱状态
    active = new Set(SUBJECT_ORDER);
    gradeLimit = GRADE_MAX;
    focus = new Set();
    focusLinks = new Set();
    revealedFocus = new Set();
    revealedFocusLinks = new Set();
    prereqLinks = new Set();
    unlockLinks = new Set();
    selected = null;
    focusDimmed = false;
    focusHold = false;
    trail = [];
    trailSet = new Set();
    trailPairs = new Set();
    renderChainBar();
    ambientLinks = new Set();
    revealToken += 1;
    hideFocusMarker();

    // 加载新学科数据
    const data = cfg.data();
    store = normalize(
      data.topics,
      data.dependencies,
      data.lessonRecords,
      data.topicMetadata,
      data.lessonTopicLinks,
      data.curriculumSequence,
      data.modules
    );
    activeModule = null;
    syncModules();

    // 文案与统计面板
    applySubjectCopy(cfg, store.nodes.length, store.dependencyLinkCount, store.lessonsById.size);

    // 年级滑块
    const slider = $("ageSlider");
    slider.min = GRADE_MIN;
    slider.max = GRADE_MAX;
    slider.value = GRADE_MAX;
    const ticks = [];
    for (let g = GRADE_MIN; g <= GRADE_MAX; g++) ticks.push(g);
    $("gradeTicks").innerHTML = ticks.map((g) => `<span>${GRADE_LABEL(g)}</span>`).join("");
    $("ageValue").textContent = GRADE_LABEL(GRADE_MAX);
    $("ageAxisValue").textContent = GRADE_LABEL(GRADE_MIN);

    // 切换按钮状态
    document.querySelectorAll(".subject-switch button").forEach((b) => {
      const isActive = b.dataset.subject === subject;
      b.classList.toggle("on", isActive);
      b.setAttribute("aria-selected", isActive);
    });

    // 重建领域面板并重新渲染
    buildSubjects();
    apply();
  }

  async function main() {
    try {
      // 先把等级轴/配色绑定到当前学科，再读数据 —— 否则首屏沿用默认区间。
      bindSubjectConfig(SUBJECT_CONFIG[currentSubject]);
      const data = SUBJECT_CONFIG[currentSubject].data();
      if (data) {
        store = normalize(
          data.topics,
          data.dependencies,
          data.lessonRecords,
          data.topicMetadata,
          data.lessonTopicLinks,
          data.curriculumSequence,
          data.modules
        );
      } else {
        const [tr, dr, lr, mr, ltr, csr] = await Promise.all([
          fetch(`${DATA}/topics.json`),
          fetch(`${DATA}/dependencies.json`),
          fetch(`${DATA}/lesson-records.json`),
          fetch(`${DATA}/topic-metadata.json`),
          fetch(`${DATA}/lesson-topic-links.json`),
          fetch(`${DATA}/curriculum-sequence.json`),
        ]);
        if (!tr.ok || !dr.ok || !lr.ok || !mr.ok || !ltr.ok || !csr.ok) {
          throw new Error("知识图谱数据不可用");
        }
        store = normalize(
          await tr.json(),
          await dr.json(),
          await lr.json(),
          await mr.json(),
          await ltr.json(),
          await csr.json()
        );
      }
      syncModules();
      // 首屏就按当前学科填充文案与统计面板，避免 HTML 默认文案残留
      applySubjectCopy(
        SUBJECT_CONFIG[currentSubject],
        store.nodes.length,
        store.dependencyLinkCount,
        store.lessonsById.size
      );
      buildSubjects();
      initGraph();
      apply();

      $("closePanel").onclick = closePanel;
      $("skipIntro").onclick = () => finishIntro(true);
      $("introEnter") && ($("introEnter").onclick = () => finishIntro(true));
      $("introDemo")  && ($("introDemo").onclick  = () => { finishIntro(true); setTimeout(startDemo, 320); });
      $("demoBtn").onclick = () => {
        if (demoActive) stopDemo(true);
        else startDemo();
      };
      $("fullscreenBtn").onclick = toggleFullscreen;
      document.addEventListener("fullscreenchange", syncFullscreenButton);
      let focusResizeTimer = 0;
      const relayout = (delay) => {
        window.clearTimeout(focusResizeTimer);
        focusResizeTimer = window.setTimeout(() => {
          syncGraphSize();
          // 画布尺寸要等绘制一帧才真正生效，紧接着取景会按旧尺寸算，
          // 结果整张图落偏（矮窗口下还会顶出画面）。
          requestAnimationFrame(() => {
            if (selected) frameFocusView(focus, 360);
            else frameGraph(Graph.graphData().nodes, 360);
          });
        }, delay);
      };
      window.addEventListener("resize", () => relayout(140));
      // 容器本身也可能变（字体加载完、面板挤压、旋屏），一起盯住
      if (window.ResizeObserver) {
        new ResizeObserver(() => relayout(80)).observe($("graph"));
      }
      $("ageSlider").oninput = (event) => {
        stopGradePlayback();
        setGradeLimit(event.target.value, "manual");
      };
      $("agePlay").onclick = () => {
        if (gradePlaying) stopGradePlayback();
        else startGradePlayback();
      };
      $("toggleAll").onclick = () => {
        if (selected) closePanel();
        active = new Set(SUBJECT_ORDER);
        activeModule = null;
        syncSubjectButtons();
        syncModuleFilter();
        apply();
      };
      $("structureBtn").onclick = () => {
        if (selected) closePanel();
        openStructure();
      };
      $("dockStructure").onclick = () => {
        if (selected) closePanel();
        openStructure();
      };
      $("closeStructure").onclick = closeStructure;
      $("expandAll").onclick = () => {
        const groups = [...$("structureList").querySelectorAll(".st-domain")];
        const allOpen = groups.every((g) => g.classList.contains("open"));
        groups.forEach((g) => {
          g.classList.toggle("open", !allOpen);
          g.querySelector(".st-domain-head")?.setAttribute("aria-expanded", allOpen ? "false" : "true");
        });
        $("expandAll").textContent = allOpen ? "全部展开" : "全部收起";
      };
      $("structure").addEventListener("click", (e) => {
        if (e.target === $("structure")) closeStructure();
      });
      $("moduleFilterClear").onclick = () => clearModule();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (!$("structure").hidden) closeStructure();
          else if (activeModule) clearModule();
        }
      });
      document.querySelectorAll(".subject-switch button").forEach((b) => {
        b.onclick = () => switchSubject(b.dataset.subject);
      });
      let t;
      // ── 搜索自动补全：候选下拉 + 键盘导航 + 点击选中 ──
      const searchInput = $("search");
      const suggestBox = $("searchSuggest");
      const searchWrapEl = suggestBox.closest(".search-wrap");
      let suggestItems = [];
      let suggestIndex = -1;
      const escapeHtml = (s) =>
        String(s).replace(/[&<>"']/g, (c) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        }[c]));

      function hideSuggest() {
        suggestBox.hidden = true;
        suggestBox.innerHTML = "";
        suggestItems = [];
        suggestIndex = -1;
      }

      function renderSuggest(q) {
        const lower = q.toLowerCase();
        if (!lower) { hideSuggest(); return; }
        const hits = [];
        for (const n of store.nodes) {
          if (
            n.name.toLowerCase().includes(lower) ||
            (n.nameEn || "").toLowerCase().includes(lower) ||
            (n.nameEs || "").toLowerCase().includes(lower)
          ) {
            hits.push(n);
            if (hits.length >= 8) break;
          }
        }
        if (!hits.length) { hideSuggest(); return; }
        suggestItems = hits;
        suggestIndex = -1;
        suggestBox.innerHTML = hits
          .map((n) => {
            // 只留等级与领域：模块名太长会把整行撑爆，候选列表要的是「一眼区分」
            const meta = [n.grade, n.domain].filter(Boolean).join("　");
            return (
              `<li role="option" aria-selected="false">` +
              `<span class="sg-name">${escapeHtml(n.name)}</span>` +
              `<span class="sg-meta">${escapeHtml(meta)}</span>` +
              `</li>`
            );
          })
          .join("");
        suggestBox.hidden = false;
      }

      function updateSuggestActive() {
        [...suggestBox.children].forEach((li, i) => {
          li.classList.toggle("active", i === suggestIndex);
          li.setAttribute("aria-selected", i === suggestIndex ? "true" : "false");
        });
      }

      function pickSuggest(i) {
        const n = suggestItems[i];
        if (!n) return;
        hideSuggest();
        searchInput.value = "";
        ensureGradeVisible(n);
        if (!active.has(n.subject)) {
          active.add(n.subject);
          syncSubjectButtons();
          apply(() => showNode(n.id));
        } else {
          showNode(n.id);
        }
      }

      suggestBox.addEventListener("mousedown", (e) => {
        e.preventDefault(); // 防止 input 失焦打断点击
        const li = e.target.closest("li");
        if (li) pickSuggest([...suggestBox.children].indexOf(li));
      });
      document.addEventListener("click", (e) => {
        if (searchWrapEl && !searchWrapEl.contains(e.target)) hideSuggest();
      });

      $("search").oninput = (e) => {
        clearTimeout(t);
        const v = e.target.value.trim();
        if (!v) {
          hideSuggest();
          status.textContent = `${store.nodes.length} 个知识点已连接`;
          return;
        }
        t = setTimeout(() => renderSuggest(v), 120);
      };
      $("search").onkeydown = (e) => {
        // 中文输入法组字期间的回车是「选词」，不是提交
        if (e.isComposing || e.keyCode === 229) return;
        if (suggestBox.hidden) {
          if (e.key === "Enter") search(e.target.value.trim());
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          suggestIndex = Math.min(suggestIndex + 1, suggestItems.length - 1);
          updateSuggestActive();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          suggestIndex = Math.max(suggestIndex - 1, 0);
          updateSuggestActive();
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (suggestIndex >= 0) pickSuggest(suggestIndex);
          else {
            hideSuggest();
            search(e.target.value.trim());
          }
        } else if (e.key === "Escape") {
          hideSuggest();
        }
      };
    } catch (e) {
      console.error(e);
      $("intro").classList.add("hide");
      document.body.classList.add("scene-ready");
      status.textContent = "加载失败";
      panelEmpty.innerHTML = `<strong>知识图谱加载失败</strong><p>${e.message}</p>`;
      openPanel();
    }
  }

  main();

  // 截图/验收用的定帧钩子：带 #shot 打开时，跳过开场并直接落定
  if (SHOT) {
    try {
      if (location.hash.indexOf("structure") >= 0) {
        const sb = document.getElementById("structureBtn");
        if (sb) sb.click();
      }
      if (location.hash.indexOf("suggest") >= 0) {
        const si = document.getElementById("search");
        si.value = "虚拟式";
        si.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (location.hash.indexOf("search") >= 0) {
        // 验收：#shot-search 走一遍真实搜索路径（含等级抬升）
        const q = decodeURIComponent(location.hash.split("q=")[1] || "虚拟式现在时的构成");
        if (location.hash.indexOf("limit") >= 0) setGradeLimit(GRADE_MIN, "search");
        search(q);
      }
      if (location.hash.indexOf("hover") >= 0) {
        const pick =
          store.nodes.find((n) => n.grade === "B1.2") ||
          store.nodes.find((n) => (store.prereqOf.get(n.id) || []).length >= 2) ||
          store.nodes[0];
        if (pick) showHoverCard(pick, 620, 430);
      }
      if (location.hash.indexOf("panel") >= 0) {
        const pick = store.nodes.find((n) => (store.prereqOf.get(n.id) || []).length >= 2) || store.nodes[0];
        if (pick) showNode(pick.id);
      }
      finishEntryReveal(true);
      document.getElementById("intro").classList.add("hide");
      document.getElementById("intro").hidden = true;
    } catch (err) { /* 忽略 */ }
  }

  // #diag 打开时注入几何自检：相机 / 选中点 / 焦点环三者的屏幕落点是否一致
  if (location.hash.indexOf("diag") >= 0) {
    window.__diag = () => {
      const cam = Graph && Graph.camera();
      const rect = $("graph").getBoundingClientRect();
      const cv = Graph && Graph.renderer && Graph.renderer().domElement;
      const node = Graph && Graph.graphData().nodes.find((n) => n.id === selected);
      const obj = node && node.__threeObj;
      return {
        canvasCss: cv && [cv.clientWidth, cv.clientHeight],
        canvasAttr: cv && [cv.width, cv.height],
        graphRect: [rect.left, rect.top, rect.width, rect.height],
        camAspect: cam && cam.aspect,
        camPos: cam && cam.position.toArray().map((v) => +v.toFixed(1)),
        target: Graph && Graph.controls() && Graph.controls().target.toArray().map((v) => +v.toFixed(1)),
        nodePos: node && [node.x, node.y, node.z].map((v) => +(+v).toFixed(1)),
        objPos: obj && obj.position.toArray().map((v) => +v.toFixed(1)),
        markerPos: focusMarker && focusMarker.position.toArray().map((v) => +v.toFixed(1)),
        markerVisible: focusMarker && focusMarker.visible,
        proj: node && Graph.graph2ScreenCoords(node.x, node.y, node.z),
        visible: visibleBox(canvasBox()),
        panelLeft: $("panel").getBoundingClientRect().left,
      };
    };

    // 整张图在屏幕上的包围盒 / 形心，用来判断「图是不是跑到右边去了」
    window.__trail = () => ({
      trail: trail.slice(),
      pairs: [...trailPairs],
      edgeCount: Graph.graphData().links.filter((l) => {
        const a = typeof l.source === "object" ? l.source.id : l.source;
        const b = typeof l.target === "object" ? l.target.id : l.target;
        return a && b && trailPairs.has(pairKey(a, b));
      }).length,
      colored: [...trailPairs],
    });
    window.__screen = (name) => {
      const n = Graph.graphData().nodes.find((x) => x.name === name);
      if (!n) return null;
      const q = Graph.graph2ScreenCoords(n.x || 0, n.y || 0, n.z || 0);
      const r = $("graph").getBoundingClientRect();
      return [r.left + q.x, r.top + q.y];
    };
    window.__geo = () => {
      const cam = Graph.camera();
      const ctl = Graph.controls();
      const cv = Graph.renderer().domElement;
      const cr = cv.getBoundingClientRect();
      const gr = $("graph").getBoundingClientRect();
      window.__fov = { fov: cam.fov, aspect: cam.aspect, zoom: cam.zoom, cr: [Math.round(cr.width), Math.round(cr.height)] };
      const nodes = Graph.graphData().nodes;
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, sx = 0, sy = 0, n = 0;
      for (const nd of nodes) {
        const p = Graph.graph2ScreenCoords(nd.x, nd.y, nd.z);
        if (!p || !isFinite(p.x) || !isFinite(p.y)) continue;
        if (p.x < minx) minx = p.x;
        if (p.x > maxx) maxx = p.x;
        if (p.y < miny) miny = p.y;
        if (p.y > maxy) maxy = p.y;
        sx += p.x; sy += p.y; n++;
      }
      // 各等级在屏幕上的平均 y：判断整张图有没有被上下翻转
      const acc = {};
      for (const nd of nodes) {
        const q = Graph.graph2ScreenCoords(nd.x, nd.y, nd.z);
        if (!q || !isFinite(q.y)) continue;
        const k = nd.grade || "?";
        (acc[k] = acc[k] || []).push(q.y);
      }
      window.__levels = Object.fromEntries(
        Object.keys(acc).sort().map((k) => [k, Math.round(acc[k].reduce((a, v) => a + v, 0) / acc[k].length)])
      );
      window.__fit = lastFitInfo;

      return {
        graph: [gr.left, gr.top, gr.width, gr.height].map(Math.round),
        canvas: [cr.left, cr.top, cr.width, cr.height].map(Math.round),
        canvasAttr: [cv.width, cv.height],
        count: n,
        box: [minx, maxx, miny, maxy].map(Math.round),
        centroid: [Math.round(sx / n), Math.round(sy / n)],
        camPos: cam.position.toArray().map(Math.round),
        target: ctl.target.toArray().map(Math.round),
        dist: Math.round(cam.position.distanceTo(ctl.target)),
      };
    };
  }

})();
