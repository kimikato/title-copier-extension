(async () => {
	const { target_url_pattern, target_selector, regex_pattern, replacement } = await chrome.storage.sync.get(
		["target_url_pattern","target_selector","regex_pattern","replacement"]
	);

	if (!target_url_pattern || !target_selector) return;

	try {
    	if (!new RegExp(target_url_pattern).test(location.href)) return;
	} catch(e) {
    	console.error("URL正規表現エラー:", e);
    	return;
  	}

  	const el = document.querySelector(target_selector);
	if (!el) return;

  	let text = el.textContent.trim();

  	if (regex_pattern) {
    	try {
      		text = text.replace(new RegExp(regex_pattern, "g"), replacement || "");
    	} catch(e) {
      		console.error("正規表現置換エラー:", e);
    	}
  	}

	// コピー用ボタン生成
  	const btn = document.createElement("button");
  	btn.textContent = "コピー";
  	btn.style.position = "fixed";
  	btn.style.top = "10px";
  	btn.style.right = "10px";
  	btn.style.zIndex = 9999;
  	btn.style.padding = "5px 10px";
  	btn.style.background = "#4CAF50";
  	btn.style.color = "#fff";
  	btn.style.border = "none";
  	btn.style.borderRadius = "3px";
  	btn.style.cursor = "pointer";

  	btn.addEventListener("click", async () => {
    	try {
      		await navigator.clipboard.writeText(text);
      		showToast("コピーしました！");
    	} catch (err) {
      		console.error("コピー失敗:", err);
      		showToast("コピーに失敗しました");
    	}
  	});

	document.body.appendChild(btn);

  	// トースト表示
  	function showToast(msg) {
    	const toast = document.createElement("div");
    	toast.textContent = msg;
   		toast.style.position = "fixed";
    	toast.style.top = "50px";
    	toast.style.right = "10px";
    	toast.style.background = "#333";
    	toast.style.color = "#fff";
    	toast.style.padding = "5px 10px";
    	toast.style.borderRadius = "3px";
    	toast.style.zIndex = 10000;
    	toast.style.opacity = 0;
    	toast.style.transition = "opacity 0.5s";
    	document.body.appendChild(toast);
    	requestAnimationFrame(() => toast.style.opacity = 1);
    	setTimeout(() => {
      		toast.style.opacity = 0;
      		setTimeout(() => toast.remove(), 500);
    	}, 2000);
  	}
})();
