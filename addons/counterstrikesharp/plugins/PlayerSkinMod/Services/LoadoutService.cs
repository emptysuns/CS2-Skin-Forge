using System.Text.Json;
using Microsoft.Extensions.Logging;
using PlayerSkinMod.Models;

namespace PlayerSkinMod.Services;

public static class LoadoutService
{
    public static void LoadFromFile(
        string filePath,
        Dictionary<int, PlayerLoadout> playerLoadouts,
        ILogger logger)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                logger.LogInformation($"[PlayerSkinMod] Loadout file not found: {filePath} (will use random skins)");
                return;
            }

            var json = File.ReadAllText(filePath);
            if (string.IsNullOrWhiteSpace(json))
            {
                logger.LogInformation("[PlayerSkinMod] Loadout file is empty");
                return;
            }

            logger.LogInformation($"[PlayerSkinMod] Read loadout file ({json.Length} bytes): {json.Substring(0, Math.Min(200, json.Length))}");

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            foreach (var prop in root.EnumerateObject())
            {
                if (!int.TryParse(prop.Name, out int slot))
                {
                    logger.LogWarning($"[PlayerSkinMod] Skipping non-numeric key: {prop.Name}");
                    continue;
                }
                var loadoutEl = prop.Value;

                var loadout = new PlayerLoadout();

                if (loadoutEl.TryGetProperty("useRandom", out var useRandomEl))
                    loadout.UseRandom = useRandomEl.GetBoolean();

                if (loadoutEl.TryGetProperty("knifeIndex", out var knifeIdxEl) && knifeIdxEl.GetInt32() >= 0)
                    loadout.KnifeIndex = knifeIdxEl.GetInt32();

                if (loadoutEl.TryGetProperty("knifePaint", out var knifePaintEl) && knifePaintEl.GetInt32() >= 0)
                    loadout.KnifePaint = knifePaintEl.GetInt32();

                if (loadoutEl.TryGetProperty("knifeWear", out var knifeWearEl))
                    loadout.KnifeWear = (float)knifeWearEl.GetDouble();

                if (loadoutEl.TryGetProperty("knifeSeed", out var knifeSeedEl))
                    loadout.KnifeSeed = knifeSeedEl.GetInt32();

                if (loadoutEl.TryGetProperty("gloveIndex", out var gloveIdxEl) && gloveIdxEl.GetInt32() >= 0)
                    loadout.GloveIndex = gloveIdxEl.GetInt32();

                if (loadoutEl.TryGetProperty("glovePaint", out var glovePaintEl) && glovePaintEl.GetInt32() >= 0)
                    loadout.GlovePaint = glovePaintEl.GetInt32();

                if (loadoutEl.TryGetProperty("gloveWear", out var gloveWearEl))
                    loadout.GloveWear = (float)gloveWearEl.GetDouble();

                if (loadoutEl.TryGetProperty("gloveSeed", out var gloveSeedEl))
                    loadout.GloveSeed = gloveSeedEl.GetInt32();

                // New: separate CT/T agent models
                if (loadoutEl.TryGetProperty("agentModelCt", out var agentCtEl) && agentCtEl.GetInt32() >= 0)
                    loadout.AgentModelCt = agentCtEl.GetInt32();
                if (loadoutEl.TryGetProperty("agentModelT", out var agentTEl) && agentTEl.GetInt32() >= 0)
                    loadout.AgentModelT = agentTEl.GetInt32();
                // Backward compat: if old agentModel exists and new fields don't, use old value for both
                if (loadout.AgentModelCt < 0 && loadout.AgentModelT < 0 && loadoutEl.TryGetProperty("agentModel", out var oldAgentEl) && oldAgentEl.GetInt32() >= 0)
                {
                    loadout.AgentModelCt = oldAgentEl.GetInt32();
                    loadout.AgentModelT = oldAgentEl.GetInt32();
                }

                if (loadoutEl.TryGetProperty("musicKit", out var musicEl) && musicEl.GetInt32() >= 0)
                    loadout.MusicKit = musicEl.GetInt32();

                if (loadoutEl.TryGetProperty("weaponPaints", out var wpEl))
                {
                    foreach (var wp in wpEl.EnumerateObject())
                    {
                        if (ushort.TryParse(wp.Name, out ushort defIndex) && wp.Value.GetInt32() >= 0)
                            loadout.WeaponPaints[defIndex] = wp.Value.GetInt32();
                    }
                }

                // NEW: Load weapon seeds (backward-compatible, missing = 0)
                if (loadoutEl.TryGetProperty("weaponSeeds", out var wsEl))
                {
                    foreach (var ws in wsEl.EnumerateObject())
                    {
                        if (ushort.TryParse(ws.Name, out ushort defIndex))
                            loadout.WeaponSeeds[defIndex] = ws.Value.GetInt32();
                    }
                }

                // NEW: Load weapon wears (backward-compatible, missing = 0.01f)
                if (loadoutEl.TryGetProperty("weaponWears", out var wwEl))
                {
                    foreach (var ww in wwEl.EnumerateObject())
                    {
                        if (ushort.TryParse(ww.Name, out ushort defIndex))
                            loadout.WeaponWears[defIndex] = (float)ww.Value.GetDouble();
                    }
                }

                if (loadoutEl.TryGetProperty("weaponStickers", out var wstEl))
                {
                    foreach (var ws in wstEl.EnumerateObject())
                    {
                        if (!ushort.TryParse(ws.Name, out ushort defIdx)) continue;
                        var stickerList = new List<StickerInfo>();
                        foreach (var sEl in ws.Value.EnumerateArray())
                        {
                            var si = new StickerInfo();
                            if (sEl.TryGetProperty("id", out var idEl)) si.Id = (uint)idEl.GetInt32();
                            if (sEl.TryGetProperty("offsetX", out var oxEl)) si.OffsetX = (float)oxEl.GetDouble();
                            if (sEl.TryGetProperty("offsetY", out var oyEl)) si.OffsetY = (float)oyEl.GetDouble();
                            if (sEl.TryGetProperty("wear", out var wEl)) si.Wear = (float)wEl.GetDouble();
                            if (sEl.TryGetProperty("scale", out var scEl)) si.Scale = (float)scEl.GetDouble();
                            if (sEl.TryGetProperty("rotation", out var rEl)) si.Rotation = (float)rEl.GetDouble();
                            stickerList.Add(si);
                        }
                        if (stickerList.Count > 0)
                            loadout.WeaponStickers[defIdx] = stickerList;
                    }
                }

                playerLoadouts[slot] = loadout;
                logger.LogInformation($"[PlayerSkinMod] Loaded loadout for slot {slot}: knife={loadout.KnifeIndex}, glove={loadout.GloveIndex}, agentCT={loadout.AgentModelCt}, agentT={loadout.AgentModelT}, music={loadout.MusicKit}, weapons={loadout.WeaponPaints.Count}, random={loadout.UseRandom}");
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"[PlayerSkinMod] LoadLoadoutFromFile failed: {ex.Message}");
        }
    }

    public static HashSet<(ushort DefIndex, int Paint)> LoadLegacyPaints(string moduleDirectory, ILogger logger)
    {
        var legacyPaints = new HashSet<(ushort DefIndex, int Paint)>();
        try
        {
            var path = Path.Combine(moduleDirectory, "skins_en.json");
            if (!File.Exists(path))
            {
                logger.LogWarning("[PlayerSkinMod] skins_en.json not found; weapon skins may map to the wrong model position");
                return legacyPaints;
            }

            using var doc = JsonDocument.Parse(File.ReadAllText(path));
            foreach (var el in doc.RootElement.EnumerateArray())
            {
                if (!el.TryGetProperty("legacy_model", out var legacyEl)
                    || legacyEl.ValueKind != JsonValueKind.True)
                    continue;
                if (!el.TryGetProperty("weapon_defindex", out var defEl)) continue;
                if (!el.TryGetProperty("paint", out var paintEl)) continue;

                legacyPaints.Add(((ushort)ReadInt(defEl), ReadInt(paintEl)));
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"[PlayerSkinMod] LoadLegacyPaints failed: {ex.Message}");
        }

        return legacyPaints;

        static int ReadInt(JsonElement e) =>
            e.ValueKind == JsonValueKind.Number
                ? e.GetInt32()
                : int.TryParse(e.GetString(), out var v) ? v : 0;
    }
}
