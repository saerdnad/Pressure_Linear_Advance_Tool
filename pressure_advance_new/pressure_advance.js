/**
 * Pressure Advance Calibration Pattern
 * Copyright (C) 2019 Sineos [https://github.com/Sineos]
 * Copyright (C) 2022 AndrewEllis93 [https://github.com/AndrewEllis93]
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
'use strict';

// Settings version of localStorage
// Increase if default settings are changed / amended
const SETTINGS_VERSION = '1.4';

const PA_round = -4; // Was previously -3
const Z_round = -3;
const XY_round = -4;
const EXT_round = -5; // Was previously -4

var CUR_X = 0, // Globally track current coordinates
    CUR_Y = 0,
    CUR_Z = 0,
    RETRACTED = false; // Globally keep track of current retract state to prevent retracting/unretracting twice

// declare HTML form inputs globally
var ACCELERATION,
    ANCHOR_LAYER_LINE_RATIO,
    ANCHOR_OPTION,
    ANCHOR_PERIMETERS,
    BED_SHAPE,
    BED_TEMP,
    BED_X,
    BED_Y,
    END_GCODE,
    EXT_MULT,
    EXT_MULT_PRIME,
    EXTRUDER_NAME,
    FAN_SPEED,
    FAN_SPEED_FIRSTLAYER,
    FILAMENT,
    FILAMENT_DIAMETER,
    FILENAME,
    HEIGHT_FIRSTLAYER,
    HEIGHT_LAYER,
    HEIGHT_PRINT,
    HOTEND_TEMP,
    LINE_RATIO,
    NOTES_ENABLE,
    NOZZLE_DIAMETER,
    ORIGIN_CENTER,
    PA_END,
    PA_START,
    PA_STEP,
    PATTERN_ANGLE,
    PATTERN_OPTIONS_ENABLE,
    PATTERN_SIDE_LENGTH,
    PATTERN_SPACING,
    PERIMETERS,
    PRINT_DIR,
    PRINTER,
    RETRACT_DIST,
    SPEED_FIRSTLAYER,
    SPEED_TRAVEL,
    SPEED_PERIMETER,
    SPEED_RETRACT,
    SPEED_UNRETRACT,
    START_GCODE,
    START_GCODE_TYPE,
    USE_FWR,
    USE_MMS,
    ZHOP_ENABLE,
    ZHOP_HEIGHT;
    //SPEED_PRIME
    //USE_LINENO
    //USE_PRIME

// declare calculated variables globally
var ANCHOR_LAYER_EXTRUSION_RATIO,
    ANCHOR_LAYER_LINE_SPACING,
    ANCHOR_LAYER_LINE_WIDTH,
    CENTER_X,
    CENTER_Y,
    EXTRUSION_RATIO,
    FIT_HEIGHT,
    FIT_WIDTH,
    LINE_SPACING,
    LINE_SPACING_ANGLE,
    LINE_WIDTH,
    NUM_LAYERS,
    NUM_PATTERNS,
    PAT_START_X,
    PAT_START_Y,
    PRINT_SIZE_X,
    PRINT_SIZE_Y,
    txtArea;

// set global HTML vars from form inputs
function setHtmlVars(){
  ACCELERATION = parseInt($('#PRINT_ACCL').val());
  ANCHOR_LAYER_LINE_RATIO = parseFloat($('#ANCHOR_LAYER_LINE_RATIO').val());
  ANCHOR_OPTION = $('#ANCHOR_OPTION').val();
  ANCHOR_PERIMETERS = parseFloat($('#ANCHOR_PERIMETERS').val());
  BED_SHAPE = $('#BED_SHAPE').val();
  BED_TEMP = parseInt($('#BED_TEMP').val());
  BED_X = parseInt($('#BED_X').val());
  BED_Y = parseInt($('#BED_Y').val());
  END_GCODE = $('#END_GCODE').val();
  EXTRUDER_NAME = $('#EXTRUDER_NAME').val();
  EXT_MULT = parseFloat($('#EXT_MULT').val());
  EXT_MULT_PRIME = parseFloat($('#ENT_MULT_PRIME').val());
  FAN_SPEED = parseFloat($('#FAN_SPEED').val());
  FAN_SPEED_FIRSTLAYER = parseFloat($('#FAN_SPEED_FIRSTLAYER').val());
  FILAMENT = $('#FILAMENT').val();
  FILAMENT_DIAMETER = parseFloat($('#FILAMENT_DIAMETER').val());
  FILENAME = $('#FILENAME').val();
  HEIGHT_FIRSTLAYER = parseFloat($('#HEIGHT_FIRSTLAYER').val());
  HEIGHT_LAYER = parseFloat($('#HEIGHT_LAYER').val());
  HEIGHT_PRINT = parseFloat($('#HEIGHT_PRINT').val());
  HOTEND_TEMP = parseInt($('#HOTEND_TEMP').val());
  LINE_RATIO = parseFloat($('#LINE_RATIO').val());
  NOTES_ENABLE = $('#NOTES_ENABLE').prop('checked');
  NOZZLE_DIAMETER = parseFloat($('#NOZZLE_DIAMETER').val());
  ORIGIN_CENTER = $('#ORIGIN_CENTER').prop('checked');
  PATTERN_ANGLE = parseInt($('#PATTERN_ANGLE').val());
  PATTERN_OPTIONS_ENABLE = $('#PATTERN_OPTIONS_ENABLE').prop('checked');
  PATTERN_SIDE_LENGTH = parseInt($('#PATTERN_SIDE_LENGTH').val());
  PATTERN_SPACING = parseFloat($('#PATTERN_SPACING').val());
  PA_END = parseFloat($('#PA_END').val());
  PA_START = parseFloat($('#PA_START').val());
  PA_STEP = parseFloat($('#PA_STEP').val());
  PERIMETERS = parseInt($('#PERIMETERS').val());
  PRINTER = $('#PRINTER').val();
  PRINT_DIR = $('#PRINT_DIR').val();
  RETRACT_DIST = parseFloat($('#RETRACT_DIST').val());
  SPEED_FIRSTLAYER = parseInt($('#SPEED_FIRSTLAYER').val());
  SPEED_TRAVEL = parseInt($('#SPEED_TRAVEL').val());
  SPEED_PERIMETER = parseInt($('#SPEED_PERIMETER').val());
  SPEED_RETRACT = parseInt($('#SPEED_RETRACT').val());
  SPEED_UNRETRACT = parseInt($('#SPEED_UNRETRACT').val());
  START_GCODE = $('#START_GCODE').val();
  START_GCODE_TYPE = $('#START_GCODE_TYPE').val();
  USE_FWR = $('#USE_FWR').prop('checked');
  USE_MMS = $('#USE_MMS').prop('checked');
  ZHOP_ENABLE = $('#ZHOP_ENABLE').prop('checked');
  ZHOP_HEIGHT = parseFloat($('#ZHOP_HEIGHT').val());
  //SPEED_PRIME = parseInt($('#PRIME_SPEED').val());
  //USE_LINENO = $('#LINE_NO').prop('checked');
  //USE_PRIME = $('#PRIME').prop('checked');
}

// set global calculated variables
function setCalculatedVars(){
  if (BED_SHAPE === 'Round') {BED_Y = BED_X;}

  // if "pattern settings" checkbox isn't checked, set to defaults instead
  if (!PATTERN_OPTIONS_ENABLE){
    HEIGHT_PRINT = parseFloat(document.getElementById("HEIGHT_PRINT").defaultValue);
    PERIMETERS = parseInt(document.getElementById("PERIMETERS").defaultValue);
    PATTERN_SIDE_LENGTH = parseInt(document.getElementById("PATTERN_SIDE_LENGTH").defaultValue);
    PATTERN_SPACING = parseFloat(document.getElementById("PATTERN_SPACING").defaultValue);
    PATTERN_ANGLE = parseInt(document.getElementById("PATTERN_ANGLE").defaultValue);
    PRINT_DIR = 0;
  }

  NUM_PATTERNS = Math.round((PA_END - PA_START) / PA_STEP + 1);
  NUM_LAYERS = Math.round((HEIGHT_PRINT - HEIGHT_FIRSTLAYER) / HEIGHT_LAYER + 1);

  // line widths and extrusion ratios
  LINE_WIDTH = NOZZLE_DIAMETER * LINE_RATIO; // this has to be rounded or it causes issues
  ANCHOR_LAYER_LINE_WIDTH = NOZZLE_DIAMETER * ANCHOR_LAYER_LINE_RATIO;
  EXTRUSION_RATIO = LINE_WIDTH * HEIGHT_LAYER / (Math.pow(FILAMENT_DIAMETER / 2, 2) * Math.PI);
  ANCHOR_LAYER_EXTRUSION_RATIO = ANCHOR_LAYER_LINE_WIDTH * HEIGHT_FIRSTLAYER / (Math.pow(FILAMENT_DIAMETER / 2, 2) * Math.PI);

  // line spacings
  LINE_SPACING = LINE_WIDTH - HEIGHT_LAYER * (1 - Math.PI / 4); // from slic3r documentation: spacing = extrusion_width - layer_height * (1 - PI/4)
  ANCHOR_LAYER_LINE_SPACING = ANCHOR_LAYER_LINE_WIDTH - HEIGHT_LAYER * (1 - Math.PI / 4);
  LINE_SPACING_ANGLE = LINE_SPACING / Math.sin(toRadians(PATTERN_ANGLE)/2);

  // calculate end dimensions so we can center the print properly & know where to start/end
  CENTER_X = (ORIGIN_CENTER ? 0 : BED_X / 2);
  CENTER_Y = (ORIGIN_CENTER ? 0 : BED_Y / 2);
  PRINT_SIZE_X = Math.round10((NUM_PATTERNS * ((PERIMETERS - 1) * LINE_SPACING_ANGLE)) + 
                 ((NUM_PATTERNS - 1) *  (PATTERN_SPACING + LINE_WIDTH)) + 
                 (Math.cos(toRadians(PATTERN_ANGLE)/2) * PATTERN_SIDE_LENGTH), XY_round);
  PRINT_SIZE_Y = Math.round10(2 * (Math.sin(toRadians(PATTERN_ANGLE)/2) * PATTERN_SIDE_LENGTH), XY_round); // hypotenuse of given angle
  if (ANCHOR_OPTION == 'anchor_frame'){ // with anchor frame, right side is moved out (frame thickness - 1 perim) so last pattern's tip doesn't run over it on the first layer
    PRINT_SIZE_X += ANCHOR_LAYER_LINE_SPACING * (ANCHOR_PERIMETERS - 1);
  }
  PAT_START_X = CENTER_X - (PRINT_SIZE_X / 2);
  PAT_START_Y = CENTER_Y - (PRINT_SIZE_Y / 2);

  // real world print size, accounting for rotation and line widths.
  // this is just used to ensure it will fit on the print bed during input validation
  // actual gcode rotation is done during gcode generation
  FIT_WIDTH = PRINT_SIZE_X + LINE_WIDTH; // actual size is technically + one line width in each direction, as it squishes outwards.... this is probably being excessively anal
  FIT_HEIGHT = PRINT_SIZE_Y + LINE_WIDTH;
  FIT_WIDTH = Math.abs(PRINT_SIZE_X * Math.cos(toRadians(PRINT_DIR))) + Math.abs(PRINT_SIZE_Y * Math.sin(toRadians(PRINT_DIR))); // rotate by PRINT_DIR
  FIT_HEIGHT = Math.abs(PRINT_SIZE_X * Math.sin(toRadians(PRINT_DIR))) + Math.abs(PRINT_SIZE_Y * Math.cos(toRadians(PRINT_DIR)));

  txtArea = document.getElementById('gcodetextarea');

  if (USE_MMS) {
    SPEED_FIRSTLAYER *= 60;
    SPEED_PERIMETER *= 60;
    SPEED_TRAVEL *= 60;
    //SPEED_PRIME *= 60;
    SPEED_RETRACT *= 60;
    SPEED_UNRETRACT *= 60;
  }
}

function genGcode() {
  setHtmlVars();
  setCalculatedVars();

  var basicSettings = {
    'firstLayerSpeed': SPEED_FIRSTLAYER,
    'moveSpeed': SPEED_TRAVEL,
    'perimSpeed': SPEED_PERIMETER,
    'centerX': CENTER_X,
    'centerY': CENTER_Y,
    'printDir': PRINT_DIR,
    'layerHeight': HEIGHT_LAYER,
    'firstLayerHeight': HEIGHT_FIRSTLAYER,
    'lineWidth': LINE_WIDTH,
    'lineSpacing': LINE_SPACING,
    'extRatio': EXTRUSION_RATIO,
    'extMult': EXT_MULT,
    'extMultPrime': EXT_MULT_PRIME,
    'anchorExtRatio': ANCHOR_LAYER_EXTRUSION_RATIO,
    'anchorLineWidth': ANCHOR_LAYER_LINE_WIDTH,
    'anchorLineSpacing': ANCHOR_LAYER_LINE_SPACING,
    'retractDist': RETRACT_DIST,
    'retractSpeed': SPEED_RETRACT,
    'unretractSpeed': SPEED_UNRETRACT,
    'fwRetract': USE_FWR,
    'extruderName': EXTRUDER_NAME,
    'zhopEnable': ZHOP_ENABLE,
    'zhopHeight': ZHOP_HEIGHT
  };

  // Start G-code for pattern
  var pa_script = `\
; ### Klipper Pressure Advance Calibration Pattern ###
;
; Original Marlin linear advance calibration tool by Sineos [https://github.com/Sineos]
; Heavily modified/rewritten by Andrew Ellis [https://github.com/AndrewEllis93]
;
; -------------------------------------------
; Generated: ${new Date()}
; -------------------------------------------
;
; General:
;  - Use mm/s: ${USE_MMS}
${( NOTES_ENABLE ? '\n': '')}\
${( NOTES_ENABLE ?  '; Notes:\n' : '')}\
${( PRINTER && NOTES_ENABLE ? `;  - Printer Name: ${PRINTER}\n` : '')}\
${( FILAMENT && NOTES_ENABLE ? `;  - Filament Name: ${FILAMENT}\n` : '')}\
;
; Printer:
;  - Bed Shape: ${BED_SHAPE}
${(BED_SHAPE === 'Round' ? `;  - Bed Diameter: ${BED_X} mm\n`: `;  - Bed Size X: ${BED_X} mm\n`)}\
${(BED_SHAPE === 'Round' ? '': `;  - Bed Size Y: ${BED_Y} mm\n`)}\
;  - Origin Bed Center: ${(ORIGIN_CENTER ? 'true': 'false')}
;  - Extruder Name: ${EXTRUDER_NAME} 
;  - Travel Speed: ${(USE_MMS ? `${SPEED_TRAVEL / 60} mm/s` : `${SPEED_TRAVEL} mm/min`)}
;  - Nozzle Diameter: ${NOZZLE_DIAMETER} mm
;
; Start / END G-code:
;  - Start G-code Type: ${START_GCODE_TYPE}
${(START_GCODE_TYPE != 'standalone_temp_passing' ? `;  - Hotend Temp: ${HOTEND_TEMP}C\n`: '')}\
${(START_GCODE_TYPE != 'standalone_temp_passing' ? `;  - Bed Temp: ${BED_TEMP}C\n`: '')}\
;  - Start G-code = 
${START_GCODE.replace(/^/gm, ';      ')}
;  - End G-code = 
${END_GCODE.replace(/^/gm, ';      ')}
;
; Filament / Flow:
;  - Filament Diameter: ${FILAMENT_DIAMETER} mm
;  - Extrusion Multiplier: ${EXT_MULT}
;  - Line Width Ratio: ${LINE_RATIO}
;
; Retraction / Z Hop:
;  - Use FW Retract: ${(USE_FWR ? 'true': 'false')}
${(!USE_FWR ? `;  - Retraction Distance: ${RETRACT_DIST} mm\n` : '')}\
${(!USE_FWR ? `;  - Retract Speed: ${(USE_MMS ? `${SPEED_RETRACT / 60} mm/s\n` : `${SPEED_RETRACT} mm/min\n`)}`: '')}\
${(!USE_FWR ? `;  - Unretract Speed: ${(USE_MMS ? `${SPEED_UNRETRACT / 60} mm/s\n` : `${SPEED_UNRETRACT} mm/min\n`)}`: '')}\
;  - Z Hop Enable: ${ZHOP_ENABLE}
${(ZHOP_ENABLE ? `;  - Z Hop Height: ${ZHOP_HEIGHT}mm`: '')} 
;
; First Layer Settings:
;  - First Layer Height: ${HEIGHT_FIRSTLAYER} mm
;  - First Layer Printing Speed: ${(USE_MMS ? `${SPEED_FIRSTLAYER / 60} mm/s` : `${SPEED_FIRSTLAYER} mm/min`)}
;  - First Layer Fan: ${FAN_SPEED_FIRSTLAYER}%
;  - Anchor Option: ${ANCHOR_OPTION}
${(ANCHOR_OPTION == 'anchor_frame' ? `;  - Anchor Frame Perimeters: ${ANCHOR_PERIMETERS}\n`: '')}\
${(ANCHOR_OPTION != 'no_anchor' ? `;  - Anchor Line Width Ratio: ${ANCHOR_LAYER_LINE_RATIO}\n`: '')}\
;
; Print Settings:
;  - Layer Height: ${HEIGHT_LAYER} mm
;  - Print Speed: ${(USE_MMS ? `${SPEED_PERIMETER / 60} mm/s` : `${SPEED_PERIMETER} mm/min`)}
;  - Acceleration: ${ACCELERATION} mm/s^2
;  - Fan Speed: ${FAN_SPEED}%
;
; Pattern Settings:
${(!PATTERN_OPTIONS_ENABLE ? `; (Using defaults)\n`: '')}\
${(PATTERN_OPTIONS_ENABLE ? `; (Customized)\n`: '')}\
;  - Print Height: ${HEIGHT_PRINT} mm
;  - Perimeter Count: ${PERIMETERS}
;  - Side Length: ${PATTERN_SIDE_LENGTH} mm
;  - Spacing: ${PATTERN_SPACING} mm
;  - Corner Angle: ${PATTERN_ANGLE} degrees 
;  - Printing Direction: ${PRINT_DIR} degree
;
; Pressure Advance Stepping:
;  - PA Start Value: ${PA_START}
;  - PA End Value: ${PA_END}
;  - PA Increment: ${PA_STEP}
;
; Calculated Values:
;  - Number of Patterns to Print: ${NUM_PATTERNS}
;  - PA Values: `;
 
for (let i = 0; i < NUM_PATTERNS; i++){
  pa_script += Math.round10((PA_START + i * PA_STEP),PA_round);
  if (i != NUM_PATTERNS - 1){ // add comma separator if not last item in list
    pa_script += ', '
  }
  else {
      pa_script += '\n'
  }
}

pa_script += `\
;  - Print Size X: ${FIT_WIDTH} mm
;  - Print Size Y: ${FIT_HEIGHT} mm
;  - Total Number of Layers: ${NUM_LAYERS}
;
; Prepare printing
; 
ACTIVATE_EXTRUDER EXTRUDER=${EXTRUDER_NAME}
${(START_GCODE_TYPE != 'standalone_temp_passing' ? `M190 S${BED_TEMP} ; set and wait for bed temp\n` : '')}\
${(START_GCODE_TYPE != 'standalone_temp_passing' ? `M109 S${HOTEND_TEMP} ; set and wait for hotend temp\n` : '')}\
${START_GCODE}
G21 ; Millimeter units
G90 ; Absolute XYZ
M83 ; Relative E
G92 E0 ; Reset extruder distance
M106 S${Math.round(FAN_SPEED_FIRSTLAYER * 2.55)}; Set fan speed
SET_VELOCITY_LIMIT ACCEL='${ACCELERATION}; Set printing acceleration
;
;  Begin printing
;
`;

// Number Lines: ${(USE_LINENO ? 'true': 'false')}\n             
// Prime Nozzle: ${(USE_PRIME ? 'true': 'false')}\n
// Prime Extrusion Multiplier: ${EXT_MULT_PRIME}\n
// Prime Speed: ${SPEED_PRIME}\n`

  var TO_X = PAT_START_X,
      TO_Y = PAT_START_Y,
      TO_Z = HEIGHT_FIRSTLAYER;

  CUR_Z = HEIGHT_FIRSTLAYER; // set initial Z coordinate, otherwise z hop will go back to 0 at first

  //Move to layer height then start position, set initial PA
  pa_script += moveTo(TO_X, TO_Y, basicSettings, {comment: ' ; move to start position\n'}) + 
               moveToZ(TO_Z, basicSettings, {comment: ' ; move to start layer height\n'}) +
               `SET_PRESSURE_ADVANCE ADVANCE=${PA_START} EXTRUDER=${EXTRUDER_NAME} ; set pressure advance\n`;
    
  if (ANCHOR_OPTION == 'anchor_frame'){
    pa_script += createAnchorPerimeters(PAT_START_X, PAT_START_Y, PRINT_SIZE_X, PRINT_SIZE_Y, ANCHOR_PERIMETERS, basicSettings);
  }
  else if (ANCHOR_OPTION == 'anchor_layer'){
    // create enough perims to reach center (concentric fill)
    var NUM_CONCENTRIC = Math.floor((PRINT_SIZE_Y * Math.sin(toRadians(45))) / (ANCHOR_LAYER_LINE_SPACING / Math.sin(toRadians(45))));
    pa_script += createAnchorPerimeters(PAT_START_X, PAT_START_Y, PRINT_SIZE_X, PRINT_SIZE_Y, NUM_CONCENTRIC, basicSettings);
  }

  // draw PA pattern
  for (let i = (ANCHOR_OPTION == 'anchor_layer' ? 1 : 0); i < NUM_LAYERS ; i++){ // skip first layer if using full anchor layer
    TO_X = PAT_START_X;
    TO_Y = PAT_START_Y;
    TO_Z = (i * HEIGHT_LAYER) + HEIGHT_FIRSTLAYER;

    if (i == 0 && ANCHOR_OPTION == 'anchor_frame'){ // if printing first layer with a frame, shrink to fit inside frame
      var SHRINK = (ANCHOR_LAYER_LINE_SPACING * (ANCHOR_PERIMETERS - 1)) / Math.sin(toRadians(PATTERN_ANGLE) / 2);
      var SIDE_LENGTH = PATTERN_SIDE_LENGTH - SHRINK; 
      TO_X += SHRINK * Math.sin(toRadians(90) - toRadians(PATTERN_ANGLE) / 2);
      TO_Y += ANCHOR_LAYER_LINE_SPACING * (ANCHOR_PERIMETERS - 1);
    } else {
      var SIDE_LENGTH = PATTERN_SIDE_LENGTH;
    }

    var INITIAL_X = TO_X,
        INITIAL_Y = TO_Y;

    // move to start xy then layer height
    pa_script += moveTo(TO_X, TO_Y, basicSettings, {comment: ' ; move to start\n'}) +
                 moveToZ(TO_Z, basicSettings, {comment: ' ; move to layer height\n'});

    for (let j = 0; j < NUM_PATTERNS; j++){

      // increment pressure advance
      pa_script += 'SET_PRESSURE_ADVANCE ADVANCE=' + (PA_START + (j * PA_STEP)) + ' EXTRUDER=' + EXTRUDER_NAME + ' ; set pressure advance\n';

      if (i > 0){
        pa_script += 'M106 S' + Math.round(FAN_SPEED * 2.55) + '; Set fan speed\n';
      }
                   
      for (let k = 0; k < PERIMETERS ; k++){
        TO_X += (Math.cos(toRadians(PATTERN_ANGLE) / 2) * SIDE_LENGTH);
        TO_Y += (Math.sin(toRadians(PATTERN_ANGLE) / 2) * SIDE_LENGTH);
        pa_script += createLine(TO_X, TO_Y, basicSettings, {'speed': (i == 0 ? SPEED_FIRSTLAYER : SPEED_PERIMETER), comment: ' ; print pattern perimeter\n'});

        TO_X -= Math.cos(toRadians(PATTERN_ANGLE) / 2) * SIDE_LENGTH;
        TO_Y += Math.sin(toRadians(PATTERN_ANGLE) / 2) * SIDE_LENGTH;
        pa_script += createLine(TO_X, TO_Y, basicSettings, {'speed': (i == 0 ? SPEED_FIRSTLAYER : SPEED_PERIMETER), comment: ' ; print pattern perimeter\n'});

        TO_Y = INITIAL_Y;
        if (k != PERIMETERS - 1){ // if not last perimeter yet, move forward line spacing instead of pattern spacing
          TO_X += LINE_SPACING_ANGLE;
          pa_script += moveTo(TO_X, TO_Y, basicSettings, {comment: ' ; move to start next pattern perimeter\n'});
        } else {
          if (j == NUM_PATTERNS - 1){ // if last pattern and last perimeter, travel back to start X instead of + spacing
            TO_X = INITIAL_X;
            pa_script += moveTo(TO_X, TO_Y, basicSettings, {comment: ' ; move back to start position\n'});
          } else {
            TO_X += (PATTERN_SPACING + LINE_WIDTH);
            pa_script += moveTo(TO_X, TO_Y, basicSettings, {comment: ' ; move to next pattern\n'});
          }
        }
      }
    }
  }

/*
  // Prime nozzle if activated
  if (USE_PRIME) {
    var primeStartX = CENTER_X - LENGTH_SLOW - (0.5 * PATTERN_SIDE_LENGTH) - (USE_LINENO ? 4 : 0) - 5,
        primeStartY = CENTER_Y - (PRINT_SIZE_Y / 2);

    pa_script += ';\n' +
                '; prime nozzle\n' +
                ';\n' +
                moveTo(primeStartX, primeStartY, basicSettings) +
                createLine(primeStartX, primeStartY + PRINT_SIZE_Y, PRINT_SIZE_Y, basicSettings, {'extMult': EXT_MULT_PRIME, 'speed': SPEED_PRIME}) +
                moveTo(primeStartX + (LINE_WIDTH * 1.5), primeStartY + PRINT_SIZE_Y, basicSettings) +
                createLine(primeStartX + (LINE_WIDTH * 1.5), primeStartY, -PRINT_SIZE_Y, basicSettings, {'extMult': EXT_MULT_PRIME, 'speed': SPEED_PRIME}) +
                doEfeed('-', basicSettings);
  }

  // print K values beside the test lines
  if (USE_LINENO) {
    var numStartX = CENTER_X + (0.5 * PATTERN_SIDE_LENGTH) + LENGTH_SLOW + (USE_PRIME ? 5 : 0) - 2,
        numStartY = PAT_START_Y - 2,
        stepping = 0;

    pa_script += ';\n' +
                '; print K-values\n' +
                ';\n';

    for (var i = PA_START; i <= PA_END; i += PA_STEP) {
      if (stepping % 2 === 0) {
        pa_script += moveTo(numStartX, numStartY + (stepping * PATTERN_SPACING), basicSettings) +
                    zHop((HEIGHT_LAYER + Z_OFFSET), basicSettings) +
                    doEfeed('+', basicSettings) +
                    createGlyphs(numStartX, numStartY + (stepping * PATTERN_SPACING), basicSettings, Math.round10(i, PA_round)) +
                    doEfeed('-', basicSettings) +
                    zHop((HEIGHT_LAYER + Z_OFFSET) + 0.1, basicSettings);
      }
      stepping += 1;
    }
  }
  */

  pa_script +=  `\
SET_PRESSURE_ADVANCE ADVANCE=${PA_START} EXTRUDER=${EXTRUDER_NAME} ; set pressure advance to start value
;
; FINISH
;
${END_GCODE}`;

  txtArea.value = pa_script;
}


