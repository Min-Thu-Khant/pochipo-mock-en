/** Verified against Figma 22696:58651, read on 2026-09-18.
 * The radius is measured on the stroke centerline, not the inner/outer edge.
 */
export const iconGrid=24;
export const iconStrokeWidths=Object.freeze({
 regular:Object.freeze({line:2,circle:2,rectangle:2,inner:1.5}),
 bold:Object.freeze({line:3,circle:2.5,rectangle:2.5,inner:2})
});
export function iconCornerRadius(strokeWidth,angle=90){
 if(!Number.isFinite(strokeWidth)||strokeWidth<=0)throw new RangeError('線幅は正の数で指定してください。');
 if(!Number.isFinite(angle)||angle<=0||angle>=180)throw new RangeError('角度は0°より大きく180°より小さくしてください。');
 return 3/Math.sqrt(2)*strokeWidth*Math.sin(angle*Math.PI/360);
}
// New project extension, not an exported Figma glyph. Pip layout/diameter is our design choice.
const pips={1:[[12,12]],2:[[7.5,7.5],[16.5,16.5]],3:[[7.5,7.5],[12,12],[16.5,16.5]],4:[[7.5,7.5],[16.5,7.5],[7.5,16.5],[16.5,16.5]],5:[[7.5,7.5],[16.5,7.5],[12,12],[7.5,16.5],[16.5,16.5]],6:[[7.5,7.5],[16.5,7.5],[7.5,12],[16.5,12],[7.5,16.5],[16.5,16.5]]};
export function diceSvg(face=5,weight='regular'){
 if(!pips[face])throw new RangeError('サイコロの目は1〜6です。');
 const widths=iconStrokeWidths[weight];if(!widths)throw new RangeError('太さはregularまたはboldです。');
 const radius=Number(iconCornerRadius(widths.rectangle).toFixed(4));
 return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="${radius}" stroke="#4B5552" stroke-width="${widths.rectangle}"/>${pips[face].map(([cx,cy])=>`<circle cx="${cx}" cy="${cy}" r="${widths.inner/2}" fill="#4B5552"/>`).join('')}</svg>\n`;
}
