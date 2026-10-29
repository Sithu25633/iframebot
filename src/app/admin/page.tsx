"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Film,
  Tv,
  Coins,
  Crown,
  Shield,
  Search,
  MessageCircle,
  Plus,
  Minus,
  Ban,
  CheckCircle,
  Clock,
  RefreshCw,
  Lock,
  ArrowUpRight,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [vipSubmissions, setVipSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "requests" | "vip_screenshots">("overview");
  const [searchUser, setSearchUser] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit Coins Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [customCoinAmount, setCustomCoinAmount] = useState<string>("50");

  // Screenshot Viewer Modal
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?pin=${encodeURIComponent(pin)}`);
      if (!res.ok) throw new Error("Invalid Admin PIN");
      const data = await res.json();
      setStats(data.stats);
      setIsAuthenticated(true);
      loadAdminData(pin);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async (adminPin: string) => {
    try {
      const [uRes, rRes, sRes, vRes] = await Promise.all([
        fetch(`/api/admin/users?pin=${encodeURIComponent(adminPin)}`),
        fetch(`/api/admin/requests?pin=${encodeURIComponent(adminPin)}`),
        fetch(`/api/admin/stats?pin=${encodeURIComponent(adminPin)}`),
        fetch(`/api/admin/vip-submissions?pin=${encodeURIComponent(adminPin)}`),
      ]);
      const uData = await uRes.json();
      const rData = await rRes.json();
      const sData = await sRes.json();
      const vData = await vRes.json();
      if (uData.users) setUsers(uData.users);
      if (rData.requests) setRequests(rData.requests);
      if (sData.stats) setStats(sData.stats);
      if (vData.submissions) setVipSubmissions(vData.submissions);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCoinChange = async (userId: string, delta: number) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: "update_coins", userId, amount: delta }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, coins: data.newBalance } : u))
        );
        setSelectedUser(null);
      }
    } catch (e) {
      alert("Failed to update coins");
    }
  };

  const handleToggleVip = async (userId: string, currentVip: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: "toggle_vip", userId, isVip: !currentVip }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVip: !currentVip } : u))
        );
      }
    } catch (e) {}
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    if (!confirm(`Are you sure you want to ${currentBanned ? "unban" : "ban"} this user?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, action: "toggle_ban", userId, isBanned: !currentBanned }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBanned } : u))
        );
      }
    } catch (e) {}
  };

  const handleVipStatusAction = async (submissionId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/vip-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, submissionId, status }),
      });
      if (res.ok) {
        setVipSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, status } : s))
        );
        loadAdminData(pin);
      }
    } catch (e) {}
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-surface p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black font-black mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black mb-1">FilmFeed SSS Admin</h1>
          <p className="text-xs text-gray-400 mb-6">Enter PIN to access master control dashboard</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Admin PIN (76037)"
              className="w-full rounded-2xl border border-white/20 bg-black px-4 py-3 text-center text-sm font-mono tracking-widest text-white focus:border-white focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white py-3 px-4 text-xs font-black text-black hover:bg-gray-200 transition-all"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS CONTROL PANEL"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.phone?.includes(searchUser) ||
      u.deviceId?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const pendingVipCount = vipSubmissions.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white">FILMFEED CONTROL CENTER</span>
              <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">SSS GRADE • FIRESTORE</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Cloud Database Connected • Users, Coins, Requests & Screenshot Verification</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAdminData(pin)}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-surface px-3 py-2 text-xs font-bold text-gray-300 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-surface p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs">Total Users</span>
                <Users className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
              <p className="text-[10px] text-gray-500 mt-1">Unique Google Accounts</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs">Circulating Coins</span>
                <Coins className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400">{stats.totalCoins}</p>
              <p className="text-[10px] text-gray-500 mt-1">Economy Balance</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs">Total Requests</span>
                <Film className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalRequests}</p>
              <p className="text-[10px] text-gray-500 mt-1">Movies: {stats.movieRequests} • Series: {stats.seriesRequests}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs">Pending VIP Checks</span>
                <Crown className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-black text-emerald-400">{pendingVipCount}</p>
              <p className="text-[10px] text-gray-500 mt-1">Screenshots awaiting review</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
              activeTab === "overview" ? "bg-white text-black font-black" : "text-gray-400 hover:text-white"
            }`}
          >
            Overview & Requests
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
              activeTab === "users" ? "bg-white text-black font-black" : "text-gray-400 hover:text-white"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
              activeTab === "requests" ? "bg-white text-black font-black" : "text-gray-400 hover:text-white"
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("vip_screenshots")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "vip_screenshots" ? "bg-white text-black font-black" : "text-gray-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>VIP Screenshots ({vipSubmissions.length})</span>
            {pendingVipCount > 0 && (
              <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-black text-white ml-1">
                {pendingVipCount} NEW
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Users Manager */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search by name, email, WhatsApp phone, device ID..."
                  className="w-full rounded-xl border border-white/15 bg-surface py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-white focus:outline-none"
                />
              </div>
              <span className="text-xs text-gray-400">{filteredUsers.length} users</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-black/40 text-gray-400">
                  <tr>
                    <th className="p-3.5">User Profile</th>
                    <th className="p-3.5">WhatsApp Phone</th>
                    <th className="p-3.5">Coins</th>
                    <th className="p-3.5">Device Lock</th>
                    <th className="p-3.5">VIP Status</th>
                    <th className="p-3.5">Ban Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={u.isBanned ? "opacity-50 bg-red-950/20" : ""}>
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          {u.isVip && (
                            <span className="rounded bg-amber-400/20 text-amber-400 px-1.5 py-0.2 text-[9px] font-black">VIP</span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                      </td>
                      <td className="p-3.5 font-mono">
                        {u.phone ? (
                          <a
                            href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>{u.phone}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500">Not set</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">{u.coins || 0}</span>
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-300 hover:bg-white hover:text-black transition-colors"
                          >
                            +/- Coins
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-gray-400 truncate max-w-[140px]" title={u.deviceId}>
                        {u.deviceId || "dev_unbound"}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleVip(u.id, u.isVip)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                            u.isVip ? "bg-white text-black" : "bg-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          {u.isVip ? "VIP ACTIVE" : "GRANT VIP"}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleBan(u.id, u.isBanned)}
                          className={`rounded-lg p-1.5 text-xs transition-colors ${
                            u.isBanned ? "bg-red-600 text-white" : "bg-white/10 text-gray-400 hover:text-red-400"
                          }`}
                          title={u.isBanned ? "Unban user" : "Ban user"}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Requests Stream */}
        {(activeTab === "requests" || activeTab === "overview") && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="h-4 w-4 text-white" />
              <span>Real-Time Movie & TV Series Requests</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-black/40 text-gray-400">
                  <tr>
                    <th className="p-3.5">Content Title</th>
                    <th className="p-3.5">Type & Quality</th>
                    <th className="p-3.5">Requester</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Token</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3.5 font-bold text-white max-w-[220px] truncate">{r.title}</td>
                      <td className="p-3.5">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-300 uppercase">
                          {r.type === "series" ? `Series S${r.season || 1}` : "Movie"} • {r.quality}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-gray-300">{r.userName}</td>
                      <td className="p-3.5 font-mono text-emerald-400">{r.userPhone || "Guest"}</td>
                      <td className="p-3.5 font-mono text-gray-400">{r.token}</td>
                      <td className="p-3.5 text-[11px] text-gray-500">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">No requests logged yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: VIP Screenshots & Proof Verification */}
        {activeTab === "vip_screenshots" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-white" />
                  <span>VIP Verification Screenshots Submitted by Users</span>
                </h3>
                <p className="text-xs text-gray-400">Review screenshots uploaded by users to unlock TV Series packs</p>
              </div>
              <span className="text-xs text-gray-400">{vipSubmissions.length} submissions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vipSubmissions.map((sub) => (
                <div key={sub.id} className="rounded-2xl border border-white/15 bg-surface p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{sub.userName || "Member"}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[9px] font-black uppercase ${
                          sub.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : sub.status === "rejected"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-300 font-mono">
                      WhatsApp: <b className="text-emerald-400">{sub.phone}</b>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Series: <span className="text-white font-bold">{sub.seriesTitle}</span>
                    </div>
                  </div>

                  {/* Screenshot Thumbnail */}
                  {sub.screenshotUrl ? (
                    <div
                      onClick={() => setViewingScreenshot(sub.screenshotUrl)}
                      className="relative h-44 w-full rounded-xl overflow-hidden border border-white/10 bg-black/50 cursor-pointer group hover:border-white transition-all flex items-center justify-center"
                    >
                      <img
                        src={sub.screenshotUrl}
                        alt="Proof"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-black text-black shadow-lg">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Full Image</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 w-full rounded-xl border border-white/10 bg-black/50 flex items-center justify-center text-xs text-gray-500">
                      No Screenshot Provided
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
                    <span>{new Date(sub.createdAt).toLocaleString()}</span>

                    {/* Approve / Reject Buttons */}
                    {sub.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVipStatusAction(sub.id, "approved")}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black text-white hover:bg-emerald-500"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve VIP</span>
                        </button>
                        <button
                          onClick={() => handleVipStatusAction(sub.id, "rejected")}
                          className="flex items-center gap-1 rounded-lg bg-red-600/30 text-red-400 border border-red-500/30 px-2 py-1 text-[10px] font-bold hover:bg-red-600 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {vipSubmissions.length === 0 && (
                <div className="col-span-full py-12 text-center rounded-2xl border border-white/10 bg-surface text-gray-400 text-xs">
                  No VIP screenshots submitted yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Custom Coins Adjuster */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-surface p-6 text-white shadow-2xl">
              <h3 className="text-base font-bold mb-1">Adjust Coins for {selectedUser.name}</h3>
              <p className="text-xs text-gray-400 mb-4">Current balance: <b className="text-amber-400 font-mono">{selectedUser.coins}</b> Coins</p>

              {/* Quick adjustment buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleCoinChange(selectedUser.id, 50)}
                  className="rounded-xl bg-white/10 py-2 text-xs font-bold text-white hover:bg-white hover:text-black transition-colors"
                >
                  +50 Coins
                </button>
                <button
                  type="button"
                  onClick={() => handleCoinChange(selectedUser.id, 100)}
                  className="rounded-xl bg-white/10 py-2 text-xs font-bold text-white hover:bg-white hover:text-black transition-colors"
                >
                  +100 Coins
                </button>
                <button
                  type="button"
                  onClick={() => handleCoinChange(selectedUser.id, -50)}
                  className="rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 py-2 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors"
                >
                  -50 Coins
                </button>
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  value={customCoinAmount}
                  onChange={(e) => setCustomCoinAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 rounded-xl border border-white/15 bg-black px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCoinChange(selectedUser.id, parseInt(customCoinAmount, 10) || 0)}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-black text-black hover:bg-gray-200"
                >
                  Apply
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full rounded-xl bg-white/5 py-2.5 text-xs font-bold text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal: Fullscreen Screenshot Viewer */}
        {viewingScreenshot && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn cursor-pointer"
            onClick={() => setViewingScreenshot(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 p-2 bg-surface">
              <button
                onClick={() => setViewingScreenshot(null)}
                className="absolute top-4 right-4 rounded-full bg-black/80 p-2 text-white hover:bg-white hover:text-black transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={viewingScreenshot}
                alt="Enlarged Proof"
                className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