// Save content of textarea to file using
// https://github.com/eligrey/FileSaver.js
function saveTextAsFile() {
  var textToWrite = document.getElementById('gcodetextarea').value,
      textFileAsBlob = new Blob([textToWrite], {type: 'text/plain'}),
      usersFilename = document.getElementById('FILENAME').value,
      filename = usersFilename || '',
      fileNameToSaveAs = filename + '.gcode';
  if (textToWrite) {
    saveAs(textFileAsBlob, fileNameToSaveAs);
  } else {
    alert('Generate G-code first');
    return;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
(function() {

  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */

  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || Number(exp) === 0) {
      return Math[type](value);
    }
    value = Number(value);
    exp = Number(exp);
    // If the value is not a number or the exp is not an integer...
    if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](Number(value[0] + 'e' + (value[1] ? (Number(value[1]) - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return Number(value[0] + 'e' + (value[1] ? (Number(value[1]) + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
}());

// get the number of decimal places of a float
function getDecimals(num) {
  var match = (String(num)).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
    return num;
  }
  var decimalPlaces = Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? Number(match[2]) : 0));
  return decimalPlaces;
}

// convert degrees to radians
function toRadians(degrees){
  return degrees * (Math.PI / 180);
}

// return distance between two point
function getDistance(cur_x, cur_y, to_x, to_y){
  return Math.hypot((to_x - cur_x), (to_y - cur_y));
}

// print a line between current position and target
function createLine(to_x, to_y, basicSettings, optional) {
  var ext = 0,
      length = 0,
      gcode = '';

  //handle optional function arguements passed as object
  var defaults = {
    extMult: basicSettings['extMult'],
    extRatio: basicSettings['extRatio'],
    speed: basicSettings['firstLayerSpeed'],
    comment: ' ; print line\n'
  };
  var optArgs = $.extend({}, defaults, optional);

  // change speed if first layer
  if (Math.round10(CUR_Z, Z_round) == basicSettings['firstLayerHeight']){
    optArgs['speed'] = basicSettings['firstLayerSpeed'];
  } else {
    optArgs['speed'] = basicSettings['perimSpeed'];
  }

  length = getDistance(CUR_X, CUR_Y, to_x, to_y);
  ext = Math.round10(optArgs['extRatio'] * optArgs['extMult'] * Math.abs(length), EXT_round);

  gcode += 'G1 X' + Math.round10(rotateX(to_x, basicSettings['centerX'], to_y, basicSettings['centerY'], basicSettings['printDir']), XY_round) +
             ' Y' + Math.round10(rotateY(to_x, basicSettings['centerX'], to_y, basicSettings['centerY'], basicSettings['printDir']), XY_round) +
             ' E' + ext + ' F' + optArgs['speed'] + optArgs['comment'];

  CUR_X = to_x, // update global position vars
  CUR_Y = to_y;

  return gcode;
}

// move print head to coordinates
function moveTo(to_x, to_y, basicSettings, optional) {
  var gcode = '',
      distance = getDistance(CUR_X, CUR_Y, to_x, to_y);

  var defaults = {
    comment: ' ; move\n'
  };
  var optArgs = $.extend({}, defaults, optional);

  if(distance >= 2){ // don't retract for travels under 2mm
    gcode += doEfeed('-', basicSettings); //retract
  }

  gcode += 'G0 X' + Math.round10(rotateX(to_x, basicSettings['centerX'], to_y, basicSettings['centerY'], basicSettings['printDir']), XY_round) +
             ' Y' + Math.round10(rotateY(to_x, basicSettings['centerX'], to_y, basicSettings['centerY'], basicSettings['printDir']), XY_round) +
             ' F' + basicSettings['moveSpeed'] + optArgs['comment'];
  
  CUR_X = to_x, // update global position vars
  CUR_Y = to_y;

  if(distance >= 2){
    gcode += doEfeed('+', basicSettings);  //unretract
  }
        
  return gcode;
}

function moveToZ(to_z, basicSettings){
  var gcode = '';
  gcode += 'G1 Z' + Math.round10(to_z, Z_round) + ' F' + basicSettings['moveSpeed'] + ' ; move to z height\n';
  CUR_Z = to_z; // update global position var
  return gcode;
}

// create retract / un-retract gcode
function doEfeed(dir, basicSettings) {
  var gcode = '';

  if (basicSettings['zhopEnable'] == false){
    switch (true) {
      case (!basicSettings['fwRetract'] && dir === '+' && RETRACTED === true):
        gcode += 'G1 E' + Math.round10(basicSettings['retractDist'], EXT_round) + ' F' + basicSettings['unretractSpeed'] + ' ; un-retract\n';
        RETRACTED = false;
        break;
      case (!basicSettings['fwRetract'] && dir === '-' && RETRACTED === false):
        gcode += 'G1 E-' + Math.round10(basicSettings['retractDist'], EXT_round) + ' F' + basicSettings['retractSpeed'] + ' ; retract\n';
        RETRACTED = true;
        break;
      case (basicSettings['fwRetract'] && dir === '+' && RETRACTED === true):
        gcode += 'G11 ; un-retract\n';
        RETRACTED = false;
        break;
      case (basicSettings['fwRetract'] && dir === '-' && RETRACTED === false):
        gcode += 'G10 ; retract\n';
        RETRACTED = true;
        break;
    }
  } else {
    switch (true) {
      case (!basicSettings['fwRetract'] && dir === '+' && RETRACTED === true):
        gcode += 'G1 Z' + Math.round10(CUR_Z, Z_round) + ' F' + basicSettings['moveSpeed'] + ' ; z hop return\n' +
                 'G1 E' + Math.round10(basicSettings['retractDist'], EXT_round) + ' F' + basicSettings['unretractSpeed'] + ' ; un-retract\n';
        RETRACTED = false;
        break;
      case (!basicSettings['fwRetract'] && dir === '-' && RETRACTED === false):
        gcode += 'G1 E-' + Math.round10(basicSettings['retractDist'], EXT_round) + ' F' + basicSettings['retractSpeed'] + ' ; retract\n' +
                 'G1 Z' + Math.round10((CUR_Z + basicSettings['zhopHeight']), Z_round) + ' F' + basicSettings['moveSpeed'] + ' ; z hop\n';
                 
        RETRACTED = true;
        break;
      case (basicSettings['fwRetract'] && dir === '+' && RETRACTED === true):
        gcode += 'G1 Z' + Math.round10(CUR_Z, Z_round) + ' F' + basicSettings['moveSpeed'] + ' ; z hop return\n' +
                 'G11 ; un-retract\n';
        RETRACTED = false;
        break;
      case (basicSettings['fwRetract'] && dir === '-' && RETRACTED === false):
        gcode += 'G10 ; retract\n' +
                 'G1 Z' + Math.round10((CUR_Z + basicSettings['zhopHeight']), Z_round) + ' F' + basicSettings['moveSpeed'] + ' ; z hop\n';
        RETRACTED = true;
        break;
    }
  }
  return gcode;
}

// draw perimeter, move inwards, repeat
function createAnchorPerimeters(min_x, min_y, max_x, max_y, num_perims, basicSettings, optional){
  var gcode = '',
      to_x = min_x,
      to_y = min_y;

  //handle optional function arguments passed as object
  var defaults = {
    spacing: basicSettings['anchorLineSpacing'],
    extRatio: basicSettings['anchorExtRatio'],
    speed: basicSettings['firstLayerSpeed'],
    comment: ' ; print line\n'
  };

  var optArgs = $.extend({}, defaults, optional);
  
  for (let i = 0; i < num_perims ; i++){

    if (i != 0){ // after first perimeter, step inwards to start next perimeter
      to_x += optArgs['spacing'];
      to_y += optArgs['spacing'];
      gcode += moveTo(to_x, to_y, basicSettings, {comment: ' ; step inwards to print next anchor perimeter\n'})
    }
    // draw line up
    to_y += max_y - (i * optArgs['spacing']) * 2;
    gcode += createLine(to_x, to_y, basicSettings, {speed: optArgs['speed'], extRatio: optArgs['extRatio'], comment: ' ; draw anchor perimeter (up)\n'});

    // draw line right
    to_x += max_x - (i * optArgs['spacing']) * 2;
    gcode += createLine(to_x, to_y, basicSettings, {speed: optArgs['speed'], extRatio: optArgs['extRatio'], comment: ' ; draw anchor perimeter (right)\n'});

    // draw line down
    to_y -= max_y - (i * optArgs['spacing']) * 2;
    gcode += createLine(to_x, to_y, basicSettings, {speed: optArgs['speed'], extRatio: optArgs['extRatio'], comment: ' ; draw anchor perimeter (down)\n'});

    // draw line left
    to_x -= max_x - (i * optArgs['spacing']) * 2;
    gcode += createLine(to_x, to_y, basicSettings, {speed: optArgs['speed'], extRatio: optArgs['extRatio'], comment: ' ; draw anchor perimeter (left)\n'});
  }
  return gcode;
}

/*
// create digits for K line numbering
function createGlyphs(startX, startY, basicSettings, value) {
  var glyphSegHeight = 2,
      glyphSegHeight2 = 0.4,
      glyphSpacing = 3.0,
      glyphString = '',
      xCount = 0,
      yCount = 0,
      sNumber = value.toString(),
      glyphSeg = {
        '1': ['up', 'up'],
        '2': ['mup', 'mup', 'right', 'down', 'left', 'down', 'right'],
        '3': ['mup', 'mup', 'right', 'down', 'down', 'left', 'mup', 'right'],
        '4': ['mup', 'mup', 'down', 'right', 'mup', 'down', 'down'],
        '5': ['right', 'up', 'left', 'up', 'right'],
        '6': ['mup', 'right', 'down', 'left', 'up', 'up', 'right'],
        '7': ['mup', 'mup', 'right', 'down', 'down'],
        '8': ['mup', 'right', 'down', 'left', 'up', 'up', 'right', 'down'],
        '9': ['right', 'up', 'left', 'up', 'right', 'down'],
        '0': ['right', 'up', 'up', 'left', 'down', 'down'],
        '.': ['dot']
      };

  for (var i = 0, len = sNumber.length; i < len; i += 1) {
    for (var key in glyphSeg[sNumber.charAt(i)]) {
      if(glyphSeg[sNumber.charAt(i)].hasOwnProperty(key)) {
        var up = createLine(startX + (xCount * glyphSegHeight), startY + (yCount * glyphSegHeight) + glyphSegHeight, glyphSegHeight, basicSettings, {'speed': basicSettings['firstLayerSpeed'], 'comment': ' ; ' + sNumber.charAt(i) + '\n'}),
            down = createLine(startX + (xCount * glyphSegHeight), startY + (yCount * glyphSegHeight) - glyphSegHeight, glyphSegHeight, basicSettings, {'speed': basicSettings['firstLayerSpeed'], 'comment': ' ; ' + sNumber.charAt(i) + '\n'}),
            right = createLine(startX + (xCount * glyphSegHeight) + glyphSegHeight, startY + (yCount * glyphSegHeight), glyphSegHeight, basicSettings, {'speed': basicSettings['firstLayerSpeed'], 'comment': ' ; ' + sNumber.charAt(i) + '\n'}),
            left = createLine(startX + (xCount * glyphSegHeight) - glyphSegHeight, startY + (yCount * glyphSegHeight), glyphSegHeight, basicSettings, {'speed': basicSettings['firstLayerSpeed'], 'comment': ' ; ' + sNumber.charAt(i) + '\n'}),
            mup = moveTo(startX + (xCount * glyphSegHeight), startY + (yCount * glyphSegHeight) + glyphSegHeight, basicSettings),
            dot = createLine(startX, startY + glyphSegHeight2, glyphSegHeight2, basicSettings, {speed: basicSettings['firstLayerSpeed'], comment: ' ; dot\n'});
        if (glyphSeg[sNumber.charAt(i)][key] === 'up') {
          glyphString += up;
          yCount += 1;
        } else if (glyphSeg[sNumber.charAt(i)][key] === 'down') {
          glyphString += down;
          yCount -= 1;
        } else if (glyphSeg[sNumber.charAt(i)][key] === 'right') {
          glyphString += right;
          xCount += 1;
        } else if (glyphSeg[sNumber.charAt(i)][key] === 'left') {
          glyphString += left;
          xCount -= 1;
        } else if (glyphSeg[sNumber.charAt(i)][key] === 'mup') {
          glyphString += mup;
          yCount += 1;
        } else if (glyphSeg[sNumber.charAt(i)][key] === 'dot') {
          glyphString += dot;
        }
      }
    }
    if (sNumber.charAt(i) === '1' || sNumber.charAt(i) === '.') {
      startX += 1;
    } else {
      startX += glyphSpacing;
    }
    if (i !== sNumber.length - 1) {
      glyphString += doEfeed('-', basicSettings, (basicSettings['fwRetract'] ? 'FWR' : 'STD')) +
                     moveTo(startX, startY, basicSettings) +
                     doEfeed('+', basicSettings, (basicSettings['fwRetract'] ? 'FWR' : 'STD'));
    }
    yCount = 0;
    xCount = 0;
  }
  return glyphString;
}
*/

// rotate x around a defined center xm, ym
function rotateX(x, xm, y, ym, a) {
  a = toRadians(a); // Convert to radians
  var cos = Math.cos(a),
      sin = Math.sin(a);

  // Subtract midpoints, so that midpoint is translated to origin
  // and add it in the end again
  //var xr = (x - xm) * cos - (y - ym) * sin + xm; //CCW
  var xr = (cos * (x - xm)) + (sin * (y - ym)) + xm; //CW
  return xr;
}


// rotate y around a defined center xm, ym
function rotateY(x, xm, y, ym, a) {
  a = toRadians(a); // Convert to radians
  var cos = Math.cos(a),
      sin = Math.sin(a);

  // Subtract midpoints, so that midpoint is translated to origin
  // and add it in the end again
  //var yr = (x - xm) * sin + (y - ym) * cos + ym; //CCW
  var yr = (cos * (y - ym)) - (sin * (x - xm)) + ym; //CW
  return yr;
}

// save current settings as localStorage object
function setLocalStorage() {
var   NOTES_ENABLE = $('#NOTES_ENABLE').prop('checked'),
      PATTERN_OPTIONS_ENABLE = $('#PATTERN_OPTIONS_ENABLE').prop('checked'),
      HOTEND_TEMP = parseInt($('#HOTEND_TEMP').val()),
      BED_TEMP = parseInt($('#BED_TEMP').val()),
      START_GCODE_TYPE = $('#START_GCODE_TYPE').val(),
      ANCHOR_OPTION = $('#ANCHOR_OPTION').val(),
      FILAMENT_DIAMETER = parseFloat($('#FILAMENT_DIAMETER').val()),
      NOZZLE_DIAMETER = parseFloat($('#NOZZLE_DIAMETER').val()),
      LINE_RATIO = parseFloat($('#LINE_RATIO').val()),
      ANCHOR_LAYER_LINE_RATIO = parseFloat($('#ANCHOR_LAYER_LINE_RATIO').val()),
      START_GCODE = $('#START_GCODE').val(),
      END_GCODE = $('#END_GCODE').val(),
      SPEED_FIRSTLAYER = parseInt($('#SPEED_FIRSTLAYER').val()),
      SPEED_PERIMETER = parseInt($('#SPEED_PERIMETER').val()),
      SPEED_TRAVEL = parseInt($('#SPEED_TRAVEL').val()),
      SPEED_RETRACT = parseInt($('#SPEED_RETRACT').val()),
      SPEED_UNRETRACT = parseInt($('#SPEED_UNRETRACT').val()),
      ACCELERATION = parseInt($('#PRINT_ACCL').val()),
      RETRACT_DIST = parseFloat($('#RETRACT_DIST').val()),
      ZHOP_ENABLE = $('#ZHOP_ENABLE').prop('checked'),
      ZHOP_HEIGHT = parseFloat($('#ZHOP_HEIGHT').val()),
      BED_SHAPE = $('#BED_SHAPE').val(),
      BED_X = parseInt($('#BED_X').val()),
      BED_Y = parseInt($('#BED_Y').val()),
      ORIGIN_CENTER = $('#ORIGIN_CENTER').prop('checked'),
      HEIGHT_FIRSTLAYER = parseFloat($('#HEIGHT_FIRSTLAYER').val()),
      HEIGHT_LAYER = parseFloat($('#HEIGHT_LAYER').val()),
      HEIGHT_PRINT = parseFloat($('#HEIGHT_PRINT').val()),
      EXTRUDER_NAME = $('#EXTRUDER_NAME').val(),
      FAN_SPEED_FIRSTLAYER = parseFloat($('#FAN_SPEED_FIRSTLAYER').val()),
      FAN_SPEED = parseFloat($('#FAN_SPEED').val()),
      EXT_MULT = parseFloat($('#EXT_MULT').val()),
      PA_START = parseFloat($('#PA_START').val()),
      PA_END = parseFloat($('#PA_END').val()),
      PA_STEP = parseFloat($('#PA_STEP').val()),
      PRINT_DIR = $('#PRINT_DIR').val(),
      PATTERN_SPACING = parseFloat($('#PATTERN_SPACING').val()),
      PATTERN_ANGLE = parseFloat($('#PATTERN_ANGLE').val()),
      PERIMETERS = parseFloat($('#PERIMETERS').val()),
      //USE_PRIME = $('#PRIME').prop('checked'),
      //EXT_MULT_PRIME = parseFloat($('#ENT_MULT_PRIME').val()),
      //SPEED_PRIME = parseFloat($('#PRIME_SPEED').val()),
      PATTERN_SIDE_LENGTH = parseFloat($('#PATTERN_SIDE_LENGTH').val()),
      USE_FWR = $('#USE_FWR').prop('checked'),
      USE_MMS = $('#USE_MMS').prop('checked');
      //USE_LINENO = $('#LINE_NO').prop('checked');

  var settings = {
    'NOTES_ENABLE': NOTES_ENABLE,
    'PATTERN_OPTIONS_ENABLE': PATTERN_OPTIONS_ENABLE,
    'HOTEND_TEMP': HOTEND_TEMP,
    'BED_TEMP': BED_TEMP,
    'FILAMENT_DIAMETER': FILAMENT_DIAMETER,
    'NOZZLE_DIAMETER': NOZZLE_DIAMETER,
    'LINE_RATIO': LINE_RATIO,
    'ANCHOR_OPTION': ANCHOR_OPTION,
    'ANCHOR_LAYER_LINE_RATIO': ANCHOR_LAYER_LINE_RATIO,
    'START_GCODE_TYPE': START_GCODE_TYPE,
    'START_GCODE': START_GCODE,
    'END_GCODE': END_GCODE,
    'SPEED_FIRSTLAYER': SPEED_FIRSTLAYER,
    'SPEED_PERIMETER': SPEED_PERIMETER,
    'SPEED_TRAVEL': SPEED_TRAVEL,
    'SPEED_RETRACT': SPEED_RETRACT,
    'SPEED_UNRETRACT': SPEED_UNRETRACT,
    'ACCELERATION': ACCELERATION,
    'RETRACT_DIST': RETRACT_DIST,
    'ZHOP_ENABLE': ZHOP_ENABLE,
    'ZHOP_HEIGHT': ZHOP_HEIGHT,
    'BED_SHAPE': BED_SHAPE,
    'BED_X': BED_X,
    'BED_Y': BED_Y,
    'ORIGIN_CENTER': ORIGIN_CENTER,
    'HEIGHT_FIRSTLAYER': HEIGHT_FIRSTLAYER,
    'HEIGHT_LAYER': HEIGHT_LAYER,
    'HEIGHT_PRINT': HEIGHT_PRINT,
    'EXTRUDER_NAME': EXTRUDER_NAME,
    'FAN_SPEED_FIRSTLAYER' : FAN_SPEED_FIRSTLAYER,
    'FAN_SPEED' : FAN_SPEED,
    'EXT_MULT': EXT_MULT,
    'PA_START': PA_START,
    'PA_END': PA_END,
    'PA_STEP': PA_STEP,
    'PRINT_DIR': PRINT_DIR,
    'PATTERN_SPACING': PATTERN_SPACING,
    'PATTERN_ANGLE': PATTERN_ANGLE,
    'PERIMETERS': PERIMETERS,
    //'USE_PRIME': USE_PRIME,
    //'EXT_MULT_PRIME': EXT_MULT_PRIME,
    //'SPEED_PRIME' : SPEED_PRIME,
    'PATTERN_SIDE_LENGTH': PATTERN_SIDE_LENGTH,
    'USE_FWR': USE_FWR,
    'USE_MMS': USE_MMS
    //'USE_LINENO': USE_LINENO
  };

  const lsSettings = JSON.stringify(settings);
  window.localStorage.setItem('PA_SETTINGS', lsSettings);
}

// toggle between mm/s and mm/min speed settings
function speedToggle() {
  var SPEED_FIRSTLAYER = $('#SPEED_FIRSTLAYER').val(),
      SPEED_PERIMETER = $('#SPEED_PERIMETER').val(),
      SPEED_TRAVEL = $('#SPEED_TRAVEL').val(),
      SPEED_RETRACT = $('#SPEED_RETRACT').val(),
      SPEED_PRIME = $('#PRIME_SPEED').val(),
      SPEED_UNRETRACT = $('#SPEED_UNRETRACT').val();
  if ($('#USE_MMS').is(':checked')) {
    SPEED_FIRSTLAYER = $('#SPEED_FIRSTLAYER').val();
    SPEED_PERIMETER = $('#SPEED_PERIMETER').val();
    SPEED_TRAVEL = $('#SPEED_TRAVEL').val();
    SPEED_RETRACT = $('#SPEED_RETRACT').val();
    SPEED_UNRETRACT = $('#SPEED_UNRETRACT').val();
    SPEED_PRIME = $('#PRIME_SPEED').val();
    $('#SPEED_FIRSTLAYER').val(SPEED_FIRSTLAYER / 60);
    $('#SPEED_PERIMETER').val(SPEED_PERIMETER / 60);
    $('#SPEED_TRAVEL').val(SPEED_TRAVEL / 60);
    $('#SPEED_RETRACT').val(SPEED_RETRACT / 60);
    $('#SPEED_UNRETRACT').val(SPEED_UNRETRACT / 60);
    $('#PRIME_SPEED').val(SPEED_PRIME / 60);
  } else {
    SPEED_FIRSTLAYER = $('#SPEED_FIRSTLAYER').val();
    SPEED_PERIMETER = $('#SPEED_PERIMETER').val();
    SPEED_TRAVEL = $('#SPEED_TRAVEL').val();
    SPEED_RETRACT = $('#SPEED_RETRACT').val();
    SPEED_UNRETRACT = $('#SPEED_UNRETRACT').val();
    SPEED_PRIME = $('#PRIME_SPEED').val();
    $('#SPEED_FIRSTLAYER').val(SPEED_FIRSTLAYER * 60);
    $('#SPEED_PERIMETER').val(SPEED_PERIMETER * 60);
    $('#SPEED_TRAVEL').val(SPEED_TRAVEL * 60);
    $('#SPEED_RETRACT').val(SPEED_RETRACT * 60);
    $('#SPEED_UNRETRACT').val(SPEED_UNRETRACT * 60);
    $('#PRIME_SPEED').val(SPEED_PRIME * 60);
  }
}

// toggle between round and rectangular bed shape
function toggleBedShape() {
  if ($('#BED_SHAPE').val() === 'Round') {
    $('label[for=\'BED_X\']').text('Bed Diameter:');
    $('#shape').text('Diameter (mm) of the bed');
    document.getElementById('bedSizeYRow').style.display = 'none';
    if (!$('#ORIGIN_CENTER').is(':checked')) {
      $('#ORIGIN_CENTER').prop('checked', !$('#ORIGIN_CENTER').prop('checked'));
    }
    document.getElementById('originBedCenterRow').style.display = 'none';
  } else {
    $('label[for=\'BED_X\']').text('Bed Size X:');
    $('#shape').text('Size (mm) of the bed in X');
    document.getElementById('bedSizeYRow').style.display = '';
    document.getElementById('originBedCenterRow').style.display = '';
  }
}

// toggle prime relevant options
/*
function togglePrime() {
  if ($('#PRIME').is(':checked')) {
    $('#ENT_MULT_PRIME').prop('disabled', false);
    $('label[for=PRIME_EXT]').css({opacity: 1});
  } else {
    $('#ENT_MULT_PRIME').prop('disabled', true);
    $('label[for=PRIME_EXT]').css({opacity: 0.5});
  }
}
*/


function toggleStartGcode(){
  var CANNED_GCODE = `\
G28 ; Home all axes
;G32                ; Tramming macro (uncomment if used)
;QUAD_GANTRY_LEVEL  ; Level flying gantry (uncomment if used)
;Z_TILT_ADJUST      ; Tilt level bed (uncomment if used)
G28 Z               ; Home Z
G90                 ; Use absolute positioning
G1 Z10 F100         ; Z raise
;BED_MESH_CALIBRATE ; Generate bed mesh (uncomment if used)
M112                ; Reading comprehension check! (emergency stop)`

  var STANDALONE_MACRO = `\
PRINT_START
; Make sure this macro name matches your own! 
; (Some may use START_PRINT instead, for example.)`

  var STANDALONE_TEMP_PASSING_MACRO = `\
; !!!!!!! Pass your temperatures to your start macro here !!!!!!!
PRINT_START HOTEND=200 BED=60

; Make sure the macro name AND parameter names match YOUR start macro setup
; (Example, some macros use EXTRUDER=X rather than HOTEND=X)`

  var CANNED_GCODE_CUSTOM = "",
      STANDALONE_MACRO_CUSTOM = "",
      STANDALONE_TEMP_PASSING_MACRO_CUSTOM = "";

  //$('#START_GCODE').val()

  if ($('#START_GCODE_TYPE').val() == "custom"){
    $('#START_GCODE').val(CANNED_GCODE);
  } else if ($('#START_GCODE_TYPE').val() == "standalone") {
    $('#START_GCODE').val(STANDALONE_MACRO);
  } else {
    $('#START_GCODE').val(STANDALONE_TEMP_PASSING_MACRO);
  }
}

function toggleStartGcodeTypeDescriptions(){
    if ($('#START_GCODE_TYPE').val() == "custom"){
    document.getElementById("START_GCODE_TYPE_Description").innerHTML = `<p>Use custom start g-code (below). The defaults have a lot of redundancies and are intended to be revised.</p>
You should generally be able to copy your usual start g-code from your slicer.`;
    document.getElementById('hotendTempRow').style.display = '';
    document.getElementById('bedTempRow').style.display = '';
  } else if ($('#START_GCODE_TYPE').val() == "standalone") {
    document.getElementById("START_GCODE_TYPE_Description").innerHTML = "<p>Only use if your start macro contains <font color=\"red\"><strong>all necessary start g-codes!</strong></font> (homing, quad gantry leveling, z offset, bed leveling, etc).</p>";
    document.getElementById('hotendTempRow').style.display = '';
    document.getElementById('bedTempRow').style.display = '';
  } else {
    document.getElementById("START_GCODE_TYPE_Description").innerHTML = `<p>Only use if your start macro contains <font color=\"red\"><strong>all necessary start g-codes</font> <i>and</i></strong> is <strong><a href=\"https://github.com/AndrewEllis93/Print-Tuning-Guide/blob/main/articles/passing_slicer_variables.md\">set up to receive variables</a></strong>!</p>
<p><strong>This will prevent temperature gcodes from being added separately.</strong> You will have to pass temperatures yourself below.</p>`;
    document.getElementById('hotendTempRow').style.display = 'none';
    document.getElementById('bedTempRow').style.display = 'none';
  }
}


function toggleTemps(){
  if ($('#START_GCODE_TYPE').val() == "custom"){
    document.getElementById('hotendTempRow').style.display = '';
    document.getElementById('bedTempRow').style.display = '';
  } else if ($('#START_GCODE_TYPE').val() == "standalone") {
    document.getElementById('hotendTempRow').style.display = '';
    document.getElementById('bedTempRow').style.display = '';
  } else {
    document.getElementById('hotendTempRow').style.display = 'none';
    document.getElementById('bedTempRow').style.display = 'none';
  }
}

function toggleNotes(){
  if ($('#NOTES_ENABLE').is(':checked')) {
    document.getElementById('printerNameRow').style.display = '';
    document.getElementById('filamentNameRow').style.display = '';
  } else {
    document.getElementById('printerNameRow').style.display = 'none';
    document.getElementById('filamentNameRow').style.display = 'none';
  }
}

function togglePatternOptions(){
  if ($('#PATTERN_OPTIONS_ENABLE').is(':checked')) {
    document.getElementById('printHeightRow').style.display = '';
    document.getElementById('perimetersRow').style.display = '';
    document.getElementById('patternSideLengthRow').style.display = '';
    document.getElementById('patternSpacingRow').style.display = '';
    document.getElementById('patternAngleRow').style.display = '';
    document.getElementById('printDirectionRow').style.display = '';
  } else {
    document.getElementById('printHeightRow').style.display = 'none';
    document.getElementById('perimetersRow').style.display = 'none';
    document.getElementById('patternSideLengthRow').style.display = 'none';
    document.getElementById('patternSpacingRow').style.display = 'none';
    document.getElementById('patternAngleRow').style.display = 'none';
    document.getElementById('printDirectionRow').style.display = 'none';
  }
}

function toggleAnchorOptions(){
    if ($('#ANCHOR_OPTION').val() == "anchor_frame"){
    document.getElementById('anchorPerimetersRow').style.display = '';
    document.getElementById('anchorLineRatioRow').style.display = '';
    document.getElementById("anchorOptionDescription").innerHTML = '<img style="width: auto; max-height: 200px;" src="./images/anchor_frame.png" alt="Anchor Frame" />'
  } else if ($('#ANCHOR_OPTION').val() == "anchor_layer") {
    document.getElementById('anchorPerimetersRow').style.display = 'none';
    document.getElementById('anchorLineRatioRow').style.display = '';
    document.getElementById("anchorOptionDescription").innerHTML = '<img style="width: auto; max-height: 200px;" src="./images/anchor_layer.png" alt="Anchor Layer" />'
  } else {
    document.getElementById('anchorPerimetersRow').style.display = 'none';
    document.getElementById('anchorLineRatioRow').style.display = 'none';
    document.getElementById("anchorOptionDescription").innerHTML = '<img style="width: auto; max-height: 200px;" src="./images/no_anchor.png" alt="No Anchor" />'
  }
}

// toggle between standard and firmware retract
function toggleRetract() {
  if ($('#USE_FWR').is(':checked')) {
    document.getElementById('retractionDistanceRow').style.display = 'none';
    document.getElementById('retractionSpeedRow').style.display = 'none';
    document.getElementById('unretractionSpeedRow').style.display = 'none';
  } else {
    document.getElementById('retractionDistanceRow').style.display = '';
    document.getElementById('retractionSpeedRow').style.display = '';
    document.getElementById('unretractionSpeedRow').style.display = '';
  }
}

function toggleZHop() {
  if ($('#ZHOP_ENABLE').is(':checked')) {
    document.getElementById('zhopHeightRow').style.display = '';
  } else {
    document.getElementById('zhopHeightRow').style.display = 'none';
  }
}

// show the calculated values at the bottom of the form
function displayCalculatedValues(action = 'show'){
  var body='';

  if (action == 'show'){
    body += `&nbsp;<strong>Pattern count: </strong> ${NUM_PATTERNS}<br>`;
    body += '&nbsp;<strong>PA values: </strong> ';
    for (let i = 0; i < NUM_PATTERNS; i++){
      body += `${Math.round10((PA_START + i * PA_STEP),PA_round)}`;
      if (i != NUM_PATTERNS - 1){ // add comma separator if not last item in list
        body += ', '; 
      }
      else {
         body += '<br>';
      }
    }
    body += `&nbsp;<strong>Print size X: </strong> ${Math.round10(FIT_WIDTH, -2)}mm<br>`;
    body += `&nbsp;<strong>Print size Y: </strong> ${Math.round10(FIT_HEIGHT, -2)}mm`;
    document.getElementById("information").innerHTML = body;
    document.getElementById('informationTable').style.display = '';
  } else {
    body = '';
    document.getElementById("information").innerHTML = '';
    document.getElementById('informationTable').style.display = 'none';
  }
}

// sanity checks for pattern / bed size
function validateInput() {
  setHtmlVars();
  setCalculatedVars();

  var testNaN = {
      // do not use parseInt or parseFloat for validating, since both
      // functions will have special parsing characteristics leading to
      // false numeric validation
      BED_X: $('#BED_X').val(),
      BED_Y: $('#BED_Y').val(),
      PA_START: $('#PA_START').val(),
      PA_END: $('#PA_END').val(),
      PA_STEP: $('#PA_STEP').val(),
      PATTERN_SPACING: $('#PATTERN_SPACING').val(),
      PATTERN_ANGLE: $('#PATTERN_ANGLE').val(),
      SPEED_FIRSTLAYER: $('#SPEED_FIRSTLAYER').val(),
      SPEED_PERIMETER: $('#SPEED_PERIMETER').val(),
      PATTERN_SIDE_LENGTH: $('#PATTERN_SIDE_LENGTH').val(),
      HOTEND_TEMP: $('#HOTEND_TEMP').val(),
      BED_TEMP: $('#BED_TEMP').val(),
      FILAMENT_DIAMETER: $('#FILAMENT_DIAMETER').val(),
      NOZZLE_DIAMETER: $('#NOZZLE_DIAMETER').val(),
      LINE_RATIO: $('#LINE_RATIO').val(),
      ANCHOR_LAYER_LINE_RATIO: $('#ANCHOR_LAYER_LINE_RATIO').val(),
      ANCHOR_PERIMETERS : $('#ANCHOR_PERIMETERS').val(),
      HEIGHT_LAYER: $('#HEIGHT_LAYER').val(),
      HEIGHT_FIRSTLAYER: $('#HEIGHT_FIRSTLAYER').val(),
      FAN_SPEED_FIRSTLAYER: $('#FAN_SPEED_FIRSTLAYER').val(),
      FAN_SPEED: $('#FAN_SPEED').val(),
      EXT_MULT: $('#EXT_MULT').val(),
      //PRIME_EXT: $('#ENT_MULT_PRIME').val(),
      SPEED_TRAVEL: $('#SPEED_TRAVEL').val(),
      SPEED_RETRACT: $('#SPEED_RETRACT').val(),
      SPEED_UNRETRACT: $('#SPEED_UNRETRACT').val(),
      PRINT_ACCL: $('#PRINT_ACCL').val(),
      ZHOP_HEIGHT: $('#ZHOP_HEIGHT').val(),
      HEIGHT_PRINT: $('#HEIGHT_PRINT').val(),
      PERIMETERS: $('#PERIMETERS').val(),
      //PRIME_SPEED: $('#PRIME_SPEED').val(),
      RETRACT_DIST: $('#RETRACT_DIST').val()
    }

    var decimals = getDecimals(parseFloat(testNaN['PA_STEP']));
    var invalidDiv = 0;
  
  // Start clean
  $('BED_X,#START_GCODE_TYPE,#START_GCODE,#END_GCODE,#BED_Y,#EXT_MULT,#FAN_SPEED,#FAN_SPEED_FIRSTLAYER,#FILAMENT_DIAMETER,#HOTEND_TEMP,#BED_TEMP,#SPEED_FIRSTLAYER,#LAYER_HEIGHT,#HEIGHT_FIRSTLAYER,#LINE_RATIO,#ANCHOR_LAYER_LINE_RATIO,#SPEED_TRAVEL,#NOZZLE_DIAMETER,#PA_END,'
      + '#PA_START,#PA_STEP,#PATTERN_ANGLE,#PATTERN_SIDE_LENGTH,#PATTERN_SPACING,#SPEED_PERIMETER,#PERIMETERS,#PRINT_ACCL,#HEIGHT_PRINT,#SPEED_RETRACT,#RETRACT_DIST,#SPEED_UNRETRACT,#ZHOP_HEIGHT').each((i,t) => {
    t.setCustomValidity('');
    const tid = $(t).attr('id');
    $(`label[for=${tid}]`).removeClass();
  });
  $('#warning1').hide();
  $('#warning2').hide();
  $('#warning3').hide();
  $('#button').prop('disabled', false);

  // Check for proper numerical values
  Object.keys(testNaN).forEach((k) => {
    if ((isNaN(testNaN[k]) && !isFinite(testNaN[k])) || testNaN[k].trim().length === 0) {
      $('label[for=' + k + ']').addClass('invalidNumber');
      $('#warning3').text('Some values are not proper numbers. Check highlighted Settings.');
      $('#warning3').addClass('invalidNumber');
      $('#warning3').show();
      $('#button').prop('disabled', true);
    }
  });
  
    // Check if pressure advance stepping is a multiple of the pressure advance Range
  if ((Math.round10(parseFloat(testNaN['PA_END']) - parseFloat(testNaN['PA_START']), PA_round) * Math.pow(10, decimals)) % (parseFloat(testNaN['PA_STEP']) * Math.pow(10, decimals)) !== 0) {
    $('label[for=PA_START]').addClass('invalidDiv');
    $('label[for=PA_END]').addClass('invalidDiv');
    $('label[for=PA_STEP]').addClass('invalidDiv');
    $('#warning1').text('Your PA range cannot be cleanly divided. Check highlighted Pattern Settings.');
    $('#warning1').addClass('invalidDiv');
    $('#warning1').show();
    $('#button').prop('disabled', true);
    invalidDiv = 1;
    displayCalculatedValues('hide');
  } else if (parseFloat(testNaN['PA_END']) - parseFloat(testNaN['PA_START']) < 0) { // Check if pressure advance stepping is a multiple of the pressure advance Range
    $('label[for=PA_START]').addClass('invalidDiv');
    $('label[for=PA_END]').addClass('invalidDiv');
    $('#warning1').text('Your PA start value cannot be higher than your PA end value. Check highlighted settings.');
    $('#warning1').addClass('invalidDiv');
    $('#warning1').show();
    $('#button').prop('disabled', true);
    invalidDiv = 1;
    displayCalculatedValues('hide');
  } else {
      displayCalculatedValues('show');

      // only check bed dimensions if above checks pass

      // Check if pattern settings exceed bed size
      // too tall for round bed
      if (BED_SHAPE === 'Round' && (Math.sqrt(Math.pow(FIT_WIDTH, 2) + Math.pow(FIT_HEIGHT, 2)) > (parseInt(testNaN['BED_X']) - 5)) && FIT_HEIGHT > FIT_WIDTH) {
        $('label[for=PA_START]').addClass('invalidSize');
        $('label[for=PA_END]').addClass('invalidSize');
        $('label[for=PA_STEP]').addClass('invalidSize');
        $('label[for=PATTERN_SPACING]').addClass('invalidSize');
        $('label[for=PATTERN_ANGLE]').addClass('invalidSize');
        $('label[for=PATTERN_SIDE_LENGTH]').addClass('invalidSize');
        $('label[for=PERIMETERS]').addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).text('Your Pattern size (x: ' + Math.round(FIT_WIDTH) + ', y: ' + Math.round(FIT_HEIGHT) + ') exceeds your bed\'s diameter. Check highlighted Pattern Settings.');
        $((invalidDiv ? '#warning2' : '#warning1')).addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).show();
        displayCalculatedValues('hide');
      }

      // too wide for round bed
      if (BED_SHAPE === 'Round' && (Math.sqrt(Math.pow(FIT_WIDTH, 2) + Math.pow(FIT_HEIGHT, 2)) > (parseInt(testNaN['BED_X']) - 5)) && FIT_WIDTH > FIT_HEIGHT) {
        $('label[for=PA_START]').addClass('invalidSize');
        $('label[for=PA_END]').addClass('invalidSize');
        $('label[for=PA_STEP]').addClass('invalidSize');
        $('label[for=PATTERN_SPACING]').addClass('invalidSize');
        $('label[for=PATTERN_ANGLE]').addClass('invalidSize');
        $('label[for=PATTERN_SIDE_LENGTH]').addClass('invalidSize');
        $('label[for=PERIMETERS]').addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).text('Your Pattern size (x: ' + Math.round(FIT_WIDTH) + ', y: ' + Math.round(FIT_HEIGHT) + ') exceeds your bed\'s diameter. Check highlighted Pattern Settings.');
        $((invalidDiv ? '#warning2' : '#warning1')).addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).show();
        displayCalculatedValues('hide');
      }

      // too wide
      if (BED_SHAPE === 'Rect' && FIT_WIDTH > (parseInt(testNaN['BED_X']) - 5)) {
        $('label[for=PA_START]').addClass('invalidSize');
        $('label[for=PA_END]').addClass('invalidSize');
        $('label[for=PA_STEP]').addClass('invalidSize');
        $('label[for=PATTERN_SPACING]').addClass('invalidSize');
        $('label[for=PATTERN_ANGLE]').addClass('invalidSize');
        $('label[for=PATTERN_SIDE_LENGTH]').addClass('invalidSize');
        $('label[for=PERIMETERS]').addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).text('Your Pattern size (x: ' + Math.round(FIT_WIDTH) + ', y: ' + Math.round(FIT_HEIGHT) + ') exceeds your X bed size. Check highlighted Pattern Settings.');
        $((invalidDiv ? '#warning2' : '#warning1')).addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).show();
        displayCalculatedValues('hide');
      }

      // too tall
      if (BED_SHAPE === 'Rect' && FIT_HEIGHT > (parseInt(testNaN['BEDSIZE_Y']) - 5)) {
        $('label[for=PA_START]').addClass('invalidSize');
        $('label[for=PA_END]').addClass('invalidSize');
        $('label[for=PA_STEP]').addClass('invalidSize');
        $('label[for=PATTERN_SPACING]').addClass('invalidSize');
        $('label[for=PATTERN_ANGLE]').addClass('invalidSize');
        $('label[for=PATTERN_SIDE_LENGTH]').addClass('invalidSize');
        $('label[for=PERIMETERS]').addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).text('Your Pattern size (x: ' + Math.round(FIT_WIDTH) + ', y: ' + Math.round(FIT_HEIGHT) + ') exceeds your Y bed size. Check highlighted Pattern Settings.');
        $((invalidDiv ? '#warning2' : '#warning1')).addClass('invalidSize');
        $((invalidDiv ? '#warning2' : '#warning1')).show();
        displayCalculatedValues('hide');
      }
  }
}

