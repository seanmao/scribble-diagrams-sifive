const {WaveDrom} = require('../wavedrom/WaveDrom.js');

// Use the generated Roboto text function from fonts.js to approximate text width for fontsize 1.
const textWidth = require('../util/fonts.js').Roboto()(1).getWidth


/******************************************************************
 * Use WaveDrom to create a Register diagram, adjusting lanes and fonts to fit the page.
 *   When invoked from a resizable (eg web) environment, "hspace" should reflect the new page width.
 * @param data - data in "wavedrom" format
 * @returns {string} - svg diagram
 */
function Register(data) {

    // Get the configured values, allowing for defaults.
    const config = data.config || {};
    const lanes = config.lanes || 1;
    const hspace = config.hspace || 640;
    var fontsize = config.fontsize || 12;

    // Find the biggest text mismatch for all the fields.
    //   The mismatch ratio is expressed as the text width per bit.
    const ratios = data.reg.map(f => textWidth(f.name)/f.bits);
    const worst = Math.max(...ratios);

    // Get the configured bits per lane.
    const totalBits = data.reg.map(f=>f.bits).reduce((x,y)=>x+y, 0);
    var bitsPerLane = Math.ceil(totalBits/lanes);

    // If the worst text doesn't fit into its field, start by rounding bits per lane down to a power of two.
    //  Note: the lane is likely already a power of 2, but let's just be sure.
    if (worst * fontsize * bitsPerLane < hspace)
        bitsPerLane = pow2Down(bitsPerLane);

    // Reduce the bits per lane until the text fits.
    for (; bitsPerLane > 8; bitsPerLane /= 2)
        if (worst * fontsize * bitsPerLane < hspace)
            break;

    // If necessary, also reduce the font size.
    for (; fontsize > 5; fontsize--)
        if (worst * fontsize * bitsPerLane < hspace)
            break;

    // Construct new data with the new lanes, width and font size,
    const newConfig = {
        ...config,
        lanes: Math.ceil(totalBits / bitsPerLane),
        fontsize,
        hspace
    };
    const newData = {...data, config:newConfig};

    // Create the register diagram using the rescaled data.
    return WaveDrom(newData);
}


/***************************************************************************
 * Round a number down to the closest power of two.  (Note: integer optimizations possible)
 *    We are assuming no floating point error when dealing with integer powers of two.
 */
const pow2Down = (n) => Math.pow(2, Math.floor(Math.log2(n)));



module.exports = {Register};