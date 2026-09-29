from pathlib import Path

root = Path('/tmp/the-free-game/game')

def replace(path, old, new, count=1):
    p = root / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Padrao nao encontrado em {path}: {old[:80]!r}')
    text = text.replace(old, new, count)
    p.write_text(text, encoding='utf-8')

# Usa a camada autônoma como simulação principal.
replace(
    'presentation/approved_game.gd',
    'const Village = preload("res://simulation/approved_sim.gd")',
    'const Village = preload("res://simulation/autonomous_sim.gd")'
)

# Retoma automaticamente o autosave local quando o usuário volta ao site.
replace(
    'presentation/approved_game.gd',
    '\t_setup_audio()\n\tprint("PLAYABLE_READY: The Free Game — 0.4.4")',
    '\t_setup_audio()\n\tif FileAccess.file_exists("user://vale-approved-autosave-v1.json"):\n\t\t_load_paths(["user://vale-approved-autosave-v1.json"])\n\tprint("PLAYABLE_READY: The Free Game — 0.4.4 AUTONOMOUS")'
)
replace(
    'presentation/approved_game.gd',
    'tr("Partida recuperada. Nada avançou enquanto esteve fechada.")',
    'tr("Partida recuperada. A vila continuou evoluindo enquanto esteve fechada.")'
)

# O contador superior passa a usar população virtual (habitantes), não apenas atores 3D.
replace(
    'ui/approved_hud.gd',
    'label.text = "%d/%d" % [workers.size(),int(_call_value("population_capacity",workers.size()))]',
    'label.text = "%d/%d" % [int(_call_value("population_count",workers.size())),int(_call_value("population_capacity",workers.size()))]'
)

# Limites apenas de renderização, não da simulação: mantém o celular responsivo.
replace(
    'presentation/approved_world.gd',
    ' var alive := {}\n for b: Dictionary in sim.buildings:\n  if b.stage=="cancelled":continue\n  alive[b.id]=true',
    ' var alive := {}\n var rendered_buildings := 0\n for b: Dictionary in sim.buildings:\n  if b.stage=="cancelled":continue\n  if rendered_buildings >= 240: continue\n  rendered_buildings += 1\n  alive[b.id]=true'
)
replace(
    'presentation/approved_world.gd',
    ' alive.clear()\n for worker: Dictionary in sim.workers:\n  alive[worker.id]=true',
    ' alive.clear()\n var rendered_workers := 0\n for worker: Dictionary in sim.workers:\n  if rendered_workers >= 120: continue\n  rendered_workers += 1\n  alive[worker.id]=true'
)
replace(
    'presentation/approved_world.gd',
    ' detail_cursor=(detail_cursor+1)%maxi(1,sim.workers.size())',
    ' detail_cursor=(detail_cursor+1)%maxi(1,mini(sim.workers.size(),120))'
)

print('Patches de autonomia aplicados.')
