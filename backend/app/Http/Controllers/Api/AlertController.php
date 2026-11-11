<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Alert::where('user_id', $user->id)->with(['farm', 'parcel'])->latest();

        if ($request->has('unread_only') && $request->unread_only) {
            $query->where('is_read', false);
        }

        return response()->json($query->paginate(20));
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $alert = Alert::where('user_id', $user->id)->findOrFail($id);
        $alert->update(['is_read' => true]);

        return response()->json(['message' => 'Alerte marquée comme lue.']);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        Alert::where('user_id', $user->id)->update(['is_read' => true]);

        return response()->json(['message' => 'Toutes les alertes sont marquées comme lues.']);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $alert = Alert::where('user_id', $user->id)->findOrFail($id);
        $alert->delete();

        return response()->json(['message' => 'Alerte supprimée.']);
    }
}
