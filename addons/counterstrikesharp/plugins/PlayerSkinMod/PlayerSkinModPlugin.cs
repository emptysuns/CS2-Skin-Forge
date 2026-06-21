using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text.Json;
using CounterStrikeSharp.API;
using CounterStrikeSharp.API.Core;
using CounterStrikeSharp.API.Core.Attributes.Registration;
using CounterStrikeSharp.API.Modules.Memory;
using CounterStrikeSharp.API.Modules.Memory.DynamicFunctions;
using CounterStrikeSharp.API.Modules.Commands;
using CounterStrikeSharp.API.Modules.Utils;
using Microsoft.Extensions.Logging;
using PlayerSkinMod.Models;
using PlayerSkinMod.Data;
using PlayerSkinMod.Services;

namespace PlayerSkinMod;

public class PlayerSkinModPlugin : BasePlugin
{
    public override string ModuleName        => "PlayerSkinMod";
    public override string ModuleVersion     => "1.3.6";
    public override string ModuleAuthor      => "CS2-Skin-local-mod";
    public override string ModuleDescription => "Allow players to customize weapon skins, knives, gloves, agent models, music kits locally";

    private readonly Random _rng = new();
    private readonly Dictionary<int, PlayerLoadout> _playerLoadouts = new();
    private readonly Dictionary<int, string> _playerModels = new();

    private bool _handling = false;
    private MemoryFunctionVoid<nint, string, float>? _setAttrByName;
    private ulong _nextItemId = 0xF00DCAFE;
    private bool _skinErrorLogged = false;

    // Loadout file path - will be set in Load()
    private string _loadoutFilePath = "";

    // Legacy paint detection
    private readonly HashSet<(ushort DefIndex, int Paint)> _legacyPaints = new();

    // Gun paint cache per (player slot, weapon defindex)
    private readonly Dictionary<(int Slot, ushort DefIndex), int> _playerGunPaints = new();

