document.getElementById("save").addEventListener("click", () => {
	const target_url_pattern = document.getElementById("target_url_pattern").value;
	const target_selector = document.getElementById("target_selector").value;
	const regex_pattern = document.getElementById("regex_pattern").value;
	const replacement = document.getElementById("replacement").value;

	chrome.storage.sync.set({ target_url_pattern, target_selector, regex_pattern, replacement }, () => {
		const status = document.getElementById("status");
    	status.textContent = "保存しました！";
    	setTimeout(() => status.textContent = "", 2000);
  	});
});

// 保存されている値を読み込み
window.addEventListener("DOMContentLoaded", () => {
	chrome.storage.sync.get(["target_url_pattern","target_selector","regex_pattern","replacement"], (data) => {
		document.getElementById("target_url_pattern").value = data.target_url_pattern || "";
		document.getElementById("target_selector").value = data.target_selector || "";
		document.getElementById("regex_pattern").value = data.regex_pattern || "";
		document.getElementById("replacement").value = data.replacement || "";
	});
});
