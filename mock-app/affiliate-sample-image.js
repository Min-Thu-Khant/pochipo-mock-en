// Screenshot creatives are visual mock samples; existing offer terms and destinations stay authoritative.
const affiliateSampleIds=new Map();
export function affiliateSampleImage(o){if(!affiliateSampleIds.has(o.id))affiliateSampleIds.set(o.id,affiliateSampleIds.size%9);const n=affiliateSampleIds.get(o.id),x=[60,363,666][n%3],y=[450,866,1282][Math.floor(n/3)],scale=1179/945;return `<svg class="affiliate-sample-image" viewBox="${x*scale} ${y*scale} ${219*scale} ${219*scale}" role="img" aria-label="案件画像のモック見本"><image href="assets/affiliate-reference.png" width="1179" height="2556"/></svg>`;}
