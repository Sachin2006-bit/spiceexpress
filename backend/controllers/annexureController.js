import Annexure from '../models/Annexure.js';
import LR from '../models/LR.js';

export const createAnnexure = async (req, res) => {
  const { lrId, status } = req.body;
  const annexure = await Annexure.create({ lrId, status });
  res.status(201).json(annexure);
};

export const getAnnexures = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const annexures = await Annexure.find(filter).populate('lrId');
  res.json(annexures);
};