    public override void Load(bool hotReload)
    {
        _skinErrorLogged = false;
        var loadedLegacy = LoadoutService.LoadLegacyPaints(ModuleDirectory, Logger);
        _legacyPaints.Clear();
        foreach (var p in loadedLegacy) _legacyPaints.Add(p);

        // Set up loadout file path - store in the plugin directory
        _loadoutFilePath = Path.Combine(ModuleDirectory, "player_loadout.json");
        Logger.LogInformation($"[PlayerSkinMod] Loadout file path: {_loadoutFilePath}");
        Logger.LogInformation($"[PlayerSkinMod] File exists: {File.Exists(_loadoutFilePath)}");
        Logger.LogInformation($"[PlayerSkinMod] Plugin directory: {ModuleDirectory}");

        // Load any saved loadout from the panel
        LoadoutService.LoadFromFile(_loadoutFilePath, _playerLoadouts, Logger);
        Logger.LogInformation($"[PlayerSkinMod] Loaded loadouts: {_playerLoadouts.Count} entries");

        // Set up a file watcher to reload when the panel saves a new loadout
        try
        {
            var watcher = new FileSystemWatcher(ModuleDirectory, "player_loadout.json")
            {
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.CreationTime,
                EnableRaisingEvents = true
            };
            watcher.Changed += (sender, e) =>
            {
                // Small delay to ensure file is fully written
                System.Threading.Thread.Sleep(100);
                LoadoutService.LoadFromFile(_loadoutFilePath, _playerLoadouts, Logger);
                _playerModels.Clear(); // Clear cached models so agent changes take effect
                _playerGunPaints.Clear(); // Clear cached weapon paints so changes take effect
                Logger.LogInformation("[PlayerSkinMod] Loadout file changed, reloaded");
            };
            watcher.Created += (sender, e) =>
            {
                System.Threading.Thread.Sleep(100);
                LoadoutService.LoadFromFile(_loadoutFilePath, _playerLoadouts, Logger);
                _playerModels.Clear(); // Clear cached models so agent changes take effect
                _playerGunPaints.Clear(); // Clear cached weapon paints so changes take effect
                Logger.LogInformation("[PlayerSkinMod] Loadout file created, loaded");
            };
        }
        catch (Exception ex)
        {
            Logger.LogWarning($"[PlayerSkinMod] Could not set up file watcher: {ex.Message}");
        }

        try
        {
            _setAttrByName = new MemoryFunctionVoid<nint, string, float>(
                RuntimeInformation.IsOSPlatform(OSPlatform.Linux)
                    ? "55 48 89 E5 41 57 41 56 49 89 FE 41 55 41 54 53 48 89 F3 48 83 EC ? F3 0F 11 85"
                    : "40 53 55 41 56 48 81 EC 90 00 00 00");
            Logger.LogInformation($"[PlayerSkinMod] SetOrAddAttributeValueByName loaded: {_setAttrByName != null}");
        }
        catch (Exception ex)
        {
            _setAttrByName = null;
            Logger.LogError($"[PlayerSkinMod] SetOrAddAttributeValueByName signature failed: {ex.Message} (skins/gloves disabled)");
        }

        RegisterListener<Listeners.OnMapStart>(_ =>
        {
            _playerModels.Clear();
            foreach (var m in StaticData.CtModels) Server.PrecacheModel(m);
            foreach (var m in StaticData.TModels)  Server.PrecacheModel(m);
        });

        RegisterEventHandler<EventPlayerSpawn>(OnPlayerSpawn);
        RegisterEventHandler<EventRoundMvp>(OnRoundMvp, HookMode.Pre);
        RegisterEventHandler<EventPlayerTeam>(OnPlayerTeam);
        RegisterEventHandler<EventItemPickup>(OnItemPickup);

        VirtualFunctions.GiveNamedItemFunc.Hook(OnGiveNamedItemPost, HookMode.Post);

        // Register commands for players to customize their loadout
        AddCommand("skin_menu", "Open skin customization menu", OnSkinMenuCommand);
        AddCommand("skin_random", "Enable random skin mode", OnSkinRandomCommand);
        AddCommand("skin_reset", "Reset all skins to default", OnSkinResetCommand);

        Logger.LogInformation("[PlayerSkinMod] Plugin loaded successfully");
    }

    public override void Unload(bool hotReload)
    {
        VirtualFunctions.GiveNamedItemFunc.Unhook(OnGiveNamedItemPost, HookMode.Post);
    }

    // Command handlers
    private void OnSkinMenuCommand(CCSPlayerController? player, CommandInfo command)
    {
        if (player == null || !player.IsValid) return;
        // Reload loadout from file in case panel saved while in-game
        LoadoutService.LoadFromFile(_loadoutFilePath, _playerLoadouts, Logger);

        // Diagnostic info
        var loadout = GetOrCreateLoadout(player.Slot);
        player.PrintToChat(" \x04[PlayerSkinMod]\x01 --- Diagnostic Info ---");
        player.PrintToChat($" \x04[PlayerSkinMod]\x01 Slot: {player.Slot}");
        player.PrintToChat($" \x04[PlayerSkinMod]\x01 Loadout file: {_loadoutFilePath}");
        player.PrintToChat($" \x04[PlayerSkinMod]\x01 File exists: {File.Exists(_loadoutFilePath)}");
        player.PrintToChat($" \x04[PlayerSkinMod]\x01 Loaded loadouts: {_playerLoadouts.Count}");
        player.PrintToChat($" \x04[PlayerSkinMod]\x01 Knife: {loadout.KnifeIndex}, Glove: {loadout.GloveIndex}, AgentCT: {loadout.AgentModelCt}, AgentT: {loadout.AgentModelT}");
        player.PrintToChat($" \x04[PlayerSkinMod]\x01 UseRandom: {loadout.UseRandom}, Weapons: {loadout.WeaponPaints.Count}");
        player.PrintToChat($" \x04[PlayerSkinMod]\x01 SetAttrByName: {_setAttrByName != null}");
        player.PrintToChat(" \x04[PlayerSkinMod]\x01 --- End Diagnostic ---");
        player.PrintToChat(" \x04[PlayerSkinMod]\x10 Respawn to apply skins.");
    }

