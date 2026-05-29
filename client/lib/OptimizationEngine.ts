export interface MaterialProperties {
  name: string;
  cost: number; // USD per kg
  carbon: number; // kg CO2 per kg
  density: number; // kg/m^3
}

export interface ConcreteMix {
  cement: number; // kg
  water: number; // kg
  sand: number; // kg
  gravel: number; // kg
  flyAsh: number; // kg
  slag: number; // kg
  silicaFume: number; // kg
  // Output Properties
  strength: number; // MPa
  wbRatio: number;
  totalBinder: number;
  cost: number; // USD per m^3
  carbon: number; // kg CO2 per m^3
  volume: number; // should be close to 1000 liters (1 m^3)
}

export interface OptimizationTarget {
  strengthClass: 'C25' | 'C30' | 'C35' | 'C40';
  optimizationPriority: 'cost' | 'carbon' | 'balanced';
  cementPrice: number;
  flyAshPrice: number;
  slagPrice: number;
  silicaFumePrice: number;
}

// Global baseline constants
export const DEFAULT_MATERIALS: Record<string, MaterialProperties> = {
  cement: { name: 'OPC Cement (CEM I)', cost: 0.12, carbon: 0.85, density: 3150 },
  water: { name: 'Water', cost: 0.002, carbon: 0.0002, density: 1000 },
  sand: { name: 'Fine Aggregate (Sand)', cost: 0.018, carbon: 0.005, density: 2650 },
  gravel: { name: 'Coarse Aggregate (Gravel)', cost: 0.022, carbon: 0.006, density: 2700 },
  flyAsh: { name: 'Fly Ash (Recycled)', cost: 0.04, carbon: 0.015, density: 2200 },
  slag: { name: 'GGBS Slag (Recycled)', cost: 0.06, carbon: 0.07, density: 2850 },
  silicaFume: { name: 'Silica Fume (Recycled)', cost: 0.35, carbon: 0.025, density: 2200 },
};

// TS EN 206 standard efficiency factors (k-values)
export const K_FACTORS = {
  flyAsh: 0.4,
  slag: 0.6,
  silicaFume: 2.0,
};

// Target strengths in MPa (f_ck_cube)
export const TARGET_STRENGTHS = {
  C25: 30, // f_ck_cube is 30 MPa (25 MPa cylinder)
  C30: 37, // f_ck_cube is 37 MPa (30 MPa cylinder)
  C35: 45, // f_ck_cube is 45 MPa (35 MPa cylinder)
  C40: 50, // f_ck_cube is 50 MPa (40 MPa cylinder)
};

/**
 * Calculates concrete mix properties using structural concrete chemistry.
 * Uses the Bolomey formula for strength estimation:
 * f_c = K_b * (B / (W + Air) - 0.5)
 * where B = Cement + k_fa * FlyAsh + k_sl * Slag + k_sf * SilicaFume
 */
