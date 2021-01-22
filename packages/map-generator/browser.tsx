import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as hashed from 'hashed';
import { Mapgen } from './mapgen';

let map_generator = new Mapgen();
var loaded = false;

// Update parameters from the hash
function listener(newState) {
    Object.assign(map_generator.parameters, newState);
    if (loaded) {
        generateMap();
    }
}

// register a state provider
const update = hashed.register(map_generator.parameters, listener);

window.addEventListener('load', renderRoot);

class UIRoot extends React.Component {
    render() {
        return <>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                alignContent: 'stretch'
            }}>
                <div id='left-side'>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '0.2rem',
                        margin: '1rem',
                    }}>
                        <button id="randomize" onClick={ onRandomizeClicked }>Randomize Inputs</button>
                        <button id="generate" onClick={ newMap }>Generate</button>
                        <button id="download" onClick={ onDownloadClicked }>Download</button>
                    </div>
                    <form id='inputs' onChange={updateParams} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        margin: '1rem',
                    }}>
                        <label htmlFor='map_size'>Map size</label>
                        <input type='number' min='8' max='256' step='8' name='map_size'/>

                        <label htmlFor='biome'>Biome</label>
                        <select name='biome' id='biome'>
                            <option value='rock'>Rock</option>
                            <option value='ice'>Ice</option>
                            <option value='lava'>Lava</option>
                        </select>

                        <label htmlFor='solid_rock'>Solid Rock</label>
                        <input type='range' name='solid_rock' id='solid_rock' min='0.2' max='0.6' step='0.004'/>

                        <label htmlFor='other_rock'>Other Rock</label>
                        <input type='range' name='other_rock' id='other_rock' min='0.2' max='0.6' step='0.004'/>

                        <label htmlFor='energy_crystals'>Energy Crystals</label>
                        <input type='range' name='energy_crystals' id='energy_crystals' min='0.0' max='0.8' step='0.008'/>

                        <label htmlFor='ore'>Ore</label>
                        <input type='range' name='ore' id='ore' min='0.0' max='0.8' step='0.008'/>

                        <label htmlFor='ecs'>Energy Crystal Seams</label>
                        <input type='range' name='ecs' id='ecs' min='0.0' max='0.6' step='0.006'/>

                        <label htmlFor='os'>Ore Seams</label>
                        <input type='range' name='os' id='os' min='0.0' max='0.6' step='0.006'/>

                        <label htmlFor='rs'>Recharge Seams</label>
                        <input type='range' name='rs' id='rs' min='0.0' max='0.3' step='0.003'/>

                        <label htmlFor='flood_level'>Water/Lava Flood Level</label>
                        <input type='range' name='flood_level' id='flood_level' min='0.0' max='1.0' step='0.01'/>

                        <label htmlFor='flood_type'>Water or Lava</label>
                        <select name='flood_type' id='flood_type'>
                            <option value='water'>Water</option>
                            <option value='lava'>Lava</option>
                        </select>

                        <label htmlFor='erosion_sources'>Erosion Sources</label>
                        <input type='range' name='erosion_sources' id='erosion_sources' min='0.0' max='0.01' step='0.0001'/>

                        <label htmlFor='landslide_sources'>Landslide Sources</label>
                        <input type='range' name='landslide_sources' id='landslide_sources' min='0.0' max='0.4' step='0.004'/>

                        <label htmlFor='slugs'>Slimy Slug Holes</label>
                        <input type='range' name='slugs' id='slugs' min='0.0' max='0.01' step='0.0001'/>

                    </form>
                </div>
                <div style={{
                    margin: '0 20px'
                }}>
                    <canvas id='canvas' width="800" height="800"></canvas>
                </div>
            </div>
        </>;
    }

    componentDidMount() {

        // Initialize input values
        setInputValues();
        generateMap();
    }
}

function renderRoot() {
    ReactDOM.render(
        <UIRoot/>,
        document.getElementById('render-here')
    );
    loaded = true;
}

function onRandomizeClicked() {
    // Replace everything except the size
    var size = map_generator.parameters?.size;
    map_generator.init_parameters();
    map_generator.parameters.size = size;
    setInputValues();
    newMap();
}

// Update the mapgen parameters with the input values
function updateParams(e: Event) {
    var form = e.target?.parentElement;

    // Update the parameters to match the inputs
    map_generator.parameters!.size = parseInt(form.map_size.value);
    map_generator.parameters!.biome = form.biome.value;
    map_generator.parameters!.solidDensity = parseFloat(form.solid_rock.value);
    map_generator.parameters!.wallDensity = parseFloat(form.other_rock.value);
    map_generator.parameters!.crystalDensity = parseFloat(form.energy_crystals.value);
    map_generator.parameters!.oreDensity = parseFloat(form.ore.value);
    map_generator.parameters!.crystalSeamDensity = parseFloat(form.ecs.value);
    map_generator.parameters!.oreSeamDensity = parseFloat(form.os.value);
    map_generator.parameters!.rechargeSeamDensity = parseFloat(form.rs.value);
    map_generator.parameters!.floodLevel = parseFloat(form.flood_level.value);
    map_generator.parameters!.floodType = form.flood_type.value;
    map_generator.parameters!.flowDensity = parseFloat(form.erosion_sources.value);
    map_generator.parameters!.landslideDensity = parseFloat(form.landslide_sources.value);
    map_generator.parameters!.slugDensity = parseFloat(form.slugs.value);

    generateMap();
}

