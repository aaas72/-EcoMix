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
  // Aggregate weights to get full volume compatibility
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
  // Kb is aggregate quality factor, set to 34 for high-quality standard aggregate.
  // Air volume assumed 1.5% (represented as equivalent water weight ratio)
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

  // Standard non-optimized benchmark mix for comparison:
  // Usually all OPC cement, higher water content.
  const waterOPC = 185;
  const cementOPC = Math.round((reqStrength / 34 + 0.5) * (waterOPC + 15));
  // Total dry weight of concrete is approx 2400 kg/m^3. Aggregates = 2400 - cement - water.
  const aggregateOPC = 2400 - cementOPC - waterOPC;
  const sandOPC = Math.round(aggregateOPC * 0.4);
  const gravelOPC = Math.round(aggregateOPC * 0.6);
  const opcMix = calculateMixProperties(cementOPC, waterOPC, 0, 0, 0, sandOPC, gravelOPC, prices);

  // Optimization grid search: sample green replacement ratios
  // TS EN 206 restrictions:
  // Fly ash <= 35% of total binder
  // Slag <= 70% of total binder
  // Silica Fume <= 10% of total binder
  // Total binder >= 300 kg
  // Water/Binder <= 0.45
  for (let faPct = 0; faPct <= 35; faPct += 2) {
    for (let slagPct = 0; slagPct <= 70; slagPct += 5) {
      for (let sfPct = 0; sfPct <= 10; sfPct += 2) {
        // Exceeded replacement ratio limits combined (typically combined ash + slag <= 70%)
        if (faPct + slagPct + sfPct > 75) continue;

        // Try water values between 140kg (using plasticizers) and 180kg
        for (let water = 145; water <= 170; water += 5) {
          
          // Using target strength and Bolomey formula, solve for required effective binder B_eff:
          // reqStrength = 34 * (B_eff / (water + 15) - 0.5)
          // B_eff = (reqStrength / 34 + 0.5) * (water + 15)
          const B_eff_req = (reqStrength / 34 + 0.5) * (water + 15);

          // We also have: B_eff = Cement + k_fa * FlyAsh + k_sl * Slag + k_sf * SilicaFume
          // Let total binder weight be C_total.
          // FlyAsh = C_total * faPct/100
          // Slag = C_total * slagPct/100
          // SilicaFume = C_total * sfPct/100
          // Cement = C_total * (1 - (faPct + slagPct + sfPct)/100)
          const faF = (faPct / 100) * K_FACTORS.flyAsh;
          const slagF = (slagPct / 100) * K_FACTORS.slag;
          const sfF = (sfPct / 100) * K_FACTORS.silicaFume;
          const cementF = 1 - (faPct + slagPct + sfPct) / 100;

          const effMultiplier = cementF + faF + slagF + sfF;
          const C_total = B_eff_req / effMultiplier;

          // Check compliance with minimum binder constraint
          if (C_total < 300) continue;

          const cement = C_total * (1 - (faPct + slagPct + sfPct) / 100);
          const flyAsh = C_total * (faPct / 100);
          const slag = C_total * (slagPct / 100);
          const silicaFume = C_total * (sfPct / 100);

          // Check W/B ratio <= 0.45
          const wb = water / C_total;
          if (wb > 0.46) continue; // Small tolerance

          // Proportions for Aggregates:
          // Volume of ingredients + volume of aggregate must sum to 1 m^3 (1000 L)
          // 1.5% air is 15 liters.
          const usedVolumeLiters =
            (cement / DEFAULT_MATERIALS.cement.density +
              water / DEFAULT_MATERIALS.water.density +
              flyAsh / DEFAULT_MATERIALS.flyAsh.density +
              slag / DEFAULT_MATERIALS.slag.density +
              silicaFume / DEFAULT_MATERIALS.silicaFume.density) * 1000 + 15;

          const aggregateVolumeLiters = 1000 - usedVolumeLiters;
          if (aggregateVolumeLiters <= 0) continue;

          // Standard aggregate density weighted blend: 40% sand (2650 kg/m^3), 60% gravel (2700 kg/m^3)
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

          // Calculate Optimization score based on priority
          let score = 0;
          if (target.optimizationPriority === 'cost') {
            score = candidate.cost;
          } else if (target.optimizationPriority === 'carbon') {
            score = candidate.carbon * 1.5; // Scale to match visual weights
          } else {
            // Balanced compromise (normalized weight blend)
            // Carbon ranges roughly from 100 to 400. Cost from 40 to 80.
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

  // Fallback to OPC mix if solver fails to converge under tight limits
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