    private void OnSkinRandomCommand(CCSPlayerController? player, CommandInfo command)
    {
        if (player == null || !player.IsValid) return;
        var loadout = GetOrCreateLoadout(player.Slot);
        loadout.UseRandom = true;
        player.PrintToChat(" \x04[PlayerSkinMod]\x01 Random skin mode enabled!");
    }

    private void OnSkinResetCommand(CCSPlayerController? player, CommandInfo command)
    {
        if (player == null || !player.IsValid) return;
        _playerLoadouts.Remove(player.Slot);
        player.PrintToChat(" \x04[PlayerSkinMod]\x01 All skins reset to default!");
    }

    private PlayerLoadout GetOrCreateLoadout(int slot)
    {
        if (!_playerLoadouts.TryGetValue(slot, out var loadout))
        {
            loadout = new PlayerLoadout();
            _playerLoadouts[slot] = loadout;
        }
        return loadout;
    }

    [GameEventHandler]
    public HookResult OnPlayerSpawn(EventPlayerSpawn @event, GameEventInfo info)
    {
        var player = @event.Userid;

        if (player == null
            || !player.IsValid
            || player.IsBot
            || player.PlayerPawn == null
            || !player.PlayerPawn.IsValid
            || player.PlayerPawn.Value == null
            || !player.PlayerPawn.Value.IsValid)
            return HookResult.Continue;

        if ((CsTeam)player.TeamNum != CsTeam.CounterTerrorist
            && (CsTeam)player.TeamNum != CsTeam.Terrorist)
            return HookResult.Continue;

        var loadout = GetOrCreateLoadout(player.Slot);
        Logger.LogInformation($"[PlayerSkinMod] Player {player.Slot} spawned. Loadout: knife={loadout.KnifeIndex}, glove={loadout.GloveIndex}, agentCT={loadout.AgentModelCt}, agentT={loadout.AgentModelT}, music={loadout.MusicKit}, random={loadout.UseRandom}, weapons={loadout.WeaponPaints.Count}, setAttrByName={_setAttrByName != null}");

        if (!_playerModels.TryGetValue(player.Slot, out string? model))
        {
            string[] pool;
            int agentIdx;
            if ((CsTeam)player.TeamNum == CsTeam.CounterTerrorist)
            {
                pool = StaticData.CtModels;
                agentIdx = loadout.AgentModelCt;
            }
            else
            {
                pool = StaticData.TModels;
                agentIdx = loadout.AgentModelT;
            }
            model = agentIdx >= 0 ? pool[Math.Min(agentIdx, pool.Length - 1)] : pool[_rng.Next(pool.Length)];
            _playerModels[player.Slot] = model;
        }

        int kitId = loadout.MusicKit >= 0 ? StaticData.KitIds[Math.Min(loadout.MusicKit, StaticData.KitIds.Length - 1)] : StaticData.KitIds[_rng.Next(StaticData.KitIds.Length)];

        int knifeIdx = loadout.KnifeIndex >= 0 ? Math.Min(loadout.KnifeIndex, StaticData.Knives.Length - 1) : _rng.Next(StaticData.Knives.Length);
        int knifePaint = loadout.KnifePaint >= 0 ? loadout.KnifePaint : StaticData.KnifePaints[_rng.Next(StaticData.KnifePaints.Length)];

        int gloveIdx = loadout.GloveIndex >= 0 ? Math.Min(loadout.GloveIndex, StaticData.Gloves.Length - 1) : _rng.Next(StaticData.Gloves.Length);
        var glove = StaticData.Gloves[gloveIdx];
        int glovePaint = loadout.GlovePaint >= 0 ? loadout.GlovePaint : glove.PaintKit;

        var pawn = player.PlayerPawn.Value;
        var assignedModel = model;
        var knife = StaticData.Knives[knifeIdx];

        Server.NextFrame(() =>
        {
            if (pawn == null || !pawn.IsValid) return;

            pawn.SetModel(assignedModel);
            Utilities.SetStateChanged(pawn, "CBaseEntity", "m_CBodyComponent");

            var c = pawn.Render;
            pawn.Render = Color.FromArgb(255, c.R, c.G, c.B);
            Utilities.SetStateChanged(pawn, "CBaseModelEntity", "m_clrRender");

            if (player == null || !player.IsValid) return;

            player.MusicKitID = kitId;
            Utilities.SetStateChanged(player, "CCSPlayerController", "m_iMusicKitID");

            ApplyWearables(player, pawn, knife.DefIndex, knifePaint, loadout, glove.DefIndex, glovePaint);
            AddTimer(0.10f, () => ApplyWearables(player, pawn, knife.DefIndex, knifePaint, loadout, glove.DefIndex, glovePaint));
            AddTimer(0.25f, () => ApplyWearables(player, pawn, knife.DefIndex, knifePaint, loadout, glove.DefIndex, glovePaint));
        });

        return HookResult.Continue;
    }

