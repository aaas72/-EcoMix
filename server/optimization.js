// Concrete baseline properties
const DEFAULT_MATERIALS = {
  cement: { name: 'OPC Cement (CEM I)', cost: 0.12, carbon: 0.85, density: 3150 },
  water: { name: 'Water', cost: 0.002, carbon: 0.0002, density: 1000 },
  sand: { name: 'Fine Aggregate (Sand)', cost: 0.018, carbon: 0.005, density: 2650 },
  gravel: { name: 'Coarse Aggregate (Gravel)', cost: 0.022, carbon: 0.006, density: 2700 },
  flyAsh: { name: 'Fly Ash (Recycled)', cost: 0.04, carbon: 0.015, density: 2200 },
  slag: { name: 'GGBS Slag (Recycled)', cost: 0.06, carbon: 0.07, density: 2850 },
  silicaFume: { name: 'Silica Fume (Recycled)', cost: 0.35, carbon: 0.025, density: 2200 },
};

const K_FACTORS = {
  flyAsh: 0.4,
  slag: 0.6,
  silicaFume: 2.0,
};

const TARGET_STRENGTHS = {
  C25: 30,
  C30: 37,
  C35: 45,
  C40: 50,
};

function calculateMixProperties(cement, water, flyAsh, slag, silicaFume, sand, gravel, prices = {}) {
  const matPrices = {
    cement: prices.cement ?? DEFAULT_MATERIALS.cement.cost,
    water: DEFAULT_MATERIALS.water.cost,
    sand: DEFAULT_MATERIALS.sand.cost,
    gravel: DEFAULT_MATERIALS.gravel.cost,
    flyAsh: prices.flyAsh ?? DEFAULT_MATERIALS.flyAsh.cost,
    slag: prices.slag ?? DEFAULT_MATERIALS.slag.cost,
    silicaFume: prices.silicaFume ?? DEFAULT_MATERIALS.silicaFume.cost,
  };

  const totalBinder = cement + flyAsh + slag + silicaFume;
  const B_eff = cement + K_FACTORS.flyAsh * flyAsh + K_FACTORS.slag * slag + K_FACTORS.silicaFume * silicaFume;
  const wbRatio = water / (cement > 0 ? cement : 1);

  // Strength Estimation (Bolomey Formula)
  const Kb = 34;
  const strength = Kb * (B_eff / (water + 15) - 0.5);

  const totalCost =
    cement * matPrices.cement +
    water * matPrices.water +
    sand * matPrices.sand +
    gravel * matPrices.gravel +
    flyAsh * matPrices.flyAsh +
    slag * matPrices.slag +
    silicaFume * matPrices.silicaFume;

  const totalCarbon =
    cement * DEFAULT_MATERIALS.cement.carbon +
    water * DEFAULT_MATERIALS.water.carbon +
    sand * DEFAULT_MATERIALS.sand.carbon +
    gravel * DEFAULT_MATERIALS.gravel.carbon +
    flyAsh * DEFAULT_MATERIALS.flyAsh.carbon +
    slag * DEFAULT_MATERIALS.slag.carbon +
    silicaFume * DEFAULT_MATERIALS.silicaFume.carbon;

  const volume =
    cement / DEFAULT_MATERIALS.cement.density +
    water / DEFAULT_MATERIALS.water.density +
    sand / DEFAULT_MATERIALS.sand.density +
    gravel / DEFAULT_MATERIALS.gravel.density +
    flyAsh / DEFAULT_MATERIALS.flyAsh.density +
    slag / DEFAULT_MATERIALS.slag.density +
    silicaFume / DEFAULT_MATERIALS.silicaFume.density;

  return {
    cement: Math.round(cement),
    water: Math.round(water),
    sand: Math.round(sand),
    gravel: Math.round(gravel),
    flyAsh: Math.round(flyAsh),
    slag: Math.round(slag),
    silicaFume: Math.round(silicaFume),
    strength: Math.max(0, Math.round(strength * 10) / 10),
    wbRatio: Math.round(wbRatio * 100) / 100,
    totalBinder: Math.round(totalBinder),
    cost: Math.round(totalCost * 100) / 100,
    carbon: Math.round(totalCarbon * 100) / 100,
    volume: Math.round(volume * 1000) / 1000,
  };
}

