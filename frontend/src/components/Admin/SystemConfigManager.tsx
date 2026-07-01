"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings2, Save, RefreshCw, Loader2, CheckCircle, XCircle, Info
} from "lucide-react";

interface SystemConfig {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

interface AiCostConfig {
  geminiFlashCostPer1kTokens: number;
  geminiProCostPer1kTokens: number;
  whisperCostPerMinute: number;
  monthlyBudgetUsd: number;
}

interface AccountingConfig {
  enableS1: boolean;
  enableS2: boolean;
  enableS3: boolean;
  enableS4: boolean;
  defaultVatRate: number;
  defaultPersonalIncomeTaxRate: number;
}

interface TT88Config {
  accounting: AccountingConfig;
}

const API = "http://localhost:5178/api";

function getToken() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(localStorage.getItem("bizflow_user") || "{}").token || ""; } catch { return ""; }
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const defaultAiCost: AiCostConfig = {
  geminiFlashCostPer1kTokens: 0.00015,
  geminiProCostPer1kTokens: 0.003,
  whisperCostPerMinute: 0.006,
  monthlyBudgetUsd: 50,
};

const defaultTT88: TT88Config = {
  accounting: {
    enableS1: true, enableS2: true, enableS3: true, enableS4: true,
    defaultVatRate: 10, defaultPersonalIncomeTaxRate: 1.5,
  },
};

