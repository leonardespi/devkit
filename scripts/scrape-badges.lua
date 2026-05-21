-- scrape-badges.lua
-- Extracts badge catalog from badges.pages.dev/script.js → techstack.json
-- Source language: Lua 5.5  |  Target: LuaJIT (compile with valua)
--
-- The site is a SPA; badge data is embedded in script.js as JS object literals.
-- Object field order (fixed): superLight → … → path → shortHex → slug → title → badgeEncodedTitle
-- URL template (from site JS):
--   https://img.shields.io/badge/{encodedTitle}-{shortHex}?logo={slug}&logoColor={logoColor}&style=for-the-badge
--   logoColor = superLight ? "000" : "fff"

local SCRIPT_URL <const> = "https://badges.pages.dev/script.js"
local OUTPUT     <const> = "src/tools/readme-wizard/techstack.json"
local SAMPLE     <const> = 10

-- superLight:(!0|!1) … path:"SVG" … shortHex:"HEX",slug:"SLUG",title:"TITLE",badgeEncodedTitle:"ENC"
local BADGE_PAT <const> =
    'superLight:(!%d),[^}]-path:"[^"]*",shortHex:"([^"]+)",slug:"([^"]+)",title:"([^"]+)",badgeEncodedTitle:"([^"]*)"'

local SHIELD_BASE <const> = "https://img.shields.io/badge/"

local function fetch(url)
    local h = io.popen('curl -s --fail -- "' .. url .. '"')
    assert(h, "io.popen failed")
    local body = h:read("*a")
    h:close()
    assert(body and #body > 0, "curl returned empty body — check network/URL")
    return body
end

local function build_url(encodedTitle, shortHex, slug, logoColor)
    return SHIELD_BASE .. encodedTitle .. "-" .. shortHex
        .. "?logo=" .. slug
        .. "&logoColor=" .. logoColor
        .. "&style=for-the-badge"
end

local function scrape(js)
    local badges = {}
    for superLight, shortHex, slug, title, encodedTitle in js:gmatch(BADGE_PAT) do
        local logoColor <const> = superLight == "!0" and "000" or "fff"
        badges[title] = build_url(encodedTitle, shortHex, slug, logoColor)
    end
    return badges
end

local function sorted_keys(t)
    local keys = {}
    for k in pairs(t) do
        keys[#keys + 1] = k
    end
    table.sort(keys)
    return keys
end

local function json_str(s)
    s = s:gsub('\\', '\\\\')
    s = s:gsub('"',  '\\"')
    return '"' .. s .. '"'
end

local function write_json(badges, path)
    local f    = assert(io.open(path, "w"), "cannot open " .. path)
    local keys <const> = sorted_keys(badges)
    local n    <const> = #keys
    f:write("{\n")
    for i, k in ipairs(keys) do
        local sep = i < n and "," or ""
        f:write("  " .. json_str(k) .. ": " .. json_str(badges[k]) .. sep .. "\n")
    end
    f:write("}\n")
    f:close()
    return n
end

local js     <const> = fetch(SCRIPT_URL)
local badges <const> = scrape(js)
local n      <const> = write_json(badges, OUTPUT)

io.write(string.format("scraped %d badges → %s\n", n, OUTPUT))

local keys  <const> = sorted_keys(badges)
for i = 1, math.min(SAMPLE, n) do
    local k = keys[i]
    io.write(string.format("  %s: %s\n", k, badges[k]))
end
