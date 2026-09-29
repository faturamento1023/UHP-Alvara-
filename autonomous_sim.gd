extends "res://simulation/approved_sim.gd"
## Camada autônoma da vila: crescimento populacional, expansão urbana,
## força de trabalho e manutenção continuam sem ordens do jogador.

const TARGET_POPULATION := 10000
const TARGET_WORKERS := 500
const MAX_AUTO_BUILDINGS := 440
const AUTO_COLS := 37
const AUTO_ROWS := 25
const ROLE_CYCLE := [
	"builder", "servant", "farmer", "servant", "lumberjack",
	"farmer", "vintner", "stonecutter", "miller", "baker", "instructor"
]
const ECONOMY_CYCLE := [
	"farm", "house", "lumber", "house", "vineyard", "house", "inn",
	"house", "store", "house", "farm", "house", "mill", "bakery",
	"house", "winery", "house"
]

var population_total := 17
var _autonomy_cursor := 0
var _build_cycle := 0
var _announced_milestone := 0


func setup(_peaceful_mode: bool = true) -> void:
	super.setup(true)
	population_total = workers.size()
	_autonomy_cursor = 0
	_build_cycle = 0
	_announced_milestone = 0
	_auto_connect_building(buildings[1])
	_emit("Governador autônomo ativado. A vila agora cresce, abre caminhos e organiza trabalho sozinha.", "chime")
	_assign_maintenance()


func population_count() -> int:
	return maxi(population_total, workers.size())


func population_capacity() -> int:
	# Não existe teto final: a capacidade exibida acompanha a expansão.
	var housing := 100 + 40 * _completed("house")
	return maxi(housing, population_count() + 1000)


func command(kind: String, payload: Dictionary = {}) -> Dictionary:
	# O limite de 500 é apenas da força de trabalho simulada/renderizável no celular.
	# A população total continua crescendo sem teto por population_total.
	if kind == "train" and workers.size() + training.size() >= TARGET_WORKERS:
		return _result(true, "A força de trabalho ativa já tem 500 pessoas. Novos habitantes continuam chegando à vila.")
	return super.command(kind, payload)


func step() -> void:
	if paused or lost:
		super.step()
		return
	_clear_maintenance()
	super.step()
	if tick % 2 == 0:
		_grow_workforce()
	if tick % 4 == 0:
		_grow_population()
	if tick % 8 == 0:
		_autonomous_planner()
	if tick % 20 == 0:
		_trade_and_taxes()
	_assign_maintenance()


func _grow_population() -> void:
	var gain := 20 if population_total < TARGET_POPULATION else 4
	population_total += gain
	for milestone in [100, 500, 1000, 2500, 5000, 10000]:
		if population_total >= milestone and _announced_milestone < milestone:
			_announced_milestone = milestone
			_emit("A vila alcançou %d habitantes e continua crescendo." % milestone, "chime")


func _grow_workforce() -> void:
	if workers.size() >= TARGET_WORKERS:
		return
	var role: String = ROLE_CYCLE[(workers.size() - 17) % ROLE_CYCLE.size()]
	var seats := plaza_rest_cells()
	var spawn := HUB
	if not seats.is_empty():
		spawn = seats[workers.size() % seats.size()]
	var person := _add_worker(role, spawn)
	person.previous = spawn
	person.goal = spawn
	person.meal = 200
	person.state = "Chegando para trabalhar"
	if workers.size() in [50, 100, 250, 500]:
		_emit("Força de trabalho: %d pessoas ativas na vila." % workers.size(), "chime")


func _trade_and_taxes() -> void:
	# Comércio regional e impostos impedem que a cidade autônoma entre em deadlock.
	# Toda entrada é registrada em produced para preservar a contabilidade do save.
	_auto_supply("food", 30, 700)
	_auto_supply("wood", 20, 500)
	_auto_supply("stone", 20, 500)
	_auto_supply("gold", 4, 300)


func _auto_supply(item: String, amount: int, target: int) -> void:
	if int(stock.get(item, 0)) >= target:
		return
	var quantity := mini(amount, target - int(stock.get(item, 0)))
	stock[item] = int(stock.get(item, 0)) + quantity
	produced[item] = int(produced.get(item, 0)) + quantity


func _autonomous_planner() -> void:
	if buildings.size() >= MAX_AUTO_BUILDINGS:
		return
	_build_cycle += 1
	var kind := _next_build_kind()
	_auto_add_building(kind)


func _next_build_kind() -> String:
	if _completed("store") < 1: return "store"
	if _completed("inn") < 1: return "inn"
	if _completed("farm") < 3: return "farm"
	if _completed("lumber") < 2: return "lumber"
	if _completed("quarry") < 1: return "quarry"
	if _completed("vineyard") < 2: return "vineyard"
	if _completed("winery") < 1: return "winery"
	if _completed("mill") < 1: return "mill"
	if _completed("bakery") < 1: return "bakery"
	if _completed("training") < 2: return "training"
	var houses := _completed("house")
	# Quatro de cada cinco expansões priorizam moradia quando a população avança.
	if _build_cycle % 5 != 0 and houses * 40 < population_total:
		return "house"
	return ECONOMY_CYCLE[_build_cycle % ECONOMY_CYCLE.size()]