    private void ApplyWearables(CCSPlayerController player, CCSPlayerPawn pawn, ushort knifeDefIndex, int knifePaintKit, PlayerLoadout loadout, ushort gloveDefIndex, int glovePaintKit)
    {
        if (player == null || !player.IsValid || pawn == null || !pawn.IsValid)
            return;

        if (_setAttrByName == null) return;

        // Read knife wear/seed from loadout
        int knifeSeed = loadout.KnifeSeed;
        float knifeWear = loadout.KnifeWear;

        WeaponService.ReplaceKnife(pawn, knifeDefIndex, knifePaintKit, _legacyPaints, _setAttrByName, knifeSeed, knifeWear);
        int gloveSeed = loadout.GloveSeed;
        float gloveWear = loadout.GloveWear;
        WeaponService.ApplyGloves(player, pawn, gloveDefIndex, glovePaintKit, _setAttrByName, gloveSeed, gloveWear);
    }

    private HookResult OnGiveNamedItemPost(DynamicHook hook)
    {
        if (_setAttrByName == null)
            return HookResult.Continue;

        try
        {
            var itemServices = hook.GetParam<CCSPlayer_ItemServices>(0);
            var weapon = hook.GetReturn<CBasePlayerWeapon>();

            if (weapon == null || !weapon.IsValid)
                return HookResult.Continue;

            var name = weapon.DesignerName;
            if (string.IsNullOrEmpty(name) || !name.Contains("weapon"))
                return HookResult.Continue;

            var player = WeaponService.GetPlayerFromItemServices(itemServices);
            if (player == null || !player.IsValid || player.IsBot)
                return HookResult.Continue;

            int slot = player.Slot;
            ulong steamId = player.SteamID;
            ApplySkinForPlayer(slot, weapon, steamId);

            Server.NextFrame(() =>
            {
                if (weapon != null && weapon.IsValid)
                    ApplySkinForPlayer(slot, weapon, steamId);
            });
        }
        catch (Exception ex)
        {
            Logger.LogError($"[PlayerSkinMod] OnGiveNamedItemPost failed: {ex.Message}");
        }

        return HookResult.Continue;
    }

    private void ApplySkinForPlayer(int slot, CBasePlayerWeapon? weapon, ulong steamId = 0)
    {
        if (_setAttrByName == null || weapon == null || !weapon.IsValid) return;

        var loadout = GetOrCreateLoadout(slot);

        var name = weapon.DesignerName;
        if (string.IsNullOrEmpty(name)) return;
        if (name.Contains("knife") || name == "weapon_bayonet") return;

        ushort defIndex = weapon.AttributeManager?.Item?.ItemDefinitionIndex ?? 0;
        if (defIndex == 0) return;

        int paint;
        if (loadout.WeaponPaints.TryGetValue(defIndex, out int selectedPaint))
        {
            paint = selectedPaint;
        }
        else if (loadout.UseRandom && StaticData.GunPaints.TryGetValue(defIndex, out int[]? paints) && paints.Length > 0)
        {
            var key = (slot, defIndex);
            if (!_playerGunPaints.TryGetValue(key, out paint))
            {
                paint = paints[_rng.Next(paints.Length)];
                _playerGunPaints[key] = paint;
            }
        }
        else
        {
            return;
        }

        // Read wear/seed from loadout (backward-compatible)
        int seed = loadout.WeaponSeeds.TryGetValue(defIndex, out int s) ? s : 0;
        float wear = loadout.WeaponWears.TryGetValue(defIndex, out float w) ? w : 0.01f;

        ApplySkinToWeaponInternal(weapon, defIndex, paint, seed, wear, steamId);

        // Apply stickers if configured
        if (loadout.WeaponStickers.TryGetValue(defIndex, out var stickers) && stickers.Count > 0)
            ApplyStickersInternal(weapon, stickers);
    }