function setInputValues() {
    var form = document.getElementById('inputs');

    // Update the inputs to match the parameters
    form!.map_size.value = map_generator.parameters!.size;
    form!.biome.value = map_generator.parameters!.biome;
    form!.solid_rock.value = map_generator.parameters!.solidDensity;
    form!.other_rock.value = map_generator.parameters!.wallDensity;
    form!.energy_crystals.value = map_generator.parameters!.crystalDensity;
    form!.ore.value = map_generator.parameters!.oreDensity;
    form!.ecs.value = map_generator.parameters!.crystalSeamDensity;
    form!.os.value = map_generator.parameters!.oreSeamDensity;
    form!.rs.value = map_generator.parameters!.rechargeSeamDensity;
    form!.flood_level.value = map_generator.parameters!.floodLevel;
    form!.flood_type.value = map_generator.parameters!.floodType;
    form!.erosion_sources.value = map_generator.parameters!.flowDensity;
    form!.landslide_sources.value = map_generator.parameters!.landslideDensity;
    form!.slugs.value = map_generator.parameters!.slugDensity;

}

function generateMap() {

    var success = map_generator.mapgen();

    var downloadButton = document.getElementById('download');
    if (success) {
        downloadButton!.disabled = false;
        downloadButton!.title = '';
    }
    else {
        downloadButton!.disabled = true;
        downloadButton!.title = 'Can\'t save maps with no tool store';
    }

    // Synchronize the hash and the form
    setInputValues();
    update(map_generator.parameters);

    // Render the preview
    display();
}


function newMap() {
    // Generate a new seed
    map_generator.seed = Math.random();

    generateMap();
}

function onDownloadClicked() {
    download(map_generator.mm_text(), 'generatedMap.dat');
    return;
}

// Display the map
function display() {

    // Layers
    var wallArray = map_generator.data.wall_array;
    var crystalArray = map_generator.data.crystal_array;
    var oreArray = map_generator.data.ore_array;

    // Create the image
    var canvasElement = document.getElementById('canvas');
    var ctx = canvasElement.getContext('2d');
    var scale = Math.floor(canvasElement.width / wallArray.length);
    var offset = Math.floor(canvasElement.width % wallArray.length / 2);

    // Color conversions
    var colors = {
        0:   'rgb(24, 0, 59)',  // Ground
        1:  'rgb(166, 72, 233)',  // Dirt
        2:  'rgb(139, 43, 199)',  // Loose Rock
        3:  'rgb(108, 10, 163)',  // Hard Rock
        4:  'rgb(59, 0, 108)',  // Solid Rock
        6:  'rgb(6, 45, 182)',  // Water
        7:   'rgb(239, 79, 16)',  // Lava
        8:  'rgb(56, 44, 73)',  // Landslide rubble
        9:  'rgb(150, 150, 0)',  // Slimy Slug hole
        10:  'rgb(185, 255, 25)',  // Energy Crystal Seam
        11:  'rgb(146, 62, 20)',  // Ore Seam
        12:  'rgb(250, 255, 14)',  // Recharge Seam
        13:  'rgb(190, 190, 190)',  // Building power path
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the background
    ctx.fillStyle = 'black';
    ctx.fillRect(
        offset,
        offset,
        canvasElement.width - offset * 2,
        canvasElement.height - offset * 2);

    // Draw the tiles
    for (var i = 0; i < wallArray.length; i++) {
        for (var j = 0; j < wallArray[0].length; j++) {
            // Draw the tile
            ctx.fillStyle = colors[wallArray[i][j]];
            ctx.fillRect(
                j * scale + offset + 1,
                i * scale + offset + 1,
                scale - 1,
                scale - 1
            )

            // Draw the crystal and ore indicators
            if (crystalArray[i][j] > 0) {
                ctx.fillStyle = colors[10];
                ctx.fillRect(
                    j * scale + offset + 2,
                    i * scale + offset + 2,
                    2,
                    2
                )
            }
            if (oreArray[i][j] > 0) {
                ctx.fillStyle = colors[11];
                ctx.fillRect(
                    j * scale + offset + 5,
                    i * scale + offset + 2,
                    2,
                    2
                )
            }
        }
    }
}

function download(data: string, filename: string) {
  const blob = new Blob([data], {type : 'application/text'});
  const url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  a.click();
}
