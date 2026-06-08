import { getAllConversations, getConversationsByStage, getPendingFollowUps } from "@/lib/conversation-state";
import { scoreLead, qualifyLead } from "@/lib/kingtokenz-kb";

export const dynamic = "force-dynamic";

function formatTime(ts: number) {
  return new Date(ts).toLocaleString();
}

function stageColor(stage: string) {
  const map: Record<string, string> = {
    new: "bg-gray-100 text-gray-700",
    opener_sent: "bg-blue-100 text-blue-700",
    responded_positive: "bg-green-100 text-green-700",
    qualifying: "bg-yellow-100 text-yellow-700",
    pitched: "bg-purple-100 text-purple-700",
    objection: "bg-orange-100 text-orange-700",
    closing: "bg-teal-100 text-teal-700",
    closed_won: "bg-green-600 text-white",
    closed_lost: "bg-red-100 text-red-700",
    nurture: "bg-gray-100 text-gray-500",
  };
  return map[stage] ?? "bg-gray-100 text-gray-700";
}

export default function Dashboard() {
  const all = getAllConversations();
  const hot = getConversationsByStage("closing").length;
  const pending = getPendingFollowUps().length;
  const won = getConversationsByStage("closed_won").length;
  const lost = getConversationsByStage("closed_lost").length;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Kingtokenz WhatsApp Bot</h1>
          <p className="text-gray-400">AI-powered sales agent — {all.length} conversations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: all.length, color: "text-white" },
            { label: "In Closing", value: hot, color: "text-teal-400" },
            { label: "Won", value: won, color: "text-green-400" },
            { label: "Lost", value: lost, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Pending Follow-ups */}
        {pending > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-8">
            <h2 className="text-yellow-400 font-semibold mb-2">⚠️ {pending} leads need follow-up</h2>
            <p className="text-yellow-200/60 text-sm">
              These conversations have a scheduled follow-up that&apos;s due now.
            </p>
          </div>
        )}

        {/* Conversations */}
        <div className="space-y-4">
          {all.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">📱</div>
              <p>No conversations yet. Send the WhatsApp bot a message to start!</p>
            </div>
          ) : (
            all.map((conv) => {
              const score = conv.leadData
                ? scoreLead(
                    conv.leadData.followers ?? 25000,
                    conv.leadData.bio ?? "",
                    conv.leadData.postingFrequency ?? "inconsistent"
                  )
                : 0;
              const qual = qualifyLead(score);

              return (
                <div key={conv.phoneNumber} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <div>
                      <div className="font-mono text-sm text-gray-300">{conv.phoneNumber}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Last active: {formatTime(conv.lastMessageAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stageColor(conv.stage)}`}>
                        {conv.stage.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        qual === "hot" ? "bg-red-500 text-white" :
                        qual === "warm" ? "bg-orange-500 text-white" :
                        "bg-gray-700 text-gray-300"
                      }`}>
                        {qual.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Lead data */}
                  {conv.leadData && Object.keys(conv.leadData).length > 0 && (
                    <div className="px-5 py-3 bg-gray-800/40 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {conv.leadData.followers && (
                        <div><span className="text-gray-400">Followers:</span> {conv.leadData.followers.toLocaleString()}</div>
                      )}
                      {conv.leadData.postingFrequency && (
                        <div><span className="text-gray-400">Posting:</span> {conv.leadData.postingFrequency}</div>
                      )}
                      {conv.leadData.goal && (
                        <div><span className="text-gray-400">Goal:</span> {conv.leadData.goal}</div>
                      )}
                      {conv.leadData.challenge && (
                        <div><span className="text-gray-400">Challenge:</span> {conv.leadData.challenge.slice(0, 40)}…</div>
                      )}
                    </div>
                  )}

                  {/* Messages */}
                  <div className="px-5 py-3 space-y-2 max-h-64 overflow-y-auto">
                    {conv.messages.length === 0 ? (
                      <p className="text-gray-600 text-sm italic">No messages yet</p>
                    ) : (
                      conv.messages.slice(-8).map((msg, i) => (
                        <div key={i} className={`flex ${msg.from === "agent" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                            msg.from === "agent"
                              ? "bg-teal-600 text-white rounded-br-sm"
                              : "bg-gray-700 text-gray-100 rounded-bl-sm"
                          }`}>
                            <span className="text-xs opacity-60 mr-1">{msg.from === "agent" ? "🤖" : "👤"}</span>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Score bar */}
                  <div className="px-5 py-3 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-12">Score</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            score >= 60 ? "bg-red-500" : score >= 35 ? "bg-orange-500" : "bg-gray-600"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-300 w-8">{score}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-xs">
          Kingtokenz WhatsApp Bot · {all.length} total conversations
        </div>
      </div>
    </main>
  );
}