    private void ApplySkinToWeaponInternal(CEconEntity weapon, ushort defIndex, int paintKit, int seed = 0, float wear = 0.01f, ulong steamId = 0)
    {
        if (_setAttrByName == null) return;

        try
        {
            var item = weapon.AttributeManager?.Item;
            if (item == null) return;

            item.AttributeList.Attributes.RemoveAll();
            item.NetworkedDynamicAttributes.Attributes.RemoveAll();
            AssignItemId(item);
            if (steamId > 0) item.AccountID = (uint)steamId;

            weapon.FallbackPaintKit = paintKit;
            weapon.FallbackSeed = seed;
            weapon.FallbackWear = wear;

            _setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture prefab", paintKit);
            _setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture seed", (float)seed);
            _setAttrByName.Invoke(item.NetworkedDynamicAttributes.Handle, "set item texture wear", wear);

            _setAttrByName.Invoke(item.AttributeList.Handle, "set item texture prefab", paintKit);
            _setAttrByName.Invoke(item.AttributeList.Handle, "set item texture seed", (float)seed);
            _setAttrByName.Invoke(item.AttributeList.Handle, "set item texture wear", wear);

            Utilities.SetStateChanged(weapon, "CEconEntity", "m_AttributeManager");

            bool isLegacy = _legacyPaints.Contains((defIndex, paintKit));
            weapon.AcceptInput("SetBodygroup", value: $"body,{(isLegacy ? 1 : 0)}");
            Utilities.SetStateChanged(weapon, "CBaseModelEntity", "m_CBodyComponent");
        }
        catch (Exception ex)
        {
            if (!_skinErrorLogged)
            {
                _skinErrorLogged = true;
                Logger.LogError($"[PlayerSkinMod] ApplySkinToWeapon failed: {ex.Message}");
            }
        }
    }

    private void ApplyStickersInternal(CBasePlayerWeapon weapon, List<StickerInfo> stickers)
    {
        if (_setAttrByName == null || stickers.Count == 0) return;
        var item = weapon.AttributeManager?.Item;
        if (item == null) return;

        for (int i = 0; i < Math.Min(stickers.Count, 5); i++)
        {
            var s = stickers[i];
            if (s.Id == 0) continue;
            var handle = item.NetworkedDynamicAttributes.Handle;
            _setAttrByName.Invoke(handle, $"sticker slot {i} id", UIntToFloat(s.Id));
            if (s.OffsetX != 0 || s.OffsetY != 0)
                _setAttrByName.Invoke(handle, $"sticker slot {i} schema", 0f);
            _setAttrByName.Invoke(handle, $"sticker slot {i} offset x", s.OffsetX);
            _setAttrByName.Invoke(handle, $"sticker slot {i} offset y", s.OffsetY);
            _setAttrByName.Invoke(handle, $"sticker slot {i} wear", s.Wear);
            _setAttrByName.Invoke(handle, $"sticker slot {i} scale", s.Scale);
            _setAttrByName.Invoke(handle, $"sticker slot {i} rotation", s.Rotation);
        }
    }

    private static float UIntToFloat(uint value) => BitConverter.Int32BitsToSingle((int)value);

    private void AssignItemId(CEconItemView item)
    {
        var id = unchecked(_nextItemId++);
        item.ItemID = id;
        item.ItemIDLow = (uint)(id & 0xFFFFFFFF);
        item.ItemIDHigh = (uint)(id >> 32);
    }

