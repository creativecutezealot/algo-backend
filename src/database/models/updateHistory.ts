export default function (sequelize, DataTypes) {
  const updateHistory = sequelize.define(
    'updateHistory',
    {
      updatedTime: {
        type: DataTypes.STRING(20),
        allowNull: false,
      }
    }
  );

  updateHistory.associate = (models) => {};

  return updateHistory;
}
