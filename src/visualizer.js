import {renderRadial} from './renderers/radial.js';
import {renderParticles} from './renderers/particles.js';

const renderers = {
    radial: renderRadial,
    particles: renderParticles,
};

export const visualize = (dataArray, ctx, s, w, h, config = {}, timeDomainData = null) => {
    ctx.clearRect(0, 0, w, h);
    const render = renderers[config.visualizationMode];
    render(dataArray, ctx, s, w, h, config, timeDomainData);
}