$(window).load(() => {
  // Adapt textarea to cell size
  var TXTAREAHEIGHT = $('.txtareatd').height();
  $('.calibpat #gcodetextarea').css({'height': (TXTAREAHEIGHT) + 'px'});

  // create tab index dynamically
  $(':input:not(:hidden)').each(function(i) {
    $(this).attr('tabindex', i + 1);
  });

  // Get localStorage data
  var lsSettings = window.localStorage.getItem('PA_SETTINGS');

  if (lsSettings) {
    var settings = jQuery.parseJSON(lsSettings);
    $('#NOTES_ENABLE').prop('checked', settings['NOTES_ENABLE']);
    $('#PATTERN_OPTIONS_ENABLE').prop('checked', settings['PATTERN_OPTIONS_ENABLE']);
    $('#BED_TEMP').val(settings['BED_TEMP']);
    $('#HOTEND_TEMP').val(settings['HOTEND_TEMP']);
    $('#ANCHOR_OPTION').val(settings['ANCHOR_OPTION']);
    $('#START_GCODE_TYPE').val(settings['START_GCODE_TYPE']);
    $('#FILAMENT_DIAMETER').val(settings['FILAMENT_DIAMETER']);
    $('#NOZZLE_DIAMETER').val(settings['NOZZLE_DIAMETER']);
    $('#LINE_RATIO').val(settings['LINE_RATIO']);
    $('#ANCHOR_LAYER_LINE_RATIO').val(settings['ANCHOR_LAYER_LINE_RATIO']);
    $('#START_GCODE').val(settings['START_GCODE']);
    $('#END_GCODE').val(settings['END_GCODE']);
    $('#SPEED_FIRSTLAYER').val(settings['SPEED_FIRSTLAYER']);
    $('#SPEED_PERIMETER').val(settings['SPEED_PERIMETER']);
    $('#SPEED_TRAVEL').val(settings['SPEED_TRAVEL']);
    $('#SPEED_RETRACT').val(settings['SPEED_RETRACT']);
    $('#SPEED_UNRETRACT').val(settings['SPEED_UNRETRACT']);
    $('#PRINT_ACCL').val(settings['ACCELERATION']);
    $('#ZHOP_ENABLE').prop('checked', settings['ZHOP_ENABLE']);
    $('#ZHOP_HEIGHT').val(settings['ZHOP_HEIGHT']);
    $('#RETRACT_DIST').val(settings['RETRACT_DIST']);
    $('#BED_SHAPE').val(settings['BED_SHAPE']);
    $('#BED_X').val(settings['BED_X']);
    $('#BED_Y').val(settings['BED_Y']);
    $('#ORIGIN_CENTER').prop('checked', settings['ORIGIN_CENTER']);
    $('#HEIGHT_FIRSTLAYER').val(settings['HEIGHT_FIRSTLAYER']);
    $('#HEIGHT_LAYER').val(settings['HEIGHT_LAYER']);
    $('#HEIGHT_PRINT').val(settings['HEIGHT_PRINT']);
    $('#EXTRUDER_NAME').val(settings['EXTRUDER_NAME']);
    $('#FAN_SPEED_FIRSTLAYER').val(settings['FAN_SPEED_FIRSTLAYER']);
    $('#FAN_SPEED').val(settings['FAN_SPEED']);
    $('#EXT_MULT').val(settings['EXT_MULT']);
    $('#PA_START').val(settings['PA_START']);
    $('#PA_END').val(settings['PA_END']);
    $('#PA_STEP').val(settings['PA_STEP']);
    $('#PRINT_DIR').val(settings['PRINT_DIR']);
    $('#PATTERN_SPACING').val(settings['PATTERN_SPACING']);
    $('#PATTERN_ANGLE').val(settings['PATTERN_ANGLE']);
    $('#PERIMETERS').val(settings['PERIMETERS']);
    $('#PRIME').prop('checked', settings['USE_PRIME']);
    $('#ENT_MULT_PRIME').val(settings['EXT_MULT_PRIME']);
    $('#PRIME_SPEED').val(settings['SPEED_PRIME']);
    $('#PATTERN_SIDE_LENGTH').val(settings['PATTERN_SIDE_LENGTH']);
    $('#USE_FWR').prop('checked', settings['USE_FWR']);
    $('#USE_MMS').prop('checked', settings['USE_MMS']);
    $('#LINE_NO').prop('checked', settings['USE_LINENO']);
  }

  // run all toggles on initial page load
  toggleBedShape();
  //togglePrime();
  toggleRetract();
  toggleZHop();
  toggleNotes();
  togglePatternOptions();
  toggleAnchorOptions();
  toggleTemps();
  toggleStartGcodeTypeDescriptions();

  // validate input on page load (also triggers displayCalculatedValues();)
  validateInput();

  // toggle between mm/s and mm/min speeds
  $('#USE_MMS').change(speedToggle);

  // Toggle bed options when bed shape is changed
  $('#BED_SHAPE').change(() => {
    toggleBedShape();
    validateInput();
  });

  // toggle prime relevant html elements
  //$('#PRIME').change(togglePrime);

  // Toggle notes fields with toggle checkbox
  $('#NOTES_ENABLE').change(toggleNotes);

  // Toggle start gcode and hotend/bed temp visibility when choosing start g-code option
  $('#START_GCODE_TYPE').change(toggleStartGcode);
  $('#START_GCODE_TYPE').change(toggleStartGcodeTypeDescriptions);

  // Toggle visibility of anchor options depending on anchor selection
  $('#ANCHOR_OPTION').change(toggleAnchorOptions);

  // Toggle pattern setting fields with toggle checkbox, and sets values to default when unchecked
  $('#PATTERN_OPTIONS_ENABLE').change(togglePatternOptions);

  // Toggle retraction option visibility when firmware retract is toggled
  $('#USE_FWR').change(toggleRetract);

  // Toggle z hop option visibility when z hop is toggled
  $('#ZHOP_ENABLE').change(toggleZHop);

  // Focus the first field
  //$('#padv input:first').focus();
});
