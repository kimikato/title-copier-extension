(async () => {
  const { rules = [] } = await chrome.storage.sync.get("rules");
  if (!Array.isArray(rules) || rules.length === 0) return;

  // URL監視（SPA対策）
  const on_url_change = (() => {
    let last = location.href;
    return (cb) => {
      const fire_if_changed = () => {
        if (location.href !== last) {
          last = location.href;
          cb();
        }
      };
      // pushState/replaceState をフック
      const wrap = (type) => {
        const orig = history[type];
        history[type] = function () {
          const ret = orig.apply(this, arguments);
          fire_if_changed();
          return ret;
        };
      };
      wrap("pushState");
      wrap("replaceState");
      window.addEventListener("popstate", fire_if_changed);

      // 初回適用
      cb();
    };
  })();

  // 要素が現れるまで待つ
  function wait_for_element(selector, { root = document.body, timeout = 15000 } = {}) {
    return new Promise((resolve, reject) => {
      const found = root.querySelector(selector);
      if (found) return resolve(found);

      const obs = new MutationObserver(() => {
        const el = root.querySelector(selector);
        if (el) { obs.disconnect(); resolve(el); }
      });
      obs.observe(root, { childList: true, subtree: true });

      setTimeout(() => { obs.disconnect(); reject(new Error("timeout")); }, timeout);
    });
  }

  // ページに合うルールを探す（options.js のキー名と一致）
  function find_match_rule() {
    for (const r of rules) {
      try {
        if (r.target_url_pattern && new RegExp(r.target_url_pattern).test(location.href)) {
          return r;
        }
      } catch (e) {
        // 無効な正規表現はスキップ
      }
    }
    return null;
  }

  async function apply_for_current_page() {
    // 既存ボタンを掃除（増殖防止）※ querySelectorAll が正解
    document.querySelectorAll("[data-title-copier-btn]").forEach(b => b.remove());

    const rule = find_match_rule();
    if (!rule) return;

    let el;
    try {
      el = await wait_for_element(rule.target_selector);
    } catch {
      return; // 見つからなければ諦める
    }

    // ボタン作成
    const btn = document.createElement("button");
    btn.textContent = "コピー";
    btn.setAttribute("data-title-copier-btn", "1");
    Object.assign(btn.style, {
      zIndex: "999999",
      padding: "5px 10px",
      marginLeft: "8px",
      background: "#4CAF50",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    });

    // タイトル文字を取得（ボタン混入回避：TEXT_NODEのみ集計）
    const get_processed_text = () => {
      let raw = "";
      el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) raw += n.textContent; });
      let text = (raw || el.textContent || "").trim();

      const pattern = rule.regex_pattern;
      if (pattern) {
        try {
          text = text.replace(new RegExp(pattern, "g"), rule.replacement ?? "");
        } catch (e) {
          console.error("正規表現エラー:", e);
        }
      }
      return text;
    };

    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(get_processed_text());
        show_toast("✅ コピーしました");
      } catch {
        show_toast("⚠️ コピーに失敗しました");
      }
    });

    // タイトル“直後”に配置（見た目は横、DOMは分離 → textContent汚染しにくい）
    // el.insertAdjacentElement("afterend", btn);
    // もし el 内に入れたいならこちら：
    el.appendChild(btn);
  }

  function show_toast(msg) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: "fixed",
      top: "50px",
      right: "10px",
      background: "#333",
      color: "#fff",
      padding: "6px 10px",
      borderRadius: "3px",
      zIndex: "10000",
      opacity: "0",
      transition: "opacity .5s ease"
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => (toast.style.opacity = "1"));
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 1800);
  }

  // 初回 & URL 変化ごとに適用
  on_url_change(apply_for_current_page);
})();
