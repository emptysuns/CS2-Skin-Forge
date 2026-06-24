using CounterStrikeSharp.API;
using CounterStrikeSharp.API.Core;
using CounterStrikeSharp.API.Modules.Memory.DynamicFunctions;
using PlayerSkinMod.Data;
using PlayerSkinMod.Models;

namespace PlayerSkinMod.Services;

public static class WeaponService
{
    private static ulong _nextItemId = 0xF00DCAFE;

    public static CCSPlayerController? GetPlayerFromItemServices(CCSPlayer_ItemServices itemServices)
    {
        var pawn = itemServices.Pawn.Value;
        if (pawn == null || !pawn.IsValid || pawn.Controller.Value == null || !pawn.Controller.IsValid)
            return null;

        var player = new CCSPlayerController(pawn.Controller.Value.Handle);
        return player.IsValid ? player : null;
    }

    public static float UIntToFloat(uint value) => BitConverter.Int32BitsToSingle((int)value);

    public static void ApplyStickers(
        CBasePlayerWeapon weapon,
        List<StickerInfo> stickers,
        MemoryFunctionVoid<nint, string, float> setAttrByName)
    {
        if (stickers.Count == 0) return;
        var item = weapon.AttributeManager?.Item;
        if (item == null) return;

        for (int i = 0; i < Math.Min(stickers.Count, 5); i++)
        {
            var sticker = stickers[i];
            if (sticker.Id == 0) continue;
            var handle = item.NetworkedDynamicAttributes.Handle;
            setAttrByName.Invoke(handle, $"sticker slot {i} id", UIntToFloat(sticker.Id));
            if (sticker.OffsetX != 0 || sticker.OffsetY != 0)
                setAttrByName.Invoke(handle, $"sticker slot {i} schema", 0f);
            setAttrByName.Invoke(handle, $"sticker slot {i} offset x", sticker.OffsetX);
            setAttrByName.Invoke(handle, $"sticker slot {i} offset y", sticker.OffsetY);
            setAttrByName.Invoke(handle, $"sticker slot {i} wear", sticker.Wear);
            setAttrByName.Invoke(handle, $"sticker slot {i} scale", sticker.Scale);
            setAttrByName.Invoke(handle, $"sticker slot {i} rotation", sticker.Rotation);
        }
    }

    public static void ApplyKeychains(
        CBasePlayerWeapon weapon,
        KeychainInfo keychain,
        MemoryFunctionVoid<nint, string, float> setAttrByName)
    {
        if (keychain.Id == 0) return;
        var item = weapon.AttributeManager?.Item;
        if (item == null) return;

        var handle = item.NetworkedDynamicAttributes.Handle;
        setAttrByName.Invoke(handle, "keychain slot 0 id", UIntToFloat(keychain.Id));
        setAttrByName.Invoke(handle, "keychain slot 0 offset x", keychain.OffsetX);
        setAttrByName.Invoke(handle, "keychain slot 0 offset y", keychain.OffsetY);
        setAttrByName.Invoke(handle, "keychain slot 0 offset z", keychain.OffsetZ);
        if (keychain.Seed > 0)
            setAttrByName.Invoke(handle, "keychain slot 0 seed", (float)keychain.Seed);
    }

    public static void ApplySkinToWeapon(
        CEconEntity weapon,
        ushort defIndex,
        int paintKit,
        HashSet<(ushort DefIndex, int Paint)> legacyPaints,
        MemoryFunctionVoid<nint, string, float> setAttrByName,
        ref bool skinErrorLogged,
        int seed = 0,
        float wear = 0.01f,
        uint accountId = 0,
        string? nametag = null,
        StatTrakInfo? statTrak = null)
    {
        try
        {
            var item = weapon.AttributeManager?.Item;
            if (item == null) return;

            item.AttributeList.Attributes.RemoveAll();
            item.NetworkedDynamicAttributes.Attributes.RemoveAll();
            AssignItemId(item);
            if (accountId > 0) item.AccountID = accountId;

            weapon.FallbackPaintKit = paintKit;
            weapon.FallbackSeed = seed;
            weapon.FallbackWear = wear;

            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture seed", (float)seed);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture wear", wear);

            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture seed", (float)seed);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture wear", wear);

            // Apply nametag
            if (!string.IsNullOrEmpty(nametag))
            {
                item.CustomName = nametag;
            }

