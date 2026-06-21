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
                // Set StatTrak count via attribute
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

    public static void ReplaceKnife(
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
            foreach (var handle in weapons)
            {
                var w = handle.Value;
                if (w == null || !w.IsValid) continue;
                var name = w.DesignerName;
                if (string.IsNullOrEmpty(name)) continue;
                if (name != "weapon_knife" && name != "weapon_knife_t") continue;

                w.AcceptInput("ChangeSubclass", value: defIndex.ToString());

                var item = w.AttributeManager?.Item;
                if (item == null) break;

                item.ItemDefinitionIndex = defIndex;
                item.EntityQuality = 3;

                item.AttributeList.Attributes.RemoveAll();
                item.NetworkedDynamicAttributes.Attributes.RemoveAll();

                AssignItemId(item);

                if (paintKit > 0)
                {
                    w.FallbackPaintKit = paintKit;
                    w.FallbackSeed = knifeSeed;
                    w.FallbackWear = knifeWear;

                    setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture prefab", paintKit);
                    setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture seed", (float)knifeSeed);
                    setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture wear", knifeWear);

                    setAttrByName.Invoke(item.AttributeList.Handle, "set item texture prefab", paintKit);
                    setAttrByName.Invoke(item.AttributeList.Handle, "set item texture seed", (float)knifeSeed);
                    setAttrByName.Invoke(item.AttributeList.Handle, "set item texture wear", knifeWear);
                }

                Utilities.SetStateChanged(w, "CEconEntity", "m_AttributeManager");

                // Handle legacy bodygroup for knife skins
                bool isLegacy = legacyPaints.Contains((defIndex, paintKit));
                w.AcceptInput("SetBodygroup", value: $"body,{(isLegacy ? 1 : 0)}");
                Utilities.SetStateChanged(w, "CBaseModelEntity", "m_CBodyComponent");
                break;
            }
        }
        catch (Exception ex)
        {
        }
    }

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

            // Clear existing attributes
            item.NetworkedDynamicAttributes.Attributes.RemoveAll();
            item.AttributeList.Attributes.RemoveAll();

            // Set glove identity
            item.ItemDefinitionIndex = defIndex;
            AssignItemId(item);

            // Apply skin attributes on BOTH lists (critical for CS2 rendering)
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture seed", (float)seed);
            setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture wear", wear);

            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture prefab", paintKit);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture seed", (float)seed);
            setAttrByName.Invoke(item.AttributeList.Handle, "set item texture wear", wear);

            item.Initialized = true;

            // Force glove model refresh via bodygroup toggle (NO lastinv — that causes conflicts)
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
