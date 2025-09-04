// public/widget.js
(function() {
  const iframe = document.createElement("iframe");
  iframe.src = "https://codream-ai-chatbot.vercel.app/"; // your deployed Vercel app URL
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "350px";
  iframe.style.height = "500px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  iframe.style.zIndex = "9999";
  iframe.style.display = "none";

  const button = document.createElement("div");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.background = "#007bff";
  button.style.color = "white";
  button.style.padding = "14px";
  button.style.borderRadius = "50%";
  button.style.cursor = "pointer";
  button.style.zIndex = "10000";

  button.onclick = () => {
    iframe.style.display = iframe.style.display === "none" ? "block" : "none";
  };

  document.body.appendChild(button);
  document.body.appendChild(iframe);
})();
