import tpl601Bg from "@/static/invitation/tpl601.png";
import tpl602Bg from "@/static/invitation/tpl602.png";
import tpl603Bg from "@/static/invitation/tpl603.png";
import tpl604Bg from "@/static/invitation/tpl604.png";
import tpl605Bg from "@/static/invitation/tpl605.png";
import tpl606Bg from "@/static/invitation/tpl606.png";

const templates = [
  {
    id: "tpl601",
    name: "炫彩紫",
    bgImg: tpl601Bg,
    aspectRatio: 750 / 1624,
    slots: {
      avatar: { cx: 0.808, cy: 0.207, r: 0.146 },
      inviterName: { cx: 0.795, cy: 0.311, fontPct: 0.0197, color: "#FFFFFF", bold: true, maxLen: 8 },
      qrcode: { cx: 0.763, cy: 0.513, size: 0.271 },
      liveName: { x: 0.211, y: 0.475, fontPct: 0.016, color: "#FFFFFF", maxLen: 10 },
      time: { x: 0.211, y: 0.605, fontPct: 0.016, color: "#FFFFFF" },
    },
  },
  {
    id: "tpl602",
    name: "红运福利",
    bgImg: tpl602Bg,
    aspectRatio: 750 / 1624,
    slots: {
      avatar: { cx: 0.500, cy: 0.454, r: 0.140 },
      inviterName: { cx: 0.496, cy: 0.539, fontPct: 0.0209, color: "#0E0F0E", bold: true, maxLen: 8 },
      qrcode: { cx: 0.748, cy: 0.655, size: 0.333 },
      liveName: { x: 0.196, y: 0.623, fontPct: 0.016, color: "#1D1D1C", maxLen: 10 },
      time: { x: 0.196, y: 0.724, fontPct: 0.016, color: "#1D1D1C" },
    },
  },
  {
    id: "tpl603",
    name: "紫调简约",
    bgImg: tpl603Bg,
    aspectRatio: 750 / 1624,
    slots: {
      avatar: { cx: 0.507, cy: 0.438, r: 0.104 },
      inviterName: { cx: 0.503, cy: 0.505, fontPct: 0.0209, color: "#0E0F0E", bold: true, maxLen: 8 },
      qrcode: { cx: 0.767, cy: 0.611, size: 0.283 },
      liveName: { x: 0.212, y: 0.605, fontPct: 0.016, color: "#1D1D1C", maxLen: 10 },
      time: { x: 0.212, y: 0.700, fontPct: 0.016, color: "#1D1D1C" },
    },
  },
  {
    id: "tpl604",
    name: "简约邀请",
    bgImg: tpl604Bg,
    aspectRatio: 750 / 1334,
    slots: {
      avatar: { cx: 0.323, cy: 0.321, r: 0.07 },
      inviterName: { x: 0.412, y: 0.303, fontPct: 0.021, color: "#FFFFFF", maxLen: 10 },
      qrcode: { cx: 0.504, cy: 0.849, size: 0.232 },
      liveName: { cx: 0.5, cy: 0.660, fontPct: 0.030, color: "#FFFFFF", bold: true, maxLen: 10 },
      time: { cx: 0.5, cy: 0.740, fontPct: 0.0195, color: "#FFFFFF" },
    },
  },
  {
    id: "tpl605",
    name: "蓝调邀请",
    bgImg: tpl605Bg,
    aspectRatio: 750 / 1333,
    slots: {
      avatar: { cx: 0.188, cy: 0.307, r: 0.08 },
      inviterName: { x: 0.287, y: 0.290, fontPct: 0.0225, color: "#122D6C", maxLen: 10 },
      qrcode: { cx: 0.499, cy: 0.848, size: 0.208 },
      liveName: { x: 0.229, y: 0.655, fontPct: 0.021, color: "#122D6C", bold: true, maxLen: 12 },
      time: { x: 0.229, y: 0.739, fontPct: 0.021, color: "#5765E8", bold: true },
    },
  },
  {
    id: "tpl606",
    name: "自然风光",
    bgImg: tpl606Bg,
    aspectRatio: 750 / 1334,
    slots: {
      avatar: { cx: 0.129, cy: 0.859, r: 0.063 },
      inviterName: { x: 0.211, y: 0.843, fontPct: 0.021, color: "#010002", maxLen: 10 },
      qrcode: { cx: 0.829, cy: 0.847, size: 0.195 },
      liveName: { cx: 0.501, cy: 0.297, fontPct: 0.021, color: "#010002", maxLen: 15 },
      time: { cx: 0.5, cy: 0.674, fontPct: 0.021, color: "#010002" },
    },
  },
];

export default templates;
