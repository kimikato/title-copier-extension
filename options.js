const rules_element = document.getElementById("rules");
const template = document.getElementById("rule_template");
const status_element = document.getElementById("status");

// ルールの新規追加
document.getElementById("add_rule").addEventListener("click", () => {
	add_rule({});
});

// ルールの保存
document.getElementById("save_all").addEventListener("click", async () => {
	const rules = collect_rules_from_DOM();
	await chrome.storage.sync.set({ rules });
	toast("保存しました。");
});

// ルールをJSONでエクスポート
document.getElementById("export_json").addEventListener("click", async () => {
	const { rules = [] } = await chrome.storage.sync.get("rules");
	const blob = new Blob([JSON.stringify(rules, null, 2)], {type: 'application/json'});
	const url = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement("a"), {href: url, download: "title-copier-extension-rules.json"});
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
});

// ルールをJSONでインポート
document.getElementById("import_json").addEventListener("click", async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!Array.isArray(json)) throw new Error("Invalid JSON (must be an array)");
      rules_element.innerHTML = "";
      json.forEach(r => add_rule(r));
      await chrome.storage.sync.set({ rules: collect_rules_from_DOM() });
      toast("インポートしました！");
    } catch (e) {
      toast("インポート失敗: " + e.message);
    }
  };
  input.click();
});

// トースト機能
function toast(message) {
	status_element.textContent = message;
	setTimeout(() => status_element.textContent = "", 1800);
};

// ルールの追加
function add_rule(rule) {
	const node = template.content.firstElementChild.cloneNode(true);
	node.querySelector(".target_url_pattern").value = rule.target_url_pattern || "";
	node.querySelector(".target_selector").value = rule.target_selector || "";
	node.querySelector(".regex_pattern").value = rule.regex_pattern || "";
	node.querySelector(".replacement").value = rule.replacement || "";

	node.querySelector(".btn-remove").addEventListener("click", () => {
		node.remove();
	});

	node.querySelector(".btn-test").addEventListener("click", () => {
		const sample = node.querySelector(".test_input").value ?? "";
		const pattern = node.querySelector(".regex_pattern").value ?? "";
		const replacement = node.querySelector(".replacement").value ?? "";
		let out = sample;
		if ( pattern ) {
			try {
				out = sample.replace(new RegExp(pattern, "g"), replacement);
			} catch (e) {
				out = `正規表現エラー : ${e.message}`;
			}
		}
		node.querySelector(".test_result").textContent = out;
	});

	rules_element.appendChild(node);
};

// DOMからruleの取得
function collect_rules_from_DOM() {
	return Array.from(rules_element.querySelectorAll(".rule")).map(rule_node => ({
		target_url_pattern: rule_node.querySelector(".target_url_pattern").value.trim(),
		target_selector: rule_node.querySelector(".target_selector").value.trim(),
		regex_pattern: rule_node.querySelector(".regex_pattern").value.trim(),
		replacement: rule_node.querySelector(".replacement").value ?? ""
	})).filter(r => r.target_url_pattern && r.target_selector);
}

// 初期ロード：単一設定からの移行もサポート
(async function init() {
	const store = await chrome.storage.sync.get(["rules", "target_url_pattern", "target_selector", "regex_pattern", "replacement"]);
	let rules = store.rules;

	// 旧キーで保存されていたら移行
	if ((!rules || !Array.isArray(rules) || rules.length === 0) &&
		(store.target_url_pattern || store.target_selector || store.regex_pattern || store.replacement !== undefined)) {
			rules = [{
				target_url_pattern: store.target_url_pattern || "",
				target_selector: store.target_selector || "",
				regex_pattern: store.regex_pattern || "",
				replacement: store.replacement ?? ""
			}].filter(r => r.target_url_pattern && r.target_selector);

			await chrome.storage.sync.set({ rules });
		}

		rules_element.innerHTML = "";
		(rules && rules.length ? rules : [{}]).forEach(r => add_rule(r));
})();
