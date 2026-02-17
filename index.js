import express from "express";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const app = express();
app.use(express.json());

const economyPath = path.join("./economy.json");

// Função segura para ler JSON
function lerJSON(caminho){
  if(!fs.existsSync(caminho)) fs.writeFileSync(caminho, JSON.stringify({usuarios:{}}, null, 2));
  return JSON.parse(fs.readFileSync(caminho, "utf8"));
}

// Emoji da Nina estilo card
const ninaEmoji = "💖";

// Endpoint do perfil
app.post("/perfil", async (req, res) => {
  const { userId, username, avatar, banner } = req.body;

  const economia = lerJSON(economyPath);
  if(!economia.usuarios[userId]) economia.usuarios[userId] = {
    nicoins: Math.floor(Math.random() * 20000) + 10000
  };
  const userData = economia.usuarios[userId];

  // Canvas
  const width = 800;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fundo do card (banner ou padrão)
  const bg = banner || "https://i.imgur.com/5vK0X1g.png";
  const bannerImg = await loadImage(bg);
  ctx.drawImage(bannerImg, 0, 0, width, height);

  // Fundo semitransparente pra destacar info
  ctx.fillStyle = "rgba(255, 245, 203, 0.7)"; // bege suave
  ctx.fillRect(20, 20, width - 40, height - 40);

  // Avatar
  const avatarImg = await loadImage(avatar);
  ctx.beginPath();
  ctx.arc(100, 150, 80, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImg, 20, 70, 160, 160);
  ctx.restore?.();

  // Texto: username
  ctx.fillStyle = "#000";
  ctx.font = "bold 36px Sans";
  ctx.fillText(`${username} ${ninaEmoji}`, 200, 120);

  // Texto: NiCoins
  ctx.font = "bold 28px Sans";
  ctx.fillText(`💰 NiCoins: ${userData.nicoins}`, 200, 180);

  // Envia imagem
  const buffer = canvas.toBuffer("image/png");
  res.setHeader("Content-Type", "image/png");
  res.send(buffer);
});

// Start do servidor
app.listen(process.env.PORT || 3000, () => {
  console.log("🐱✨ API de Perfil Card rodando!");
});