function optimizeConcreteMix(target) {
  const reqStrength = TARGET_STRENGTHS[target.strengthClass] || 37;
  let bestMix = null;
  let bestScore = Infinity;

  const prices = {
    cement: target.cementPrice ?? DEFAULT_MATERIALS.cement.cost,
    flyAsh: target.flyAshPrice ?? DEFAULT_MATERIALS.flyAsh.cost,
    slag: target.slagPrice ?? DEFAULT_MATERIALS.slag.cost,
    silicaFume: target.silicaFumePrice ?? DEFAULT_MATERIALS.silicaFume.cost,
  };

  // Optimization grid search: sample green replacement ratios
  for (let faPct = 0; faPct <= 35; faPct += 2) {
    for (let slagPct = 0; slagPct <= 70; slagPct += 5) {
      for (let sfPct = 0; sfPct <= 10; sfPct += 2) {
        if (faPct + slagPct + sfPct > 75) continue;

        for (let water = 145; water <= 170; water += 5) {
          const B_eff_req = (reqStrength / 34 + 0.5) * (water + 15);

          const faF = (faPct / 100) * K_FACTORS.flyAsh;
          const slagF = (slagPct / 100) * K_FACTORS.slag;
          const sfF = (sfPct / 100) * K_FACTORS.silicaFume;
          const cementF = 1 - (faPct + slagPct + sfPct) / 100;

          const effMultiplier = cementF + faF + slagF + sfF;
          const C_total = B_eff_req / effMultiplier;

          if (C_total < 300) continue;

          const cement = C_total * cementF;
          const flyAsh = C_total * (faPct / 100);
          const slag = C_total * (slagPct / 100);
          const silicaFume = C_total * (sfPct / 100);

          const wb = water / C_total;
          if (wb > 0.46) continue;

          const usedVolumeLiters =
            (cement / DEFAULT_MATERIALS.cement.density +
              water / DEFAULT_MATERIALS.water.density +
              flyAsh / DEFAULT_MATERIALS.flyAsh.density +
              slag / DEFAULT_MATERIALS.slag.density +
              silicaFume / DEFAULT_MATERIALS.silicaFume.density) * 1000 + 15;

          const aggregateVolumeLiters = 1000 - usedVolumeLiters;
          if (aggregateVolumeLiters <= 0) continue;

          const avgDensity = 0.4 * 2650 + 0.6 * 2700;
          const aggregateWeight = (aggregateVolumeLiters / 1000) * avgDensity;
          const sand = Math.round(aggregateWeight * 0.4);
          const gravel = Math.round(aggregateWeight * 0.6);

          const candidate = calculateMixProperties(
            cement,
            water,
            flyAsh,
            slag,
            silicaFume,
            sand,
            gravel,
            prices
          );

          let score = 0;
          if (target.optimizationPriority === 'cost') {
            score = candidate.cost;
          } else if (target.optimizationPriority === 'carbon') {
            score = candidate.carbon * 1.5;
          } else {
            const normCost = (candidate.cost - 35) / 50;
            const normCarbon = (candidate.carbon - 80) / 320;
            score = normCost * 0.5 + normCarbon * 0.5;
          }

          if (score < bestScore) {
            bestScore = score;
            bestMix = candidate;
          }
        }
      }
    }
  }

  // Fallback default OPC
  if (!bestMix) {
    const waterOPC = 185;
    const cementOPC = Math.round((reqStrength / 34 + 0.5) * (waterOPC + 15));
    const aggregateOPC = 2400 - cementOPC - waterOPC;
    const sandOPC = Math.round(aggregateOPC * 0.4);
    const gravelOPC = Math.round(aggregateOPC * 0.6);
    bestMix = calculateMixProperties(cementOPC, waterOPC, 0, 0, 0, sandOPC, gravelOPC, prices);
  }

  return bestMix;
}

module.exports = {
  optimizeConcreteMix,
  calculateMixProperties,
  DEFAULT_MATERIALS,
  TARGET_STRENGTHS,
};
