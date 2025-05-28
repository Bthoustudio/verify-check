
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("query-form");
  const input = document.getElementById("sn");
  const resultBox = document.getElementById("result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sn = input.value.trim();
    if (!sn) return;

    resultBox.innerHTML = "查詢中...";

    try {
      const response = await fetch("data/data.json");
      const data = await response.json();

      const record = data.find(item => item["瓶號"] === sn);

      if (!record) {
        resultBox.innerHTML = `
          <h2 class="text-red-600 font-semibold">⚠️ 查無此瓶號資料</h2>
          <p>請確認您輸入的瓶號是否正確，或聯繫水宅客服。</p>
        `;
        return;
      }

      const dateStr = record["領取時間"]
        ? new Date(record["領取時間"]).toLocaleDateString("zh-TW", { year: "numeric", month: "numeric", day: "numeric" })
        : "";

      const revoke = record["是否回收"] === "是";
      const now = new Date();
      const received = record["領取時間"] ? new Date(record["領取時間"]) : null;
      const sixMonthsPassed = received && ((now - received) > (180 * 24 * 60 * 60 * 1000));

      const revokeTime = record["回收時間"]
        ? new Date(record["回收時間"]).toLocaleDateString("zh-TW", { year: "numeric", month: "numeric", day: "numeric" })
        : "-";

      let validStatus = revoke
        ? '<span class="text-red-600 font-semibold">已註銷</span>'
        : '<span class="text-green-600 font-semibold">是</span>';

      let extraWarning = (!revoke && sixMonthsPassed)
        ? '<p class="text-yellow-600 font-semibold">⚠️ 領取時間已超過半年，請向總部申請更換。</p>'
        : "";

      resultBox.innerHTML = `
        <div class="border-t pt-4 mt-4 space-y-1">
          <h3 class="text-lg font-semibold text-green-600">✅ 查驗成功：${record["瓶號"]}</h3>
          <p>使用店家：${record["使用店家"]}</p>
          <p>型號：${record["型號"]}</p>
          <p>領取時間：${dateStr}</p>
          <p>是否有效：${validStatus}</p>
          <p>註銷時間：${revokeTime}</p>
          ${extraWarning}
        </div>
      `;
    } catch (error) {
      console.error("資料載入錯誤：", error);
      resultBox.innerHTML = "<p class='text-red-600'>查詢失敗，請稍後再試。</p>";
    }
  });

  const params = new URLSearchParams(window.location.search);
  const preset = params.get("sn");
  if (preset) {
    input.value = preset;
    form.dispatchEvent(new Event("submit"));
  }
});
