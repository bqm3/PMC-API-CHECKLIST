const { Op } = require("sequelize");
const Ent_checklist = require("../models/ent_checklist.model");
const Ent_thietlapca = require("../models/ent_thietlapca.model");

exports.syncSochecklist = async (ID_ThietLapCa, transaction) => {
  const thietlap = await Ent_thietlapca.findOne({
    where: { ID_ThietLapCa, isDelete: 0 },
    transaction,
  });

  if (!thietlap) return;

  const checklistCount = await Ent_checklist.count({
    where: {
      ID_Hangmuc: {
        [Op.in]: thietlap.ID_Hangmucs,
      },
      isDelete: 0,
    },
    transaction,
  });

  await Ent_thietlapca.update(
    { Sochecklist: checklistCount },
    { where: { ID_ThietLapCa }, transaction }
  );
};
