<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Services\AquaSmartAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiChatController extends Controller
{
    protected AquaSmartAiService $aiService;

    public function __construct(AquaSmartAiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Send message to AquaSmart AI
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $sessionId = $request->session_id ?: (string) Str::uuid();

        // 1. Record user message
        AiConversation::create([
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => $request->message,
        ]);

        // 2. Call AquaSmart AI Service
        $aiReply = $this->aiService->ask($user, $request->message, $sessionId);

        // 3. Record assistant reply
        $assistantMsg = AiConversation::create([
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'role' => 'assistant',
            'content' => $aiReply,
        ]);

        return response()->json([
            'session_id' => $sessionId,
            'reply' => $aiReply,
            'message_id' => $assistantMsg->id,
            'created_at' => $assistantMsg->created_at,
        ]);
    }

    /**
     * Get chat conversation history
     */
    public function getHistory(Request $request)
    {
        $user = $request->user();
        $sessionId = $request->query('session_id');

        $query = AiConversation::where('user_id', $user->id);
        if ($sessionId) {
            $query->where('session_id', $sessionId);
        }

        $messages = $query->orderBy('created_at', 'asc')->take(50)->get();

        return response()->json([
            'messages' => $messages,
            'suggested_questions' => [
                'Quelle quantité d\'eau dois-je utiliser aujourd\'hui ?',
                'Pourquoi ma consommation d\'eau a-t-elle augmenté ?',
                'Comment économiser davantage d\'eau ?',
                'Quand dois-je irriguer mes oliviers ?',
                'Comment interpréter le niveau d\'humidité du sol ?',
                'Comment réduire mes dépenses d\'irrigation ?',
            ],
        ]);
    }

    /**
     * Clear chat history
     */
    public function clearHistory(Request $request)
    {
        $user = $request->user();
        $sessionId = $request->query('session_id');

        $query = AiConversation::where('user_id', $user->id);
        if ($sessionId) {
            $query->where('session_id', $sessionId);
        }
        $query->delete();

        return response()->json(['message' => 'Historique effacé.']);
    }
}
