import * as random from "./random";
import { createArrayFilledWith } from "./misc";

var _pj;
function _pj_snippets(container) {
  function in_es6(left, right) {
    if (right instanceof Array || typeof right === "string") {
      return right.indexOf(left) > -1;
    } else {
      if (
        right instanceof Map ||
        right instanceof Set ||
        right instanceof WeakMap ||
        right instanceof WeakSet
      ) {
        return right.has(left);
      } else {
        return left in right;
      }
    }
  }
  container["in_es6"] = in_es6;
  return container;
}
_pj = {};
_pj_snippets(_pj);
export class Mapgen {
  init_parameters() {
    this.parameters = {
      length: 32,
      width: 32,
      size: 32,
      solidDensity: random.random() * 0.3 + 0.2,
      wallDensity: random.random() * 0.3 + 0.3,
      oreDensity: random.random() * 0.3 + 0.3,
      crystalDensity: random.random() * 0.3 + 0.2,
      oreSeamDensity: random.random() * 0.25,
      crystalSeamDensity: random.random() * 0.5,
      rechargeSeamDensity: random.random() * 0.08 + 0.01,
      floodLevel: random.random() * 0.75,
      floodType: ["water", "lava"][random.randint(0, 1)],
      flowDensity: random.random() * 0.005,
      flowInterval: random.randint(20, 180),
      preFlow: random.randint(3, 8),
      landslideDensity: random.random() * 0.4,
      landslideInterval: random.randint(10, 90),
      slugDensity: random.random() * 0.01,
      terrain: random.randint(0, 25),
      biome: ["ice", "rock", "lava"][random.randint(0, 2)],
      smoothness: 16,
      oxygen: 0 - 1,
      stats: false,
      save: false,
      name: "Untitled",
      overwrite: false,
      show: false,
    };
  }
  constructor() {
    this.seed = random.random();
    this.init_parameters();
    this.data = {};
  }
  mapgen() {
    var seeds;
    random.seed(this.seed);
    seeds = {
      solid_seed: random.random(),
      other_seed: random.random(),
      ore_seed: random.random(),
      crystal_seed: random.random(),
      height_seed: random.random(),
      slug_seed: random.random(),
      ecs_seed: random.random(),
      os_seed: random.random(),
      rs_seed: random.random(),
      erosion_seed: random.random(),
      landslide_seed: random.random(),
      base_seed: random.random(),
    };
    if (this.parameters["size"]) {
      this.parameters["size"] =
        Number.parseInt((this.parameters["size"] + 7) / 8) * 8;
      this.parameters["length"] = this.parameters["size"];
      this.parameters["width"] = this.parameters["size"];
    }
    if (this.parameters["oxygen"] === -1) {
      this.parameters["oxygen"] =
        this.parameters["length"] * this.parameters["width"] * 3;
    }
    this.data["solid_array"] = this.createArray(
      this.parameters["length"],
      this.parameters["width"],
      -1
    );
    this.data["wall_array"] = this.createArray(
      this.parameters["length"],
      this.parameters["width"],
      -1
    );
    random.seed(seeds["solid_seed"]);
    this.randomize(
      this.data["solid_array"],
      1 - this.parameters["solidDensity"]
    );
    this.speleogenesis(this.data["solid_array"]);
    this.cleanup(this.data["solid_array"]);
    this.fillExtra(this.data["solid_array"]);
    random.seed(seeds["other_seed"]);
    this.randomize(this.data["wall_array"], 1 - this.parameters["wallDensity"]);
    this.speleogenesis(this.data["wall_array"]);
    this.cleanup(this.data["wall_array"]);
    this.details(this.data["wall_array"], 3);
    for (var i = 0, _pj_a = this.parameters["length"]; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = this.parameters["width"]; j < _pj_b; j += 1) {
        if (this.data["solid_array"][i][j] === -1) {
          this.data["wall_array"][i][j] = 4;
        }
      }
    }
    random.seed(seeds["ore_seed"]);
    this.data["ore_array"] = this.createArray(
      this.parameters["length"],
      this.parameters["width"],
      -1
    );
    this.randomize(this.data["ore_array"], 1 - this.parameters["oreDensity"]);
    this.speleogenesis(this.data["ore_array"]);
    this.cleanup(this.data["ore_array"]);
    this.details(this.data["ore_array"], 4);
    random.seed(seeds["crystal_seed"]);
    this.data["crystal_array"] = this.createArray(
      this.parameters["length"],
      this.parameters["width"],
      -1
    );
    this.randomize(
      this.data["crystal_array"],
      1 - this.parameters["crystalDensity"]
    );
    this.speleogenesis(this.data["crystal_array"]);
    this.cleanup(this.data["crystal_array"]);
    this.details(this.data["crystal_array"], 5);
    random.seed(seeds["height_seed"]);
    this.data["height_array"] = this.heightMap(
      this.parameters["length"] + 1,
      this.parameters["width"] + 1,
      this.parameters["terrain"],
      this.parameters["smoothness"]
    );
    this.flood(
      this.data["wall_array"],
      this.data["height_array"],
      this.parameters["floodLevel"],
      this.parameters["floodType"]
    );
    for (var i = 0, _pj_a = this.parameters["length"]; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = this.parameters["width"]; j < _pj_b; j += 1) {
        if (!_pj.in_es6(this.data["wall_array"][i][j], [1,2,3])) {
          this.data["crystal_array"][i][j] = 0;
          this.data["ore_array"][i][j] = 0;
        }
      }
    }
    random.seed(seeds["slug_seed"]);
    this.aSlimySlugIsInvadingYourBase(
      this.data["wall_array"],
      this.parameters["slugDensity"]
    );
    random.seed(seeds["ecs_seed"]);
    this.addSeams(
      this.data["wall_array"],
      this.data["crystal_array"],
      this.parameters["crystalSeamDensity"],
      10
    );
    random.seed(seeds["os_seed"]);
    this.addSeams(
      this.data["wall_array"],
      this.data["ore_array"],
      this.parameters["oreSeamDensity"],
      11
    );
    random.seed(seeds["rs_seed"]);
    this.addRechargeSeams(
      this.data["wall_array"],
      this.parameters["rechargeSeamDensity"]
    );
    random.seed(seeds["erosion_seed"]);
    this.data["flow_list"] = [];
    if (this.parameters["floodType"] === "lava") {
      this.data["flow_list"] = this.createFlowList(
        this.data["wall_array"],
        this.parameters["flowDensity"],
        this.data["height_array"],
        this.parameters["preFlow"],
        this.parameters["terrain"]
      );
    }
    random.seed(seeds["landslide_seed"]);
    this.data["landslide_list"] = this.aLandslideHasOccured(
      this.data["wall_array"],
      this.parameters["landslideDensity"]
    );
    random.seed(seeds["base_seed"]);
    this.data["base"] = this.chooseBase(this.data["wall_array"]);
    if (!this.data["base"]) {
      return false;
    }
    this.setBase(
      this.data["base"],
      this.data["wall_array"],
      this.data["height_array"]
    );
    return true;
  }
  addSeams(array, resourceArray, density, seam_type) {
    for (var i = 0, _pj_a = array.length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = array[0].length; j < _pj_b; j += 1) {
        if (random.random() < density) {
          if (resourceArray[i][j] > 2) {
            array[i][j] = seam_type;
          }
        }
      }
    }
  }
  addRechargeSeams(array, density) {
    var rand;
    for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        rand = random.random() < density;
        if (array[i][j] === 4) {
          if (
            ((array[i + 1][j] === 4 && array[i - 1][j] === 4) ||
              (array[i][j + 1] === 4 && array[i][j - 1] === 4)) &&
            (array[i + 1][j] !== 4 ||
              array[i - 1][j] !== 4 ||
              array[i][j + 1] !== 4 ||
              array[i][j - 1] !== 4)
          ) {
            if (rand) {
              array[i][j] = 12;
            }
          }
        }
      }
    }
  }
  aLandslideHasOccured(array, stability) {
    var landslideArray, landslideList;
    landslideArray = this.createArray(array.length, array[0].length, -1);
    this.randomize(landslideArray, 1 - stability);
    this.speleogenesis(landslideArray);
    this.details(landslideArray, 3);
    landslideList = [[], [], []];
    for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        if (landslideArray[i][j] > 0 && array[i][j] === 0) {
          array[i][j] = 8;
        }
        if (landslideArray[i][j] > 0 && _pj.in_es6(array[i][j], [1,2,3])) {
          landslideList[landslideArray[i][j] - 1].push([i, j]);
        }
      }
    }
    return landslideList;
  }
  aSlimySlugIsInvadingYourBase(array, slugDensity) {
    for (var i = 0, _pj_a = array.length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = array[0].length; j < _pj_b; j += 1) {
        if (random.random() < slugDensity) {
          if (array[i][j] === 0) {
            array[i][j] = 9;
          }
        }
      }
    }
  }
  chooseBase(array) {
    var possibleBaseList;
    possibleBaseList = [];
    for (var i = 1, _pj_a = array.length - 2; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 2; j < _pj_b; j += 1) {
        if (
          array[i][j] === 0 &&
          array[i + 1][j] === 0 &&
          array[i][j + 1] === 0 &&
          array[i + 1][j + 1] === 0
        ) {
          possibleBaseList.push([i, j]);
        }
      }
    }
    if (possibleBaseList.length === 0) {
      return false;
    }
    return [
      possibleBaseList[random.randint(0, possibleBaseList.length - 1)],
    ][0];
  }
  cleanup(array) {
    var changed;
    changed = true;
    while (changed === true) {
      changed = false;
      for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
        for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
          if (
            (array[i - 1][j] === 0 && array[i + 1][j] === 0) ||
            (array[i][j - 1] === 0 && array[i][j + 1] === 0)
          ) {
            if (array[i][j] !== 0) {
              array[i][j] = 0;
              changed = true;
            }
          }
        }
      }
    }
  }
  mm_text() {
    var MMtext, caveList, conversion, converted_walls, crystalCount;
    crystalCount = this.countAccessibleCrystals(
      this.data["wall_array"],
      this.data["base"],
      this.data["ore_array"],
      false
    );
    if (crystalCount >= 14) {
      crystalCount = this.countAccessibleCrystals(
        this.data["wall_array"],
        this.data["base"],
        this.data["ore_array"],
        true
      );
    }
    MMtext =
      "info{\n" +
      "rowcount:" +
      this.data["wall_array"].length.toString() +
      "\n" +
      "colcount:" +
      this.data["wall_array"][0].length.toString() +
      "\n" +
      "camerapos:Translation: X=" +
      (this.data["base"][1] * 300 + 300).toString() +
      " Y=" +
      (this.data["base"][0] * 300 + 300).toString() +
      " Z=" +
      this.data["height_array"][this.data["base"][0]][
        this.data["base"][1]
      ].toString() +
      " Rotation: P=44.999992 Y=180.000000 R=0.000000 Scale X=1.000 Y=1.000 Z=1.000\n" +
      "biome:" +
      this.parameters["biome"] +
      "\n" +
      "creator:Map Generator for Manic Miners\n" +
      (this.parameters["oxygen"]
        ? "oxygen:" +
          this.parameters["oxygen"].toString() +
          "/" +
          this.parameters["oxygen"].toString() +
          "\n"
        : "") +
      "levelname:" +
      this.parameters["name"] +
      "\n" +
      "erosioninitialwaittime:10\n" +
      "}\n";
    MMtext += "tiles{\n";
    conversion = {
      [0]: "1",
      [1]: "26",
      [2]: "30",
      [3]: "34",
      [4]: "38",
      [6]: "11",
      [7]: "6",
      [8]: "63",
      [9]: "12",
      [10]: "42",
      [11]: "46",
      [12]: "50",
      [13]: "14",
    };
    converted_walls = this.createArray(
      this.data["wall_array"].length,
      this.data["wall_array"][0].length,
      null
    );
    for (var i = 0, _pj_a = this.data["wall_array"].length; i < _pj_a; i += 1) {
      for (
        var j = 0, _pj_b = this.data["wall_array"][0].length;
        j < _pj_b;
        j += 1
      ) {
        converted_walls[i][j] = conversion[this.data["wall_array"][i][j]];
      }
    }
    caveList = this.findCaves(this.data["wall_array"], this.data["base"]);
    for (
      var cave, _pj_c = 0, _pj_a = caveList, _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      cave = _pj_a[_pj_c];
      for (
        var space, _pj_f = 0, _pj_d = cave, _pj_e = _pj_d.length;
        _pj_f < _pj_e;
        _pj_f += 1
      ) {
        space = _pj_d[_pj_f];
        converted_walls[space[0]][space[1]] = (
          Number.parseInt(converted_walls[space[0]][space[1]]) + 100
        ).toString();
      }
    }
    for (var i = 0, _pj_a = converted_walls.length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = converted_walls[0].length; j < _pj_b; j += 1) {
        MMtext += converted_walls[i][j] + ",";
      }
      MMtext += "\n";
    }
    MMtext += "}\n";
    MMtext += "height{\n";
    for (
      var i = 0, _pj_a = this.data["height_array"].length;
      i < _pj_a;
      i += 1
    ) {
      for (
        var j = 0, _pj_b = this.data["height_array"][0].length;
        j < _pj_b;
        j += 1
      ) {
        MMtext += this.data["height_array"][i][j].toString() + ",";
      }
      MMtext += "\n";
    }
    MMtext += "}\n";
    MMtext += "resources{\n";
    MMtext += "crystals:\n";
    for (var i = 0, _pj_a = converted_walls.length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = converted_walls[0].length; j < _pj_b; j += 1) {
        MMtext += this.data["ore_array"][i][j].toString() + ",";
      }
      MMtext += "\n";
    }
    MMtext += "ore:\n";
    for (var i = 0, _pj_a = converted_walls.length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = converted_walls[0].length; j < _pj_b; j += 1) {
        MMtext += this.data["ore_array"][i][j].toString() + ",";
      }
      MMtext += "\n";
    }
    MMtext += "}\n";
    MMtext += "objectives{\n";
    MMtext +=
      "resources: " +
      Math.min(Number.parseInt(crystalCount / 2), 999).toString() +
      ",0,0\n";
    MMtext += "}\n";
    MMtext += "buildings{\n";
    MMtext +=
      "BuildingToolStore_C\n" +
      "Translation: X=" +
      (this.data["base"][1] * 300 + 150.0).toString() +
      " Y=" +
      (this.data["base"][0] * 300 + 150.0).toString() +
      " Z=" +
      (
        this.data["height_array"][this.data["base"][0]][this.data["base"][1]] +
        (_pj.in_es6("udts", this.parameters) ? 50 : 0)
      ).toString() +
      " Rotation: P=" +
      (_pj.in_es6("udts", this.parameters) ? "180" : "0") +
      ".000000 Y=89.999992 R=0.000000 Scale X=1.000 Y=1.000 Z=1.000\n" +
      "Level=1\n" +
      "Teleport=True\n" +
      "Health=MAX\n" +
      "Powerpaths=X=" +
      (
        Number.parseInt(converted_walls[0].length / 8) *
          Number.parseInt(this.data["base"][0] / 8) +
        Number.parseInt(this.data["base"][1] / 8)
      ).toString() +
      " Y=" +
      (this.data["base"][0] % 8).toString() +
      " Z=" +
      (this.data["base"][1] % 8).toString() +
      "/X=" +
      (
        Number.parseInt(converted_walls[0].length / 8) *
          Number.parseInt((this.data["base"][0] + 1) / 8) +
        Number.parseInt(this.data["base"][1] / 8)
      ).toString() +
      " Y=" +
      ((this.data["base"][0] + 1) % 8).toString() +
      " Z=" +
      (this.data["base"][1] % 8).toString() +
      "/\n";
    MMtext += "}\n";
    MMtext += "landslideFrequency{\n";
    for (
      var i = 1, _pj_a = this.data["landslide_list"].length + 1;
      i < _pj_a;
      i += 1
    ) {
      if (this.data["landslide_list"][i - 1].length) {
        MMtext += (i * this.parameters["landslideInterval"]).toString() + ":";
      }
      for (
        var space,
          _pj_d = 0,
          _pj_b = this.data["landslide_list"][i - 1],
          _pj_c = _pj_b.length;
        _pj_d < _pj_c;
        _pj_d += 1
      ) {
        space = _pj_b[_pj_d];
        MMtext += space[1].toString() + "," + space[0].toString() + "/";
      }
      if (this.data["landslide_list"][i - 1].length) {
        MMtext += "\n";
      }
    }
    MMtext += "}\n";
    MMtext += "lavaspread{\n";
    for (
      var i = 1, _pj_a = this.data["flow_list"].length + 1;
      i < _pj_a;
      i += 1
    ) {
      if (this.data["flow_list"][i - 1].length) {
        MMtext += (i * this.parameters["flowInterval"]).toString() + ":";
      }
      for (
        var space,
          _pj_d = 0,
          _pj_b = this.data["flow_list"][i - 1],
          _pj_c = _pj_b.length;
        _pj_d < _pj_c;
        _pj_d += 1
      ) {
        space = _pj_b[_pj_d];
        MMtext += space[1].toString() + "," + space[0].toString() + "/";
      }
      if (this.data["flow_list"][i - 1].length) {
        MMtext += "\n";
      }
    }
    MMtext += "}\n";
    MMtext += "miners{\n";
    MMtext += "}\n";
    MMtext += "briefing{\n";
    MMtext +=
      "You must collect " +
      Math.min(Number.parseInt(crystalCount / 2), 999).toString() +
      " energy crystals.  \n";
    MMtext += "}\n";
    return MMtext;
  }
  countAccessibleCrystals(array, base, crystalArray, vehicles) {
    var count, i, spaces, tmap, types, x, y;
    spaces = [base];
    tmap = this.createArray(array.length, array[0].length, -1);
    types = [0, 1, 2, 3, 8, 9, 10, 11, 13];
    if (vehicles) {
      types = [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 13];
    }
    for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        if (_pj.in_es6(array[i][j], types)) {
          tmap[i][j] = 0;
        }
      }
    }
    tmap[base[0]][base[1]] = 1;
    i = 0;
    while (i < spaces.length) {
      x = spaces[i][0];
      y = spaces[i][1];
      if (tmap[x - 1][y] === 0) {
        tmap[x - 1][y] = 1;
        spaces.push([x - 1, y]);
      }
      if (tmap[x + 1][y] === 0) {
        tmap[x + 1][y] = 1;
        spaces.push([x + 1, y]);
      }
      if (tmap[x][y - 1] === 0) {
        tmap[x][y - 1] = 1;
        spaces.push([x, y - 1]);
      }
      if (tmap[x][y + 1] === 0) {
        tmap[x][y + 1] = 1;
        spaces.push([x, y + 1]);
      }
      i += 1;
    }
    count = 0;
    for (
      var space, _pj_c = 0, _pj_a = spaces, _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      space = _pj_a[_pj_c];
      count += crystalArray[space[0]][space[1]];
    }
    return count;
  }
  // createArray(x, y, fill) {
  //   var array;
  //   array = [null] * x;
  //   for (var i = 0, _pj_a = x; i < _pj_a; i += 1) {
  //     array[i] = [null] * y;
  //     for (var j = 0, _pj_b = y; j < _pj_b; j += 1) {
  //       array[i][j] = fill;
  //     }
  //   }
  //   return array;
  // }
  createArray(x, y, fill) {
    const array = createArrayFilledWith(x, null);
    for (let i = 0, _pj_a = x; i < _pj_a; i += 1) {
      array[i] = createArrayFilledWith(y, null);
      for (let j = 0, _pj_b = y; j < _pj_b; j += 1) {
        array[i][j] = fill;
      }
    }
    return array;
  }
  createFlowList(array, density, height, preFlow, terrain) {
    var adjacent,
      elevation,
      flowArray,
      flowList,
      i,
      sourceElevation,
      sources,
      spillList,
      totalSources;
    flowArray = this.createArray(array.length, array[0].length, -1);
    spillList = [];
    sources = [];
    for (var i = 0, _pj_a = array.length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = array[0].length; j < _pj_b; j += 1) {
        if (random.random() < density) {
          if (array[i][j] === 0) {
            sources.push([i, j]);
          }
        }
        if (_pj.in_es6(array[i][j], [0,1,2,3])) {
          flowArray[i][j] = 0;
        }
      }
    }
    for (
      var source, _pj_c = 0, _pj_a = sources, _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      source = _pj_a[_pj_c];
      array[source[0]][source[1]] = 7;
      flowList = [source];
      flowArray[source[0]][source[1]] = 1;
      i = 0;
      while (i < flowList.length) {
        adjacent = [
          [flowList[i][0] + 1, flowList[i][1]],
          [flowList[i][0] - 1, flowList[i][1]],
          [flowList[i][0], flowList[i][1] + 1],
          [flowList[i][0], flowList[i][1] - 1],
        ];
        sourceElevation =
          height[flowList[i][0]][flowList[i][1]] +
          height[flowList[i][0] + 1][flowList[i][1]] +
          height[flowList[i][0]][flowList[i][1] + 1] +
          height[flowList[i][0] + 1][flowList[i][1] + 1];
        for (
          var space, _pj_f = 0, _pj_d = adjacent, _pj_e = _pj_d.length;
          _pj_f < _pj_e;
          _pj_f += 1
        ) {
          space = _pj_d[_pj_f];
          elevation =
            height[space[0]][space[1]] +
            height[space[0] + 1][space[1]] +
            height[space[0]][space[1] + 1] +
            height[space[0] + 1][space[1] + 1];
          if (
            flowArray[space[0]][space[1]] === 0 &&
            sourceElevation > elevation - terrain * 3
          ) {
            flowList.push(space);
            flowArray[space[0]][space[1]] = 1;
          }
        }
        i += 1;
      }
      spillList.push(flowList);
      for (
        var space, _pj_f = 0, _pj_d = flowList, _pj_e = _pj_d.length;
        _pj_f < _pj_e;
        _pj_f += 1
      ) {
        space = _pj_d[_pj_f];
        flowArray[space[0]][space[1]] = 0;
      }
    }
    for (var i = 0, _pj_a = preFlow; i < _pj_a; i += 1) {
      totalSources = sources.length;
      for (var j = 0, _pj_b = totalSources; j < _pj_b; j += 1) {
        adjacent = [
          [sources[j][0] + 1, sources[j][1]],
          [sources[j][0] - 1, sources[j][1]],
          [sources[j][0], sources[j][1] + 1],
          [sources[j][0], sources[j][1] - 1],
        ];
        for (
          var space, _pj_e = 0, _pj_c = adjacent, _pj_d = _pj_c.length;
          _pj_e < _pj_d;
          _pj_e += 1
        ) {
          space = _pj_c[_pj_e];
          if (array[space[0]][space[1]] === 0) {
            array[space[0]][space[1]] = 7;
            sources.push(space);
          }
        }
      }
    }
    return spillList;
  }
  details(array, maxDistance) {
    for (var n = 0, _pj_a = maxDistance; n < _pj_a; n += 1) {
      for (var i = 1, _pj_b = array.length - 1; i < _pj_b; i += 1) {
        for (var j = 1, _pj_c = array[0].length - 1; j < _pj_c; j += 1) {
          if (
            (array[i - 1][j] === n ||
              array[i + 1][j] === n ||
              array[i][j - 1] === n ||
              array[i][j + 1] === n) &&
            array[i][j] === -1
          ) {
            array[i][j] = n + 1;
          }
        }
      }
    }
    for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        if (array[i][j] === -1) {
          array[i][j] = maxDistance;
        }
      }
    }
    for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        if (array[i][j] >= 1) {
          array[i][j] = random.randint(array[i][j] - 1, array[i][j] + 1);
          if (array[i][j] <= 0) {
            array[i][j] = 1;
          }
          if (array[i][j] > maxDistance) {
            array[i][j] = maxDistance;
          }
        }
      }
    }
  }
  fillExtra(array) {
    var spaces, tmap;
    tmap = this.createArray(array.length, array[0].length, 0);
    for (var i = 0, _pj_a = array.length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = array[0].length; j < _pj_b; j += 1) {
        if (array[i][j] !== 0) {
          tmap[i][j] = -1;
        }
      }
    }
    spaces = this.openSpaces(tmap, false);
    if (spaces.length < 1) {
      return false;
    }
    spaces.sort(function(a, b){ return b.length - a.length; });
    spaces.pop(0);
    for (
      var space, _pj_c = 0, _pj_a = spaces, _pj_b = _pj_a.length;
      _pj_c < _pj_b;
      _pj_c += 1
    ) {
      space = _pj_a[_pj_c];
      for (
        var coord, _pj_f = 0, _pj_d = space, _pj_e = _pj_d.length;
        _pj_f < _pj_e;
        _pj_f += 1
      ) {
        coord = _pj_d[_pj_f];
        array[coord[0]][coord[1]] = -1;
      }
    }
    return true;
  }
  fillSquare(i, j, array, length, width, squareSize, value) {
    for (
      var k = Math.max(i, 0), _pj_a = Math.min(i + squareSize, length);
      k < _pj_a;
      k += 1
    ) {
      for (
        var l = Math.max(j, 0), _pj_b = Math.min(j + squareSize, width);
        l < _pj_b;
        l += 1
      ) {
        array[k][l] += value;
      }
    }
  }
  findCaves(array, base) {
    var caveList, tmap;
    tmap = this.createArray(array.length, array[0].length, -1);
    for (var i = 1, _pj_a = array.length; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length; j < _pj_b; j += 1) {
        if (_pj.in_es6(array[i][j], [0, 6, 7, 8, 9, 13])) {
          tmap[i][j] = 0;
        }
      }
    }
    caveList = this.openSpaces(tmap, true);
    for (var i = 0, _pj_a = caveList.length; i < _pj_a; i += 1) {
      if (_pj.in_es6(base, caveList[i])) {
        caveList.pop(i);
        break;
      }
    }
    return caveList;
  }
  flood(array, heightArray, floodLevel, floodType) {
    var difference, floodHeight, length, maximum, minimum, width;
    length = array.length;
    width = array[0].length;
    if (floodType === "water") {
      floodType = 6;
    } else {
      floodType = 7;
    }
    minimum = heightArray[0][0];
    maximum = heightArray[0][0];
    for (var i = 0, _pj_a = length + 1; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = width + 1; j < _pj_b; j += 1) {
        maximum = Math.max(heightArray[i][j], maximum);
        minimum = Math.min(heightArray[i][j], minimum);
      }
    }
    difference = maximum - minimum;
    floodHeight = Number.parseInt(difference * floodLevel + minimum);
    for (var i = 0, _pj_a = length + 1; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = width + 1; j < _pj_b; j += 1) {
        heightArray[i][j] = Math.max(heightArray[i][j], floodHeight);
      }
    }
    for (var i = 0, _pj_a = length; i < _pj_a; i += 1) {
      for (var j = 0, _pj_b = width; j < _pj_b; j += 1) {
        if (
          array[i][j] === 0 &&
          heightArray[i][j] === floodHeight &&
          heightArray[i + 1][j] === floodHeight &&
          heightArray[i][j + 1] === floodHeight &&
          heightArray[i + 1][j + 1] === floodHeight
        ) {
          array[i][j] = floodType;
        }
      }
    }
  }
  heightMap(length, width, terrain, smoothness) {
    var array, value;
    array = this.createArray(length, width, 0);
    terrain = Math.max(terrain, 1);
    for (var i = -smoothness, _pj_a = length; i < _pj_a; i += 1) {
      for (var j = -smoothness, _pj_b = width; j < _pj_b; j += 1) {
        value = random.randint(
          -Number.parseInt(terrain),
          Number.parseInt(terrain)
        );
        this.fillSquare(i, j, array, length, width, smoothness, value);
      }
    }
    return array;
  }
  openSpaces(array, corners) {
    var index, space, spaces, x, y;
    spaces = [];
    for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        if (array[i][j] === 0) {
          array[i][j] = 1;
          space = [];
          index = 0;
          space.push([i, j]);
          while (index < space.length) {
            x = space[index][0];
            y = space[index][1];
            if (array[x - 1][y] === 0) {
              array[x - 1][y] = 1;
              space.push([x - 1, y]);
            }
            if (array[x + 1][y] === 0) {
              array[x + 1][y] = 1;
              space.push([x + 1, y]);
            }
            if (array[x][y - 1] === 0) {
              array[x][y - 1] = 1;
              space.push([x, y - 1]);
            }
            if (array[x][y + 1] === 0) {
              array[x][y + 1] = 1;
              space.push([x, y + 1]);
            }
            if (corners) {
              if (array[x - 1][y - 1] === 0) {
                array[x - 1][y - 1] = 1;
                space.push([x - 1, y - 1]);
              }
              if (array[x + 1][y - 1] === 0) {
                array[x + 1][y - 1] = 1;
                space.push([x + 1, y - 1]);
              }
              if (array[x - 1][y + 1] === 0) {
                array[x - 1][y + 1] = 1;
                space.push([x - 1, y + 1]);
              }
              if (array[x + 1][y + 1] === 0) {
                array[x + 1][y + 1] = 1;
                space.push([x + 1, y + 1]);
              }
            }
            array[x][y] = 1;
            index += 1;
          }
          spaces.push(space);
        }
      }
    }
    return spaces;
  }
  randomize(array, probability) {
    for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        if (random.random() < probability) {
          array[i][j] = 0;
        }
      }
    }
  }
  setBase(base, array, height) {
    var average;
    array[base[0]][base[1]] = 13;
    array[base[0] + 1][base[1]] = 13;
    average = Number.parseInt(
      (height[base[0]][base[1]] +
        height[base[0] + 1][base[1]] +
        height[base[0]][base[1] + 1] +
        height[base[0] + 1][base[1] + 1]) /
        4
    );
    average = Number.parseInt(average);
    height[base[0]][base[1]] = average;
    height[base[0] + 1][base[1]] = average;
    height[base[0]][base[1] + 1] = average;
    height[base[0] + 1][base[1] + 1] = average;
  }
  speleogenesis(array) {
    var adjacent, changed, tmap;
    changed = true;
    while (changed) {
      changed = false;
      tmap = this.createArray(array.length, array[0].length, 4);
      for (var i = 0, _pj_a = array.length; i < _pj_a; i += 1) {
        for (var j = 0, _pj_b = array[0].length; j < _pj_b; j += 1) {
          tmap[i][j] = array[i][j];
        }
      }
      for (var i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
        for (var j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
          adjacent = 0;
          if (tmap[i + 1][j] === -1) {
            adjacent += 1;
          }
          if (tmap[i - 1][j] === -1) {
            adjacent += 1;
          }
          if (tmap[i][j + 1] === -1) {
            adjacent += 1;
          }
          if (tmap[i][j - 1] === -1) {
            adjacent += 1;
          }
          if (adjacent === 0) {
            if (array[i][j] !== 0) {
              changed = true;
              array[i][j] = 0;
            }
          } else {
            if (adjacent >= 3) {
              if (array[i][j] !== -1) {
                changed = true;
                array[i][j] = -1;
              }
            }
          }
        }
      }
    }
  }
}

//# sourceMappingURL=mapgen.js.map