            // Apply StatTrak
            if (statTrak != null && statTrak.Enabled)
            {
                item.EntityQuality = 9; // StatTrak quality
                setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "kill eater", 80);
                setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "kill eater score type", 0);
                setAttrByName.Invoke(item.AttributeList.Handle, "kill eater", 80);
                setAttrByName.Invoke(item.AttributeList.Handle, "kill eater score type", 0);
                setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "kill eater user 1", (float)statTrak.Count);
                setAttrByName.Invoke(item.AttributeList.Handle, "kill eater user 1", (float)statTrak.Count);
            }

            Utilities.SetStateChanged(weapon, "CEconEntity", "m_AttributeManager");

            bool isLegacy = legacyPaints.Contains((defIndex, paintKit));
            weapon.AcceptInput("SetBodygroup", value: $"body,{(isLegacy ? 1 : 0)}");
            Utilities.SetStateChanged(weapon, "CBaseModelEntity", "m_CBodyComponent");
        }
        catch (Exception ex)
        {
            if (!skinErrorLogged)
            {
                skinErrorLogged = true;
            }
        }
    }

    /// <summary>
    /// Replace the player's knife with the specified knife type and skin.
    /// When the knife type changes (e.g. Butterfly → Talon), the old entity is
    /// destroyed and a fresh one is created so the engine picks up the correct
    /// AnimGraph / VData for the new knife family.
    /// </summary>
    public static void ReplaceKnife(
        CCSPlayerController player,
        CCSPlayerPawn pawn,
        ushort defIndex,
        int paintKit,
        HashSet<(ushort DefIndex, int Paint)> legacyPaints,
        MemoryFunctionVoid<nint, string, float> setAttrByName,
        int knifeSeed = 0,
        float knifeWear = 0.01f)
    {
        try
        {
            var weapons = pawn.WeaponServices?.MyWeapons;
            if (weapons == null) return;

            // ── Find the current knife ──────────────────────────────────
            CBasePlayerWeapon? knife = null;
            foreach (var handle in weapons)
            {
                var w = handle.Value;
                if (w == null || !w.IsValid) continue;
                var name = w.DesignerName;
                if (string.IsNullOrEmpty(name)) continue;
                if (name != "weapon_knife" && name != "weapon_knife_t") continue;
                knife = w;
                break;
            }

            if (knife == null) return;

            var item = knife.AttributeManager?.Item;
            if (item == null) return;

            ushort currentDefIndex = item.ItemDefinitionIndex;

            // ── Knife TYPE changed → destroy & recreate ─────────────────
            // Different knife families (Butterfly / Talon / Karambit …)
            // use incompatible AnimGraph2 + VData.  Patching the existing
            // entity with ChangeSubclass alone leaves the old animation
            // bindings in place, causing hand / pose glitches.
            if (currentDefIndex != defIndex)
            {
                // Schedule old entity for destruction (small delay so the
                // engine has time to detach it from the player's inventory).
                knife.AddEntityIOEvent("Kill", knife, null, "", 0.05f);

                // Give a fresh default knife – the engine creates it with
                // the correct base VData for the current team.
                player.GiveNamedItem("weapon_knife");

                // On the next tick the new knife is fully initialised.
                // Patch it to the desired subclass + skin, then force the
                // client to re-select the knife slot so the view-model
                // reloads the matching animation set.
                Server.NextFrame(() =>
                {
                    if (pawn == null || !pawn.IsValid) return;

                    var newWeapons = pawn.WeaponServices?.MyWeapons;
                    if (newWeapons == null) return;

                    foreach (var nh in newWeapons)
                    {
                        var w = nh.Value;
                        if (w == null || !w.IsValid) continue;
                        var wname = w.DesignerName;
                        if (string.IsNullOrEmpty(wname)) continue;
                        if (wname != "weapon_knife" && wname != "weapon_knife_t") continue;

                        ApplySkinToKnife(w, defIndex, paintKit, legacyPaints,
                                         setAttrByName, knifeSeed, knifeWear);
                        break;
                    }

                    // Force the client to switch to the knife slot –
                    // this makes the engine rebuild the view-model with
                    // the correct animation graph for the new subclass.
                    if (player != null && player.IsValid)
                        player.ExecuteClientCommand("slot3");
                });

                return;
            }

            // ── Same knife type → just refresh the skin ─────────────────
            ApplySkinToKnife(knife, defIndex, paintKit, legacyPaints,
                             setAttrByName, knifeSeed, knifeWear);
        }
        catch (Exception ex)
        {
        }
    }

    /// <summary>
    /// Apply skin / quality / bodygroup to an existing knife entity.
    /// </summary>
    private static void ApplySkinToKnife(
        CBasePlayerWeapon knife,
        ushort defIndex,
        int paintKit,
        HashSet<(ushort DefIndex, int Paint)> legacyPaints,
        MemoryFunctionVoid<nint, string, float> setAttrByName,
        int knifeSeed,
        float knifeWear)
    {
        knife.AcceptInput("ChangeSubclass", value: defIndex.ToString());

        var item = knife.AttributeManager?.Item;
        if (item == null) return;

        item.ItemDefinitionIndex = defIndex;
        item.EntityQuality = 3;

        item.AttributeList.Attributes.RemoveAll();
        item.NetworkedDynamicAttributes.Attributes.RemoveAll();

        AssignItemId(item);

        if (paintKit > 0)
        {
            knife.FallbackPaintKit = paintKit;
            knife.FallbackSeed = knifeSeed;
            knife.FallbackWear = knifeWear;

            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture seed", (float)knifeSeed);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture wear", knifeWear);

            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture seed", (float)knifeSeed);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture wear", knifeWear);
        }

        Utilities.SetStateChanged(knife, "CEconEntity", "m_AttributeManager");

        bool isLegacy = legacyPaints.Contains((defIndex, paintKit));
        knife.AcceptInput("SetBodygroup", value: $"body,{(isLegacy ? 1 : 0)}");
        Utilities.SetStateChanged(knife, "CBaseModelEntity", "m_CBodyComponent");
    }

    /// <summary>
    /// Apply gloves to a player pawn.
    ///   1. Clear stale attributes
    ///   2. Set defindex + skin attributes on both attribute lists
    ///   3. Notify engine via SetStateChanged (critical for rendering)
    ///   4. Mark Initialized = true
    ///   5. Bodygroup toggle 0 -> 1 (with 0.2f delay) to force material refresh
    /// Note: "lastinv" is intentionally NOT used — it can interfere with the
    /// glove model swap on certain team/model combinations.
    /// </summary>
    public static void ApplyGloves(
        CCSPlayerController player,
        CCSPlayerPawn pawn,
        ushort defIndex,
        int paintKit,
        MemoryFunctionVoid<nint, string, float> setAttrByName,
        int seed = 0,
        float wear = 0.01f,
        Action<float, Action>? addTimer = null)
    {
        try
        {
            var item = pawn.EconGloves;
            if (item == null)
            {
                player.PrintToConsole($"[PlayerSkinMod] EconGloves is null for {player.PlayerName}");
                return;
            }

            // Clear stale attributes from previous glove type
            item.NetworkedDynamicAttributes.Attributes.RemoveAll();
            item.AttributeList.Attributes.RemoveAll();

            // Set glove identity — drives which 3D model + UV layout is used
            item.ItemDefinitionIndex = defIndex;
            AssignItemId(item);

            // Apply skin attributes on BOTH lists (critical for CS2 rendering)
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture seed", (float)seed);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture wear", wear);

            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture seed", (float)seed);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture wear", wear);

            // Notify engine that attributes changed (missing from earlier versions — likely
            // the root cause of T-side gloves rendering with default textures)
            Utilities.SetStateChanged(pawn, "CBaseModelEntity", "m_CBodyComponent");

            item.Initialized = true;

            // Force glove material/texture refresh via bodygroup toggle.
            // Set to 0 immediately, toggle to 1 after 0.2f delay.
            pawn.AcceptInput("SetBodygroup", value: "first_or_third_person,0");
            if (addTimer != null)
            {
                addTimer(0.2f, () =>
                {
                    if (pawn.IsValid)
                        pawn.AcceptInput("SetBodygroup", value: "first_or_third_person,1");
                });
            }
            else
            {
                Server.NextFrame(() =>
                {
                    if (pawn.IsValid)
                        pawn.AcceptInput("SetBodygroup", value: "first_or_third_person,1");
                });
            }
        }
        catch (Exception ex)
        {
            player.PrintToConsole($"[PlayerSkinMod] ApplyGloves error: {ex.Message}");
        }
    }

    public static void AssignItemId(CEconItemView item)
    {
        var id = unchecked(_nextItemId++);
        item.ItemID = id;
        item.ItemIDLow = (uint)(id & 0xFFFFFFFF);
        item.ItemIDHigh = (uint)(id >> 32);
    }
}