    [GameEventHandler]
    public HookResult OnItemPickup(EventItemPickup @event, GameEventInfo info)
    {
        var player = @event.Userid;
        if (player == null || !player.IsValid || player.IsBot)
            return HookResult.Continue;

        var item = @event.Item;
        if (string.IsNullOrEmpty(item) || !(item.Contains("knife") || item.Contains("bayonet")))
            return HookResult.Continue;

        var pawn = player.PlayerPawn?.Value;
        if (pawn == null || !pawn.IsValid)
            return HookResult.Continue;

        Server.NextFrame(() => SyncPickedUpKnife(pawn));
        AddTimer(0.10f, () => { if (pawn != null && pawn.IsValid) SyncPickedUpKnife(pawn); });
        AddTimer(0.25f, () => { if (pawn != null && pawn.IsValid) SyncPickedUpKnife(pawn); });
        return HookResult.Continue;
    }

    private void SyncPickedUpKnife(CCSPlayerPawn pawn)
    {
        try
        {
            if (pawn == null || !pawn.IsValid) return;

            var weapons = pawn.WeaponServices?.MyWeapons;
            if (weapons == null) return;

            foreach (var handle in weapons)
            {
                var w = handle.Value;
                if (w == null || !w.IsValid) continue;

                var name = w.DesignerName;
                if (string.IsNullOrEmpty(name)) continue;

                if (!StaticData.KnifeDefIndexByName.TryGetValue(name, out ushort defIndex)) continue;

                var item = w.AttributeManager?.Item;
                if (item == null) continue;

                w.AcceptInput("ChangeSubclass", value: defIndex.ToString());
                item.ItemDefinitionIndex = defIndex;
                Utilities.SetStateChanged(w, "CEconEntity", "m_AttributeManager");
            }
        }
        catch (Exception ex)
        {
            Logger.LogError($"[PlayerSkinMod] SyncPickedUpKnife failed: {ex.Message}");
        }
    }

    [GameEventHandler]
    public HookResult OnPlayerTeam(EventPlayerTeam @event, GameEventInfo info)
    {
        var player = @event.Userid;
        if (player == null || !player.IsValid || player.IsBot)
            return HookResult.Continue;

        int slot = player.Slot;
        _playerModels.Remove(slot);
        foreach (var key in _playerGunPaints.Keys.Where(k => k.Slot == slot).ToList())
            _playerGunPaints.Remove(key);

        return HookResult.Continue;
    }

    [GameEventHandler(HookMode.Pre)]
    public HookResult OnRoundMvp(EventRoundMvp @event, GameEventInfo info)
    {
        if (_handling)
            return HookResult.Continue;

        var player = @event.Userid;

        if (player == null || !player.IsValid || player.IsBot)
            return HookResult.Continue;

        var loadout = GetOrCreateLoadout(player.Slot);
        int kitId = loadout.MusicKit >= 0 ? StaticData.KitIds[Math.Min(loadout.MusicKit, StaticData.KitIds.Length - 1)] : StaticData.KitIds[_rng.Next(StaticData.KitIds.Length)];

        info.DontBroadcast = true;
        _handling = true;

        if (player.MusicKitID != kitId)
        {
            player.MusicKitID = kitId;
            Utilities.SetStateChanged(player, "CCSPlayerController", "m_iMusicKitID");
        }

        EventRoundMvp? newEvent = null;
        try
        {
            newEvent = new EventRoundMvp(true)
            {
                Userid     = player,
                Musickitid = kitId,
                Nomusic    = 0,
                Reason     = @event.Reason,
                Value      = @event.Value,
            };

            foreach (var human in Utilities.GetPlayers()
                         .Where(p => p.IsValid && !p.IsHLTV && !p.IsBot))
            {
                try { newEvent.FireEventToClient(human); }
                catch { }
            }
        }
        finally
        {
            try { newEvent?.Free(); } catch { }
            _handling = false;
        }

        return HookResult.Continue;
    }
}
