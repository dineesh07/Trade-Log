"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Sparkles } from "lucide-react";

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
  title: string;
  submitButtonText?: string;
}

export function StrategyModal({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  title,
  submitButtonText = "Save Strategy",
}: StrategyModalProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialName);
    setError(null);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Strategy name cannot be empty");
      return;
    }
    if (trimmed.length > 50) {
      setError("Strategy name cannot exceed 50 characters");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save strategy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="strategy-name-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Strategy Name
            </label>
            <input
              id="strategy-name-input"
              type="text"
              autoFocus
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 5EMA 1:3, Orderblock Breakout..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-medium transition-all"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
              <span>Required, 1 to 50 characters</span>
              <span>{name.length}/50</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="strategy-modal-submit-button"
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
