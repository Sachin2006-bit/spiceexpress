import LR from '../models/LR.js';

export const getBusinessComparison = async (req, res) => {
  try {
    const {
      periodA_start: periodAStart,
      periodA_end: periodAEnd,
      periodB_start: periodBStart,
      periodB_end: periodBEnd,
      customerId,
    } = req.query;

    if (!periodAStart || !periodAEnd || !periodBStart || !periodBEnd) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        required: ['periodA_start', 'periodA_end', 'periodB_start', 'periodB_end'],
      });
    }

    const parseDate = (value) => (value ? new Date(value) : undefined);

    const getPeriodMetrics = async (startDate, endDate, code) => {
      const match = {};
      if (startDate || endDate) {
        match.date = {};
        if (startDate) match.date.$gte = startDate;
        if (endDate) match.date.$lte = endDate;
      }
      if (code) {
        // customerId maps to customerCode in LR schema
        match.customerCode = code;
      }

      const agg = await LR.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            lrCount: { $sum: 1 },
          },
        },
      ]);

      return {
        totalRevenue: (agg && agg[0] && agg[0].totalRevenue) || 0,
        lrCount: (agg && agg[0] && agg[0].lrCount) || 0,
      };
    };

    const [periodA, periodB] = await Promise.all([
      getPeriodMetrics(parseDate(periodAStart), parseDate(periodAEnd), customerId),
      getPeriodMetrics(parseDate(periodBStart), parseDate(periodBEnd), customerId),
    ]);

    return res.json({ periodA, periodB });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to compute business comparison', details: error.message });
  }
};

