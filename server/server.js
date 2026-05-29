const express = require('express');
const cors = require('cors');
const { optimizeConcreteMix, DEFAULT_MATERIALS, TARGET_STRENGTHS } = require('./optimization');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the Next.js frontend can communicate with the backend
app.use(cors());
app.use(express.json());

// 1. Health Status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'EcoMix Optimization Engine Backend',
    accreditation: 'MÜDEK Compliant Standard (TS EN 206)',
  });
});

// 2. Materials configuration helper endpoint
app.get('/api/materials', (req, res) => {
  res.json({
    materials: DEFAULT_MATERIALS,
    strengthClasses: TARGET_STRENGTHS,
  });
});

// 3. Main constrained optimization solver endpoint
app.post('/api/optimize', (req, res) => {
  const { strengthClass, optimizationPriority, cementPrice, flyAshPrice, slagPrice, silicaFumePrice } = req.body;

  if (!strengthClass) {
    return res.status(400).json({ error: 'Missing strengthClass parameter (e.g. C30)' });
  }

  try {
    const optimized = optimizeConcreteMix({
      strengthClass,
      optimizationPriority: optimizationPriority || 'balanced',
      cementPrice: parseFloat(cementPrice),
      flyAshPrice: parseFloat(flyAshPrice),
      slagPrice: parseFloat(slagPrice),
      silicaFumePrice: parseFloat(silicaFumePrice),
    });

    res.json({
      success: true,
      parameters: {
        strengthClass,
        optimizationPriority,
        prices: {
          cement: cementPrice,
          flyAsh: flyAshPrice,
          slag: slagPrice,
          silicaFume: silicaFumePrice,
        },
      },
      optimizedResult: optimized,
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Mathematical optimization solver failed.' });
  }
});

// Start Express listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🟢 EcoMix Optimization Server running on port ${PORT}`);
  console.log(`🟢 MÜDEK Interdisciplinary Synergy API active!`);
  console.log(`==================================================`);
});