export function calculateMixProperties(
  cement: number,
  water: number,
  flyAsh: number,
  slag: number,
  silicaFume: number,
  sand: number,
  gravel: number,
  prices: Partial<Record<string, number>> = {}
): ConcreteMix {
  const matPrices = {
    cement: prices.cement ?? DEFAULT_MATERIALS.cement.cost,
    water: DEFAULT_MATERIALS.water.cost,
    sand: DEFAULT_MATERIALS.sand.cost,
    gravel: DEFAULT_MATERIALS.gravel.cost,
    flyAsh: prices.flyAsh ?? DEFAULT_MATERIALS.flyAsh.cost,
    slag: prices.slag ?? DEFAULT_MATERIALS.slag.cost,
    silicaFume: prices.silicaFume ?? DEFAULT_MATERIALS.silicaFume.cost,
  };

  // Calculate Binder
  const totalBinder = cement + flyAsh + slag + silicaFume;
  
  // Effective binder weight according to TS EN 206
  const B_eff =
    cement +
    K_FACTORS.flyAsh * flyAsh +
    K_FACTORS.slag * slag +
    K_FACTORS.silicaFume * silicaFume;

  const wbRatio = water / (cement > 0 ? cement : 1);

  // Strength Estimation (Bolomey Formula)
  const Kb = 34;
  const strength = Kb * (B_eff / (water + 15) - 0.5);

  // Cost calculation
  const totalCost =
    cement * matPrices.cement +
    water * matPrices.water +
    sand * matPrices.sand +
    gravel * matPrices.gravel +
    flyAsh * matPrices.flyAsh +
    slag * matPrices.slag +
    silicaFume * matPrices.silicaFume;

  // Carbon footprint calculation
  const totalCarbon =
    cement * DEFAULT_MATERIALS.cement.carbon +
    water * DEFAULT_MATERIALS.water.carbon +
    sand * DEFAULT_MATERIALS.sand.carbon +
    gravel * DEFAULT_MATERIALS.gravel.carbon +
    flyAsh * DEFAULT_MATERIALS.flyAsh.carbon +
    slag * DEFAULT_MATERIALS.slag.carbon +
    silicaFume * DEFAULT_MATERIALS.silicaFume.carbon;

  // Calculate volume to ensure it equals 1m^3 (1000 liters)
  const volume =
    cement / DEFAULT_MATERIALS.cement.density +
    water / DEFAULT_MATERIALS.water.density +
    sand / DEFAULT_MATERIALS.sand.density +
    gravel / DEFAULT_MATERIALS.gravel.density +
    flyAsh / DEFAULT_MATERIALS.flyAsh.density +
    slag / DEFAULT_MATERIALS.slag.density +
    silicaFume / DEFAULT_MATERIALS.silicaFume.density;

  return {
    cement,
    water,
    sand,
    gravel,
    flyAsh,
    slag,
    silicaFume,
    strength: Math.max(0, Math.round(strength * 10) / 10),
    wbRatio: Math.round(wbRatio * 100) / 100,
    totalBinder,
    cost: Math.round(totalCost * 100) / 100,
    carbon: Math.round(totalCarbon * 100) / 100,
    volume: Math.round(volume * 1000) / 1000,
  };
}

/**
 * Optimization Engine Solver: samples search space of replacement ratios
 * under TS EN 206 limits, and picks the mix minimizing Cost or Carbon
 */
export function optimizeConcreteMix(target: OptimizationTarget): ConcreteMix {
  const reqStrength = TARGET_STRENGTHS[target.strengthClass];
  
  let bestMix: ConcreteMix | null = null;
  let bestScore = Infinity; // Lower is better

  const prices = {
    cement: target.cementPrice,
    flyAsh: target.flyAshPrice,
    slag: target.slagPrice,
    silicaFume: target.silicaFumePrice,
  };

  const waterOPC = 185;
  const cementOPC = Math.round((reqStrength / 34 + 0.5) * (waterOPC + 15));
  const aggregateOPC = 2400 - cementOPC - waterOPC;
  const sandOPC = Math.round(aggregateOPC * 0.4);
  const gravelOPC = Math.round(aggregateOPC * 0.6);
  const opcMix = calculateMixProperties(cementOPC, waterOPC, 0, 0, 0, sandOPC, gravelOPC, prices);

  // Optimization grid search
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

          const cement = C_total * (1 - (faPct + slagPct + sfPct) / 100);
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
            Math.round(cement),
            Math.round(water),
            Math.round(flyAsh),
            Math.round(slag),
            Math.round(silicaFume),
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

  return bestMix || opcMix;
}

export function getOpcBenchmark(targetClass: 'C25' | 'C30' | 'C35' | 'C40'): ConcreteMix {
  const reqStrength = TARGET_STRENGTHS[targetClass];
  const waterOPC = 185;
  const cementOPC = Math.round((reqStrength / 34 + 0.5) * (waterOPC + 15));
  const aggregateOPC = 2400 - cementOPC - waterOPC;
  const sandOPC = Math.round(aggregateOPC * 0.4);
  const gravelOPC = Math.round(aggregateOPC * 0.6);
  return calculateMixProperties(cementOPC, waterOPC, 0, 0, 0, sandOPC, gravelOPC);
}
