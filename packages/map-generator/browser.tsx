import { observer } from "mobx-react"
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mapgen } from './mapgen';
import { attemptGenerationWithRetries, mapgen, MapGenResult } from "./map-generator";
import { generateDefaultParameters, inputs, Parameters, parse } from "./parameters";
import * as hashed from 'hashed';
import { autorun } from "mobx";
import { isBoolean, isNumber, isString } from "lodash";

let parameters: Parameters = new Parameters();
let map: MapGenResult = null;
let map_generator = new Mapgen();

function T<T>(t: T) { return t }
function TI<T>() { return function<I extends T>(i: I) {return i} }

window.addEventListener('load', onLoad);
function onLoad() {

    window.map_generator = map_generator;

    randomizeParams();

    renderRoot();
}

namespace UIRoot {
    export interface Params {
        parameters: Parameters;
    }
}

@observer
class UIRoot extends React.Component<UIRoot.Params> {
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
                <form id='inputs' onChange={ updateParams }>
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
                <div style={{
                    margin: '0 20px'
                }}>
                    <p>
                        <button id="randomize" onClick={ onRandomizeClicked }>Randomize Inputs</button>
                        <button id="generate" onClick={ newMap }>Generate</button>
                        <button id="download" onClick={ onDownloadClicked }>Download</button>
                    </p>
                    <p>
                        <canvas width="1000" height="1000"></canvas>
                    </p>
                </div>
            </div>
        </>;
    }

    componentDidMount() {

        // Initialize input values
        setInputValues();
    }
}

function renderRoot() {
    ReactDOM.render(
        <UIRoot parameters={parameters} />,
        document.getElementById('render-here')
    );
}

function onRandomizeClicked() {
    // Replace everything except the size
    var size = map_generator.parameters?.size;
    map_generator.init_parameters();
    map_generator.parameters.size = size;
    setInputValues();
    newMap();
    randomizeParams();
}

function randomizeParams() {
    Object.assign(parameters, generateDefaultParameters());
    logParams();
}

function logParams() {
    console.log(parameters);
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
    console.log('generateMap()');

    var success = map_generator.mapgen();
    console.log(success);

    // console.log(document.getElementById('download').disabled);
    var downloadButton = document.getElementById('download');
    if (success) {
        downloadButton!.disabled = false;
        downloadButton!.title = '';
    }
    else {
        downloadButton!.disabled = true;
        downloadButton!.title = 'Can\'t save maps with no tool store';
    }
}

let mapDownloaded = false;

function newMap() {
    // Generate a new seed
    map_generator.seed = Math.random();

    generateMap();

    mapDownloaded = false;
    const canvasElement = $('canvas')[0] as HTMLCanvasElement;
    const {success, map: _map} = attemptGenerationWithRetries(parameters);
    if(success) {
        map = _map;
        map!.renderToCanvas(canvasElement);
    }
}

let downloadCounter = 0;
function onDownloadClicked() {
    download(map_generator.mm_text(), 'generatedMap.dat');
    return;
    if(!mapDownloaded) downloadCounter++;
    mapDownloaded = true;
    const mapText = map.convertToMM();
    download(mapText, `${ parameters.name }_${ downloadCounter }.dat`);
}

function download(data: string, filename: string) {
  const blob = new Blob([data], {type : 'application/text'});
  const url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  a.click();
}
