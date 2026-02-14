/* =========================
   FILE UPLOAD (STABLE)
========================= */
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

/* =========================
   BACKGROUND OPTION TOGGLE
========================= */
let selectedBg = "black";

const choices = document.querySelectorAll(".choice");

choices.forEach(choice => {
  choice.addEventListener("click", () => {
    choices.forEach(c => c.classList.remove("active"));
    choice.classList.add("active");
    selectedBg = choice.innerText.toLowerCase();
  });
});

/* =========================
   PREVIEW (IMAGE / VIDEO)
========================= */
const preview = document.querySelector(".preview");
const previewText = document.getElementById("previewText");
const downloadBtn = document.querySelector(".download");

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Only images for now
  if (!file.type.startsWith("image")) {
    alert("Images only for now ra 🙂");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const preview = document.querySelector(".preview");
  const previewText = document.getElementById("previewText");
  const downloadBtn = document.querySelector(".download");

  previewText.innerText = "processing ra…";

  try {
    const res = await fetch("http://127.0.0.1:8000/remove-bg", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Server error");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    preview.innerHTML = "";
    const img = document.createElement("img");
    img.src = url;
    preview.appendChild(img);

    downloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = "cutout.png";
      a.click();
    };

  } catch (err) {
    previewText.innerText = "something broke ra 🥲";
    console.error(err);
  }
});

/* =========================
   STICKER FLOAT + CHAOS
========================= */
const stickers = document.querySelectorAll(".sticker");
const stickerData = [];

stickers.forEach((sticker, i) => {
  const rotate = Math.random() * 20 - 10;
  const baseY = Math.random() * 20;

  stickerData.push({ el: sticker, rotate, baseY, dir: 1 });

  setInterval(() => {
    const d = stickerData[i];
    d.dir *= -1;
    sticker.style.transform =
      `rotate(${d.rotate + d.dir * 2}deg)
       translateY(${d.baseY + d.dir * 6}px)`;
  }, 2000 + i * 500);
});

/* =========================
   SCROLL JITTER (SAFE)
========================= */
window.addEventListener("scroll", () => {
  const y = window.scrollY;

  stickerData.forEach(d => {
    const jitter = (y * 0.03) % 8;
    d.el.style.transform =
      `rotate(${d.rotate}deg) translate(${jitter}px, ${d.baseY}px)`;
  });
});

