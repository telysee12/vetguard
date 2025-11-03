const express = require('express');
const router = express.Router();

// Local fallback village map (keep in sync with frontend localVillagesByCell)
const localVillagesByCell = {
  Kinyamakara: ['Kinyamakara I', 'Kinyamakara II', 'Kinyamakara III'],
  Ruhashya: ['Ruhashya Centre', 'Ruhashya East', 'Ruhashya West'],
  Gatobotobo: ['Gatobotobo A', 'Gatobotobo B'],
  Nyakagezi: ['Nyakagezi 1', 'Nyakagezi 2'],
  Rukira: ['Rukira North', 'Rukira South'],
  Kibingo: ['Kibingo A', 'Kibingo B'],
  Sovu: ['Sovu I', 'Sovu II'],
  Muyogoro: ['Muyogoro Central', 'Muyogoro East'],
  Bunazi: ['Bunazi I', 'Bunazi II'],
  Cyarwa: ['Cyarwa A', 'Cyarwa B'], // add real data as available
  // add more mappings...
};

// GET /api/v1/locations/cells/:cell/villages
router.get('/cells/:cell/villages', (req, res) => {
  const cell = req.params.cell;
  const villages = localVillagesByCell[cell] || null;
  if (!villages) {
    return res.status(404).json({ message: `No villages found for cell '${cell}'` });
  }
  return res.json(villages);
});

// Alternative path used by frontend attempts: /api/v1/locations/villages/:cell
router.get('/villages/:cell', (req, res) => {
  const cell = req.params.cell;
  const villages = localVillagesByCell[cell] || null;
  if (!villages) {
    return res.status(404).json({ message: `No villages found for cell '${cell}'` });
  }
  return res.json({ villages });
});

// Query form: /api/v1/villages?cell=...
router.get('/villages', (req, res) => {
  const cell = req.query.cell && String(req.query.cell);
  if (!cell) return res.status(400).json({ message: 'Missing "cell" query parameter' });
  const villages = localVillagesByCell[cell] || null;
  if (!villages) return res.status(404).json({ message: `No villages found for cell '${cell}'` });
  return res.json(villages);
});

module.exports = router;