function parseJson<T>(val: string, fallback: T): T {
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

export default function SystemConfigManager() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);

  const [aiCost, setAiCost] = useState<AiCostConfig>(defaultAiCost);
  const [tt88, setTt88] = useState<TT88Config>(defaultTT88);

  const showToast = (message: string, ok = true) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/system-configs`, { headers: authHeaders() });
      if (res.ok) {
        const data: SystemConfig[] = await res.json();
        setConfigs(data);
        const aiRaw = data.find(c => c.key === "AiCostConfig")?.value;
        const ttRaw = data.find(c => c.key === "TT88Config")?.value;
        if (aiRaw) setAiCost(parseJson(aiRaw, defaultAiCost));
        if (ttRaw) setTt88(parseJson(ttRaw, defaultTT88));
      }
    } catch { showToast("Lỗi kết nối máy chủ.", false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const saveConfig = async (key: string, value: unknown, description: string) => {
    setSaving(key);
    try {
      const res = await fetch(`${API}/system-configs/${key}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ value: JSON.stringify(value), description }),
      });
      if (res.ok) {
        showToast(`Đã lưu cấu hình "${key}" thành công.`);
        fetchConfigs();
      } else {
        const data = await res.json();
        showToast(data.message || "Lỗi khi lưu cấu hình.", false);
      }
    } catch { showToast("Lỗi kết nối.", false); }
    finally { setSaving(null); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium ${toast.ok ? "bg-emerald-600 text-white" : "bg-error text-white"}`}>
          {toast.ok ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Cấu hình Hệ thống</h2>
            <p className="text-sm text-on-surface-variant">Quản lý các thông số nền tảng toàn cục</p>
          </div>
        </div>
        <button onClick={fetchConfigs} className="p-2 rounded-lg border border-surface-container-high hover:bg-surface-container-low text-on-surface-variant">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* AI Cost Config */}
      <div className="bg-white rounded-2xl border border-surface-container-high shadow-card overflow-hidden">
        <div className="border-b border-surface-container-low px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface">Cấu hình Chi phí Dịch vụ AI</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Đơn vị: USD — áp dụng cho toàn bộ platform</p>
          </div>
          <button
            onClick={() => saveConfig("AiCostConfig", aiCost, "Cấu hình giá AI (Gemini, Whisper)")}
            disabled={saving === "AiCostConfig"}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 shadow-md shadow-primary/20"
          >
            {saving === "AiCostConfig" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Lưu
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { key: "geminiFlashCostPer1kTokens", label: "Gemini Flash (USD/1K tokens)", help: "Model nhanh, chi phí thấp" },
            { key: "geminiProCostPer1kTokens", label: "Gemini Pro (USD/1K tokens)", help: "Model mạnh, chất lượng cao" },
            { key: "whisperCostPerMinute", label: "Whisper (USD/phút)", help: "Nhận dạng giọng nói" },
            { key: "monthlyBudgetUsd", label: "Ngân sách AI tháng (USD)", help: "Cảnh báo khi vượt ngưỡng này" },
          ].map(({ key, label, help }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.000001"
                  value={(aiCost as Record<string, number>)[key]}
                  onChange={e => setAiCost({ ...aiCost, [key]: parseFloat(e.target.value) || 0 })}
                  className="flex-1 border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />{help}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* TT88 Accounting Config */}
      <div className="bg-white rounded-2xl border border-surface-container-high shadow-card overflow-hidden">
        <div className="border-b border-surface-container-low px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface">Cấu hình Kế toán Thông tư 88/2021/TT-BTC</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Áp dụng mặc định cho tất cả tenant mới</p>
          </div>
          <button
            onClick={() => saveConfig("TT88Config", tt88, "Cấu hình kế toán TT88/2021")}
            disabled={saving === "TT88Config"}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 shadow-md shadow-primary/20"
          >
            {saving === "TT88Config" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Lưu
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Sổ kế toán toggles */}
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-3">Kích hoạt Mẫu Sổ Kế toán</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "enableS1", label: "Sổ S1-HKD", desc: "Doanh thu bán hàng" },
                { key: "enableS2", label: "Sổ S2-HKD", desc: "Hàng tồn kho" },
                { key: "enableS3", label: "Sổ S3-HKD", desc: "Chi phí SXKD" },
                { key: "enableS4", label: "Sổ S4-HKD", desc: "Nghĩa vụ thuế" },
              ].map(({ key, label, desc }) => {
                const val = (tt88.accounting as Record<string, unknown>)[key] as boolean;
                return (
                  <button
                    key={key}
                    onClick={() => setTt88({ ...tt88, accounting: { ...tt88.accounting, [key]: !val } })}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${val ? "border-primary bg-primary/5" : "border-surface-container-high bg-white"}`}
                  >
                    <div className={`w-8 h-4 rounded-full mb-2 transition-all flex items-center px-0.5 ${val ? "bg-primary justify-end" : "bg-surface-container-high justify-start"}`}>
                      <span className="w-3 h-3 bg-white rounded-full shadow" />
                    </div>
                    <p className={`text-xs font-bold ${val ? "text-primary" : "text-on-surface-variant"}`}>{label}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tax Rates */}
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-3">Mức Thuế Suất Mặc định</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Thuế suất GTGT (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={tt88.accounting.defaultVatRate}
                    onChange={e => setTt88({ ...tt88, accounting: { ...tt88.accounting, defaultVatRate: parseFloat(e.target.value) || 0 } })}
                    className="flex-1 border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">%</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />Thuế GTGT theo Thông tư 40/2021/TT-BTC. Xác nhận với kế toán cho ngành cụ thể.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Thuế suất TNCN (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={tt88.accounting.defaultPersonalIncomeTaxRate}
                    onChange={e => setTt88({ ...tt88, accounting: { ...tt88.accounting, defaultPersonalIncomeTaxRate: parseFloat(e.target.value) || 0 } })}
                    className="flex-1 border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm font-bold text-on-surface-variant">%</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />Thuế TNCN theo phương pháp kê khai. Xác nhận với kế toán.
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Lưu ý pháp lý</p>
              <p className="text-xs text-amber-700 mt-1">
                Mức thuế suất GTGT/TNCN áp dụng phụ thuộc vào ngành nghề kinh doanh cụ thể và có thể thay đổi theo quy định mới. Hệ thống chỉ sử dụng các giá trị này làm mặc định gợi ý — Chủ hộ/kế toán viên cần xác nhận lại với cơ quan thuế địa phương trước khi sử dụng chính thức.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Config List */}
      {configs.length > 0 && (
        <div className="bg-white rounded-2xl border border-surface-container-high shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-container-low">
            <h3 className="font-bold text-on-surface">Tất cả Cấu hình hệ thống</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Xem raw JSON các keys đang được lưu</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container-high">
                  <th className="p-3 text-left">Key</th>
                  <th className="p-3 text-left">Mô tả</th>
                  <th className="p-3 text-right">Cập nhật lần cuối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {configs.map(c => (
                  <tr key={c.key} className="hover:bg-surface-container-low/50">
                    <td className="p-3 font-mono text-xs text-primary font-bold">{c.key}</td>
                    <td className="p-3 text-xs text-on-surface-variant">{c.description || "—"}</td>
                    <td className="p-3 text-right text-xs text-on-surface-variant">{new Date(c.updatedAt).toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