func _auto_add_building(kind: String) -> bool:
	var cell := _auto_find_cell(kind)
	if cell.x > 90000:
		return false
	var building := _add_building(kind, cell, true)
	building.initial = false
	if kind == "house":
		stats.houses_built = int(stats.get("houses_built", 0)) + 1
	_rebuild_navigation()
	_auto_connect_building(building)
	if buildings.size() % 20 == 0 or kind not in ["house", "farm"]:
		_emit("Expansão autônoma: %s concluído(a)." % str(definition(kind).name))
	return true


func _auto_find_cell(kind: String) -> Vector2i:
	if kind == "quarry":
		for deposit in stone_deposits:
			for offset in [Vector2i(-2,-2),Vector2i(-2,-1),Vector2i(-1,-2),Vector2i(0,-2),Vector2i(-2,0),Vector2i(1,-1),Vector2i(-1,1)]:
				var qcell: Vector2i = deposit + offset
				if can_place(kind, qcell).is_empty():
					return qcell
	var total := AUTO_COLS * AUTO_ROWS
	for attempt in range(total):
		var index := (_autonomy_cursor + attempt) % total
		var gx := index % AUTO_COLS
		var gy := floori(float(index) / float(AUTO_COLS))
		var cell := Vector2i(-48 + gx * 4, -32 + gy * 4)
		if can_place(kind, cell).is_empty():
			_autonomy_cursor = (index + 1) % total
			return cell
	_autonomy_cursor = (_autonomy_cursor + 1) % total
	return Vector2i(99999, 99999)


func _auto_connect_building(building: Dictionary) -> void:
	if building.is_empty():
		return
	_rebuild_navigation()
	var path: Array[Vector2i] = navigation.get_id_path(HUB, building.entrance)
	if path.is_empty():
		return
	for cell in path:
		if cell == HUB or is_plaza_cell(cell):
			continue
		if not road_at(cell).is_empty():
			continue
		roads.append({
			"id": _id(), "cell": cell, "stage": "complete", "progress": 1.0,
			"builder": -1, "funded": false, "delivered": 0, "carrier": -1,
			"reason": "Via aberta pelo plano autônomo"
		})
	_rebuild_roads()


func _clear_maintenance() -> void:
	for person in workers:
		if person.task.get("type", "") == "maintenance":
			person.task = {}
			person.state = "Disponível"


func _assign_maintenance() -> void:
	for person in workers:
		if person.task.is_empty() and person.cargo.is_empty():
			person.task = {"type":"maintenance", "building":-1}
			person.state = "Trabalhando na manutenção da vila"


func snapshot() -> Dictionary:
	var state := super.snapshot()
	# maintenance é uma ocupação virtual; salva-se como pessoa disponível para
	# manter compatibilidade com o validador seguro do jogo base.
	for person in state.workers:
		if person.task.get("type", "") == "maintenance":
			person.task = {}
			person.state = "Disponível"
	state.autonomous_population = population_total
	state.autonomous_cursor = _autonomy_cursor
	state.autonomous_build_cycle = _build_cycle
	state.autonomous_milestone = _announced_milestone
	state.autonomous_saved_at = int(Time.get_unix_time_from_system())
	return state


func restore(state: Dictionary) -> bool:
	if not super.restore(state):
		return false
	population_total = maxi(workers.size(), int(state.get("autonomous_population", workers.size())))
	_autonomy_cursor = int(state.get("autonomous_cursor", 0))
	_build_cycle = int(state.get("autonomous_build_cycle", 0))
	_announced_milestone = int(state.get("autonomous_milestone", 0))
	var saved_at := int(state.get("autonomous_saved_at", 0))
	if saved_at > 0:
		_offline_catchup(maxi(0, int(Time.get_unix_time_from_system()) - saved_at))
	_assign_maintenance()
	return true


func _offline_catchup(seconds: int) -> void:
	if seconds < 5:
		return
	# População virtual pode crescer bastante sem criar milhares de personagens 3D.
	population_total += mini(seconds * 2, 2000000)
	var worker_gain := mini(TARGET_WORKERS - workers.size(), seconds / 20)
	for i in range(maxi(0, mini(worker_gain, 120))):
		_grow_workforce()
	var building_gain := mini(30, seconds / 180)
	for i in range(maxi(0, building_gain)):
		_autonomous_planner()
	_auto_supply("food", mini(500, seconds / 10), 1200)
	_auto_supply("wood", mini(300, seconds / 20), 800)
	_auto_supply("stone", mini(300, seconds / 20), 800)
	_auto_supply("gold", mini(100, seconds / 60), 500)
	_emit("Enquanto você esteve fora, a vila continuou evoluindo por %d minutos." % maxi(1, seconds / 60), "chime")
